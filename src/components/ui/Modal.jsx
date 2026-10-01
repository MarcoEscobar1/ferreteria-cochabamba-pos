import { useEffect } from 'react';
import { HiOutlineX } from 'react-icons/hi';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-steel-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — bottom sheet on mobile, centered on sm+ */}
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl ring-1 ring-steel-200`}
        style={{ animation: 'modalIn 0.22s ease-out' }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-steel-100 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-steel-900 sm:text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600 transition-colors"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @media (max-width: 639px) {
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(100%); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
}
