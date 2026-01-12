import type { Metadata } from 'next';
import { stripIndents } from '@/app/(builder)/website-builder/utils/stripIndent';
import 'react-toastify/dist/ReactToastify.css';
import '@xterm/xterm/css/xterm.css';
import './styles/index.scss';

export const metadata: Metadata = {
  title: 'D Admin - AI Website Builder',
  description: 'AI-powered full-stack web development in the browser',
};

const inlineThemeScript = stripIndents`
  (function() {
    try {
      const cookies = document.cookie.split(';');
      const themeCookie = cookies.find(c => c.trim().startsWith('d-admin-theme='));
      
      if (themeCookie) {
        const value = themeCookie.split('=')[1];
        const decoded = decodeURIComponent(value);
        const parsed = JSON.parse(decoded);
        
        // Check if theme name contains 'dark' or if colorScheme is 'dark'
        const isDark = (parsed.theme && parsed.theme.includes('dark')) || parsed.colorScheme === 'dark';
        
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  })();
`;

export default function WebsiteBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: inlineThemeScript }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <div id="builder-root" className="w-full h-full">
        {children}
      </div>
    </>
  );
}
