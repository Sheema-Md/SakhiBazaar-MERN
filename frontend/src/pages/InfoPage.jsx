import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';

const PAGE_CONTENT = {
    '/about': {
        title: 'About Sakhi Bazaar',
        body: 'Sakhi Bazaar connects customers with women-led businesses selling handcrafted products, local foods, and creative work.',
    },
    '/privacy-policy': {
        title: 'Privacy Policy',
        body: 'We use account, order, delivery, and payment information only to operate Sakhi Bazaar, provide support, and improve the marketplace experience.',
    },
    '/terms-conditions': {
        title: 'Terms & Conditions',
        body: 'By using Sakhi Bazaar, customers and sellers agree to provide accurate information, follow applicable laws, and use the marketplace responsibly.',
    },
};

const InfoPage = () => {
    const { pathname } = useLocation();
    const content = PAGE_CONTENT[pathname] || PAGE_CONTENT['/about'];

    return (
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 sm:p-12 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-600">
                        {pathname === '/about' ? <ShoppingBag size={22} /> : <ShieldCheck size={22} />}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">{content.title}</h1>
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{content.body}</p>
                <Link to="/" className="inline-flex items-center gap-2 mt-8 text-sm font-bold text-rose-600 hover:text-rose-700">
                    <ArrowLeft size={16} /> Back to marketplace
                </Link>
            </div>
        </div>
    );
};

export default InfoPage;