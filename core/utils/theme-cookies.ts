'use server';
import { cookies } from 'next/headers';
interface ThemeConfig {
  theme: string;
  colorScheme: string;
  scale: number;
}

const THEME_COOKIE_NAME = 'd-admin-theme';
const DEFAULT_THEME: ThemeConfig = {
  theme: 'd-admin-dark',
  colorScheme: 'd-admin-dark',
  scale: 14,
};

export async function getThemeFromCookies(): Promise<ThemeConfig> {
  try {
    const cookieStore = await cookies();
    const themeCookie = cookieStore.get(THEME_COOKIE_NAME);

    if (themeCookie?.value) {
      const parsed = JSON.parse(themeCookie.value);
      return {
        theme: parsed.theme || DEFAULT_THEME.theme,
        colorScheme: parsed.colorScheme || DEFAULT_THEME.colorScheme,
        scale: parsed.scale || DEFAULT_THEME.scale,
      };
    }
  } catch (error: unknown) {
    const err = error as { digest?: string; message?: string };
    if (
      err?.digest !== 'DYNAMIC_SERVER_USAGE' &&
      !err?.message?.includes('Dynamic server usage')
    ) {
      console.error('Error reading theme cookie:', error);
    }
  }

  return DEFAULT_THEME;
}

export async function setThemeCookie(config: ThemeConfig): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(THEME_COOKIE_NAME, JSON.stringify(config), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    console.error('Error setting theme cookie:', error);
  }
}
