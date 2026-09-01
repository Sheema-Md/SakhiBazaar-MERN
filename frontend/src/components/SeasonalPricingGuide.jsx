import { useState } from 'react';
import { Sun, Snowflake, CloudRain, Sparkles, Info, TrendingUp, ShieldCheck } from 'lucide-react';

const SEASONS = [
  {
    key: 'summer',
    name: 'Summer Season',
    icon: Sun,
    color: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    multiplier: 1.10,
    desc: 'Light cottons & breathable fabrics see +10% peak demand.',
  },
  {
    key: 'winter',
    name: 'Winter Season',
    icon: Snowflake,
    color: 'from-sky-500 to-indigo-600',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    multiplier: 1.25,
    desc: 'Heavy woolens, shawls & winter crafts see +25% peak demand.',
  },
  {
    key: 'monsoon',
    name: 'Monsoon Season',
    icon: CloudRain,
    color: 'from-blue-600 to-cyan-600',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    multiplier: 1.05,
    desc: 'Water-resistant crafts & everyday home items see steady +5% demand.',
  },
  {
    key: 'festive',
    name: 'Festive Season',
    icon: Sparkles,
    color: 'from-purple-600 to-rose-600',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    multiplier: 1.30,
    desc: 'High demand for festive silk, jewelry, & handlooms (+30% peak demand).',
  },
];

const SeasonalPricingGuide = ({ basePrice = 0, category = '', compact = false }) => {
  const [selectedSeason, setSelectedSeason] = useState('festive');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const numericPrice = Number(basePrice) || 0;

  const currentSeasonObj = SEASONS.find((s) => s.key === selectedSeason) || SEASONS[0];

  return (
    <div className="bg-white dark:bg-slate-800 border border-rose-100/60 dark:border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      
      {/* Title & Help button */}
      <div className="flex items-center justify-between border-b border-rose-50 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-rose-500 to-indigo-600 text-white rounded-xl shadow-sm">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Seasonal Market Price Calculator
            </h3>
            <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold">
              Transparent, demand-based commodity pricing guidelines
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInfoModal(!showInfoModal)}
          className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Info size={14} />
          <span>How it works</span>
        </button>
      </div>

      {/* Seasonal Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SEASONS.map((season) => {
          const Icon = season.icon;
          const isSelected = selectedSeason === season.key;
          return (
            <button
              key={season.key}
              type="button"
              onClick={() => setSelectedSeason(season.key)}
              className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? `bg-gradient-to-r ${season.color} text-white border-transparent shadow-md`
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{season.name}</span>
            </button>
          );
        })}
      </div>

      {/* Price Impact Preview Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${currentSeasonObj.badgeBg}`}>
              Multiplier: {currentSeasonObj.multiplier}x (+{Math.round((currentSeasonObj.multiplier - 1) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {currentSeasonObj.desc}
          </p>
        </div>

        {numericPrice > 0 && (
          <div className="shrink-0 bg-white dark:bg-slate-800 p-3 rounded-xl border border-rose-100 dark:border-slate-700 text-right shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Est. Market Value</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              ₹{Math.round(numericPrice * currentSeasonObj.multiplier).toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* Explanation Banner */}
      {showInfoModal && (
        <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-300 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
            <ShieldCheck size={16} />
            <span>Understanding Seasonal Pricing Guidelines</span>
          </div>
          <p className="leading-relaxed">
            Sakhi Bazaar dynamically incorporates seasonal market index factors to support women artisans. During peak seasons (like Pashmina in Winter or Silk during Festive Diwali/Eid), high demand allows sellers to price their products at benchmark maximums without losing sales.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 font-medium">
            <li><strong>Summer:</strong> 10% benchmark boost for cotton, khadi, and pottery.</li>
            <li><strong>Winter:</strong> 25% benchmark boost for shawls, carpets, and woolens.</li>
            <li><strong>Monsoon:</strong> 5% steady market rate for year-round utilities.</li>
            <li><strong>Festive:</strong> 30% peak demand surge for bridal, silk sarees, and jewelry.</li>
          </ul>
        </div>
      )}

    </div>
  );
};

export default SeasonalPricingGuide;
