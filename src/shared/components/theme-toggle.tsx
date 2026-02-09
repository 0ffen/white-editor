import * as React from 'react';
import { MoonStarIcon, SunIcon } from 'lucide-react';
import { getTranslate } from '@/shared';
import { Button } from '@/shared/components';

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((isDark) => !isDark);

  return (
    <Button
      type='button'
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      data-style='ghost'
      tooltip={getTranslate('theme')}
    >
      {isDarkMode ? <MoonStarIcon /> : <SunIcon />}
    </Button>
  );
}
