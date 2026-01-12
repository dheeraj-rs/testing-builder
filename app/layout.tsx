import type { Metadata } from "next";
import { getThemeFromCookies } from "@/core/utils/theme-cookies";
import AppProviders from "@/core/providers/AppProviders";
import "./globals.css";
import "@/core/styles/index.scss";

export const metadata: Metadata = {
  title: 'D-Admin - Website Builder & Management Platform',
  description: 'Professional website builder and management platform. Create, deploy, and manage websites with advanced features, templates, and analytics.',
  keywords: 'website builder, web development, website management, templates, portfolio, SEO, analytics, drag and drop, responsive design',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeConfig = await getThemeFromCookies();
  const isDark = themeConfig.theme.includes('dark') || themeConfig.colorScheme === 'dark';

  return (
    <html lang="en" className={isDark ? 'dark' : ''}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          id="theme-css"
          rel="stylesheet"
          href={`/themes/${themeConfig.theme}/theme.css`}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html { font-size: ${themeConfig.scale}px; }`,
          }}
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className='antialiased'
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
