import { useState, useEffect } from 'react';
import {
  SlidersHorizontal, ChevronRight, ChevronDown, CheckSquare, Square,
  DollarSign, MapPin, Search, X, RotateCcw, Tag, Percent, PackageCheck
} from 'lucide-react';

const CATEGORY_TREE = {
  'Clothing': ['Sarees', 'Kurtis', 'Shawls', 'Kids Wear'],
  'Handmade Crafts': ['Wooden Toys', 'Pottery', 'Embroidered Bags', 'Paintings'],
  'Food': ['Spices', 'Pickles', 'Organic Honey', 'Sweets'],
  'Jewelry': ['Terracotta Jewelry', 'Silver Filigree', 'Beaded Necklaces', 'Earrings'],
  'Home Decor': ['Wall Hangings', 'Cushion Covers', 'Candles', 'Table Runners']
};

const getCategoryChildren = (value) => {
  if (Array.isArray(value)) return value.map(child => ({ label: child, children: [] }));
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([label, children]) => ({
      label,
      children: getCategoryChildren(children)
    }));
  }
  return [];
};

const getLeafLabels = (node) => node.children.length > 0
  ? node.children.flatMap(getLeafLabels)
  : [node.label];

const getAllDescendantLabels = (node) => [
  node.label,
  ...node.children.flatMap(getAllDescendantLabels)
];

const CATEGORY_NODES = Object.entries(CATEGORY_TREE).map(([label, children]) => ({
  label,
  children: getCategoryChildren(children)
}));

const matchesCategorySearch = (node, query) => {
  if (!query) return true;
  return getAllDescendantLabels(node).some(label => label.toLowerCase().includes(query));
};

