import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('ventas, acceso y fechas conservan sus invariantes', async (t) => {
  const server = await createServer({ server: { middlewareMode: true } });
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  try {
    const api = await server.ssrLoadModule('/src/api/demoApi.js');
    const { products, sales } = await server.ssrLoadModule('/src/data/demoData.js');
    const { useAuthStore: auth } = await server.ssrLoadModule('/src/stores/authStore.js');
    const { useCartStore: cart } = await server.ssrLoadModule('/src/stores/cartStore.js');

    await t.test('una venta rechazada no modifica ningún stock', async () => {
      const before = products.map((product) => product.stock);
      const count = sales.length;
      await assert.rejects(api.processSale({ employee_id: 'emp-001', items: [
        { product_id: products[0].id, quantity: 1 },
        { product_id: products[1].id, quantity: products[1].stock + 1 },
      ] }), /Stock insuficiente/);
      assert.deepEqual(products.map((product) => product.stock), before);
      assert.equal(sales.length, count);
    });

    await t.test('cantidades inválidas y duplicadas no evaden el stock', async () => {
      for (const quantity of [0, -1, 1.5, NaN]) {
        await assert.rejects(api.processSale({ employee_id: 'emp-001', items: [{ product_id: products[0].id, quantity }] }), /Cantidad inválida/);
      }
      await assert.rejects(api.processSale({ employee_id: 'emp-001', items: [
        { product_id: products[0].id, quantity: products[0].stock },
        { product_id: products[0].id, quantity: 1 },
      ] }), /Stock insuficiente/);
    });

    await t.test('una venta válida descuenta una vez y conserva el nombre del producto', async () => {
      const product = { ...products[0] };
      const result = await api.processSale({ employee_id: 'emp-001', items: [{ product_id: product.id, quantity: 2 }] });
      const sale = await api.fetchSaleById(result.sale_id);
      assert.equal(products[0].stock, product.stock - 2);
      assert.equal(sale.sale_items[0].product_name, product.name);
      assert.equal(sale.total, product.price * 2);
    });

    await t.test('los empleados creados pueden acceder y las credenciales no se revelan', async () => {
      const employee = await api.createEmployee({ email: ' NUEVO@EJEMPLO.COM ', full_name: 'Nuevo empleado', role: 'employee', password: 'clave123' });
      await auth.getState().signIn(' nuevo@ejemplo.com ', 'clave123');
      assert.equal(auth.getState().employee.id, employee.id);
      assert.ok(!storage.get('demo_session').includes('clave123'));
      await assert.rejects(auth.getState().signIn('nadie@ejemplo.com', 'error'), (error) => !error.message.includes('admin123') && !error.message.includes('emp123'));
      await api.toggleEmployeeActive(employee.id, false);
      await assert.rejects(auth.getState().signIn(employee.email, 'clave123'), /deshabilitada/);
      await auth.getState().initialize();
      assert.equal(auth.getState().employee, null);
    });

    await t.test('el carrito respeta el stock y se limpia al cerrar sesión', async () => {
      cart.getState().addItem(products[0]);
      cart.getState().updateQuantity(products[0].id, products[0].stock + 1);
      assert.equal(cart.getState().items[0].quantity, 1);
      await auth.getState().signOut();
      assert.equal(cart.getState().items.length, 0);
    });

    await t.test('desvincular una categoría elimina la relación visible', async () => {
      const updated = await api.updateProduct(products[0].id, { category_id: null });
      assert.equal(updated.category_id, null);
      assert.equal(updated.categories, null);
    });

    await t.test('la fecha de los reportes respeta el día local', async () => {
      const { formatDateISO } = await server.ssrLoadModule('/src/utils/formatters.js');
      assert.equal(formatDateISO(new Date(2026, 9, 11, 23, 45)), '2026-10-11');
    });
  } finally {
    await server.close();
    delete globalThis.sessionStorage;
  }
});
