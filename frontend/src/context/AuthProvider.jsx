import { useState } from 'react';
import axios from 'axios';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, authPersistenceReady, googleProvider } from '../config/firebase';
import { AuthContext } from './AuthContext';
import { API_URL } from '../config/api';

export const AuthProvider = ({ children }) => {
  // Initialize state synchronously to avoid cascading renders
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('sakhi_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem('sakhi_user');
      }
    }
    return null;
  });

  const [loading] = useState(false);

  // Login handler
  const login = async (loginId, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { loginId, password });
      setUser(response.data);
      sessionStorage.setItem('sakhi_user', JSON.stringify(response.data));
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
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      setUser(response.data);
      sessionStorage.setItem('sakhi_user', JSON.stringify(response.data));
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
      await authPersistenceReady;
      await signOut(auth);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${API_URL}/auth/google-login`, {
        idToken,
        role: role || 'customer'
      });

      setUser(response.data);
      sessionStorage.setItem('sakhi_user', JSON.stringify(response.data));
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
    sessionStorage.removeItem('sakhi_user');
    void signOut(auth).catch((error) => {
      console.error('Firebase sign-out failed:', error);
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
