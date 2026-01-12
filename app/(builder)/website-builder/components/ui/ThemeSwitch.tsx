import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import { themeStore } from '@/app/(builder)/website-builder/lib/stores/theme';
import { IconButton } from './IconButton';

interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch = memo(({ className }: ThemeSwitchProps) => {
  const theme = useStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    domLoaded && (
      <IconButton
        className={className}
        icon={theme === 'dark' ? 'i-ph-moon-stars-duotone' : 'i-ph-sun-dim-duotone'}
        size="xl"
        title={`Current Theme: ${theme === 'dark' ? 'Dark' : 'Light'} (Change theme from main app settings)`}
        onClick={() => {
          // Theme is controlled by main app - show tooltip or navigate to settings
          console.log('Theme is controlled by the main app. Use the theme selector in the config bar to change themes.');
        }}
      />
    )
  );
});
