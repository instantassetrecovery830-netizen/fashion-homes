import React, { useState } from 'react';
import { 
    Palette, ChevronDown, Check, CheckCircle2, AlertCircle, Eye, 
    RefreshCw, Sparkles, Store, Megaphone, LayoutGrid, Type, 
    Sliders, ExternalLink, ShieldCheck, Compass, Mail, Clock, Plus, Trash2, Menu
} from 'lucide-react';
import { Vendor, ThemeSettings, StoreDesignSettings } from '../../types.ts';

interface StoreDesignViewProps {
    cmsForm: any;
    setCmsForm: (form: any) => void;
    handleCMSUpdate: (customForm?: any) => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
    vendors?: Vendor[];
    onUpdateVendor?: (vendor: Vendor) => Promise<void>;
    onNavigate?: (view: any) => void;
    onDesignerClick?: (designerName: string) => void;
}

const LUXURY_PRESETS: Array<{
    name: string;
    description: string;
    theme: ThemeSettings;
}> = [
    {
        name: 'Minimalist Noir',
        description: 'Monochrome high-fashion aesthetic with sharp edges and rich serif typography.',
        theme: {
            primaryColor: '#000000',
            secondaryColor: '#1A1A1A',
            accentColor: '#D4AF37',
            fontFamily: 'Serif',
            borderRadius: 'none'
        }
    },
    {
        name: 'Haute Imperial Gold',
        description: 'Opulent warm tones with brushed brass accents and refined subtle radii.',
        theme: {
            primaryColor: '#141210',
            secondaryColor: '#26221E',
            accentColor: '#E5C07B',
            fontFamily: 'Serif',
            borderRadius: 'sm'
        }
    },
    {
        name: 'Modern Vanguard',
        description: 'Contemporary sleek sans-serif lines with cobalt highlights.',
        theme: {
            primaryColor: '#0A0A0A',
            secondaryColor: '#171717',
            accentColor: '#2563EB',
            fontFamily: 'Sans',
            borderRadius: 'none'
        }
    },
    {
        name: 'Ivory Atelier',
        description: 'Clean gallery-white palette with warm gold artisan details.',
        theme: {
            primaryColor: '#1C1917',
            secondaryColor: '#292524',
            accentColor: '#C29B38',
            fontFamily: 'Serif',
            borderRadius: 'sm'
        }
    }
];

