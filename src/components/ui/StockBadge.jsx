export function StockBadge({ stock, minStock = 5 }) {
  if (stock === 0) {
    return <span className="badge-danger">Agotado</span>;
  }
  if (stock <= minStock) {
    return <span className="badge-warning">Stock bajo: {stock}</span>;
  }
  return <span className="badge-success">{stock} en stock</span>;
}

export default StockBadge;
