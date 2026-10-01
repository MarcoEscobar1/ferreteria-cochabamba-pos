import Modal from './Modal';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) {
  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-steel-600">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button onClick={onClose} className="btn-secondary w-full sm:w-auto" disabled={loading}>
          {cancelText}
        </button>
        <button onClick={onConfirm} className={`${btnClass} w-full sm:w-auto`} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Procesando...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
}
