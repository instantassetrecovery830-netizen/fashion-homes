
import React from 'react';
import { Save, Menu, Camera, Image as ImageIcon, Type, Grid, Plus, X, Video, Link, Globe, Instagram, Facebook, Palette } from 'lucide-react';
import { Vendor } from '../../types.ts';

interface StorefrontViewProps {
    storefrontForm: Vendor | null;
    setStorefrontForm: (form: Vendor) => void;
    handleStorefrontSave: () => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
    avatarInputRef: React.RefObject<HTMLInputElement | null>;
    coverInputRef: React.RefObject<HTMLInputElement | null>;
    galleryInputRef: React.RefObject<HTMLInputElement | null>;
    videoInputRef: React.RefObject<HTMLInputElement | null>;
    handleImageUpload: (file: File, type: 'AVATAR' | 'COVER' | 'GALLERY' | 'VIDEO', index?: number) => void;
    removeFromGallery: (index: number) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
    storefrontForm,
    setStorefrontForm,
    handleStorefrontSave,
    setIsSidebarOpen,
    avatarInputRef,
    coverInputRef,
    galleryInputRef,
    videoInputRef,
    handleImageUpload,
    removeFromGallery
}) => {
    if (!storefrontForm) return <div className="p-8 text-gray-400">Loading storefront settings...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">Storefront Editor</h2>
                <div className="flex gap-4">
                    <button 
                        onClick={handleStorefrontSave}
                        className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors hidden md:block"
                    >
                        Save Changes
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Brand Identity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Visual Assets */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-gray-400">
                            <ImageIcon size={14} /> Visual Identity
                        </h3>
                        
                        <div className="space-y-10">
                            {/* Cover Image */}
                            <div className="relative group">
                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-3">Cover Image (1200x400)</p>
                                <div className="aspect-[3/1] bg-gray-50 border border-gray-100 overflow-hidden relative rounded-sm">
                                    <img src={storefrontForm.coverImage} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => coverInputRef.current?.click()}
                                            className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Camera size={14} /> Replace Cover
                                        </button>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={coverInputRef}
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'COVER')}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="flex items-center gap-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-100 overflow-hidden relative">
                                        <img src={storefrontForm.avatar} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera size={14} className="text-white" />
                                        </div>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={avatarInputRef}
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'AVATAR')}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold uppercase tracking-wide mb-1">Brand Avatar</h4>
                                    <p className="text-xs text-gray-400">Recommended: 400x400px. This will be displayed on your profile and in the marketplace.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Details */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-gray-400">
                            <Type size={14} /> Brand Voice
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Display Name</label>
                                <input 
                                    value={storefrontForm.name}
                                    onChange={(e) => setStorefrontForm({...storefrontForm, name: e.target.value})}
                                    className="w-full border-b border-gray-200 py-3 text-lg font-serif italic focus:border-black outline-none bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Brand Bio / Philosophy</label>
                                <textarea 
                                    value={storefrontForm.bio}
                                    onChange={(e) => setStorefrontForm({...storefrontForm, bio: e.target.value})}
                                    className="w-full border border-gray-200 p-4 text-sm focus:border-black outline-none bg-gray-50 h-32 resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Shipping Origin Address (For Live Rates)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-[9px] text-gray-400 uppercase">Street Address</label>
                                        <input 
                                            value={storefrontForm.shipping_address?.street || ''}
                                            onChange={(e) => setStorefrontForm({
                                                ...storefrontForm, 
                                                shipping_address: { ...(storefrontForm.shipping_address || { city: '', state: '', zip: '', country: 'US' }), street: e.target.value }
                                            })}
                                            placeholder="123 Fashion St"
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase">City</label>
                                        <input 
                                            value={storefrontForm.shipping_address?.city || ''}
                                            onChange={(e) => setStorefrontForm({
                                                ...storefrontForm, 
                                                shipping_address: { ...(storefrontForm.shipping_address || { street: '', state: '', zip: '', country: 'US' }), city: e.target.value }
                                            })}
                                            placeholder="New York"
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase">State / Province</label>
                                        <input 
                                            value={storefrontForm.shipping_address?.state || ''}
                                            onChange={(e) => setStorefrontForm({
                                                ...storefrontForm, 
                                                shipping_address: { ...(storefrontForm.shipping_address || { street: '', city: '', zip: '', country: 'US' }), state: e.target.value }
                                            })}
                                            placeholder="NY"
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase">ZIP / Postal Code</label>
                                        <input 
                                            value={storefrontForm.shipping_address?.zip || ''}
                                            onChange={(e) => setStorefrontForm({
                                                ...storefrontForm, 
                                                shipping_address: { ...(storefrontForm.shipping_address || { street: '', city: '', state: '', country: 'US' }), zip: e.target.value }
                                            })}
                                            placeholder="10001"
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase">Country (ISO 2-letter code)</label>
                                        <input 
                                            value={storefrontForm.shipping_address?.country || ''}
                                            onChange={(e) => setStorefrontForm({
                                                ...storefrontForm, 
                                                shipping_address: { ...(storefrontForm.shipping_address || { street: '', city: '', state: '', zip: '' }), country: e.target.value }
                                            })}
                                            placeholder="US"
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                        />
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-2">This address is used to calculate real-time shipping rates for your customers.</p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Theme Selection */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                            <Palette size={14} /> Visual Theme
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['MINIMALIST', 'DARK', 'AVANT-GARDE', 'CLASSIC'].map((theme) => (
                                <button 
                                    key={theme}
                                    onClick={() => setStorefrontForm({...storefrontForm, visualTheme: theme as any})}
                                    className={`p-4 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        storefrontForm.visualTheme === theme 
                                        ? 'border-black bg-black text-white' 
                                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                                    }`}
                                >
                                    {theme}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Moodboard & Socials */}
                <div className="space-y-8">
                     {/* Moodboard Gallery */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400">
                                <Grid size={14} /> Moodboard Gallery
                            </h3>
                            <div className="relative overflow-hidden">
                                 <button className="text-[10px] bg-black text-white px-3 py-1 uppercase font-bold tracking-widest flex items-center gap-1 hover:bg-luxury-gold transition-colors">
                                    <Plus size={12} /> Add Image
                                 </button>
                                 <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={galleryInputRef}
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'GALLERY')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                            {storefrontForm.gallery?.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-50 relative group overflow-hidden rounded-sm">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                    <button 
                                        onClick={() => removeFromGallery(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            {(!storefrontForm.gallery || storefrontForm.gallery.length === 0) && (
                                <div className="col-span-3 py-8 text-center border border-dashed border-gray-200 rounded-sm text-gray-400 text-xs">
                                    Upload images to showcase your aesthetic.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Upload */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                            <Video size={14} /> Brand Video
                        </h3>
                        <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group cursor-pointer hover:border-luxury-gold transition-colors rounded-sm">
                            {storefrontForm.videoUrl ? (
                                <div className="relative w-full h-full">
                                    <video src={storefrontForm.videoUrl} controls className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setStorefrontForm({...storefrontForm, videoUrl: undefined})}
                                        className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white z-10"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Video size={32} className="mb-2" />
                                    <span className="text-[10px] uppercase tracking-wide font-bold text-center px-2">Upload Video</span>
                                    <span className="text-[9px] text-gray-300 mt-1">MP4, WebM (Max 10MB)</span>
                                </div>
                            )}
                            {!storefrontForm.videoUrl && (
                                <input 
                                    type="file" 
                                    accept="video/*"
                                    ref={videoInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 10 * 1024 * 1024) {
                                                alert("Video file is too large. Please upload a video smaller than 10MB.");
                                                return;
                                            }
                                            handleImageUpload(file, 'VIDEO');
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4">
                            Upload a brand video to be displayed in your store gallery.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                            <Link size={14} /> Connections
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <Globe size={14} className="absolute left-0 top-3 text-gray-400" />
                                <input 
                                    placeholder="Website URL"
                                    value={storefrontForm.website || ''}
                                    onChange={(e) => setStorefrontForm({...storefrontForm, website: e.target.value})}
                                    className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                />
                            </div>
                            <div className="relative">
                                <Instagram size={14} className="absolute left-0 top-3 text-gray-400" />
                                <input 
                                    placeholder="Instagram Handle"
                                    value={storefrontForm.instagram || ''}
                                    onChange={(e) => setStorefrontForm({...storefrontForm, instagram: e.target.value})}
                                    className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                />
                            </div>
                            <div className="relative">
                                <Video size={14} className="absolute left-0 top-3 text-gray-400" />
                                <input 
                                    placeholder="TikTok Handle"
                                    value={storefrontForm.tiktok || ''}
                                    onChange={(e) => setStorefrontForm({...storefrontForm, tiktok: e.target.value})}
                                    className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                />
                            </div>
                             <div className="relative">
                                <Facebook size={14} className="absolute left-0 top-3 text-gray-400" />
                                <input 
                                    placeholder="Facebook URL"
                                    value={storefrontForm.facebook || ''}
                                    onChange={(e) => setStorefrontForm({...storefrontForm, facebook: e.target.value})}
                                    className="w-full border-b border-gray-200 py-2 pl-6 text-sm focus:border-black outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:hidden mt-6 pb-20">
                  <button 
                      onClick={handleStorefrontSave}
                      className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                  >
                      Save Changes
                  </button>
              </div>
        </div>
    );
};