export const StoreDesignView: React.FC<StoreDesignViewProps> = ({
    cmsForm,
    setCmsForm,
    handleCMSUpdate,
    setIsSidebarOpen,
    vendors = [],
    onUpdateVendor,
    onNavigate,
    onDesignerClick
}) => {
    const [activeSection, setActiveSection] = useState<'theme' | 'announcement' | 'layout' | 'collections' | 'branding' | 'ateliers'>('theme');
    const [isSaving, setIsSaving] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Selected Atelier for Admin Storefront Inspector
    const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');
    const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

    // Safe getters
    const currentTheme: ThemeSettings = cmsForm?.theme || {
        primaryColor: '#000000',
        secondaryColor: '#1F1F1F',
        accentColor: '#D4AF37',
        fontFamily: 'Serif',
        borderRadius: 'sm'
    };

    const currentStoreDesign: StoreDesignSettings = cmsForm?.storeDesign || {
        announcement: {
            enabled: true,
            text: 'Complimentary express courier delivery on all orders over $500 • Worldwide customs cleared',
            link: '/marketplace',
            bgColor: '#000000',
            textColor: '#FFFFFF',
            badgeText: 'EXCLUSIVE'
        },
        layout: {
            gridColumns: 3,
            cardStyle: 'editorial',
            showPriceCurrency: true,
            showAtelierBadges: true,
            defaultSort: 'featured'
        },
        featuredCategories: [
            {
                id: 'cat_1',
                title: 'Haute Couture',
                subtitle: 'One-of-one runway showpieces',
                imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
                link: '/marketplace?category=Couture'
            },
            {
                id: 'cat_2',
                title: 'Bespoke Tailoring',
                subtitle: 'Hand-measured artisanal suiting',
                imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
                link: '/marketplace?category=Tailoring'
            },
            {
                id: 'cat_3',
                title: 'Artisanal Jewelry',
                subtitle: 'Sculpted precious metals & gemstones',
                imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
                link: '/marketplace?category=Jewelry'
            }
        ],
        branding: {
            tagline: "The Premier Digital Flagship for African Luxury & Bespoke Craftsmanship",
            supportEmail: "concierge@myfitstore.com",
            conciergeHours: "Mon – Sat: 08:00 – 20:00 GMT",
            newsletterTitle: "Enter The Inner Guild",
            copyrightText: "© 2026 MyFitStore Atelier Guild. All Rights Reserved."
        }
    };

    const updateTheme = (updates: Partial<ThemeSettings>) => {
        setCmsForm({
            ...cmsForm,
            theme: {
                ...currentTheme,
                ...updates
            }
        });
    };

    const updateStoreDesign = (updates: Partial<StoreDesignSettings>) => {
        setCmsForm({
            ...cmsForm,
            storeDesign: {
                ...currentStoreDesign,
                ...updates
            }
        });
    };

    const applyPreset = (preset: typeof LUXURY_PRESETS[0]) => {
        updateTheme(preset.theme);
        setStatusFeedback({
            type: 'success',
            message: `Applied "${preset.name}" preset. Remember to save changes.`
        });
        setTimeout(() => setStatusFeedback(null), 4000);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setStatusFeedback(null);
        try {
            await handleCMSUpdate(cmsForm);
            setStatusFeedback({
                type: 'success',
                message: 'Store & Marketplace design settings successfully saved and synced live!'
            });
        } catch (err: any) {
            console.error("Save error:", err);
            setStatusFeedback({
                type: 'error',
                message: err?.message || 'Failed to save store design. Please try again.'
            });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusFeedback(null), 6000);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
            {/* Header with Save & Marketplace Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-[10px] uppercase font-bold tracking-widest rounded-xs border border-luxury-gold/30">
                            Marketplace Styling
                        </span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Store Design</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif italic text-luxury-black">Design Store & Marketplace</h2>
                    <p className="text-xs text-gray-500 mt-1">Configure global marketplace aesthetics, announcement bars, catalog layout, curated collections, and atelier storefronts.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {onNavigate && (
                        <button 
                            type="button"
                            onClick={() => onNavigate('MARKETPLACE')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors rounded-xs"
                            title="Open marketplace store to verify changes live"
                        >
                            <Eye size={14} /> Preview Store
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-luxury-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-black transition-all shadow-md disabled:opacity-50 rounded-xs"
                    >
                        {isSaving ? (
                            <>
                                <RefreshCw size={14} className="animate-spin text-luxury-gold" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Check size={14} />
                                <span>Save Store Design</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Notification Feedback */}
            {statusFeedback && (
                <div className={`p-4 rounded-sm border flex items-center justify-between animate-fade-in ${
                    statusFeedback.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                        : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                    <div className="flex items-center gap-3">
                        {statusFeedback.type === 'success' ? (
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle size={18} className="text-red-600 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{statusFeedback.message}</span>
                    </div>
                    {statusFeedback.type === 'success' && onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('MARKETPLACE')}
                            className="text-xs font-bold uppercase tracking-wider underline hover:text-emerald-700"
                        >
                            View Marketplace Live →
                        </button>
                    )}
                </div>
            )}

            {/* Top Navigation Tabs for Store Design Sections */}
            <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2 scrollbar-none">
                {[
                    { id: 'theme', label: 'Theme & Colors', icon: Palette },
                    { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
                    { id: 'layout', label: 'Catalog & Grid', icon: LayoutGrid },
                    { id: 'collections', label: 'Featured Categories', icon: Sparkles },
                    { id: 'branding', label: 'Branding & Footer', icon: Compass },
                    { id: 'ateliers', label: 'Ateliers Storefronts', icon: Store },
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSection(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                            activeSection === tab.id
                                ? 'bg-luxury-black text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-100'
                        }`}
                    >
                        <tab.icon size={14} className={activeSection === tab.id ? 'text-luxury-gold' : 'text-gray-400'} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeSection === 'theme' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Custom Palette & Typography (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-base font-serif italic text-luxury-black font-bold">Marketplace Visual Identity</h3>
                                <p className="text-xs text-gray-500 mt-1">Configure global colors, typography style, and element borders for the entire store experience.</p>
                            </div>

                            {/* Color Pickers */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="border border-gray-100 p-3 rounded-sm bg-gray-50/50">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Primary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color"
                                            value={currentTheme.primaryColor || '#000000'}
                                            onChange={e => updateTheme({ primaryColor: e.target.value })}
                                            className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 p-0 cursor-pointer"
                                        />
                                        <input 
                                            value={currentTheme.primaryColor || '#000000'}
                                            onChange={e => updateTheme({ primaryColor: e.target.value })}
                                            className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none font-mono uppercase bg-white"
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 block">Headers, buttons, primary UI</span>
                                </div>

                                <div className="border border-gray-100 p-3 rounded-sm bg-gray-50/50">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Accent / Highlight</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color"
                                            value={currentTheme.accentColor || '#D4AF37'}
                                            onChange={e => updateTheme({ accentColor: e.target.value })}
                                            className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 p-0 cursor-pointer"
                                        />
                                        <input 
                                            value={currentTheme.accentColor || '#D4AF37'}
                                            onChange={e => updateTheme({ accentColor: e.target.value })}
                                            className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none font-mono uppercase bg-white"
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 block">Gold badges, highlights, hovers</span>
                                </div>

                                <div className="border border-gray-100 p-3 rounded-sm bg-gray-50/50">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Secondary Surface</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color"
                                            value={currentTheme.secondaryColor || '#1F1F1F'}
                                            onChange={e => updateTheme({ secondaryColor: e.target.value })}
                                            className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 p-0 cursor-pointer"
                                        />
                                        <input 
                                            value={currentTheme.secondaryColor || '#1F1F1F'}
                                            onChange={e => updateTheme({ secondaryColor: e.target.value })}
                                            className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none font-mono uppercase bg-white"
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 block">Subtle dark panels & footers</span>
                                </div>
                            </div>

                            {/* Typography & Corner Radii */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Font Family Style</label>
                                    <select 
                                        value={currentTheme.fontFamily || 'Serif'}
                                        onChange={e => updateTheme({ fontFamily: e.target.value as any })}
                                        className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none bg-white font-medium"
                                    >
                                        <option value="Serif">Editorial Serif (Playfair / Bodoni Luxury)</option>
                                        <option value="Sans">Modern Sans (Sleek Minimalist Helvetica / Inter)</option>
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">Applies to headings, titles, and branding accents across the store.</p>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Corner Radius</label>
                                    <select 
                                        value={currentTheme.borderRadius || 'sm'}
                                        onChange={e => updateTheme({ borderRadius: e.target.value as any })}
                                        className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none bg-white font-medium"
                                    >
                                        <option value="none">None (0px - Sharp Architectural Luxury)</option>
                                        <option value="sm">Small (2px - Subtle Tailored Edges)</option>
                                        <option value="md">Medium (6px - Contemporary Soft)</option>
                                        <option value="full">Full (Pill - Modern Casual)</option>
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">Controls button corners, card edges, and badge shapes.</p>
                                </div>
                            </div>
                        </div>

                        {/* Live Design Card Sample */}
                        <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-3">Live Component Preview</span>
                            <div className="p-6 border border-gray-100 rounded-sm bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="space-y-1 text-center sm:text-left">
                                    <span 
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-xs"
                                        style={{ backgroundColor: `${currentTheme.accentColor}20`, color: currentTheme.accentColor }}
                                    >
                                        Atelier Verified
                                    </span>
                                    <h4 
                                        className={`text-xl font-bold ${currentTheme.fontFamily === 'Serif' ? 'font-serif italic' : 'font-sans'}`}
                                        style={{ color: currentTheme.primaryColor }}
                                    >
                                        Imperial Hand-Draped Silk Cape
                                    </h4>
                                    <p className="text-xs text-gray-500">Maison De L'Étoile • Accra, Ghana</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold font-mono" style={{ color: currentTheme.primaryColor }}>$1,250</span>
                                    <button 
                                        type="button"
                                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all"
                                        style={{ 
                                            backgroundColor: currentTheme.primaryColor,
                                            borderRadius: currentTheme.borderRadius === 'none' ? '0px' : currentTheme.borderRadius === 'sm' ? '2px' : currentTheme.borderRadius === 'md' ? '6px' : '9999px'
                                        }}
                                    >
                                        Explore Piece
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Curated Luxury Presets (1 col) */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm space-y-4">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-black">Luxury Presets</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Click to instantly apply curated haute-couture styling palettes.</p>
                            </div>

                            <div className="space-y-3">
                                {LUXURY_PRESETS.map((p, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => applyPreset(p)}
                                        className="p-3 border border-gray-200 hover:border-black rounded-sm cursor-pointer transition-all hover:shadow-xs group bg-gray-50/30 hover:bg-white"
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-gray-900 group-hover:text-black">{p.name}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.theme.primaryColor }} />
                                                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.theme.accentColor }} />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-snug">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcement Bar Section */}
            {activeSection === 'announcement' && (
                <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-serif italic text-luxury-black font-bold">Store Announcement Banner</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Global ticker bar displayed prominently at the very top of the store.</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs font-bold uppercase text-gray-600">Active</span>
                            <input 
                                type="checkbox"
                                checked={currentStoreDesign.announcement?.enabled ?? true}
                                onChange={e => updateStoreDesign({
                                    announcement: {
                                        ...(currentStoreDesign.announcement || { text: '' }),
                                        enabled: e.target.checked
                                    }
                                })}
                                className="w-4 h-4 accent-black rounded cursor-pointer"
                            />
                        </label>
                    </div>

                    {/* Live Preview of Banner */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block">Live Preview</label>
                        <div 
                            className="p-2.5 text-center text-xs tracking-wider flex items-center justify-center gap-2 rounded-xs"
                            style={{ 
                                backgroundColor: currentStoreDesign.announcement?.bgColor || '#000000',
                                color: currentStoreDesign.announcement?.textColor || '#FFFFFF'
                            }}
                        >
                            {currentStoreDesign.announcement?.badgeText && (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-white/20 rounded-xs">
                                    {currentStoreDesign.announcement.badgeText}
                                </span>
                            )}
                            <span className="font-medium text-[11px]">{currentStoreDesign.announcement?.text || 'Announcement message preview'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Announcement Message</label>
                            <input 
                                value={currentStoreDesign.announcement?.text || ''}
                                onChange={e => updateStoreDesign({
                                    announcement: {
                                        ...(currentStoreDesign.announcement || { enabled: true }),
                                        text: e.target.value
                                    }
                                })}
                                placeholder="e.g. Complimentary worldwide courier delivery on orders above $500 • Customs & duties prepaid"
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Badge Text (Optional)</label>
                            <input 
                                value={currentStoreDesign.announcement?.badgeText || ''}
                                onChange={e => updateStoreDesign({
                                    announcement: {
                                        ...(currentStoreDesign.announcement || { enabled: true, text: '' }),
                                        badgeText: e.target.value
                                    }
                                })}
                                placeholder="e.g. EXCLUSIVE, SPECIAL, or PRIVILEGE"
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Link Destination</label>
                            <input 
                                value={currentStoreDesign.announcement?.link || ''}
                                onChange={e => updateStoreDesign({
                                    announcement: {
                                        ...(currentStoreDesign.announcement || { enabled: true, text: '' }),
                                        link: e.target.value
                                    }
                                })}
                                placeholder="e.g. /marketplace or /the-drop"
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none font-mono"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Banner Background Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color"
                                    value={currentStoreDesign.announcement?.bgColor || '#000000'}
                                    onChange={e => updateStoreDesign({
                                        announcement: {
                                            ...(currentStoreDesign.announcement || { enabled: true, text: '' }),
                                            bgColor: e.target.value
                                        }
                                    })}
                                    className="w-8 h-8 rounded-full border border-gray-200 p-0 cursor-pointer"
                                />
                                <input 
                                    value={currentStoreDesign.announcement?.bgColor || '#000000'}
                                    onChange={e => updateStoreDesign({
                                        announcement: {
                                            ...(currentStoreDesign.announcement || { enabled: true, text: '' }),
                                            bgColor: e.target.value
                                        }
                                    })}
                                    className="flex-1 border border-gray-200 p-2 text-xs font-mono uppercase outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Banner Text Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color"
                                    value={currentStoreDesign.announcement?.textColor || '#FFFFFF'}
                                    onChange={e => updateStoreDesign({
                                        announcement: {
                                            ...(currentStoreDesign.announcement || { enabled: true, text: '' }),
                                            textColor: e.target.value
                                        }
                                    })}
                                    className="w-8 h-8 rounded-full border border-gray-200 p-0 cursor-pointer"
                                />
                                <input 
                                    value={currentStoreDesign.announcement?.textColor || '#FFFFFF'}
                                    onChange={e => updateStoreDesign({
                                        announcement: {
                                            ...(currentStoreDesign.announcement || { enabled: true, text: '' }),
                                            textColor: e.target.value
                                        }
                                    })}
                                    className="flex-1 border border-gray-200 p-2 text-xs font-mono uppercase outline-none focus:border-black"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Catalog & Grid Layout Settings */}
            {activeSection === 'layout' && (
                <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-serif italic text-luxury-black font-bold">Marketplace Catalog & Grid Display</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Control how couture and ready-to-wear items appear to clients browsing the marketplace.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Grid Columns */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase font-bold block">Desktop Grid Columns</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { col: 2, label: '2 Columns', desc: 'Editorial lookbook' },
                                    { col: 3, label: '3 Columns', desc: 'Standard luxury balance' },
                                    { col: 4, label: '4 Columns', desc: 'High-density catalog' },
                                ].map(item => (
                                    <button
                                        key={item.col}
                                        type="button"
                                        onClick={() => updateStoreDesign({
                                            layout: {
                                                ...(currentStoreDesign.layout || {}),
                                                gridColumns: item.col as any
                                            }
                                        })}
                                        className={`p-3 border rounded-sm text-left transition-all ${
                                            (currentStoreDesign.layout?.gridColumns || 3) === item.col
                                                ? 'border-black bg-gray-50 shadow-xs'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-xs font-bold block text-gray-900">{item.label}</span>
                                        <span className="text-[10px] text-gray-400 mt-0.5 block">{item.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Card Style */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase font-bold block">Product Card Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { style: 'editorial', label: 'Editorial', desc: 'Subtle zoom & serif' },
                                    { style: 'minimal', label: 'Minimal', desc: 'Clean flat outline' },
                                    { style: 'luxury', label: 'Luxury Shadow', desc: 'Gold accent hover' },
                                ].map(item => (
                                    <button
                                        key={item.style}
                                        type="button"
                                        onClick={() => updateStoreDesign({
                                            layout: {
                                                ...(currentStoreDesign.layout || {}),
                                                cardStyle: item.style as any
                                            }
                                        })}
                                        className={`p-3 border rounded-sm text-left transition-all ${
                                            (currentStoreDesign.layout?.cardStyle || 'editorial') === item.style
                                                ? 'border-black bg-gray-50 shadow-xs'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-xs font-bold block text-gray-900">{item.label}</span>
                                        <span className="text-[10px] text-gray-400 mt-0.5 block">{item.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Catalog Badges & Currency toggles */}
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-3.5 border border-gray-100 rounded-sm hover:bg-gray-50 cursor-pointer">
                            <div>
                                <span className="text-xs font-bold text-gray-800 block">Show Verified Atelier Badge</span>
                                <span className="text-[11px] text-gray-400">Display gold verification seal next to certified designer names</span>
                            </div>
                            <input 
                                type="checkbox"
                                checked={currentStoreDesign.layout?.showAtelierBadges ?? true}
                                onChange={e => updateStoreDesign({
                                    layout: {
                                        ...(currentStoreDesign.layout || {}),
                                        showAtelierBadges: e.target.checked
                                    }
                                })}
                                className="w-4 h-4 accent-black rounded cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3.5 border border-gray-100 rounded-sm hover:bg-gray-50 cursor-pointer">
                            <div>
                                <span className="text-xs font-bold text-gray-800 block">Multi-Currency Converter</span>
                                <span className="text-[11px] text-gray-400">Enable real-time currency selector (USD, EUR, GBP, NGN, GHS, ZAR, KES)</span>
                            </div>
                            <input 
                                type="checkbox"
                                checked={currentStoreDesign.layout?.showPriceCurrency ?? true}
                                onChange={e => updateStoreDesign({
                                    layout: {
                                        ...(currentStoreDesign.layout || {}),
                                        showPriceCurrency: e.target.checked
                                    }
                                })}
                                className="w-4 h-4 accent-black rounded cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Featured Categories / Curations */}
            {activeSection === 'collections' && (
                <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-serif italic text-luxury-black font-bold">Featured Store Categories & Curations</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Showcase editorial collections and department highlights on the marketplace.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const current = currentStoreDesign.featuredCategories || [];
                                const newCat = {
                                    id: `cat_${Date.now()}`,
                                    title: 'New Luxury Curation',
                                    subtitle: 'Artisanal collection',
                                    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
                                    link: '/marketplace'
                                };
                                updateStoreDesign({ featuredCategories: [...current, newCat] });
                            }}
                            className="px-3 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 hover:bg-luxury-gold hover:text-black transition-colors"
                        >
                            <Plus size={14} /> Add Category
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(currentStoreDesign.featuredCategories || []).map((cat, idx) => (
                            <div key={cat.id || idx} className="border border-gray-200 rounded-sm overflow-hidden bg-gray-50/50 space-y-3 p-4">
                                <div className="relative aspect-video rounded-sm overflow-hidden bg-gray-200">
                                    <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const updated = (currentStoreDesign.featuredCategories || []).filter((_, i) => i !== idx);
                                            updateStoreDesign({ featuredCategories: updated });
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                        title="Delete category"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Title</label>
                                        <input 
                                            value={cat.title}
                                            onChange={e => {
                                                const list = [...(currentStoreDesign.featuredCategories || [])];
                                                list[idx] = { ...list[idx], title: e.target.value };
                                                updateStoreDesign({ featuredCategories: list });
                                            }}
                                            className="w-full border border-gray-200 p-2 text-xs focus:border-black outline-none font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Subtitle</label>
                                        <input 
                                            value={cat.subtitle || ''}
                                            onChange={e => {
                                                const list = [...(currentStoreDesign.featuredCategories || [])];
                                                list[idx] = { ...list[idx], subtitle: e.target.value };
                                                updateStoreDesign({ featuredCategories: list });
                                            }}
                                            className="w-full border border-gray-200 p-2 text-xs focus:border-black outline-none text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Image URL</label>
                                        <input 
                                            value={cat.imageUrl}
                                            onChange={e => {
                                                const list = [...(currentStoreDesign.featuredCategories || [])];
                                                list[idx] = { ...list[idx], imageUrl: e.target.value };
                                                updateStoreDesign({ featuredCategories: list });
                                            }}
                                            className="w-full border border-gray-200 p-2 text-xs focus:border-black outline-none font-mono text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Link Target</label>
                                        <input 
                                            value={cat.link || '/marketplace'}
                                            onChange={e => {
                                                const list = [...(currentStoreDesign.featuredCategories || [])];
                                                list[idx] = { ...list[idx], link: e.target.value };
                                                updateStoreDesign({ featuredCategories: list });
                                            }}
                                            className="w-full border border-gray-200 p-2 text-xs focus:border-black outline-none font-mono text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Storefront Branding & Footer Details */}
            {activeSection === 'branding' && (
                <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-serif italic text-luxury-black font-bold">Storefront Branding & Footer Information</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Define platform brand messaging, customer concierge contacts, and legal notices.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Maison Brand Tagline</label>
                            <input 
                                value={currentStoreDesign.branding?.tagline || ''}
                                onChange={e => updateStoreDesign({
                                    branding: {
                                        ...(currentStoreDesign.branding || {}),
                                        tagline: e.target.value
                                    }
                                })}
                                placeholder="The Premier Digital Flagship for African Luxury & Bespoke Craftsmanship"
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none font-serif italic text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Concierge Support Email</label>
                            <input 
                                value={currentStoreDesign.branding?.supportEmail || ''}
                                onChange={e => updateStoreDesign({
                                    branding: {
                                        ...(currentStoreDesign.branding || {}),
                                        supportEmail: e.target.value
                                    }
                                })}
                                placeholder="concierge@myfitstore.com"
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Concierge Operating Hours</label>
                            <input 
                                value={currentStoreDesign.branding?.conciergeHours || ''}
                                onChange={e => updateStoreDesign({
                                    branding: {
                                        ...(currentStoreDesign.branding || {}),
                                        conciergeHours: e.target.value
                                    }
                                })}
                                placeholder="Mon – Sat: 08:00 – 20:00 GMT"
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Footer Newsletter Invitation</label>
                            <input 
                                value={currentStoreDesign.branding?.newsletterTitle || ''}
                                onChange={e => updateStoreDesign({
                                    branding: {
                                        ...(currentStoreDesign.branding || {}),
                                        newsletterTitle: e.target.value
                                    }
                                })}
                                placeholder="Enter The Inner Guild"
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Copyright & Guild Notice</label>
                            <input 
                                value={currentStoreDesign.branding?.copyrightText || ''}
                                onChange={e => updateStoreDesign({
                                    branding: {
                                        ...(currentStoreDesign.branding || {}),
                                        copyrightText: e.target.value
                                    }
                                })}
                                placeholder="© 2026 MyFitStore Atelier Guild. All Rights Reserved."
                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Ateliers Storefront Inspector */}
            {activeSection === 'ateliers' && (
                <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-serif italic text-luxury-black font-bold">Atelier Storefronts Inspector & Theming Override</h3>
                        <p className="text-xs text-gray-500 mt-0.5">As platform administrator, review each verified atelier's custom storefront styling, hero banner, and brand narrative.</p>
                    </div>

                    {vendors && vendors.length > 0 ? (
                        <div className="space-y-6">
                            {/* Vendor Selector Dropdown */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-sm border border-gray-100">
                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Select Atelier to Inspect</label>
                                    <select
                                        value={selectedVendorId}
                                        onChange={e => setSelectedVendorId(e.target.value)}
                                        className="border border-gray-300 p-2 text-xs font-bold rounded-sm bg-white focus:border-black outline-none min-w-[240px]"
                                    >
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.name} ({v.verificationStatus || 'UNVERIFIED'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedVendor && onDesignerClick && (
                                    <button
                                        type="button"
                                        onClick={() => onDesignerClick(selectedVendor.name)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-luxury-gold hover:text-black transition-colors"
                                    >
                                        <ExternalLink size={14} /> View Atelier Public Storefront
                                    </button>
                                )}
                            </div>

                            {/* Selected Atelier Details Card */}
                            {selectedVendor && (
                                <div className="border border-gray-200 rounded-sm p-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            {selectedVendor.avatar ? (
                                                <img src={selectedVendor.avatar} alt={selectedVendor.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-serif font-bold text-gray-500">
                                                    {selectedVendor.name.slice(0, 1)}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-lg font-serif italic font-bold text-luxury-black flex items-center gap-2">
                                                    {selectedVendor.name}
                                                    {selectedVendor.verificationStatus === 'VERIFIED' && (
                                                        <ShieldCheck size={16} className="text-luxury-gold" />
                                                    )}
                                                </h4>
                                                <span className="text-xs text-gray-500">{selectedVendor.location || 'Pan-African Atelier'} • Tier: {selectedVendor.subscriptionPlan || 'Atelier'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-gray-100 text-gray-700 rounded-xs">
                                                Theme: {selectedVendor.visualTheme || 'MINIMALIST'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Storefront Hero Preview */}
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Storefront Hero Banner</label>
                                        {selectedVendor.heroBanner || selectedVendor.coverImage ? (
                                            <div className="relative aspect-21/9 rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                                                <img 
                                                    src={selectedVendor.heroBanner || selectedVendor.coverImage} 
                                                    alt="Atelier Banner" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                                                    <h3 className="text-white text-xl sm:text-2xl font-serif italic font-bold tracking-wide">
                                                        {selectedVendor.heroHeadline || selectedVendor.name}
                                                    </h3>
                                                    {selectedVendor.heroTagline && (
                                                        <p className="text-white/80 text-xs mt-1 max-w-lg">{selectedVendor.heroTagline}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-sm text-xs text-gray-400">
                                                No custom hero banner uploaded yet.
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand Story Snippet */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Brand Narrative</span>
                                            <p className="text-xs text-gray-700 leading-relaxed italic">
                                                "{selectedVendor.brandStory || selectedVendor.bio || 'No brand narrative provided.'}"
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Artisan Quote</span>
                                            <p className="text-xs text-gray-700 leading-relaxed italic">
                                                "{selectedVendor.artisanQuote || 'Crafting timeless silhouettes from heritage textiles.'}"
                                            </p>
                                            {selectedVendor.artisanQuoteAuthor && (
                                                <span className="text-[10px] text-gray-500 block mt-1 font-bold">— {selectedVendor.artisanQuoteAuthor}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 p-4 text-center">No vendors registered on platform yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};
