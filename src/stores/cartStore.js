import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  customerName: '',

  addItem: (product) => {
    const items = get().items;
    const existing = items.find((item) => item.product_id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) return false;
      set({
        items: items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
            : item
        ),
      });
    } else {
      if (product.stock <= 0) return false;
      set({
        items: [
          ...items,
          {
            product_id: product.id,
            product_name: product.name,
            unit_price: product.price,
            quantity: 1,
            subtotal: product.price,
            stock: product.stock,
            image_url: product.image_url,
          },
        ],
      });
    }
    return true;
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.product_id === productId
          ? { ...item, quantity, subtotal: quantity * item.unit_price }
          : item
      ),
    });
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.product_id !== productId) });
  },

  setCustomerName: (name) => set({ customerName: name }),

  getTotal: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  clear: () => set({ items: [], customerName: '' }),
}));
