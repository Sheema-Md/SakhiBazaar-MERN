
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    ArrowRight,
    Sparkles,
    Heart,
    Store,
    ShieldCheck,
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    // ============================================================
    // OPEN MARKETPLACE
    // ============================================================
    const handleBrowse = () => {
        navigate('/customer-dashboard?view=browse');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">

            {/* ======================================================
          HERO
      ====================================================== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40">

                {/* Decorative background blobs */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 -right-32 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-purple-300/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 lg:py-20">

                        <div className="w-full max-w-5xl mx-auto text-center">

                            {/* ==================================================
                  BADGE
              ================================================== */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-rose-100 dark:border-slate-700 shadow-sm mb-7">

                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30">
                                    <Sparkles
                                        size={14}
                                        className="text-rose-600 dark:text-rose-400"
                                    />
                                </span>

                                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                                    A marketplace built for women entrepreneurs
                                </span>

                            </div>

                            {/* ==================================================
                  MAIN HEADING
              ================================================== */}
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">

                                Discover something
                                <span className="block mt-2 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    beautifully unique.
                                </span>

                            </h1>

                            {/* ==================================================
                  DESCRIPTION
              ================================================== */}
                            <p className="mt-7 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed text-slate-500 dark:text-slate-400">
                                Shop handcrafted products, creative goods and
                                unique finds from talented women entrepreneurs
                                across India.
                            </p>

                            {/* ==================================================
                  CTA
              ================================================== */}
                            <div className="mt-9 flex justify-center">

                                <button
                                    type="button"
                                    onClick={handleBrowse}
                                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-base shadow-xl shadow-slate-900/10 dark:shadow-white/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                                >
                                    Start Shopping

                                    <ArrowRight
                                        size={19}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />

                                </button>

                            </div>

                            {/* ==================================================
                  TRUST INDICATORS
              ================================================== */}
                            <div className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-5">

                                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 backdrop-blur-sm">

                                    <ShieldCheck
                                        size={17}
                                        className="text-emerald-500"
                                    />

                                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        Trusted marketplace
                                    </span>

                                </div>

                                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 backdrop-blur-sm">

                                    <Heart
                                        size={17}
                                        className="text-rose-500"
                                    />

                                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        Support women-led businesses
                                    </span>

                                </div>

                                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 backdrop-blur-sm">

                                    <Store
                                        size={17}
                                        className="text-indigo-500"
                                    />

                                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        Discover local creators
                                    </span>

                                </div>

                            </div>

                            {/* ==================================================
                  VISUAL MARKETPLACE CARD
              ================================================== */}
                            <div className="mt-14 max-w-4xl mx-auto">

                                <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-r from-rose-200 via-purple-200 to-indigo-200 dark:from-rose-900/50 dark:via-purple-900/50 dark:to-indigo-900/50 shadow-2xl">

                                    <div className="rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 sm:px-10 py-7">

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                                            {/* Discover */}
                                            <div className="flex flex-col items-center text-center">

                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 mb-3">
                                                    <ShoppingBag size={22} />
                                                </div>

                                                <h3 className="font-black text-slate-900 dark:text-white">
                                                    Discover
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                                    Find products you won't see everywhere.
                                                </p>

                                            </div>

                                            {/* Connect */}
                                            <div className="flex flex-col items-center text-center">

                                                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 mb-3">
                                                    <Heart size={22} />
                                                </div>

                                                <h3 className="font-black text-slate-900 dark:text-white">
                                                    Support
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                                    Every purchase helps a woman entrepreneur grow.
                                                </p>

                                            </div>

                                            {/* Shop */}
                                            <div className="flex flex-col items-center text-center">

                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 mb-3">
                                                    <Store size={22} />
                                                </div>

                                                <h3 className="font-black text-slate-900 dark:text-white">
                                                    Shop
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                                    Browse freely and shop when you're ready.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
};

export default LandingPage;
