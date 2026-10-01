// ============================================================
// DEMO DATA — base de datos en memoria para modo demo
// Todas las operaciones CRUD se realizan sobre estos arrays.
// ============================================================

// Usuarios demo para login
export const DEMO_USERS = [
  {
    id: 'emp-001',
    email: 'admin@ferreteria.com',
    password: 'admin123',
    full_name: 'Carlos Administrador',
    phone: '+591 70000001',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'emp-002',
    email: 'empleado@ferreteria.com',
    password: 'emp123',
    full_name: 'María Empleada',
    phone: '+591 70000002',
    role: 'employee',
    is_active: true,
    created_at: '2024-01-15T08:00:00.000Z',
  },
];

export const categories = [
  { id: 'cat-001', name: 'Herramientas', description: 'Herramientas manuales y eléctricas', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-002', name: 'Tornillería', description: 'Tornillos, tuercas y fijaciones', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-003', name: 'Pintura', description: 'Pinturas, barnices y accesorios', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-004', name: 'Plomería', description: 'Tuberías, válvulas y accesorios', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-005', name: 'Electricidad', description: 'Cables, interruptores y enchufes', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-006', name: 'Construcción', description: 'Cemento, arena y materiales', is_active: false, created_at: '2024-01-01T00:00:00Z' },
];

export const suppliers = [
  { id: 'sup-001', name: 'Distribuidora Nacional S.A.', phone: '+591 4-4441234', email: 'ventas@disnac.bo', address: 'Av. Blanco Galindo Km 5, Cochabamba', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sup-002', name: 'Ferri Import Ltda.', phone: '+591 4-4449876', email: 'info@ferriimport.bo', address: 'Calle Lanza N° 234, Cochabamba', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sup-003', name: 'Pinturas del Valle', phone: '+591 76543210', email: 'contacto@pinturasvalle.bo', address: 'Zona Sud, Cochabamba', is_active: true, created_at: '2024-01-01T00:00:00Z' },
];

export const employees = [
  {
    id: 'emp-001',
    email: 'admin@ferreteria.com',
    full_name: 'Carlos Administrador',
    phone: '+591 70000001',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'emp-002',
    email: 'empleado@ferreteria.com',
    full_name: 'María Empleada',
    phone: '+591 70000002',
    role: 'employee',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
  },
];

export const products = [
  {
    id: 'prod-001',
    name: 'Martillo Carpintero 16oz',
    description: 'Martillo de acero forjado con mango de fibra de vidrio',
    barcode: '7890001000010',
    price: 85.00,
    stock: 25,
    min_stock: 5,
    category_id: 'cat-001',
    supplier_id: 'sup-001',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Herramientas' },
    suppliers: { name: 'Distribuidora Nacional S.A.' },
  },
  {
    id: 'prod-002',
    name: 'Destornillador Phillips N°2',
    description: 'Destornillador profesional de punta Phillips',
    barcode: '7890001000027',
    price: 35.50,
    stock: 40,
    min_stock: 10,
    category_id: 'cat-001',
    supplier_id: 'sup-001',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Herramientas' },
    suppliers: { name: 'Distribuidora Nacional S.A.' },
  },
  {
    id: 'prod-003',
    name: 'Tornillos autorroscantes 1" (caja 100)',
    description: 'Caja de 100 tornillos autorroscantes galvanizados de 1 pulgada',
    barcode: '7890001000034',
    price: 25.00,
    stock: 60,
    min_stock: 15,
    category_id: 'cat-002',
    supplier_id: 'sup-002',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Tornillería' },
    suppliers: { name: 'Ferri Import Ltda.' },
  },
  {
    id: 'prod-004',
    name: 'Pintura Látex Blanca 1 galón',
    description: 'Pintura látex interior/exterior color blanco',
    barcode: '7890001000041',
    price: 120.00,
    stock: 3,
    min_stock: 5,
    category_id: 'cat-003',
    supplier_id: 'sup-003',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Pintura' },
    suppliers: { name: 'Pinturas del Valle' },
  },
  {
    id: 'prod-005',
    name: 'Llave de paso 1/2" (bronce)',
    description: 'Llave de paso de bronce para tubería de 1/2 pulgada',
    barcode: '7890001000058',
    price: 45.00,
    stock: 0,
    min_stock: 8,
    category_id: 'cat-004',
    supplier_id: 'sup-001',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Plomería' },
    suppliers: { name: 'Distribuidora Nacional S.A.' },
  },
  {
    id: 'prod-006',
    name: 'Cable eléctrico #12 (rollo 50m)',
    description: 'Cable eléctrico calibre 12 AWG, rollo de 50 metros',
    barcode: '7890001000065',
    price: 280.00,
    stock: 15,
    min_stock: 3,
    category_id: 'cat-005',
    supplier_id: 'sup-002',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Electricidad' },
    suppliers: { name: 'Ferri Import Ltda.' },
  },
  {
    id: 'prod-007',
    name: 'Brocha 3 pulgadas',
    description: 'Brocha de cerdas naturales para pintura',
    barcode: '7890001000072',
    price: 18.00,
    stock: 30,
    min_stock: 10,
    category_id: 'cat-003',
    supplier_id: 'sup-003',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Pintura' },
    suppliers: { name: 'Pinturas del Valle' },
  },
  {
    id: 'prod-008',
    name: 'Alicate universal 8"',
    description: 'Alicate de uso general, 8 pulgadas, acero cromado',
    barcode: '7890001000089',
    price: 55.00,
    stock: 18,
    min_stock: 5,
    category_id: 'cat-001',
    supplier_id: 'sup-001',
    image_url: null,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    categories: { name: 'Herramientas' },
    suppliers: { name: 'Distribuidora Nacional S.A.' },
  },
];

// Ventas demo (generadas para los últimos 30 días)
const now = new Date();
export const sales = [
  {
    id: 'sale-001',
    sale_number: 1001,
    employee_id: 'emp-001',
    customer_name: 'Juan Pérez',
    total: 205.50,
    created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    employees: { full_name: 'Carlos Administrador' },
    sale_items: [
      { id: 'si-001', sale_id: 'sale-001', product_id: 'prod-001', quantity: 2, unit_price: 85.00, subtotal: 170.00, products: { name: 'Martillo Carpintero 16oz', image_url: null } },
      { id: 'si-002', sale_id: 'sale-001', product_id: 'prod-003', quantity: 1, unit_price: 25.00, subtotal: 25.00, products: { name: 'Tornillos autorroscantes 1"', image_url: null } },
      { id: 'si-003', sale_id: 'sale-001', product_id: 'prod-002', quantity: 1, unit_price: 10.50, subtotal: 10.50, products: { name: 'Destornillador Phillips N°2', image_url: null } },
    ],
  },
  {
    id: 'sale-002',
    sale_number: 1002,
    employee_id: 'emp-002',
    customer_name: 'Cliente general',
    total: 120.00,
    created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    employees: { full_name: 'María Empleada' },
    sale_items: [
      { id: 'si-004', sale_id: 'sale-002', product_id: 'prod-004', quantity: 1, unit_price: 120.00, subtotal: 120.00, products: { name: 'Pintura Látex Blanca 1 galón', image_url: null } },
    ],
  },
  {
    id: 'sale-003',
    sale_number: 1003,
    employee_id: 'emp-001',
    customer_name: 'Constructora ABC',
    total: 595.00,
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    employees: { full_name: 'Carlos Administrador' },
    sale_items: [
      { id: 'si-005', sale_id: 'sale-003', product_id: 'prod-006', quantity: 2, unit_price: 280.00, subtotal: 560.00, products: { name: 'Cable eléctrico #12 (rollo 50m)', image_url: null } },
      { id: 'si-006', sale_id: 'sale-003', product_id: 'prod-007', quantity: 1, unit_price: 18.00, subtotal: 18.00, products: { name: 'Brocha 3 pulgadas', image_url: null } },
      { id: 'si-007', sale_id: 'sale-003', product_id: 'prod-008', quantity: 1, unit_price: 17.00, subtotal: 17.00, products: { name: 'Alicate universal 8"', image_url: null } },
    ],
  },
  {
    id: 'sale-004',
    sale_number: 1004,
    employee_id: 'emp-002',
    customer_name: 'Rosa Mamani',
    total: 90.50,
    created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    employees: { full_name: 'María Empleada' },
    sale_items: [
      { id: 'si-008', sale_id: 'sale-004', product_id: 'prod-002', quantity: 1, unit_price: 35.50, subtotal: 35.50, products: { name: 'Destornillador Phillips N°2', image_url: null } },
      { id: 'si-009', sale_id: 'sale-004', product_id: 'prod-003', quantity: 2, unit_price: 25.00, subtotal: 50.00, products: { name: 'Tornillos autorroscantes 1"', image_url: null } },
      { id: 'si-010', sale_id: 'sale-004', product_id: 'prod-007', quantity: 1, unit_price: 5.00, subtotal: 5.00, products: { name: 'Brocha 3 pulgadas', image_url: null } },
    ],
  },
  {
    id: 'sale-005',
    sale_number: 1005,
    employee_id: 'emp-001',
    customer_name: 'Cliente general',
    total: 338.00,
    created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    employees: { full_name: 'Carlos Administrador' },
    sale_items: [
      { id: 'si-011', sale_id: 'sale-005', product_id: 'prod-008', quantity: 2, unit_price: 55.00, subtotal: 110.00, products: { name: 'Alicate universal 8"', image_url: null } },
      { id: 'si-012', sale_id: 'sale-005', product_id: 'prod-001', quantity: 1, unit_price: 85.00, subtotal: 85.00, products: { name: 'Martillo Carpintero 16oz', image_url: null } },
      { id: 'si-013', sale_id: 'sale-005', product_id: 'prod-006', quantity: 1, unit_price: 143.00, subtotal: 143.00, products: { name: 'Cable eléctrico #12 (rollo 50m)', image_url: null } },
    ],
  },
];

// Contador para IDs únicos
let nextId = 1000;
export const generateId = (prefix = 'id') => `${prefix}-${++nextId}`;
export const generateSaleNumber = () => {
  const max = sales.reduce((m, s) => Math.max(m, s.sale_number), 1005);
  return max + 1;
};