const CategoryTreeFilter = ({ onFilterChange, initialFilters = {} }) => {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [expandedSections, setExpandedSections] = useState({ categories: true, price: true, stock: false, shipping: false });
  const [categorySearch, setCategorySearch] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const selectedFilterCount = selectedCategories.length + selectedSubcategories.length
    + stockStatus.length + (minPrice || maxPrice ? 1 : 0) + (location ? 1 : 0) + (offerOnly ? 1 : 0);

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
    const node = CATEGORY_NODES.find(category => category.label === catName);
    const subcats = node ? getLeafLabels(node) : [];

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
    const node = CATEGORY_NODES.find(category => category.label === parentName);
    const subcats = node ? getLeafLabels(node) : [];

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

  const removeSelectedFilter = (value, type) => {
    if (type === 'category') handleParentSelect(value);
    if (type === 'subcategory') {
      const parent = CATEGORY_NODES.find(node => getLeafLabels(node).includes(value));
      if (parent) handleSubcategorySelect(value, parent.label);
    }
    if (type === 'stock') handleStockSelect(value);
    if (type === 'location') setLocation('');
    if (type === 'price') {
      setMinPrice('');
      setMaxPrice('');
    }
    if (type === 'offer') setOfferOnly(false);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Trigger callback when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // Build API-friendly query lists
      const categoriesParam = selectedCategories.join(',');

      // Only include subcategories that are checked, but if their parent is fully checked
      // then skip them so the backend fetches everything under that parent
      const subcategoriesParam = selectedSubcategories.filter(sub => {
        const parent = CATEGORY_NODES.find(node => getLeafLabels(node).includes(sub));
        return parent && !selectedCategories.includes(parent.label);
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

  const renderCategoryNode = (node, parentName, depth = 0) => {
    const isSelected = depth === 0
      ? selectedCategories.includes(node.label)
      : selectedSubcategories.includes(node.label);
    const isCollapsed = collapsedCategories[node.label];
    const visible = matchesCategorySearch(node, categorySearch.trim().toLowerCase());

    if (!visible) return null;

    return (
      <div key={`${parentName || 'root'}-${node.label}`} className={depth > 0 ? 'ml-3 border-l border-rose-100 dark:border-slate-700 pl-3' : ''}>
        <div className="flex items-center justify-between gap-2 py-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => depth === 0 ? handleParentSelect(node.label) : handleSubcategorySelect(node.label, parentName)}
              className={isSelected ? 'text-rose-500 shrink-0' : 'text-slate-400 hover:text-rose-500 shrink-0'}
              aria-label={`Select ${node.label}`}
            >
              {isSelected ? <CheckSquare size={15} className="fill-current" /> : <Square size={15} />}
            </button>
            <span
              onClick={() => depth === 0 ? handleParentSelect(node.label) : handleSubcategorySelect(node.label, parentName)}
              className={`truncate cursor-pointer ${depth === 0 ? 'text-xs font-bold text-slate-700 dark:text-slate-200' : 'text-[11px] font-semibold text-slate-500 dark:text-slate-400'}`}
            >
              {node.label}
            </span>
          </div>
          {node.children.length > 0 && (
            <button
              type="button"
              onClick={() => toggleCategoryCollapse(node.label)}
              className="p-1 text-slate-400 hover:text-rose-500 shrink-0"
              aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${node.label}`}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
        {node.children.length > 0 && !isCollapsed && (
          <div className="space-y-0.5">
            {node.children.map(child => renderCategoryNode(child, depth === 0 ? node.label : parentName, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (key, title, icon, content, summary = '') => (
    <section className="border-b border-slate-100 dark:border-slate-700/70 last:border-b-0">
      <button
        type="button"
        onClick={() => toggleSection(key)}
        className="flex w-full items-center justify-between py-3 text-left"
        aria-expanded={expandedSections[key]}
      >
        <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {icon}
          {title}
          {summary && <span className="normal-case tracking-normal text-[10px] font-semibold text-rose-500">{summary}</span>}
        </span>
        {expandedSections[key] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {expandedSections[key] && <div className="pb-4">{content}</div>}
    </section>
  );

  const filterPanel = (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-850 dark:text-slate-100">
            <SlidersHorizontal size={16} className="text-rose-500" /> Filters
          </h3>
          <p className="mt-0.5 text-[10px] text-slate-400">Refine the marketplace catalog</p>
        </div>
        {selectedFilterCount > 0 && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            {selectedFilterCount} active
          </span>
        )}
      </div>

      {selectedFilterCount > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {selectedCategories.map(value => (
            <button key={`category-${value}`} type="button" onClick={() => removeSelectedFilter(value, 'category')} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {value}<X size={10} />
            </button>
          ))}
          {selectedSubcategories.filter(value => !selectedCategories.some(category => getLeafLabels(CATEGORY_NODES.find(node => node.label === category) || { children: [] }).includes(value))).map(value => (
            <button key={`subcategory-${value}`} type="button" onClick={() => removeSelectedFilter(value, 'subcategory')} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
              {value}<X size={10} />
            </button>
          ))}
          {minPrice || maxPrice ? <button type="button" onClick={() => removeSelectedFilter('', 'price')} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">₹{minPrice || '0'} - ₹{maxPrice || 'Any'}<X size={10} /></button> : null}
          {stockStatus.map(value => <button key={`stock-${value}`} type="button" onClick={() => removeSelectedFilter(value, 'stock')} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">{value}<X size={10} /></button>)}
          {offerOnly && <button type="button" onClick={() => removeSelectedFilter('', 'offer')} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700 dark:bg-green-950/30 dark:text-green-300">Offers<X size={10} /></button>}
          {location && <button type="button" onClick={() => removeSelectedFilter('', 'location')} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">{location}<X size={10} /></button>}
        </div>
      )}

      {renderSection('categories', 'Categories', <Tag size={13} className="text-rose-500" />, (
        <div className="space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Find a category..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {CATEGORY_NODES.map(node => renderCategoryNode(node, null))}
          </div>
        </div>
      ), selectedCategories.length + selectedSubcategories.length ? `${selectedCategories.length + selectedSubcategories.length} selected` : '')}

      {renderSection('price', 'Price Range', <DollarSign size={13} className="text-rose-500" />, (
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-900" />
          <input type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-900" />
        </div>
      ), minPrice || maxPrice ? 'set' : '')}

      {renderSection('stock', 'Availability & Offers', <PackageCheck size={13} className="text-rose-500" />, (
        <div className="space-y-3">
          {['In Stock', 'Low Stock', 'Out of Stock'].map(status => {
            const checked = stockStatus.includes(status);
            return <button key={status} type="button" onClick={() => handleStockSelect(status)} className="flex w-full items-center gap-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{checked ? <CheckSquare size={15} className="text-rose-500" /> : <Square size={15} className="text-slate-400" />}{status}</button>;
          })}
          <button type="button" onClick={() => setOfferOnly(!offerOnly)} className="flex w-full items-center gap-2 border-t border-slate-100 pt-3 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">{offerOnly ? <CheckSquare size={15} className="text-rose-500" /> : <Square size={15} className="text-slate-400" />}On Discount Offer</button>
        </div>
      ), stockStatus.length || offerOnly ? 'active' : '')}

      {renderSection('shipping', 'Shipping Location', <MapPin size={13} className="text-rose-500" />, (
        <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="State, District, or City" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-900" />
      ), location ? 'set' : '')}

      <button type="button" onClick={handleClear} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-400">
        <RotateCcw size={13} /> Clear All
      </button>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setIsMobileOpen(true)} className="flex w-full items-center justify-between rounded-2xl border border-rose-100 bg-white px-4 py-3 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:hidden">
        <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white"><SlidersHorizontal size={15} className="text-rose-500" /> Filters {selectedFilterCount > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] text-white">{selectedFilterCount}</span>}</span>
        <ChevronRight size={15} className="text-slate-400" />
      </button>
      <aside className="hidden rounded-3xl border border-rose-100/30 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800 lg:block">
        {filterPanel}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" onClick={() => setIsMobileOpen(false)} className="absolute inset-0 bg-slate-950/40" aria-label="Close filters" />
          <aside className="absolute inset-y-0 left-0 w-[min(88vw,24rem)] overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold text-slate-800 dark:text-white">Filter marketplace</span><button type="button" onClick={() => setIsMobileOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-rose-500" aria-label="Close filters"><X size={18} /></button></div>
            {filterPanel}
            <div className="sticky bottom-0 mt-4 flex gap-2 border-t border-slate-100 bg-white pt-4 dark:border-slate-700 dark:bg-slate-800"><button type="button" onClick={handleClear} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Clear</button><button type="button" onClick={() => setIsMobileOpen(false)} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white">Apply Filters</button></div>
          </aside>
        </div>
      )}
    </>
  );
};

export default CategoryTreeFilter;
