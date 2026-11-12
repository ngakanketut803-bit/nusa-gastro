import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from './theme';

const THEME_STORAGE_KEY = 'nusa-gastro-theme';

const setDocumentTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light';
};

const getInitialTheme = () => {
  const theme = window.localStorage.getItem(THEME_STORAGE_KEY) === 'night' ? 'night' : 'light';
  setDocumentTheme(theme);
  return theme;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const toggleTheme = useCallback(() => {
    const nextTheme = document.documentElement.dataset.theme === 'night' ? 'light' : 'night';
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setDocumentTheme(nextTheme);
    setTheme(nextTheme);
  }, []);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};
