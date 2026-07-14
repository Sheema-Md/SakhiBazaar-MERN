import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, DollarSign, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Filters = ({
  categories = ['All', 'Clothing', 'Handmade Crafts', 'Food', 'Art', 'Jewelry', 'Home Decor'],
  statuses = [],
  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ],
  onFilterChange,
  initialFilters = {},
  showStatusFilter = false,
  showDateFilter = false,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Local filter states
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || 'All');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [status, setStatus] = useState(initialFilters.status || 'All');
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [sort, setSort] = useState(initialFilters.sort || 'newest');

  // Trigger callback when filters change
  const applyFilters = () => {
    onFilterChange({
      search,
      category,
      minPrice,
      maxPrice,
      status,
      startDate,
      endDate,
      sort,
    });
  };

  // Run filter update on state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300); // Debounce typing inputs

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, minPrice, maxPrice, status, startDate, endDate, sort]);

  const handleClear = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setStatus('All');
    setStartDate('');
    setEndDate('');
    setSort('newest');
  };

  const renderFiltersForm = () => (
    <div className="space-y-5">
      {/* 1. Search Bar */}
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder') || 'Search...'}
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* 2. Category Select */}
      {categories.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-rose-500 focus:border-rose-500 focus:outline-none appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Tag size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-405 pointer-events-none" />
          </div>
        </div>
      )}

      {/* 3. Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-full pl-6 pr-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-rose-500 focus:outline-none"
            />
            <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-full pl-6 pr-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-rose-500 focus:outline-none"
            />
            <DollarSign size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 4. Status Filter */}
      {showStatusFilter && statuses.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-rose-500 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 5. Date Range Selector */}
      {showDateFilter && (
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-[10px] focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-[10px] focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Sort Options */}
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
          Sort Options
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-rose-500 focus:outline-none cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Button */}
      <button
        type="button"
        onClick={handleClear}
        className="w-full py-2.5 border border-dashed border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-500 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div>
      {/* Mobile filter toggle button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl shadow-xs"
        >
          <SlidersHorizontal size={14} />
          Filter & Sort Options
        </button>
      </div>

      {/* Desktop sidebar wrapper */}
      <div className="hidden md:block bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-6 border-b border-rose-50/50 dark:border-slate-700 pb-3">
          <SlidersHorizontal size={16} className="text-rose-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Filters</h2>
        </div>
        {renderFiltersForm()}
      </div>

      {/* Mobile sliding drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Sliding drawer panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-rose-50/50 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-rose-500" />
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Filter Products</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              {renderFiltersForm()}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-8 w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-750 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
