import { useState, useEffect, useContext } from 'react';
import { WishlistContext } from './WishlistContext';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from backend or localStorage on mount/user change
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user && user.token) {
        setLoading(true);
        try {
          const res = await api.get('/wishlist');
          setWishlistItems(res.data || []);
        } catch (err) {
          console.error('Failed to fetch wishlist from backend:', err);
        } finally {
          setLoading(false);
        }
      } else {
        const stored = localStorage.getItem('sakhi_wishlist');
        if (stored) {
          try {
            setWishlistItems(JSON.parse(stored));
          } catch (err) {
            console.error('Failed to parse wishlist:', err);
          }
        } else {
          setWishlistItems([]);
        }
      }
    };
    fetchWishlist();
  }, [user]);

  // Save guest wishlist to localStorage on change
  useEffect(() => {
    if (!user) {
      localStorage.setItem('sakhi_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const toggleWishlist = async (product) => {
    const exists = wishlistItems.some((item) => item._id === product._id);

    if (user && user.token) {
      try {
        if (exists) {
          const res = await api.delete(`/wishlist/${product._id}`);
          setWishlistItems(res.data || []);
        } else {
          const res = await api.post('/wishlist', { productId: product._id });
          setWishlistItems(res.data || []);
        }
      } catch (err) {
        console.error('Failed to toggle wishlist on backend:', err);
      }
    } else {
      // Guest local state toggle
      setWishlistItems((prev) => {
        if (exists) {
          return prev.filter((item) => item._id !== product._id);
        } else {
          return [...prev, product];
        }
      });
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
