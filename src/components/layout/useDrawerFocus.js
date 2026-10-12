import { useEffect, useRef } from 'react';

export default function useDrawerFocus(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const drawer = ref.current;
    const elements = () => [...drawer.querySelectorAll('a[href], button:not(:disabled)')].filter((element) => element.getClientRects().length);
    elements()[0]?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const items = elements();
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
    };
    drawer.addEventListener('keydown', handleKey);
    return () => {
      drawer.removeEventListener('keydown', handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, onClose]);
  return ref;
}
