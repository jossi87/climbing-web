let swaggerStylePromise: Promise<void> | null = null;

/**
 * Load Swagger UI stylesheet only when the Swagger route is opened.
 * Keeps route-only CSS out of initial render-blocking styles.
 */
export function ensureSwaggerStyles(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.getElementById('swagger-ui-inline-style')) return Promise.resolve();
  if (swaggerStylePromise) return swaggerStylePromise;

  swaggerStylePromise = import('swagger-ui-react/swagger-ui.css?inline').then((mod) => {
    if (document.getElementById('swagger-ui-inline-style')) return;
    const style = document.createElement('style');
    style.id = 'swagger-ui-inline-style';
    style.textContent = mod.default;
    document.head.appendChild(style);
  });

  return swaggerStylePromise;
}
