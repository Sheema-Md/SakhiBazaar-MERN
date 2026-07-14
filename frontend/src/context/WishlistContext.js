import { createContext, useContext } from 'react';

export const WishlistContext = createContext(null);

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export default WishlistContext;
