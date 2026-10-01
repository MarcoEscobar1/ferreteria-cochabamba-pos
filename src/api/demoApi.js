// ============================================================
// DEMO API — reemplaza supabaseApi.js con lógica en memoria
// Todas las funciones simulan async para mantener la misma interfaz.
// Los datos se mutan directamente en los arrays de demoData.js
// ============================================================
import {
  categories,
  suppliers,
  employees,
  products,
  sales,
  generateId,
  generateSaleNumber,
} from '../data/demoData';

// Helper para simular latencia de red (opcional, se puede quitar)
const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

// Helper para obtener nombre de categoría/proveedor
const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || null;
const getSupplierName = (supId) => suppliers.find((s) => s.id === supId)?.name || null;

// ============================================================
// PRODUCTS
// ============================================================
export async function fetchProducts({ activeOnly = true, categoryId = null } = {}) {
  await delay();
  let result = products.filter((p) => {
    if (activeOnly && !p.is_active) return false;
    if (categoryId && p.category_id !== categoryId) return false;
    return true;
  });
  result = result.map((p) => ({
    ...p,
    categories: p.category_id ? { name: getCategoryName(p.category_id) } : null,
    suppliers: p.supplier_id ? { name: getSupplierName(p.supplier_id) } : null,
  }));
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchProductById(id) {
  await delay();
  const p = products.find((x) => x.id === id);
  if (!p) throw new Error('Producto no encontrado');
  return {
    ...p,
    categories: p.category_id ? { name: getCategoryName(p.category_id) } : null,
    suppliers: p.supplier_id ? { name: getSupplierName(p.supplier_id) } : null,
  };
}

export async function createProduct(product) {
  await delay();
  const catName = product.category_id ? getCategoryName(product.category_id) : null;
  const supName = product.supplier_id ? getSupplierName(product.supplier_id) : null;
  const newProduct = {
    ...product,
    id: generateId('prod'),
    is_active: true,
    created_at: new Date().toISOString(),
    categories: catName ? { name: catName } : null,
    suppliers: supName ? { name: supName } : null,
  };
  products.push(newProduct);
  return newProduct;
}

export async function updateProduct(id, updates) {
  await delay();
  // Never update stock from UI
  const { stock, ...safeUpdates } = updates;
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado');
  const catName = safeUpdates.category_id ? getCategoryName(safeUpdates.category_id) : null;
  const supName = safeUpdates.supplier_id ? getSupplierName(safeUpdates.supplier_id) : null;
  products[idx] = {
    ...products[idx],
    ...safeUpdates,
    categories: catName ? { name: catName } : products[idx].categories,
    suppliers: supName ? { name: supName } : products[idx].suppliers,
  };
  return products[idx];
}

export async function toggleProductActive(id, isActive) {
  await delay();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado');
  products[idx] = { ...products[idx], is_active: isActive };
  return products[idx];
}

export async function uploadProductImage(file) {
  await delay();
  // En modo demo, convertimos la imagen a base64 para mostrarla localmente
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Error al procesar la imagen'));
    reader.readAsDataURL(file);
  });
}

