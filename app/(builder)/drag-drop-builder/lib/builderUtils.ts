/**
 * Utility functions for the drag-drop-builder
 */

/**
 * Debounce function to limit how often a function is called
 */
export function debounce(callback: Function, timeout = 1000) {
  let timer: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, timeout);
  };
}

/**
 * Get the base URL for API calls
 * Uses environment variables for development and production
 */
export function getBaseUrl(standaloneServer: boolean): string {
  // For standalone server mode (not currently used in production)
  if (standaloneServer) {
    const standaloneServerPort = 12785;
    return `http://localhost:${standaloneServerPort}`;
  }

  // Use environment variable if available, otherwise default to /api/builder/handle
  // In production, NEXT_PUBLIC_BUILDER_API_URL should be set to your production URL
  const apiUrl =
    process.env.NEXT_PUBLIC_BUILDER_API_URL || '/api/builder/handle';
  return apiUrl;
}

/**
 * Get the full URL for an image
 * Uses environment variables for development and production
 */
export function getImageUrl(
  standaloneServer: boolean,
  imageSrc: string
): string {
  // For standalone server mode
  if (standaloneServer) {
    const standaloneServerPort = 12785;
    return `http://localhost:${standaloneServerPort}/asset?path=${imageSrc}`;
  }

  // In development and production, images are served from the same domain
  // Use environment variable if you need a different CDN or asset URL
  const baseUrl = process.env.NEXT_PUBLIC_ASSETS_URL || '';
  return baseUrl ? `${baseUrl}${imageSrc}` : imageSrc;
}

/**
 * Check if a mouse event is on a specific element
 */
/**
 * Check if a mouse event is on a specific element
 */
export function isEventOnElement(
  element: Element | null,
  event: React.MouseEvent<any> | MouseEvent
): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom &&
    event.clientX >= rect.left &&
    event.clientX <= rect.right
  );
}

/**
 * Check if a mouse event is on the top half of an element
 */
export function isElementTopHalf(
  element: Element | null,
  event: React.MouseEvent<any> | MouseEvent
): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const middle = (rect.bottom - rect.top) / 2 + rect.top;
  return event.clientY < middle;
}
