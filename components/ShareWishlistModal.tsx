import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Share2, Mail, QrCode, Sparkles, Send, 
  ExternalLink, CheckCircle2, Heart, MessageSquare
} from 'lucide-react';
import { Product, User, Vendor, SharedWishlist } from '../types.ts';
import { saveSharedWishlistToDb } from '../services/dataService.ts';

interface ShareWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: Product[];
  currentUser?: User | Vendor | null;
}

export const ShareWishlistModal: React.FC<ShareWishlistModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [curatorName, setCuratorName] = useState('');
  const [note, setNote] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultName = currentUser?.name || 'VIP Connoisseur';
      setCuratorName(defaultName);
      setTitle(`${defaultName}'s Curated Wardrobe`);
      setNote('Discover my personal selection of handpicked luxury fashion & haute couture pieces.');
      setCopied(false);
      
      // Initial fallback share URL using item IDs in query params
      const itemIds = savedItems.map(p => p.id).join(',');
      const baseUrl = window.location.origin;
      const initialUrl = `${baseUrl}/wishlist?items=${encodeURIComponent(itemIds)}`;
      setShareUrl(initialUrl);

      // Save to DB in background for a persistent unique ID
      saveWishlistToDatabase(initialUrl, `${defaultName}'s Curated Wardrobe`, defaultName, 'Discover my personal selection of handpicked luxury fashion & haute couture pieces.');
    }
  }, [isOpen, savedItems, currentUser]);

  const saveWishlistToDatabase = async (fallbackUrl: string, wishlistTitle: string, curator: string, personalNote: string) => {
    if (savedItems.length === 0) return;
    setIsGenerating(true);
    try {
      const wishlistId = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const payload: SharedWishlist = {
        id: wishlistId,
        title: wishlistTitle || 'Curated Wardrobe',
        ownerName: curator || 'Maison VIP',
        productIds: savedItems.map(p => p.id),
        createdAt: new Date().toISOString(),
        note: personalNote
      };

      await saveSharedWishlistToDb(payload);
      const generatedUrl = `${window.location.origin}/wishlist?id=${wishlistId}`;
      setShareUrl(generatedUrl);
    } catch (err) {
      console.warn("Falling back to query parameter link generation:", err);
      setShareUrl(fallbackUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareText = `Explore my curated luxury wardrobe selection on Maison: "${title}"`;

  // Social Share Handlers
  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Curated Luxury Selection: ${title}`);
    const itemsListText = savedItems.slice(0, 5).map(i => `• ${i.designer} - ${i.name} ($${i.price})`).join('\n');
    const body = encodeURIComponent(
      `Hello,\n\nI wanted to share my curated luxury wishlist from Maison:\n\n"${title}"\n${note ? `\n"${note}"\n` : ''}\nFeatured Pieces:\n${itemsListText}\n\nView the full collection here:\n${shareUrl}\n\nBest regards,\n${curatorName}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // Simple clean SVG QR Code generator component mock
  const renderQrSvg = () => {
    return (
      <svg className="w-32 h-32 mx-auto bg-white p-2 border border-gray-200" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#ffffff" />
        {/* Outer Frame */}
        <rect x="5" y="5" width="25" height="25" fill="#111111" />
        <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
        <rect x="11" y="11" width="13" height="13" fill="#111111" />

        <rect x="70" y="5" width="25" height="25" fill="#111111" />
        <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
        <rect x="76" y="11" width="13" height="13" fill="#111111" />

        <rect x="5" y="70" width="25" height="25" fill="#111111" />
        <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
        <rect x="11" y="76" width="13" height="13" fill="#111111" />

        {/* Decorative Grid Patterns representing payload */}
        <rect x="35" y="10" width="8" height="8" fill="#111111" />
        <rect x="48" y="10" width="8" height="8" fill="#111111" />
        <rect x="35" y="25" width="12" height="8" fill="#111111" />
        <rect x="52" y="25" width="8" height="8" fill="#111111" />
        <rect x="10" y="38" width="8" height="8" fill="#111111" />
        <rect x="25" y="42" width="15" height="8" fill="#111111" />
        <rect x="45" y="40" width="10" height="10" fill="#111111" />
        <rect x="62" y="38" width="12" height="8" fill="#111111" />
        <rect x="80" y="42" width="12" height="12" fill="#111111" />
        <rect x="38" y="58" width="12" height="12" fill="#111111" />
        <rect x="58" y="58" width="10" height="10" fill="#111111" />
        <rect x="75" y="62" width="15" height="8" fill="#111111" />
        <rect x="38" y="75" width="10" height="18" fill="#111111" />
        <rect x="55" y="78" width="18" height="10" fill="#111111" />
        <rect x="78" y="78" width="12" height="12" fill="#111111" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-sm shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-luxury-black text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-luxury-gold" />
            <h2 className="text-lg font-serif italic tracking-wide">Share Your Wardrobe Selection</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-luxury-black flex-1">
          {/* Item Count Preview */}
          <div className="flex items-center justify-between bg-luxury-cream/50 p-3.5 border border-luxury-gold/20 rounded-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {savedItems.slice(0, 4).map((item, idx) => (
                  <img 
                    key={idx} 
                    src={item.image} 
                    alt={item.name} 
                    className="inline-block h-9 w-9 rounded-full object-cover ring-2 ring-white" 
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-luxury-black">
                  {savedItems.length} {savedItems.length === 1 ? 'Piece' : 'Pieces'} Selected
                </p>
                <p className="text-[11px] text-gray-500 font-serif italic">
                  Total Value: ${savedItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <Heart size={18} className="text-luxury-gold fill-luxury-gold" />
          </div>

          {/* Title & Curator Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Wishlist Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Autumn Paris Capsule 2026"
                className="w-full px-3 py-2 border border-gray-200 text-xs font-bold rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Curator / Signature
              </label>
              <input
                type="text"
                value={curatorName}
                onChange={e => setCuratorName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Personal Note / Message
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a custom note to your shared collection..."
                className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          {/* Unique URL Link Input Box */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Your Unique Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 text-[11px] font-mono rounded-sm select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold transition-colors flex items-center gap-1.5 shrink-0 rounded-sm"
              >
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Social Share Buttons Grid */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Share Direct via Channel
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-sm flex flex-col items-center justify-center gap-1.5 transition-colors"
                title="Share on WhatsApp"
              >
                <MessageSquare size={18} />
                <span className="text-[10px] uppercase tracking-wider">WhatsApp</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold rounded-sm flex flex-col items-center justify-center gap-1.5 transition-colors"
                title="Share on X / Twitter"
              >
                <Send size={18} />
                <span className="text-[10px] uppercase tracking-wider">X / Twitter</span>
              </button>

              <button
                onClick={handleShareFacebook}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-sm flex flex-col items-center justify-center gap-1.5 transition-colors"
                title="Share on Facebook"
              >
                <Share2 size={18} />
                <span className="text-[10px] uppercase tracking-wider">Facebook</span>
              </button>

              <button
                onClick={handleShareEmail}
                className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-sm flex flex-col items-center justify-center gap-1.5 transition-colors"
                title="Send via Email"
              >
                <Mail size={18} />
                <span className="text-[10px] uppercase tracking-wider">Email</span>
              </button>
            </div>
          </div>

          {/* QR Code Toggle */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="text-xs text-gray-600 hover:text-luxury-black font-bold uppercase tracking-wider flex items-center justify-center gap-2 w-full py-1"
            >
              <QrCode size={16} /> {showQrCode ? "Hide QR Code" : "Show In-Person Mobile QR Code"}
            </button>

            {showQrCode && (
              <div className="mt-3 text-center space-y-2 bg-gray-50 p-4 rounded-sm border border-gray-200 animate-fade-in">
                {renderQrSvg()}
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Scan with smartphone camera to open Wishlist instantly
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="font-serif italic text-[11px]">Maison Shared Wardrobe Service</span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-black font-bold uppercase tracking-wider hover:bg-white transition-colors rounded-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareWishlistModal;
