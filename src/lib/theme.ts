export type ThemeMode = 'light';

export function getInitialTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    localStorage.setItem('444_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  return 'light';
}

export function applyTheme(_theme?: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark');
  root.classList.add('light');
  localStorage.setItem('444_theme', 'light');
}

