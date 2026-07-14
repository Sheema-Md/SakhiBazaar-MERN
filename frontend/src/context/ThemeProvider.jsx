import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const ThemeProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Sync with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync logged-in user theme preferences on mount or login
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user && user.token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/preferences', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (res.data && res.data.theme) {
            setTheme(res.data.theme);
          }
        } catch (err) {
          console.error('Failed to fetch user preferences:', err.message);
        }
      }
    };
    fetchUserPreferences();
  }, [user]);

  // Handle toggling and syncing to backend
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    if (user && user.token) {
      try {
        await axios.put(
          'http://localhost:5000/api/auth/preferences',
          { theme: newTheme },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } catch (err) {
        console.error('Failed to save theme preference:', err.message);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
