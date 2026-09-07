import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, IndianRupee, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_CATEGORIES = ['All', 'Clothing', 'Handmade Crafts', 'Food', 'Jewelry', 'Home Decor'];

const Filters = ({
  categories = DEFAULT_CATEGORIES,
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
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || 'All');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [status, setStatus] = useState(initialFilters.status || 'All');
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [sort, setSort] = useState(initialFilters.sort || 'newest');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange?.({ search, category, minPrice, maxPrice, status, startDate, endDate, sort });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice, status, startDate, endDate, sort, onFilterChange]);

  const handleClear = () => {
    setSearch(''); setCategory('All'); setMinPrice(''); setMaxPrice('');
    setStatus('All'); setStartDate(''); setEndDate(''); setSort('newest');
  };

  const inputClass = 'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none';

  const renderFiltersForm = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('search') || 'Search'}</label>
        <div className="relative"><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchPlaceholder') || 'Search products...'} className={`${inputClass} pl-9`} /><Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /></div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('category') || 'Category'}</label>
        <div className="relative"><select value={category} onChange={e => setCategory(e.target.value)} className={`${inputClass} pr-8 appearance-none cursor-pointer`}>{categories.map(cat => <option key={cat} value={cat}>{t(cat.toLowerCase()) || cat}</option>)}</select><Tag size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('priceRange') || 'Price Range'}</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative"><input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder={t('min') || 'Min'} className={`${inputClass} pl-7`} /><IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /></div>
          <div className="relative"><input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder={t('max') || 'Max'} className={`${inputClass} pl-7`} /><IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /></div>
        </div>
      </div>
      {showStatusFilter && statuses.length > 0 && <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('status') || 'Status'}</label><select value={status} onChange={e => setStatus(e.target.value)} className={`${inputClass} cursor-pointer`}><option value="All">{t('allStatuses') || 'All Statuses'}</option>{statuses.map(st => <option key={st} value={st}>{t(st.toLowerCase()) || st}</option>)}</select></div>}
      {showDateFilter && <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('dateRange') || 'Date Range'}</label><div className="grid grid-cols-2 gap-2"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} /><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} /></div></div>}
      <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('sortOptions') || 'Sort Options'}</label><select value={sort} onChange={e => setSort(e.target.value)} className={`${inputClass} cursor-pointer`}>{sortOptions.map(opt => <option key={opt.value} value={opt.value}>{t(opt.value) || opt.label}</option>)}</select></div>
      <button type="button" onClick={handleClear} className="w-full py-2.5 border border-dashed border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-500 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer">{t('clearFilters') || 'Clear Filters'}</button>
    </div>
  );

  return <div>
    <div className="md:hidden mb-4"><button onClick={() => setIsOpen(true)} className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-sm"><SlidersHorizontal size={14} />{t('filterSortOptions') || 'Filter & Sort Options'}</button></div>
    <div className="hidden md:block bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm h-fit"><div className="flex items-center gap-2 mb-6 border-b border-rose-50/50 dark:border-slate-700 pb-3"><SlidersHorizontal size={16} className="text-rose-500" /><h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('filters') || 'Filters'}</h2></div>{renderFiltersForm()}</div>
    {isOpen && <div className="fixed inset-0 z-50 md:hidden"><div className="fixed inset-0 bg-slate-900/40" onClick={() => setIsOpen(false)} /><div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-800 p-6 shadow-2xl overflow-y-auto"><div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 dark:border-slate-700"><div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-rose-500" /><span className="font-bold text-sm">{t('filterProducts') || 'Filter Products'}</span></div><button onClick={() => setIsOpen(false)} className="p-1 rounded-lg"><X size={16} /></button></div>{renderFiltersForm()}<button onClick={() => setIsOpen(false)} className="mt-8 w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-xs rounded-xl">{t('applyFilters') || 'Apply Filters'}</button></div></div>}
  </div>;
};

export default Filters;
