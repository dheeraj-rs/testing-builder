import { atom } from 'nanostores';

export type Theme = 'dark' | 'light';

export function themeIsDark() {
  return themeStore.get() === 'dark';
}

export const DEFAULT_THEME: Theme = 'dark';

export const themeStore = atom<Theme>(initStore());

function getThemeFromCookie(): Theme | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const themeCookie = cookies.find((c) =>
    c.trim().startsWith('d-admin-theme=')
  );

  if (themeCookie) {
    try {
      const value = themeCookie.split('=')[1];
      const decoded = decodeURIComponent(value);
      const parsed = JSON.parse(decoded);

      // Check if theme name contains 'dark'
      if (parsed.theme && typeof parsed.theme === 'string') {
        return parsed.theme.includes('dark') ? 'dark' : 'light';
      }

      // Check colorScheme property
      if (parsed.colorScheme) {
        return parsed.colorScheme as Theme;
      }
    } catch (e) {
      console.error('Error parsing theme cookie:', e);
    }
  }

  return null;
}

function initStore(): Theme {
  if (typeof window !== 'undefined') {
    // First try to get theme from cookie
    const cookieTheme = getThemeFromCookie();
    if (cookieTheme) {
      // Set dark class immediately
      if (cookieTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return cookieTheme;
    }

    // Fallback to color-scheme CSS property
    const colorScheme = getComputedStyle(document.documentElement)
      .getPropertyValue('color-scheme')
      .trim();

    if (colorScheme === 'dark' || colorScheme === 'light') {
      if (colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      return colorScheme as Theme;
    }
  }

  return DEFAULT_THEME;
}

// Function to detect and update theme from main app
export function syncThemeFromMainApp() {
  if (typeof window === 'undefined') return;

  // First check cookie
  const cookieTheme = getThemeFromCookie();
  if (cookieTheme) {
    const currentTheme = themeStore.get();
    if (currentTheme !== cookieTheme) {
      themeStore.set(cookieTheme);

      // Update HTML class for Tailwind dark mode
      if (cookieTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return;
  }

  // Fallback to color-scheme
  const colorScheme = getComputedStyle(document.documentElement)
    .getPropertyValue('color-scheme')
    .trim();

  if (colorScheme === 'dark' || colorScheme === 'light') {
    const newTheme = colorScheme as Theme;
    if (themeStore.get() !== newTheme) {
      themeStore.set(newTheme);

      // Update HTML class for Tailwind dark mode
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}

// Initialize theme sync on client side
if (typeof window !== 'undefined') {
  // Sync theme on load
  syncThemeFromMainApp();

  let syncTimeout: NodeJS.Timeout;
  const debouncedSync = () => {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(syncThemeFromMainApp, 100);
  };

  // Watch for theme changes using MutationObserver on the theme-css link element
  const themeLink = document.getElementById('theme-css');
  if (themeLink) {
    const observer = new MutationObserver(debouncedSync);
    observer.observe(themeLink, {
      attributes: true,
      attributeFilter: ['href'],
    });
  }

  // Watch for cookie changes
  let lastCookie = document.cookie;
  setInterval(() => {
    const currentCookie = document.cookie;
    if (currentCookie !== lastCookie) {
      lastCookie = currentCookie;
      debouncedSync();
    }
  }, 500);

  // Also watch for changes to the html element's style attribute
  const htmlObserver = new MutationObserver(debouncedSync);
  htmlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
  });

  // Periodically check for theme changes (fallback)
  setInterval(syncThemeFromMainApp, 1000);
}
