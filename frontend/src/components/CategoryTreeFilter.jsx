import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronRight, ChevronDown, CheckSquare, Square, DollarSign, MapPin } from 'lucide-react';

const CATEGORY_TREE = {
  'Clothing': ['Sarees', 'Kurtis', 'Shawls', 'Kids Wear'],
  'Handmade Crafts': ['Wooden Toys', 'Pottery', 'Embroidered Bags', 'Paintings'],
  'Food': ['Spices', 'Pickles', 'Organic Honey', 'Sweets'],
  'Jewelry': ['Terracotta Jewelry', 'Silver Filigree', 'Beaded Necklaces', 'Earrings'],
  'Home Decor': ['Wall Hangings', 'Cushion Covers', 'Candles', 'Table Runners']
};

const CategoryTreeFilter = ({ onFilterChange, initialFilters = {} }) => {
  // Toggle states for collapsible category folders
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Selected categories and subcategories
  const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories || []);
  const [selectedSubcategories, setSelectedSubcategories] = useState(initialFilters.subcategories || []);

  // Price range states
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

  // Stock status list
  const [stockStatus, setStockStatus] = useState(initialFilters.stockStatus || []);

  // Discount offer state
  const [offerOnly, setOfferOnly] = useState(initialFilters.offer || false);

  // Shipping location state
  const [location, setLocation] = useState(initialFilters.location || '');

  // Toggle collapse for parent categories
  const toggleCategoryCollapse = (catName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Handle parent category selection
  const handleParentSelect = (catName) => {
    const isSelected = selectedCategories.includes(catName);
    const subcats = CATEGORY_TREE[catName];

    if (isSelected) {
      // Remove parent
      setSelectedCategories(prev => prev.filter(c => c !== catName));
      // Remove all its subcategories
      setSelectedSubcategories(prev => prev.filter(s => !subcats.includes(s)));
    } else {
      // Add parent
      setSelectedCategories(prev => [...prev, catName]);
      // Add all its subcategories
      setSelectedSubcategories(prev => {
        const unique = new Set([...prev, ...subcats]);
        return Array.from(unique);
      });
    }
  };

  // Handle child subcategory selection
  const handleSubcategorySelect = (subName, parentName) => {
    const isSelected = selectedSubcategories.includes(subName);
    const subcats = CATEGORY_TREE[parentName];

    let newSubcats;
    if (isSelected) {
      newSubcats = selectedSubcategories.filter(s => s !== subName);
      setSelectedSubcategories(newSubcats);
      // Remove parent if it was selected
      setSelectedCategories(prev => prev.filter(c => c !== parentName));
    } else {
      newSubcats = [...selectedSubcategories, subName];
      setSelectedSubcategories(newSubcats);
      
      // If all subcategories of this parent are now selected, check the parent
      const allSelected = subcats.every(s => newSubcats.includes(s));
      if (allSelected) {
        setSelectedCategories(prev => [...prev, parentName]);
      }
    }
  };

  // Toggle stock status selection
  const handleStockSelect = (status) => {
    if (stockStatus.includes(status)) {
      setStockStatus(prev => prev.filter(s => s !== status));
    } else {
      setStockStatus(prev => [...prev, status]);
    }
  };

  // Clear all filters
  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setMinPrice('');
    setMaxPrice('');
    setStockStatus([]);
    setOfferOnly(false);
    setLocation('');
  };

  // Trigger callback when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // Build API-friendly query lists
      const categoriesParam = selectedCategories.join(',');
      
      // Only include subcategories that are checked, but if their parent is fully checked
      // then skip them so the backend fetches everything under that parent
      const subcategoriesParam = selectedSubcategories.filter(sub => {
        const parent = Object.keys(CATEGORY_TREE).find(cat => CATEGORY_TREE[cat].includes(sub));
        return parent && !selectedCategories.includes(parent);
      }).join(',');

      onFilterChange({
        categories: categoriesParam,
        subcategories: subcategoriesParam,
        minPrice,
        maxPrice,
        stockStatus: stockStatus.join(','),
        offer: offerOnly,
        location: location.trim()
      });
    }, 300);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedSubcategories, minPrice, maxPrice, stockStatus, offerOnly, location]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-rose-50/50 dark:border-slate-700/50">
        <SlidersHorizontal size={16} className="text-rose-500" />
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Filters</h3>
      </div>

      {/* 1. Category Tree Sidebar */}
      <div className="space-y-3">
        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Categories & Subcategories
        </label>
        
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {Object.keys(CATEGORY_TREE).map((parentCat) => {
            const isParentChecked = selectedCategories.includes(parentCat);
            const isCollapsed = collapsedCategories[parentCat];
            const subcats = CATEGORY_TREE[parentCat];

            return (
              <div key={parentCat} className="space-y-1">
                {/* Parent Row */}
                <div className="flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-750/30 p-1.5 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleParentSelect(parentCat)}
                      className="text-rose-500 dark:text-rose-400 hover:scale-105 transition-transform"
                    >
                      {isParentChecked ? (
                        <CheckSquare size={16} className="fill-current text-rose-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                    <span 
                      onClick={() => handleParentSelect(parentCat)}
                      className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {parentCat}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCategoryCollapse(parentCat)}
                    className="text-slate-400 hover:text-slate-650 p-0.5"
                  >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Child Subcategories */}
                {!isCollapsed && (
                  <div className="pl-6 space-y-1.5 py-1 border-l border-rose-50/70 dark:border-slate-700/60 ml-3.5">
                    {subcats.map((subcat) => {
                      const isSubChecked = selectedSubcategories.includes(subcat);
                      return (
                        <div key={subcat} className="flex items-center gap-2 hover:bg-slate-50/30 dark:hover:bg-slate-750/10 p-1 rounded-md">
                          <button
                            type="button"
                            onClick={() => handleSubcategorySelect(subcat, parentCat)}
                            className="text-slate-400 dark:text-slate-500 hover:text-rose-500"
                          >
                            {isSubChecked ? (
                              <CheckSquare size={14} className="fill-current text-rose-500" />
                            ) : (
                              <Square size={14} />
                            )}
                          </button>
                          <span
                            onClick={() => handleSubcategorySelect(subcat, parentCat)}
                            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer"
                          >
                            {subcat}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range */}
      <div className="space-y-2">
        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-full pl-6 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-450" />
          </div>
          <div className="relative">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-full pl-6 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-450" />
          </div>
        </div>
      </div>

      {/* 3. Stock Status */}
      <div className="space-y-2">
        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Stock Availability
        </label>
        <div className="space-y-1.5">
          {['In Stock', 'Low Stock', 'Out of Stock'].map((status) => {
            const checked = stockStatus.includes(status);
            return (
              <div key={status} className="flex items-center gap-2 p-0.5">
                <button
                  type="button"
                  onClick={() => handleStockSelect(status)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  {checked ? <CheckSquare size={15} className="fill-current text-rose-500" /> : <Square size={15} />}
                </button>
                <span
                  onClick={() => handleStockSelect(status)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer"
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Offers */}
      <div className="space-y-2 pt-2 border-t border-rose-50/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOfferOnly(!offerOnly)}
            className="text-slate-400 hover:text-rose-500"
          >
            {offerOnly ? <CheckSquare size={15} className="fill-current text-rose-500" /> : <Square size={15} />}
          </button>
          <span
            onClick={() => setOfferOnly(!offerOnly)}
            className="text-xs font-bold text-slate-700 dark:text-slate-250 cursor-pointer"
          >
            On Discount Offer
          </span>
        </div>
      </div>

      {/* 5. Shipping Location */}
      <div className="space-y-2 pt-2 border-t border-rose-50/50 dark:border-slate-700/50">
        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <MapPin size={11} className="text-rose-500" /> Shipping Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="State, District, or City"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-105 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
        />
      </div>

      {/* Clear Button */}
      <button
        type="button"
        onClick={handleClear}
        className="w-full py-2.5 border border-dashed border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500 hover:text-rose-500 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default CategoryTreeFilter;
