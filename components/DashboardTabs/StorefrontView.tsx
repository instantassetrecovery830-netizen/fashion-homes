import React, { useState, useRef } from 'react';
import { 
    Save, Menu, Camera, Image as ImageIcon, Type, Grid, Plus, X, Video, 
    Link, Globe, Instagram, Facebook, Palette, ShieldCheck, Sparkles, 
    Lock, ExternalLink, Quote, BookOpen, Layers, Sliders, CheckCircle2,
    Eye, ArrowRight, UploadCloud
} from 'lucide-react';
import { Vendor, ViewState } from '../../types.ts';

interface StorefrontViewProps {
    storefrontForm: Vendor | null;
    setStorefrontForm: (form: Vendor) => void;
    handleStorefrontSave: () => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
    avatarInputRef: React.RefObject<HTMLInputElement | null>;
    coverInputRef: React.RefObject<HTMLInputElement | null>;
    galleryInputRef: React.RefObject<HTMLInputElement | null>;
    videoInputRef: React.RefObject<HTMLInputElement | null>;
    handleImageUpload: (file: File, type: 'AVATAR' | 'COVER' | 'GALLERY' | 'VIDEO' | 'HERO_BANNER' | 'STORY_IMAGE', index?: number) => void;
    removeFromGallery: (index: number) => void;
    onNavigate?: (view: ViewState) => void;
    onGoToKyc?: () => void;
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
    removeFromGallery,
    onNavigate,
    onGoToKyc
}) => {
    const [activeSection, setActiveSection] = useState<'IDENTITY' | 'HERO_BANNER' | 'BRAND_STORY' | 'THEMING'>('IDENTITY');
    const [isSaving, setIsSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

    const heroBannerInputRef = useRef<HTMLInputElement>(null);
    const storyImageInputRef = useRef<HTMLInputElement>(null);

    if (!storefrontForm) return <div className="p-8 text-gray-400">Loading storefront settings...</div>;

    const isVerified = storefrontForm.verificationStatus === 'VERIFIED';

    const onSave = async () => {
        setIsSaving(true);
        try {
            await handleStorefrontSave();
            setSaveFeedback('Storefront settings updated successfully.');
            setTimeout(() => setSaveFeedback(null), 4000);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveStoryImage = (index: number) => {
        const current = [...(storefrontForm.storyImages || [])];
        current.splice(index, 1);
        setStorefrontForm({ ...storefrontForm, storyImages: current });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-serif italic text-black">Storefront & Brand Design</h2>
                        {isVerified ? (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={13} className="text-emerald-600" /> Verified Atelier
                            </span>
                        ) : (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Lock size={12} className="text-amber-600" /> Verification Pending
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Craft your boutique’s presence with bespoke hero banners, brand heritage narratives, and luxury styling.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('VENDOR_PROFILE')}
                            className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 rounded-xs transition-colors"
                            title="Preview how your storefront looks to customers"
                        >
                            <Eye size={15} /> <span className="hidden sm:inline">Preview Storefront</span>
                        </button>
                    )}

                    <button 
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-black text-white px-7 py-2.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-black transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {isSaving ? <Save size={15} className="animate-spin" /> : <Save size={15} />}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>

                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {saveFeedback && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>{saveFeedback}</span>
                    </div>
                    <button onClick={() => setSaveFeedback(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
                </div>
            )}

            {/* Sub-Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 bg-white">
                <button
                    onClick={() => setActiveSection('IDENTITY')}
                    className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeSection === 'IDENTITY'
                            ? 'border-black text-black bg-gray-50/50'
                            : 'border-transparent text-gray-400 hover:text-black'
                    }`}
                >
                    <Type size={14} /> Brand Identity & Bio
                </button>

                <button
                    onClick={() => setActiveSection('HERO_BANNER')}
                    className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeSection === 'HERO_BANNER'
                            ? 'border-black text-black bg-gray-50/50'
                            : 'border-transparent text-gray-400 hover:text-black'
                    }`}
                >
                    <Sparkles size={14} className={isVerified ? "text-luxury-gold" : "text-gray-400"} /> 
                    Custom Hero Banner 
                    {isVerified ? (
                        <span className="bg-luxury-gold/10 text-luxury-gold text-[9px] px-2 py-0.5 rounded font-bold uppercase ml-1">Atelier</span>
                    ) : (
                        <Lock size={12} className="text-amber-500 ml-1" />
                    )}
                </button>

                <button
                    onClick={() => setActiveSection('BRAND_STORY')}
                    className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeSection === 'BRAND_STORY'
                            ? 'border-black text-black bg-gray-50/50'
                            : 'border-transparent text-gray-400 hover:text-black'
                    }`}
                >
                    <BookOpen size={14} className={isVerified ? "text-luxury-gold" : "text-gray-400"} /> 
                    Brand Story & Craftsmanship
                    {isVerified ? (
                        <span className="bg-luxury-gold/10 text-luxury-gold text-[9px] px-2 py-0.5 rounded font-bold uppercase ml-1">Atelier</span>
                    ) : (
                        <Lock size={12} className="text-amber-500 ml-1" />
                    )}
                </button>

                <button
                    onClick={() => setActiveSection('THEMING')}
                    className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeSection === 'THEMING'
                            ? 'border-black text-black bg-gray-50/50'
                            : 'border-transparent text-gray-400 hover:text-black'
                    }`}
                >
                    <Palette size={14} /> Luxury Visual Theme
                </button>
            </div>

            {/* SECTION 1: BRAND IDENTITY & BASIC ASSETS */}
            {activeSection === 'IDENTITY' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Visual Identity Assets */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-gray-400">
                                <ImageIcon size={14} /> Visual Identity
                            </h3>
                            
                            <div className="space-y-10">
                                {/* Cover Image */}
                                <div className="relative group">
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-3">Cover Image (1200x400)</p>
                                    <div className="aspect-[3/1] bg-gray-50 border border-gray-100 overflow-hidden relative rounded-sm">
                                        <img src={storefrontForm.coverImage || storefrontForm.avatar} className="w-full h-full object-cover" alt="Cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button"
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
                                            <img src={storefrontForm.avatar} className="w-full h-full object-cover" alt="Avatar" />
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
                                        <h4 className="text-sm font-bold uppercase tracking-wide mb-1">Brand Avatar / Seal</h4>
                                        <p className="text-xs text-gray-400">Recommended: 400x400px. Displayed on designer cards and product detail views.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Brand Details */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-gray-400">
                                <Type size={14} /> Brand Voice & Heritage Summary
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Atelier / Brand Display Name</label>
                                    <input 
                                        value={storefrontForm.name}
                                        onChange={(e) => setStorefrontForm({...storefrontForm, name: e.target.value})}
                                        className="w-full border-b border-gray-200 py-3 text-lg font-serif italic focus:border-black outline-none bg-transparent"
                                        placeholder="e.g. Maison de l'Ombre"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Short Brand Bio / Philosophy</label>
                                    <textarea 
                                        value={storefrontForm.bio}
                                        onChange={(e) => setStorefrontForm({...storefrontForm, bio: e.target.value})}
                                        className="w-full border border-gray-200 p-4 text-sm focus:border-black outline-none bg-gray-50 h-32 resize-none"
                                        placeholder="A concise summary of your atelier's aesthetic philosophy..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Shipping Origin Address (For Live Delivery Calculations)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] text-gray-400 uppercase">Street Address</label>
                                            <input 
                                                value={storefrontForm.shipping_address?.street || ''}
                                                onChange={(e) => setStorefrontForm({
                                                    ...storefrontForm, 
                                                    shipping_address: { ...(storefrontForm.shipping_address || { city: '', state: '', zip: '', country: 'US' }), street: e.target.value }
                                                })}
                                                placeholder="123 Haute Fashion Blvd"
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
                                                placeholder="Paris / New York"
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-400 uppercase">State / Region</label>
                                            <input 
                                                value={storefrontForm.shipping_address?.state || ''}
                                                onChange={(e) => setStorefrontForm({
                                                    ...storefrontForm, 
                                                    shipping_address: { ...(storefrontForm.shipping_address || { street: '', city: '', zip: '', country: 'US' }), state: e.target.value }
                                                })}
                                                placeholder="NY / Île-de-France"
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
                                                placeholder="75001"
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-400 uppercase">Country (2-letter ISO Code)</label>
                                            <input 
                                                value={storefrontForm.shipping_address?.country || 'US'}
                                                onChange={(e) => setStorefrontForm({
                                                    ...storefrontForm, 
                                                    shipping_address: { ...(storefrontForm.shipping_address || { street: '', city: '', state: '', zip: '' }), country: e.target.value }
                                                })}
                                                placeholder="FR / US / GB"
                                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Moodboard & Connections */}
                    <div className="space-y-8">
                        {/* Moodboard Gallery */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400">
                                    <Grid size={14} /> Moodboard Gallery
                                </h3>
                                <div className="relative overflow-hidden">
                                     <button type="button" className="text-[10px] bg-black text-white px-3 py-1 uppercase font-bold tracking-widest flex items-center gap-1 hover:bg-luxury-gold hover:text-black transition-colors">
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
                                            type="button"
                                            onClick={() => removeFromGallery(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {(!storefrontForm.gallery || storefrontForm.gallery.length === 0) && (
                                    <div className="col-span-3 py-8 text-center border border-dashed border-gray-200 rounded-sm text-gray-400 text-xs">
                                        Upload images to showcase your atelier aesthetic.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Brand Video */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                <Video size={14} /> Brand Video
                            </h3>
                            <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group cursor-pointer hover:border-luxury-gold transition-colors rounded-sm">
                                {storefrontForm.videoUrl ? (
                                    <div className="relative w-full h-full">
                                        <video src={storefrontForm.videoUrl} controls className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
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
                        </div>

                        {/* Social Links */}
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                                <Link size={14} /> Official Connections
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
            )}

            {/* SECTION 2: CUSTOM HERO BANNER STUDIO (VERIFIED ATELIER ONLY) */}
            {activeSection === 'HERO_BANNER' && (
                <div className="space-y-8">
                    {!isVerified ? (
                        <div className="bg-gradient-to-br from-gray-900 via-luxury-black to-black text-white p-8 md:p-12 rounded-sm border border-luxury-gold/30 shadow-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-luxury-gold/20 text-luxury-gold rounded-full">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold block">Exclusive Feature</span>
                                    <h3 className="text-2xl font-serif italic text-white">Custom Hero Banner Studio is Locked</h3>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                                Bespoke widescreen hero banners, cinematic taglines, and custom storefront headlines are exclusively available to Verified Ateliers. Verify your business documents in the KYC Verification portal to unlock this feature.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                {onGoToKyc && (
                                    <button
                                        type="button"
                                        onClick={onGoToKyc}
                                        className="bg-luxury-gold text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                                    >
                                        <ShieldCheck size={16} /> Complete KYC Verification <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                                            <Sparkles size={16} className="text-luxury-gold" /> Atelier Hero Banner Studio
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Upload a custom widescreen hero banner (1920x600px recommended) to greet visitors on your designer profile.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => heroBannerInputRef.current?.click()}
                                            className="bg-black text-white hover:bg-luxury-gold hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                                        >
                                            <UploadCloud size={14} /> Upload Banner Image
                                        </button>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={heroBannerInputRef}
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'HERO_BANNER')}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Banner Visual Preview */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Live Hero Banner Preview</label>
                                    <div className="relative w-full h-72 md:h-96 rounded-sm overflow-hidden border border-gray-200 shadow-inner group bg-zinc-900">
                                        {storefrontForm.heroBanner ? (
                                            <img 
                                                src={storefrontForm.heroBanner} 
                                                alt="Atelier Hero Banner" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-zinc-950">
                                                <ImageIcon size={48} className="text-gray-600 mb-3" />
                                                <p className="text-sm font-serif italic text-gray-300">No custom hero banner uploaded yet.</p>
                                                <p className="text-xs text-gray-500 mt-1">Click "Upload Banner Image" above to feature your atelier's signature campaign.</p>
                                            </div>
                                        )}

                                        {/* Dynamic Overlay & Text Preview */}
                                        <div 
                                            className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 transition-all"
                                            style={{ backgroundColor: `rgba(0,0,0, ${(storefrontForm.heroOverlayOpacity ?? 40) / 100})` }}
                                        >
                                            <div className="max-w-3xl space-y-2">
                                                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-luxury-gold bg-black/60 px-3 py-1 rounded-full border border-luxury-gold/30 inline-block">
                                                    Verified Atelier Spotlight
                                                </span>
                                                <h1 className="text-3xl md:text-5xl font-serif italic text-white tracking-wide drop-shadow-md">
                                                    {storefrontForm.heroHeadline || storefrontForm.name || "Bespoke Haute Couture Atelier"}
                                                </h1>
                                                <p className="text-xs md:text-sm text-gray-200 font-light max-w-xl drop-shadow">
                                                    {storefrontForm.heroTagline || storefrontForm.bio || "Exquisite architectural silhouettes crafted by hand with sustainable luxury materials."}
                                                </p>
                                            </div>
                                        </div>

                                        {storefrontForm.heroBanner && (
                                            <button
                                                type="button"
                                                onClick={() => setStorefrontForm({ ...storefrontForm, heroBanner: undefined })}
                                                className="absolute top-4 right-4 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full transition-colors z-20"
                                                title="Remove Hero Banner"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Banner Configuration Controls */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                                            Hero Headline (Title on Banner)
                                        </label>
                                        <input 
                                            value={storefrontForm.heroHeadline || ''}
                                            onChange={(e) => setStorefrontForm({ ...storefrontForm, heroHeadline: e.target.value })}
                                            placeholder={`e.g. ${storefrontForm.name} — Haute Couture Paris`}
                                            className="w-full border border-gray-200 p-3 text-sm rounded-xs focus:border-black outline-none bg-gray-50/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                                            Hero Subtitle / Tagline
                                        </label>
                                        <input 
                                            value={storefrontForm.heroTagline || ''}
                                            onChange={(e) => setStorefrontForm({ ...storefrontForm, heroTagline: e.target.value })}
                                            placeholder="e.g. Bespoke tailoring rooted in architectural slow fashion"
                                            className="w-full border border-gray-200 p-3 text-sm rounded-xs focus:border-black outline-none bg-gray-50/50"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-bold uppercase text-gray-400">
                                                Banner Tint & Overlay Darkness: {storefrontForm.heroOverlayOpacity ?? 40}%
                                            </label>
                                            <span className="text-[10px] text-gray-400">Controls contrast for text legibility</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="85"
                                            step="5"
                                            value={storefrontForm.heroOverlayOpacity ?? 40}
                                            onChange={(e) => setStorefrontForm({ ...storefrontForm, heroOverlayOpacity: parseInt(e.target.value) })}
                                            className="w-full accent-black cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 3: BRAND STORY & ATELIER CRAFTSMANSHIP (VERIFIED ATELIER ONLY) */}
            {activeSection === 'BRAND_STORY' && (
                <div className="space-y-8">
                    {!isVerified ? (
                        <div className="bg-gradient-to-br from-gray-900 via-luxury-black to-black text-white p-8 md:p-12 rounded-sm border border-luxury-gold/30 shadow-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-luxury-gold/20 text-luxury-gold rounded-full">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold block">Exclusive Feature</span>
                                    <h3 className="text-2xl font-serif italic text-white">Brand Story Studio is Locked</h3>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                                Rich multi-paragraph brand storytelling, artisan quote spotlights, and craftsmanship workshop galleries are exclusive to Verified Ateliers. Complete your KYC submission to unlock.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                {onGoToKyc && (
                                    <button
                                        type="button"
                                        onClick={onGoToKyc}
                                        className="bg-luxury-gold text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                                    >
                                        <ShieldCheck size={16} /> Complete KYC Verification <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm space-y-8">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                                        <BookOpen size={16} className="text-luxury-gold" /> Atelier Story & Craftsmanship Manifesto
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Narrate the heritage, bespoke craftsmanship, and sustainable values behind your designs.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                                        Story Title
                                    </label>
                                    <input 
                                        value={storefrontForm.storyTitle || ''}
                                        onChange={(e) => setStorefrontForm({ ...storefrontForm, storyTitle: e.target.value })}
                                        placeholder="e.g. The Heritage of Slow Luxury & Bespoke Tailoring"
                                        className="w-full border border-gray-200 p-3 text-sm rounded-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                                        Story Subtitle
                                    </label>
                                    <input 
                                        value={storefrontForm.storySubtitle || ''}
                                        onChange={(e) => setStorefrontForm({ ...storefrontForm, storySubtitle: e.target.value })}
                                        placeholder="e.g. Three Generations of Master Handcraftsmanship"
                                        className="w-full border border-gray-200 p-3 text-sm rounded-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                                        Brand Story Narrative (The Atelier Story)
                                    </label>
                                    <textarea 
                                        value={storefrontForm.brandStory || ''}
                                        onChange={(e) => setStorefrontForm({ ...storefrontForm, brandStory: e.target.value })}
                                        placeholder="Share the full heritage, founding vision, and technical mastery of your atelier. Tell your buyers how your garments are designed, cut, and sewn with precision..."
                                        rows={7}
                                        className="w-full border border-gray-200 p-4 text-sm focus:border-black outline-none bg-gray-50/50 rounded-xs"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2 flex items-center gap-1.5">
                                        <Quote size={12} className="text-luxury-gold" /> Artisan / Founder Quote
                                    </label>
                                    <input 
                                        value={storefrontForm.artisanQuote || ''}
                                        onChange={(e) => setStorefrontForm({ ...storefrontForm, artisanQuote: e.target.value })}
                                        placeholder="e.g. “We do not merely create garments; we sculpt wearable architecture.”"
                                        className="w-full border border-gray-200 p-3 text-sm rounded-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                                        Quote Author & Title
                                    </label>
                                    <input 
                                        value={storefrontForm.artisanQuoteAuthor || ''}
                                        onChange={(e) => setStorefrontForm({ ...storefrontForm, artisanQuoteAuthor: e.target.value })}
                                        placeholder="e.g. Master Couturier & Creative Director"
                                        className="w-full border border-gray-200 p-3 text-sm rounded-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                                        Brand Manifesto & Sustainability Pillars
                                    </label>
                                    <input 
                                        value={storefrontForm.brandManifesto || ''}
                                        onChange={(e) => setStorefrontForm({ ...storefrontForm, brandManifesto: e.target.value })}
                                        placeholder="e.g. 100% Zero-Waste Pattern Drafting • Ethically Sourced Mulberry Silk • Lifetime Repair Warranty"
                                        className="w-full border border-gray-200 p-3 text-sm rounded-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>

                                {/* Craftsmanship Photo Gallery */}
                                <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                                                Craftsmanship & Workshop Gallery ({storefrontForm.storyImages?.length || 0}/6)
                                            </h4>
                                            <p className="text-[11px] text-gray-400">Photos of pattern cutting, hand-embroidery, draping, and atelier craft.</p>
                                        </div>
                                        <div className="relative">
                                            <button 
                                                type="button" 
                                                onClick={() => storyImageInputRef.current?.click()}
                                                disabled={(storefrontForm.storyImages?.length || 0) >= 6}
                                                className="bg-black text-white hover:bg-luxury-gold hover:text-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40"
                                            >
                                                <Plus size={14} /> Add Craft Photo
                                            </button>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                ref={storyImageInputRef}
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'STORY_IMAGE')}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                        {storefrontForm.storyImages?.map((img, idx) => (
                                            <div key={idx} className="aspect-square bg-gray-100 relative group overflow-hidden rounded-xs border border-gray-200">
                                                <img src={img} className="w-full h-full object-cover" alt={`Craft ${idx + 1}`} />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStoryImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete photo"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!storefrontForm.storyImages || storefrontForm.storyImages.length === 0) && (
                                            <div className="col-span-full py-8 text-center border border-dashed border-gray-200 text-gray-400 text-xs rounded-xs">
                                                No craftsmanship photos added yet. Upload photos of your atelier workshop and process to give buyers a peek behind the scenes.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 4: LUXURY VISUAL THEME SELECTION */}
            {activeSection === 'THEMING' && (
                <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 text-gray-400">
                            <Palette size={14} /> Aesthetic Profile Theme
                        </h3>
                        <p className="text-xs text-gray-500">
                            Choose the aesthetic atmosphere for your designer profile, moodboards, and product showcase.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {[
                            { id: 'MINIMALIST', label: 'Minimalist Noir', desc: 'Pristine white canvas with sharp black typography and clean gallery spacing.' },
                            { id: 'DARK', label: 'Dark Atelier', desc: 'Cinematic obsidian backdrop with stark high-contrast imagery.' },
                            { id: 'GOLD', label: 'Haute Imperial Gold', desc: 'Warm ivory parchment with opulent burnished gold accents.' },
                            { id: 'AVANT-GARDE', label: 'Avant-Garde Architectural', desc: 'High-concept monochrome layout with editorial geometry.' },
                            { id: 'CLASSIC', label: 'Classic Heritage', desc: 'Timeless European atelier styling with dignified serif typography.' },
                            { id: 'HAUTE-COUTURE', label: 'Haute Couture Salon', desc: 'Subtle warm champagne gradients reflecting atelier salons.' },
                        ].map((theme) => {
                            const isSelected = (storefrontForm.visualTheme || 'MINIMALIST') === theme.id;
                            return (
                                <button 
                                    key={theme.id}
                                    type="button"
                                    onClick={() => setStorefrontForm({ ...storefrontForm, visualTheme: theme.id as any })}
                                    className={`p-6 border text-left transition-all rounded-xs relative flex flex-col justify-between ${
                                        isSelected 
                                            ? 'border-black bg-black text-white shadow-md' 
                                            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider">{theme.label}</span>
                                            {isSelected && <CheckCircle2 size={16} className="text-luxury-gold" />}
                                        </div>
                                        <p className={`text-xs leading-relaxed ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {theme.desc}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-100/20 text-[9px] uppercase tracking-widest font-mono">
                                        Theme ID: {theme.id}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Accent Color Customizer */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <label className="text-[10px] font-bold uppercase text-gray-400 block">
                            Atelier Accent Color Preset
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                            {[
                                { name: 'Champagne Gold', hex: '#C5A059' },
                                { name: 'Atelier Bronze', hex: '#B87333' },
                                { name: 'Rose Gold', hex: '#B76E79' },
                                { name: 'Midnight Noir', hex: '#0A0A0A' },
                                { name: 'Emerald Velvet', hex: '#097969' },
                                { name: 'Imperial Sapphire', hex: '#1E3A8A' },
                                { name: 'Royal Plum', hex: '#4B0082' }
                            ].map(color => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => setStorefrontForm({ ...storefrontForm, themeAccentColor: color.hex })}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                        storefrontForm.themeAccentColor === color.hex 
                                            ? 'border-black bg-gray-50 font-bold' 
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                                    <span>{color.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
