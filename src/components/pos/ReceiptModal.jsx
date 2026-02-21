import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Modal from '../ui/Modal';
import {
  HiOutlinePrinter,
  HiOutlineDownload,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

export default function ReceiptModal({ sale, onClose, onDownload }) {
  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Recibo-${sale.sale_number}`,
  });

  return (
    <Modal open={true} onClose={onClose} title="Venta Procesada" size="md">
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
        <HiOutlineCheckCircle className="h-8 w-8 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800">¡Venta exitosa!</p>
          <p className="text-sm text-emerald-600">Venta N° {sale.sale_number} registrada correctamente</p>
        </div>
      </div>

      {/* Printable Receipt */}
      <div ref={receiptRef} className="print-area rounded-xl border border-steel-200 bg-white p-6">
        <div className="text-center">
          <h2 className="font-display text-lg font-bold text-steel-900">FERRETERÍA COCHABAMBA</h2>
          <p className="text-xs text-steel-500">Cochabamba, Bolivia</p>
        </div>

        <div className="my-4 border-t border-dashed border-steel-300" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-steel-500">Venta N°:</span>
            <span className="font-semibold">{sale.sale_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-steel-500">Fecha:</span>
            <span>{formatDateTime(sale.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-steel-500">Empleado:</span>
            <span>{sale.employees?.full_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-steel-500">Cliente:</span>
            <span>{sale.customer_name || 'Cliente general'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-steel-500">Método:</span>
            <span>Efectivo (BOB)</span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-steel-300" />

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-200 text-left text-xs text-steel-500">
              <th className="pb-2">Producto</th>
              <th className="pb-2 text-center">Cant</th>
              <th className="pb-2 text-right">P.Unit</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(sale.sale_items || []).map((item, i) => (
              <tr key={i} className="border-b border-steel-100">
                <td className="py-1.5 pr-2">{item.product_name}</td>
                <td className="py-1.5 text-center">{item.quantity}</td>
                <td className="py-1.5 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="py-1.5 text-right font-medium">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="my-3 border-t border-dashed border-steel-300" />

        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold text-steel-900">TOTAL</span>
          <span className="font-mono text-lg font-bold text-brand-700">
            {formatCurrency(sale.total)}
          </span>
        </div>

        <div className="mt-4 border-t border-dashed border-steel-300 pt-3 text-center text-xs text-steel-400">
          <p>¡Gracias por su compra!</p>
          <p>Vuelva pronto</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={handlePrint} className="btn-secondary flex-1">
          <HiOutlinePrinter className="h-4 w-4" />
          Imprimir
        </button>
        <button onClick={onDownload} className="btn-primary flex-1">
          <HiOutlineDownload className="h-4 w-4" />
          Descargar PDF
        </button>
      </div>
    </Modal>
  );
}
