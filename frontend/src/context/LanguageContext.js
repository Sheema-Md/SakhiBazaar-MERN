import { createContext, useContext } from 'react';

export const LanguageContext = createContext(null);

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export default LanguageContext;
