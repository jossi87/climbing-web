let datePickerStylePromise: Promise<void> | null = null;

/**
 * Load react-datepicker base styles only when datepicker UI is opened.
 * Keeps route-level datepicker CSS out of initial render-blocking styles.
 */
export function ensureDatePickerStyles(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.getElementById('react-datepicker-inline-style')) return Promise.resolve();
  if (datePickerStylePromise) return datePickerStylePromise;

  datePickerStylePromise = import('react-datepicker/dist/react-datepicker.css?inline').then((mod) => {
    if (document.getElementById('react-datepicker-inline-style')) return;
    const style = document.createElement('style');
    style.id = 'react-datepicker-inline-style';
    style.textContent = mod.default;
    document.head.appendChild(style);
  });

  return datePickerStylePromise;
}
