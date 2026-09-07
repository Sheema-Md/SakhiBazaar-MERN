import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Load cart when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (user && user.token) {
        setLoadingCart(true);

        try {
          const res = await api.get('/cart');
          setCartItems(res.data.items || []);
        } catch (err) {
          console.error('Failed to fetch cart from backend:', err);
          setCartItems([]);
        } finally {
          setLoadingCart(false);
        }

        return;
      }

      // Guest cart
      const storedCart = localStorage.getItem('sakhi_cart');

      if (!storedCart) {
        setCartItems([]);
        return;
      }

      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Failed to parse guest cart:', err);
        setCartItems([]);
      }
    };

    fetchCart();
  }, [user]);

  // Persist guest cart
  useEffect(() => {
    if (!user) {
      localStorage.setItem(
        'sakhi_cart',
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, user]);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    if (!product?._id) {
      throw new Error('Product information is unavailable.');
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      throw new Error('Quantity must be at least 1.');
    }

    const stock = Number(product.stockQuantity);

    const existingItem = cartItems.find(
      (item) => item.product?._id === product._id
    );

    const existingQuantity = existingItem?.quantity || 0;

    if (
      Number.isFinite(stock) &&
      stock >= 0 &&
      existingQuantity + qty > stock
    ) {
      throw new Error(
        `Only ${stock} item${stock === 1 ? '' : 's'} available.`
      );
    }

    if (user && user.token) {
      const res = await api.post('/cart', {
        productId: product._id,
        quantity: qty,
      });

      setCartItems(res.data.items || []);

      return res.data;
    }

    // Guest cart
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product?._id === product._id
      );

      if (existing) {
        return prev.map((item) => {
          if (item.product?._id !== product._id) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + qty,
          };
        });
      }

      return [
        ...prev,
        {
          product,
          quantity: qty,
          savedForLater: false,
        },
      ];
    });

    return {
      items: cartItems,
    };
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    if (!productId) {
      throw new Error('Product ID is required.');
    }

    if (user && user.token) {
      const res = await api.delete(`/cart/${productId}`);

      setCartItems(res.data.items || []);

      return res.data;
    }

    setCartItems((prev) =>
      prev.filter(
        (item) => item.product?._id !== productId
      )
    );
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (!productId) {
      throw new Error('Product ID is required.');
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty)) {
      throw new Error('Quantity must be a whole number.');
    }

    if (qty <= 0) {
      return removeFromCart(productId);
    }

    const item = cartItems.find(
      (cartItem) => cartItem.product?._id === productId
    );

    const stock = Number(item?.product?.stockQuantity);

    if (
      Number.isFinite(stock) &&
      stock >= 0 &&
      qty > stock
    ) {
      throw new Error(
        `Only ${stock} item${stock === 1 ? '' : 's'} available.`
      );
    }

    if (user && user.token) {
      const res = await api.put('/cart', {
        productId,
        quantity: qty,
      });

      setCartItems(res.data.items || []);

      return res.data;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product?._id !== productId) {
          return item;
        }

        return {
          ...item,
          quantity: qty,
        };
      })
    );
  };

  // Save / unsave for later
  const toggleSaveForLater = async (productId) => {
    if (!productId) {
      throw new Error('Product ID is required.');
    }

    if (user && user.token) {
      const res = await api.put(
        '/cart/save-for-later',
        { productId }
      );

      setCartItems(res.data.items || []);

      return res.data;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product?._id !== productId) {
          return item;
        }

        return {
          ...item,
          savedForLater: !item.savedForLater,
        };
      })
    );
  };

  // Clear cart
  const clearCart = async () => {
    if (user && user.token) {
      const res = await api.delete('/cart');

      setCartItems(res.data.items || []);

      return res.data;
    }

    setCartItems([]);
  };

  // Cart item count
  const getCartCount = () => {
    return cartItems
      .filter((item) => !item.savedForLater)
      .reduce(
        (total, item) => total + item.quantity,
        0
      );
  };

  // Cart total
  const getCartTotal = () => {
    return cartItems
      .filter((item) => !item.savedForLater)
      .reduce(
        (total, item) =>
          total +
          (item.product?.price || 0) * item.quantity,
        0
      );
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