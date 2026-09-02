import React, { useRef, useState } from 'react';
import { 
  X, Menu, Layout, Image as ImageIcon, Plus, Trash2, Grid, Upload, 
  Video, Sparkles, Layers, Check, RefreshCw
} from 'lucide-react';
import { LandingPageContent } from '../../types.ts';

interface CmsEditorProps {
    cmsForm: any;
    setCmsForm: (form: any) => void;
    handleCmsSave: () => Promise<void>;
    setActiveTab: (tab: string) => void;
    setIsSidebarOpen: (open: boolean) => void;
}

export const CmsEditor: React.FC<CmsEditorProps> = ({
    cmsForm,
    setCmsForm,
    handleCmsSave,
    setActiveTab,
    setIsSidebarOpen
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // File input refs
    const heroPosterRef = useRef<HTMLInputElement>(null);
    const heroVideoRef = useRef<HTMLInputElement>(null);
    const campaignImg1Ref = useRef<HTMLInputElement>(null);
    const campaignImg2Ref = useRef<HTMLInputElement>(null);
    const campaignImg3Ref = useRef<HTMLInputElement>(null);
    const campaignImg4Ref = useRef<HTMLInputElement>(null);
    const multiCampaignRef = useRef<HTMLInputElement>(null);
    const multiEditorialRef = useRef<HTMLInputElement>(null);
    const multiGalleryRef = useRef<HTMLInputElement>(null);

    // Helper to read single file to Base64 Data URL
    const handleSingleFileUpload = (file: File, callback: (url: string) => void) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                callback(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    // Helper to read multiple files to Base64 Data URLs
    const handleMultipleFilesUpload = (files: FileList | null, callback: (urls: string[]) => void) => {
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        const results: string[] = [];
        let readCount = 0;

        fileArray.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    results.push(reader.result as string);
                }
                readCount++;
                if (readCount === fileArray.length) {
                    callback(results);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const onSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await handleCmsSave();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Safe getters & setters for nested state
    const hero = cmsForm?.hero || { titleLine1: 'DIGITAL', titleLine2: 'AVANT-GARDE', subtitle: 'The New Vanguard', buttonText: 'Shop Collection', posterUrl: '', videoUrl: '' };
    const campaign = cmsForm?.campaign || { title: 'Urban Chronicles', subtitle: 'The Campaign', image1: '', image2: '', image3: '', image4: '', overlayText1: 'Street Edition', images: [] };
    const featuredCollections = cmsForm?.featuredCollections || [];
    const editorialImages = cmsForm?.editorialImages || [];
    const galleryImages = cmsForm?.galleryImages || [];

    const updateHero = (field: string, value: any) => {
        setCmsForm({
            ...cmsForm,
            hero: { ...hero, [field]: value }
        });
    };

    const updateCampaign = (field: string, value: any) => {
        setCmsForm({
            ...cmsForm,
            campaign: { ...campaign, [field]: value }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('OVERVIEW')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif italic text-luxury-black">Landing Page Content Manager</h2>
                        <p className="text-xs text-gray-500 mt-1">Edit imagery, headlines, and multi-photo galleries displayed across the landing page.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded">
                            <Check size={14} /> Saved Successfully
                        </span>
                    )}
                    <button 
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                        {isSaving ? 'Publishing...' : 'Publish Changes'}
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editing Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* HERO SECTION EDITOR */}
                    <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-luxury-black">
                                <Layout size={16} className="text-luxury-gold" /> Hero Section Media & Text
                            </h3>
                            <span className="text-[10px] uppercase font-semibold text-gray-400">Primary Banner</span>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Headline Line 1</label>
                                    <input 
                                        type="text"
                                        value={hero.titleLine1 || ''}
                                        onChange={(e) => updateHero('titleLine1', e.target.value)}
                                        className="w-full border border-gray-200 px-3 py-2 text-sm font-serif italic focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Headline Line 2</label>
                                    <input 
                                        type="text"
                                        value={hero.titleLine2 || ''}
                                        onChange={(e) => updateHero('titleLine2', e.target.value)}
                                        className="w-full border border-gray-200 px-3 py-2 text-sm font-serif italic focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Subtitle Eyebrow</label>
                                    <input 
                                        type="text"
                                        value={hero.subtitle || ''}
                                        onChange={(e) => updateHero('subtitle', e.target.value)}
                                        className="w-full border border-gray-200 px-3 py-2 text-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">CTA Button Text</label>
                                    <input 
                                        type="text"
                                        value={hero.buttonText || ''}
                                        onChange={(e) => updateHero('buttonText', e.target.value)}
                                        className="w-full border border-gray-200 px-3 py-2 text-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            {/* Hero Poster Image Upload */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-2 flex items-center gap-1">
                                    <ImageIcon size={12} /> Hero Poster Image
                                </label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {hero.posterUrl ? (
                                        <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden border border-gray-200 group flex-shrink-0">
                                            <img src={hero.posterUrl} alt="Hero Poster" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => updateHero('posterUrl', '')}
                                                className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-20 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-[10px]">
                                            No Poster
                                        </div>
                                    )}
                                    <div className="flex-1 w-full space-y-2">
                                        <input 
                                            type="text"
                                            placeholder="Paste Poster Image URL..."
                                            value={hero.posterUrl || ''}
                                            onChange={(e) => updateHero('posterUrl', e.target.value)}
                                            className="w-full border border-gray-200 px-3 py-2 text-xs focus:border-black outline-none bg-white"
                                        />
                                        <input 
                                            type="file" 
                                            ref={heroPosterRef} 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleSingleFileUpload(e.target.files[0], (url) => updateHero('posterUrl', url));
                                                }
                                            }}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => heroPosterRef.current?.click()}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Upload size={12} /> Upload Hero Poster Image
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Video URL / Upload */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-2 flex items-center gap-1">
                                    <Video size={12} /> Hero Background Video
                                </label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex-1 w-full space-y-2">
                                        <input 
                                            type="text"
                                            placeholder="Paste Video URL (MP4)..."
                                            value={hero.videoUrl || ''}
                                            onChange={(e) => updateHero('videoUrl', e.target.value)}
                                            className="w-full border border-gray-200 px-3 py-2 text-xs focus:border-black outline-none bg-white"
                                        />
                                        <input 
                                            type="file" 
                                            ref={heroVideoRef} 
                                            accept="video/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleSingleFileUpload(e.target.files[0], (url) => updateHero('videoUrl', url));
                                                }
                                            }}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => heroVideoRef.current?.click()}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Upload size={12} /> Upload Hero Video File
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CAMPAIGN SHOWCASE SECTION */}
                    <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-luxury-black">
                                <ImageIcon size={16} className="text-luxury-gold" /> Campaign Showcase & Grid
                            </h3>
                            <span className="text-[10px] uppercase font-semibold text-gray-400">Featured Looks</span>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Campaign Title</label>
                                    <input 
                                        type="text"
                                        value={campaign.title || ''}
                                        onChange={(e) => updateCampaign('title', e.target.value)}
                                        className="w-full border border-gray-200 px-3 py-2 text-sm font-serif italic focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Overlay Badge Text</label>
                                    <input 
                                        type="text"
                                        value={campaign.overlayText1 || ''}
                                        onChange={(e) => updateCampaign('overlayText1', e.target.value)}
                                        className="w-full border border-gray-200 px-3 py-2 text-xs focus:border-black outline-none bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            {/* Campaign Images 1 - 4 with Upload Controls */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                {[
                                    { label: 'Featured Main Image (Large)', key: 'image1', ref: campaignImg1Ref },
                                    { label: 'Campaign Image 2', key: 'image2', ref: campaignImg2Ref },
                                    { label: 'Campaign Image 3', key: 'image3', ref: campaignImg3Ref },
                                    { label: 'Campaign Image 4', key: 'image4', ref: campaignImg4Ref }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-3 border border-gray-100 rounded bg-gray-50/30 space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 block">{item.label}</label>
                                        <div className="flex items-center gap-3">
                                            {campaign[item.key] ? (
                                                <div className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden border border-gray-300 flex-shrink-0 group">
                                                    <img src={campaign[item.key]} alt={`Campaign ${idx+1}`} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => updateCampaign(item.key, '')}
                                                        className="absolute top-0.5 right-0.5 bg-black/70 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center text-[9px] text-gray-400 flex-shrink-0">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <input 
                                                    type="text"
                                                    placeholder="Image URL..."
                                                    value={campaign[item.key] || ''}
                                                    onChange={(e) => updateCampaign(item.key, e.target.value)}
                                                    className="w-full border border-gray-200 px-2 py-1 text-[11px] focus:border-black outline-none bg-white"
                                                />
                                                <input 
                                                    type="file" 
                                                    ref={item.ref} 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            handleSingleFileUpload(e.target.files[0], (url) => updateCampaign(item.key, url));
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => item.ref.current?.click()}
                                                    className="w-full py-1 bg-gray-100 hover:bg-gray-200 text-black text-[9px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Upload size={10} /> Upload File
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Multiple Campaign Gallery Upload */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-700 block">Additional Campaign Gallery (Multiple Photos)</label>
                                        <p className="text-[10px] text-gray-400">Upload multiple campaign photos at once to create a rich photo wall.</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={multiCampaignRef} 
                                        accept="image/*" 
                                        multiple 
                                        className="hidden" 
                                        onChange={(e) => {
                                            handleMultipleFilesUpload(e.target.files, (urls) => {
                                                const existing = campaign.images || [];
                                                updateCampaign('images', [...existing, ...urls]);
                                            });
                                        }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => multiCampaignRef.current?.click()}
                                        className="px-4 py-2 bg-luxury-gold text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-black transition-colors flex items-center gap-1.5"
                                    >
                                        <Plus size={12} /> Add Multiple Images
                                    </button>
                                </div>

                                {/* Multi-Image Previews */}
                                {(campaign.images && campaign.images.length > 0) ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                                        {campaign.images.map((imgUrl: string, idx: number) => (
                                            <div key={idx} className="relative aspect-square bg-gray-200 rounded overflow-hidden group border border-gray-300">
                                                <img src={imgUrl} alt={`Campaign Extra ${idx+1}`} className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = [...campaign.images];
                                                        updated.splice(idx, 1);
                                                        updateCampaign('images', updated);
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center border border-dashed border-gray-200 rounded text-gray-400 text-xs">
                                        No extra campaign gallery images uploaded yet. Click "Add Multiple Images" above to upload photos.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* EDITORIAL / TREND FORECAST GALLERY */}
                    <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-luxury-black">
                                <Sparkles size={16} className="text-luxury-gold" /> AI Trend & Editorial Showcase Images
                            </h3>
                            <input 
                                type="file" 
                                ref={multiEditorialRef} 
                                accept="image/*" 
                                multiple 
                                className="hidden" 
                                onChange={(e) => {
                                    handleMultipleFilesUpload(e.target.files, (urls) => {
                                        const updated = [...editorialImages, ...urls];
                                        setCmsForm({ ...cmsForm, editorialImages: updated });
                                    });
                                }}
                            />
                            <button 
                                type="button"
                                onClick={() => multiEditorialRef.current?.click()}
                                className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-luxury-gold transition-colors flex items-center gap-1.5"
                            >
                                <Plus size={12} /> Upload Editorial Photos
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Images displayed alongside the AI Seasonal Trend Forecast section on the landing page.</p>

                        {editorialImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded">
                                {editorialImages.map((imgUrl: string, idx: number) => (
                                    <div key={idx} className="relative aspect-[3/4] bg-gray-200 rounded overflow-hidden group border border-gray-300">
                                        <img src={imgUrl} alt={`Editorial ${idx+1}`} className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const updated = [...editorialImages];
                                                updated.splice(idx, 1);
                                                setCmsForm({ ...cmsForm, editorialImages: updated });
                                            }}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center border border-dashed border-gray-200 rounded text-gray-400 text-xs">
                                No editorial images uploaded. Add images to personalize the trend forecast section.
                            </div>
                        )}
                    </div>

                    {/* FEATURED COLLECTIONS GRID */}
                    <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-luxury-black">
                                <Grid size={16} className="text-luxury-gold" /> Featured Collections & Ateliers
                            </h3>
                            <button 
                                type="button"
                                onClick={() => {
                                    const updated = [...featuredCollections, { title: 'New Collection', image: '', description: '' }];
                                    setCmsForm({ ...cmsForm, featuredCollections: updated });
                                }}
                                className="px-4 py-2 border border-black text-black text-[10px] font-bold uppercase tracking-wider rounded hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Plus size={12} /> Add Collection Card
                            </button>
                        </div>

                        <div className="space-y-4">
                            {featuredCollections.map((collection: any, idx: number) => (
                                <div key={idx} className="p-4 border border-gray-200 rounded bg-gray-50/50 relative group space-y-3">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const updated = [...featuredCollections];
                                            updated.splice(idx, 1);
                                            setCmsForm({ ...cmsForm, featuredCollections: updated });
                                        }}
                                        className="absolute top-3 right-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Collection"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                        <div className="flex items-center gap-3">
                                            {collection.image ? (
                                                <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden border border-gray-300 flex-shrink-0">
                                                    <img src={collection.image} alt={collection.title} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center text-[9px] text-gray-400 flex-shrink-0">
                                                    No Cover
                                                </div>
                                            )}
                                            <div className="space-y-1 flex-1">
                                                <input 
                                                    type="file"
                                                    id={`collection-file-${idx}`}
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            handleSingleFileUpload(e.target.files[0], (url) => {
                                                                const updated = [...featuredCollections];
                                                                updated[idx].image = url;
                                                                setCmsForm({ ...cmsForm, featuredCollections: updated });
                                                            });
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => document.getElementById(`collection-file-${idx}`)?.click()}
                                                    className="w-full py-1.5 bg-gray-200 hover:bg-gray-300 text-black text-[9px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Upload size={10} /> Upload Image
                                                </button>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2 space-y-2">
                                            <div>
                                                <label className="text-[9px] font-bold uppercase text-gray-400 block">Collection Title</label>
                                                <input 
                                                    type="text"
                                                    value={collection.title || ''}
                                                    onChange={(e) => {
                                                        const updated = [...featuredCollections];
                                                        updated[idx].title = e.target.value;
                                                        setCmsForm({ ...cmsForm, featuredCollections: updated });
                                                    }}
                                                    className="w-full border border-gray-200 px-3 py-1.5 text-xs font-bold focus:border-black outline-none bg-white rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold uppercase text-gray-400 block">Image URL (Alternative)</label>
                                                <input 
                                                    type="text"
                                                    value={collection.image || ''}
                                                    onChange={(e) => {
                                                        const updated = [...featuredCollections];
                                                        updated[idx].image = e.target.value;
                                                        setCmsForm({ ...cmsForm, featuredCollections: updated });
                                                    }}
                                                    className="w-full border border-gray-200 px-3 py-1.5 text-[11px] focus:border-black outline-none bg-white rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {featuredCollections.length === 0 && (
                                <div className="py-6 text-center border border-dashed border-gray-200 rounded text-gray-400 text-xs">
                                    No custom collection cards added yet. Click "Add Collection Card" above.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* GENERAL LANDING PAGE BRAND GALLERY (MULTIPLE IMAGES) */}
                    <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-luxury-black">
                                    <Layers size={16} className="text-luxury-gold" /> Master Landing Page Photo Gallery
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Upload multiple brand, lookbook, and campaign photos to feature on the homepage.</p>
                            </div>
                            <input 
                                type="file" 
                                ref={multiGalleryRef} 
                                accept="image/*" 
                                multiple 
                                className="hidden" 
                                onChange={(e) => {
                                    handleMultipleFilesUpload(e.target.files, (urls) => {
                                        const updated = [...galleryImages, ...urls];
                                        setCmsForm({ ...cmsForm, galleryImages: updated });
                                    });
                                }}
                            />
                            <button 
                                type="button"
                                onClick={() => multiGalleryRef.current?.click()}
                                className="px-4 py-2 bg-luxury-gold text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-black transition-colors flex items-center gap-1.5"
                            >
                                <Plus size={12} /> Add Multiple Photos
                            </button>
                        </div>

                        {galleryImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                                {galleryImages.map((imgUrl: string, idx: number) => (
                                    <div key={idx} className="relative aspect-square bg-gray-200 rounded overflow-hidden group border border-gray-300">
                                        <img src={imgUrl} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const updated = [...galleryImages];
                                                updated.splice(idx, 1);
                                                setCmsForm({ ...cmsForm, galleryImages: updated });
                                            }}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center border border-dashed border-gray-200 rounded text-gray-400 text-xs">
                                No master gallery images uploaded. Click "Add Multiple Photos" to upload multiple high-resolution images at once.
                            </div>
                        )}
                    </div>

                </div>

                {/* Sidebar Column: Global Settings & Summary */}
                <div className="space-y-8">
                    <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm sticky top-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-luxury-black pb-2 border-b border-gray-100">
                            Marquee & Text
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Scrolling Marquee Text</label>
                                <textarea 
                                    rows={3}
                                    value={cmsForm?.marquee?.text || ''}
                                    onChange={(e) => setCmsForm({
                                        ...cmsForm,
                                        marquee: { ...cmsForm.marquee, text: e.target.value }
                                    })}
                                    placeholder="Lagos • Accra • Nairobi • Heritage Reimagined"
                                    className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none bg-gray-50 rounded resize-none"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Separate marquee items with bullet symbol (•).</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <label className="text-[10px] font-bold uppercase text-gray-500 block">Content Summary</label>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <span className="text-gray-500">Hero Poster Image:</span>
                                        <span className="font-semibold">{hero.posterUrl ? 'Uploaded' : 'Default'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <span className="text-gray-500">Campaign Main Look:</span>
                                        <span className="font-semibold">{campaign.image1 ? 'Uploaded' : 'Default'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <span className="text-gray-500">Extra Campaign Photos:</span>
                                        <span className="font-semibold">{campaign.images?.length || 0} photos</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <span className="text-gray-500">Editorial Forecast Photos:</span>
                                        <span className="font-semibold">{editorialImages.length} photos</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <span className="text-gray-500">Featured Collections:</span>
                                        <span className="font-semibold">{featuredCollections.length} cards</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <span className="text-gray-500">Master Gallery Photos:</span>
                                        <span className="font-semibold">{galleryImages.length} photos</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={onSave}
                                disabled={isSaving}
                                className="w-full mt-4 bg-black text-white py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                                {isSaving ? 'Publishing...' : 'Publish Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
