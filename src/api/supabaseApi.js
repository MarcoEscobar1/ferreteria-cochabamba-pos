import { supabase } from '../lib/supabaseClient';

// ============================================================
// PRODUCTS
// ============================================================
export async function fetchProducts({ activeOnly = true, categoryId = null } = {}) {
  let query = supabase.from('products').select('*, categories(name), suppliers(name)');
  if (activeOnly) query = query.eq('is_active', true);
  if (categoryId) query = query.eq('category_id', categoryId);
  query = query.order('name');
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), suppliers(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  // Never allow stock update from UI
  const { stock, ...safeUpdates } = updates;
  const { data, error } = await supabase
    .from('products')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleProductActive(id, isActive) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadProductImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);
  if (error) throw error;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ============================================================
// CATEGORIES
// ============================================================
export async function fetchCategories({ activeOnly = true } = {}) {
  let query = supabase.from('categories').select('*');
  if (activeOnly) query = query.eq('is_active', true);
  query = query.order('name');
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createCategory(category) {
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, updates) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleCategoryActive(id, isActive) {
  const { data, error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// SUPPLIERS
// ============================================================
export async function fetchSuppliers({ activeOnly = true } = {}) {
  let query = supabase.from('suppliers').select('*');
  if (activeOnly) query = query.eq('is_active', true);
  query = query.order('name');
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createSupplier(supplier) {
  const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id, updates) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleSupplierActive(id, isActive) {
  const { data, error } = await supabase
    .from('suppliers')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// EMPLOYEES
// ============================================================
export async function fetchEmployees({ activeOnly = false } = {}) {
  let query = supabase.from('employees').select('*');
  if (activeOnly) query = query.eq('is_active', true);
  query = query.order('full_name');
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createEmployee({ email, full_name, phone, role }) {
  // Invite user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
  });
  if (authError) throw authError;

  // Create employee record
  const { data, error } = await supabase
    .from('employees')
    .insert({
      id: authData.user.id,
      email,
      full_name,
      phone,
      role,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleEmployeeActive(id, isActive) {
  // Ban/unban in auth
  const { error: authError } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: isActive ? 'none' : '876000h', // ~100 years ban
  });
  if (authError) throw authError;

  const { data, error } = await supabase
    .from('employees')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// SALES
// ============================================================
export async function processSale(saleData) {
  const { data, error } = await supabase.rpc('process_sale', {
    sale_data: saleData,
  });
  if (error) throw error;
  return data;
}

export async function fetchSales({ employeeId = null, startDate = null, endDate = null } = {}) {
  let query = supabase
    .from('sales')
    .select('*, employees(full_name), sale_items(*, products(name, image_url))')
    .order('created_at', { ascending: false });

  if (employeeId) query = query.eq('employee_id', employeeId);
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchSaleById(id) {
  const { data, error } = await supabase
    .from('sales')
    .select('*, employees(full_name), sale_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// DASHBOARD METRICS
// ============================================================
export async function fetchDashboardMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [salesRes, productsRes, lowStockRes, outOfStockRes] = await Promise.all([
    supabase
      .from('sales')
      .select('total')
      .gte('created_at', todayISO),
    supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('is_active', true),
    supabase
      .from('products')
      .select('id, name, stock, min_stock')
      .eq('is_active', true)
      .gt('stock', 0)
      .filter('stock', 'lte', 'min_stock'),
    supabase
      .from('products')
      .select('id, name, stock')
      .eq('is_active', true)
      .eq('stock', 0),
  ]);

  const salesToday = salesRes.data || [];
  const totalSalesToday = salesToday.reduce((sum, s) => sum + Number(s.total), 0);

  return {
    totalSalesToday,
    salesCountToday: salesToday.length,
    totalProducts: productsRes.count || 0,
    lowStockProducts: lowStockRes.data || [],
    outOfStockProducts: outOfStockRes.data || [],
  };
}