// ============================================================
// CATEGORIES
// ============================================================
export async function fetchCategories({ activeOnly = true } = {}) {
  await delay();
  let result = activeOnly ? categories.filter((c) => c.is_active) : [...categories];
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(category) {
  await delay();
  const newCat = {
    ...category,
    id: generateId('cat'),
    is_active: true,
    created_at: new Date().toISOString(),
  };
  categories.push(newCat);
  return newCat;
}

export async function updateCategory(id, updates) {
  await delay();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Categoría no encontrada');
  categories[idx] = { ...categories[idx], ...updates };
  return categories[idx];
}

export async function toggleCategoryActive(id, isActive) {
  await delay();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Categoría no encontrada');
  categories[idx] = { ...categories[idx], is_active: isActive };
  return categories[idx];
}

// ============================================================
// SUPPLIERS
// ============================================================
export async function fetchSuppliers({ activeOnly = true } = {}) {
  await delay();
  let result = activeOnly ? suppliers.filter((s) => s.is_active) : [...suppliers];
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createSupplier(supplier) {
  await delay();
  const newSup = {
    ...supplier,
    id: generateId('sup'),
    is_active: true,
    created_at: new Date().toISOString(),
  };
  suppliers.push(newSup);
  return newSup;
}

export async function updateSupplier(id, updates) {
  await delay();
  const idx = suppliers.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Proveedor no encontrado');
  suppliers[idx] = { ...suppliers[idx], ...updates };
  return suppliers[idx];
}

export async function toggleSupplierActive(id, isActive) {
  await delay();
  const idx = suppliers.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Proveedor no encontrado');
  suppliers[idx] = { ...suppliers[idx], is_active: isActive };
  return suppliers[idx];
}

// ============================================================
// EMPLOYEES
// ============================================================
export async function fetchEmployees({ activeOnly = false } = {}) {
  await delay();
  let result = activeOnly ? employees.filter((e) => e.is_active) : [...employees];
  return result.sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export async function createEmployee({ email, full_name, phone, role, password }) {
  await delay();
  // Verificar que el email no exista
  if (employees.find((e) => e.email === email)) {
    throw new Error('Ya existe un empleado con ese correo electrónico');
  }
  const newEmp = {
    id: generateId('emp'),
    email,
    full_name,
    phone: phone || '',
    role,
    password: password || 'demo123',
    is_active: true,
    created_at: new Date().toISOString(),
  };
  employees.push(newEmp);
  return newEmp;
}

export async function updateEmployee(id, updates) {
  await delay();
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Empleado no encontrado');
  employees[idx] = { ...employees[idx], ...updates };
  return employees[idx];
}

export async function toggleEmployeeActive(id, isActive) {
  await delay();
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Empleado no encontrado');
  employees[idx] = { ...employees[idx], is_active: isActive };
  return employees[idx];
}

// ============================================================
// SALES
// ============================================================
export async function processSale(saleData) {
  await delay();
  const { employee_id, customer_name, items } = saleData;

  // Validar stock y calcular totales
  const saleItems = [];
  let total = 0;

  for (const item of items) {
    const productIdx = products.findIndex((p) => p.id === item.product_id);
    if (productIdx === -1) throw new Error(`Producto ${item.product_id} no encontrado`);
    const product = products[productIdx];

    if (product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para "${product.name}"`);
    }

    const subtotal = product.price * item.quantity;
    total += subtotal;

    saleItems.push({
      id: generateId('si'),
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: product.price,
      subtotal,
      products: { name: product.name, image_url: product.image_url },
    });

    // Descontar stock
    products[productIdx] = { ...products[productIdx], stock: product.stock - item.quantity };
  }

  const saleNumber = generateSaleNumber();
  const sale_id = generateId('sale');
  const emp = employees.find((e) => e.id === employee_id);

  const newSale = {
    id: sale_id,
    sale_number: saleNumber,
    employee_id,
    customer_name: customer_name || 'Cliente general',
    total,
    created_at: new Date().toISOString(),
    employees: { full_name: emp?.full_name || 'N/A' },
    sale_items: saleItems.map((si) => ({ ...si, sale_id })),
  };

  sales.unshift(newSale);
  return { sale_id, sale_number: saleNumber };
}

export async function fetchSales({ employeeId = null, startDate = null, endDate = null } = {}) {
  await delay();
  let result = [...sales];

  if (employeeId) result = result.filter((s) => s.employee_id === employeeId);
  if (startDate) result = result.filter((s) => new Date(s.created_at) >= new Date(startDate));
  if (endDate) result = result.filter((s) => new Date(s.created_at) <= new Date(endDate));

  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function fetchSaleById(id) {
  await delay();
  const sale = sales.find((s) => s.id === id);
  if (!sale) throw new Error('Venta no encontrada');
  return sale;
}

// ============================================================
// DASHBOARD METRICS
// ============================================================
export async function fetchDashboardMetrics() {
  await delay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const salesToday = sales.filter((s) => new Date(s.created_at) >= today);
  const totalSalesToday = salesToday.reduce((sum, s) => sum + Number(s.total), 0);

  const activeProducts = products.filter((p) => p.is_active);
  const lowStockProducts = activeProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.min_stock
  );
  const outOfStockProducts = activeProducts.filter((p) => p.stock === 0);

  return {
    totalSalesToday,
    salesCountToday: salesToday.length,
    totalProducts: activeProducts.length,
    lowStockProducts,
    outOfStockProducts,
  };
}
