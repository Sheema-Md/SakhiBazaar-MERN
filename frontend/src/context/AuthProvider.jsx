import { useState } from 'react';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  // Initialize state synchronously to avoid cascading renders
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('sakhi_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('sakhi_user');
      }
    }
    return null;
  });

  const [loading] = useState(false);

  const API_URL = 'http://localhost:5000/api/auth';

  // Login handler
  const login = async (loginId, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { loginId, password });
      setUser(response.data);
      localStorage.setItem('sakhi_user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  // Register handler
  const register = async (name, username, email, phoneNumber, aadhaarNumber, password, confirmPassword, role) => {
    try {
      const payload = {
        name,
        username,
        email,
        phoneNumber,
        aadhaarNumber,
        password,
        confirmPassword,
        role
      };
      console.log('AuthProvider register payload:', payload);
      const response = await axios.post(`${API_URL}/register`, payload);
      setUser(response.data);
      localStorage.setItem('sakhi_user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Google sign in handler using Firebase
  const loginWithGoogle = async (role) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${API_URL}/google-login`, {
        idToken,
        role: role || 'customer'
      });

      setUser(response.data);
      localStorage.setItem('sakhi_user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      console.error('Firebase/Google Auth Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Google Authentication failed.'
      };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('sakhi_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
