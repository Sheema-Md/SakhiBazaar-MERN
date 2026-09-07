import { useState } from 'react';
import {
    Copy,
    Facebook,
    Instagram,
    MessageCircle,
    Share2,
    Twitter
} from 'lucide-react';

const ProductShareMenu = ({ product }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');

    if (!product) return null;

    const shareUrl = `${window.location.origin}/product/${product._id}`;
    const shareText = `Check out ${product.title} on Sakhi Bazaar`;

    const showFeedback = (message) => {
        setFeedback(message);
        window.setTimeout(() => setFeedback(''), 2200);
    };

    const copyShareUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            showFeedback('Product link copied');
        } catch (error) {
            showFeedback('Copy failed');
        }
    };

    const shareNatively = async () => {
        if (!navigator.share) {
            await copyShareUrl();
            return;
        }

        try {
            await navigator.share({ title: product.title, text: shareText, url: shareUrl });
            setIsOpen(false);
        } catch (error) {
            if (error.name !== 'AbortError') showFeedback('Sharing failed');
        }
    };

    const openShareUrl = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Share product"
                aria-label="Share product"
            >
                <Share2 size={18} />
                <span>Share</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-11 z-20 w-56 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl space-y-1">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Share Product</p>
                    <button type="button" onClick={shareNatively} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left cursor-pointer">
                        <Share2 size={14} /> More sharing options
                    </button>
                    <button type="button" onClick={() => openShareUrl(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`)} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-slate-700 text-left cursor-pointer">
                        <MessageCircle size={14} className="text-green-600" /> WhatsApp
                    </button>
                    <button type="button" onClick={() => openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 text-left cursor-pointer">
                        <Facebook size={14} className="text-blue-600" /> Facebook
                    </button>
                    <button type="button" onClick={() => openShareUrl(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`)} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left cursor-pointer">
                        <Twitter size={14} /> X
                    </button>
                    <button type="button" onClick={() => { copyShareUrl(); openShareUrl('https://www.instagram.com/'); }} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-pink-50 dark:hover:bg-slate-700 text-left cursor-pointer">
                        <Instagram size={14} className="text-pink-600" /> Instagram
                    </button>
                    <button type="button" onClick={copyShareUrl} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left cursor-pointer">
                        <Copy size={14} /> Copy link
                    </button>
                    {feedback && <p className="px-2 pt-1 text-[10px] font-bold text-green-600">{feedback}</p>}
                </div>
            )}
        </div>
    );
};

export default ProductShareMenu;