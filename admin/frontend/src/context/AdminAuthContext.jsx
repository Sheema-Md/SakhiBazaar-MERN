import { createContext, useState, useEffect } from 'react';

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const stored = localStorage.getItem('sakhi_admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sakhi_admin_theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sakhi_admin_theme', theme);
  }, [theme]);

  const login = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('sakhi_admin_user', JSON.stringify(userData));
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('sakhi_admin_user');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, login, logout, theme, toggleTheme }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
