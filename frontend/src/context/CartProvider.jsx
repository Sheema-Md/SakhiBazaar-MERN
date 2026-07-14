import { useState, useEffect, useContext } from 'react';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Load cart items on mount or user change
  useEffect(() => {
    const fetchCart = async () => {
      if (user && user.token) {
        setLoadingCart(true);
        try {
          const res = await api.get('/cart');
          setCartItems(res.data.items || []);
        } catch (err) {
          console.error('Failed to fetch cart from backend:', err);
        } finally {
          setLoadingCart(false);
        }
      } else {
        // Guest user: load from localStorage
        const storedCart = localStorage.getItem('sakhi_cart');
        if (storedCart) {
          try {
            setCartItems(JSON.parse(storedCart));
          } catch (err) {
            console.error('Failed to parse cart items:', err);
          }
        } else {
          setCartItems([]);
        }
      }
    };
    fetchCart();
  }, [user]);

  // Sync guest cart to localStorage when it changes (only when guest)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('sakhi_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1) => {
    if (user && user.token) {
      try {
        const res = await api.post('/cart', { productId: product._id, quantity });
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to add to cart on backend:', err);
      }
    } else {
      // Guest
      setCartItems((prev) => {
        const existing = prev.find((item) => item.product?._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item.product?._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity, savedForLater: false }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (user && user.token) {
      try {
        const res = await api.delete(`/cart/${productId}`);
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to remove from cart on backend:', err);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.product?._id !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user && user.token) {
      try {
        const res = await api.put('/cart', { productId, quantity });
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to update cart quantity on backend:', err);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product?._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const toggleSaveForLater = async (productId) => {
    if (user && user.token) {
      try {
        const res = await api.put('/cart/save-for-later', { productId });
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to toggle save for later on backend:', err);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product?._id === productId ? { ...item, savedForLater: !item.savedForLater } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user && user.token) {
      try {
        const res = await api.delete('/cart');
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to clear cart on backend:', err);
      }
    } else {
      setCartItems([]);
    }
  };

  const getCartCount = () => {
    return cartItems
      .filter(item => !item.savedForLater)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems
      .filter(item => !item.savedForLater)
      .reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loadingCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleSaveForLater,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
