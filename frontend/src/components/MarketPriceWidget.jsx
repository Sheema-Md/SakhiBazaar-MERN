import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  TrendingUp, TrendingDown, RefreshCw,
  Award, CheckCircle
} from 'lucide-react';

const MarketPriceWidget = () => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [trends, setTrends] = useState([]);
  const [activeTab, setActiveTab] = useState('prices'); // 'prices' or 'trends'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pricesRes, trendsRes] = await Promise.all([
        api.get('/market/market-prices'),
        api.get('/market/market-trends')
      ]);
      setPrices(pricesRes.data || []);
      setTrends(trendsRes.data || []);
    } catch (err) {
      console.error('Error fetching market info:', err);
      setError('Unable to load market data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Simple helper to draw a mini sparkline using SVG path
  const renderSparkline = (trendArray) => {
    if (!trendArray || trendArray.length < 2) return null;
    const minVal = Math.min(...trendArray);
    const maxVal = Math.max(...trendArray);
    const valRange = maxVal - minVal || 1;

    const width = 80;
    const height = 24;
    const padding = 2;

    const points = trendArray.map((val, idx) => {
      const x = (idx / (trendArray.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((val - minVal) / valRange) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={trendArray[trendArray.length - 1] >= trendArray[0] ? '#10B981' : '#EF4444'}
          strokeWidth="1.8"
          points={points.join(' ')}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center min-h-[220px]">
        <RefreshCw size={24} className="animate-spin text-rose-500 mb-2" />
        <span className="text-xs text-slate-400">Loading market prices & benchmarks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm text-center text-xs text-slate-400">
        <p className="text-red-500 font-semibold mb-2">{error}</p>
        <button onClick={fetchData} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border text-[10px] font-bold">Try Again</button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl shadow-md p-5 space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-750 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">{t('marketPrices')} & Trends</h3>
            <p className="text-[10px] text-slate-400 font-semibold">{t('marketDataDisclaimer')}</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Selection buttons */}
          <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${activeTab === 'prices'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              Prices
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${activeTab === 'trends'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              Market Trends
            </button>
          </div>
        </div>
      </div>

      {/* Prices View Tab */}
      {activeTab === 'prices' && (
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {prices.map((item, idx) => {
            const displayPrice = item.currentPrice;
            const isUp = item.weeklyChange >= 0;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-750/50 rounded-2xl hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all"
              >
                {/* Product Name & Category */}
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold text-rose-605 bg-rose-50 dark:bg-rose-955/20 dark:text-rose-455 px-2 py-0.5 rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-1.5">{item.productName}</h4>
                </div>

                {/* SVG Sparkline */}
                <div className="hidden sm:block mr-6 shrink-0">
                  {renderSparkline(item.priceTrend)}
                </div>

                {/* Price Display & weekly change */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">₹{Number(displayPrice || 0).toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-slate-400">{item.unit} · {item.region}</p>
                  <p className={`text-[10px] font-bold mt-0.5 flex items-center justify-end gap-0.5 ${isUp ? 'text-green-600' : 'text-red-500'
                    }`}>
                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {isUp ? '+' : ''}{item.weeklyChange}%
                  </p>
                </div>
                <div className="col-span-full text-[9px] text-slate-400 border-t border-slate-100 dark:border-slate-750 pt-2 mt-1">
                  {t('marketRange')}: ₹{Number(item.referenceRange?.min || 0).toLocaleString('en-IN')} - ₹{Number(item.referenceRange?.max || 0).toLocaleString('en-IN')} · {t('marketDataAsOf')}: {item.dataAsOf ? new Date(item.dataAsOf).toLocaleString() : 'n/a'} · {t('marketSource')}: {item.source || item.dataSource}
                  <span className="block mt-1">{item.context}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trends View Tab */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
          {trends.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-150 dark:border-slate-750/70 rounded-2xl space-y-3"
            >
              {/* Category Badge & Demand Indicators */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-750">
                <span className="text-xs font-black text-slate-800 dark:text-white">{item.category}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${item.demandTrend === 'High' || item.demandTrend === 'Increasing'
                    ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                  }`}>
                  Demand: {item.demandTrend}
                </span>
              </div>

              {/* Popular Products in this Category */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Popular Items</span>
                <div className="flex flex-wrap gap-1">
                  {item.popularProducts?.map((prod, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-650 dark:text-slate-350 rounded-lg text-[9px] font-bold flex items-center gap-0.5"
                    >
                      <Award size={8} className="text-amber-500" />
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Increases/Decreases */}
              {item.priceIncreaseItems?.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rising Benchmarks</span>
                  <div className="space-y-1">
                    {item.priceIncreaseItems.map((inc, iIdx) => (
                      <div key={iIdx} className="flex justify-between text-[10px] font-bold text-green-600">
                        <span>{inc.name}</span>
                        <span>+{inc.change}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer guideline */}
      <div className="flex items-center gap-1 text-[10px] text-slate-400/80 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 p-2.5 rounded-xl justify-center font-semibold">
        <CheckCircle size={10} className="text-rose-500" /> {t('marketDataDisclaimer')}
      </div>
    </div>
  );
};

export default MarketPriceWidget;
