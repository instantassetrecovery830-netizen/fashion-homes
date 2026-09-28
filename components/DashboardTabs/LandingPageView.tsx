import React, { useState, useRef, useMemo } from 'react';
import { 
    Menu, ChevronDown, Video, Sparkles, Image as ImageIcon, 
    FileText, Plus, Trash2, ExternalLink, Calendar, RefreshCw, 
    Check, CheckCircle2, AlertCircle, Eye, Clock, Layers, Upload, X,
    Layout, Globe, Quote, BookOpen, Sliders
} from 'lucide-react';
import { Product, DropPageContent, LandingPageContent } from '../../types.ts';

// Helper to compress/optimize uploaded images for fast rendering and safe storage
const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    if (width / height > MAX_WIDTH / MAX_HEIGHT) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    } else {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.72));
                } else {
                    resolve(reader.result as string);
                }
            };
            img.onerror = () => resolve(reader.result as string);
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

interface LandingPageViewProps {
    cmsForm: any;
    setCmsForm: (form: any) => void;
    handleCMSUpdate: (customForm?: any) => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
    products: Product[];
    onNavigate?: (view: any) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
    cmsForm,
    setCmsForm,
    handleCMSUpdate,
    setIsSidebarOpen,
    products,
    onNavigate
}) => {
    const [expandedSection, setExpandedSection] = useState<string | null>('hero');
    const [selectedDropIndex, setSelectedDropIndex] = useState(0);
    const [isSavingDrop, setIsSavingDrop] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [dropNotification, setDropNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isUploadingDropImages, setIsUploadingDropImages] = useState(false);
    const [isDragOverDrop, setIsDragOverDrop] = useState(false);
    const [showDropUrlFallback, setShowDropUrlFallback] = useState(false);

    // Hero Poster Direct URL state
    const [heroPosterUrlInput, setHeroPosterUrlInput] = useState('');

    // Editorial Trends States
    const [newEditorialUrl, setNewEditorialUrl] = useState('');
    const [isUploadingEditorial, setIsUploadingEditorial] = useState(false);

    // Additional Campaign Slides States
    const [newCampaignSlideUrl, setNewCampaignSlideUrl] = useState('');
    const [isUploadingCampaignSlide, setIsUploadingCampaignSlide] = useState(false);

    const dropFileInputRef = useRef<HTMLInputElement>(null);
    const heroPosterInputRef = useRef<HTMLInputElement>(null);
    const campaignInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const editorialFileInputRef = useRef<HTMLInputElement>(null);
    const extraCampaignFileInputRef = useRef<HTMLInputElement>(null);

    // Multi-Drop list computed property
    const activeDrops: DropPageContent[] = useMemo(() => {
        if (cmsForm?.drops && Array.isArray(cmsForm.drops) && cmsForm.drops.length > 0) {
            return cmsForm.drops;
        }
        if (cmsForm?.drop) {
            return [cmsForm.drop];
        }
        return [];
    }, [cmsForm]);

    const activeDrop = activeDrops[selectedDropIndex] || activeDrops[0];

    const updateSelectedDrop = (updatedDrop: DropPageContent) => {
        const currentDrops = activeDrops.length > 0 ? [...activeDrops] : [updatedDrop];
        const indexToUpdate = Math.min(selectedDropIndex, currentDrops.length - 1);
        currentDrops[indexToUpdate] = updatedDrop;
        setCmsForm({
            ...cmsForm,
            drop: currentDrops[0],
            drops: currentDrops
        });
    };

    const toLocalDateTimeInput = (isoDate?: string): string => {
        if (!isoDate) return '';
        try {
            const d = new Date(isoDate);
            if (isNaN(d.getTime())) return '';
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch {
            return '';
        }
    };

    const handleDateChange = (val: string) => {
        if (!activeDrop) return;
        if (!val) {
            updateSelectedDrop({
                ...activeDrop,
                countdownDate: new Date(Date.now() + 7 * 86400000).toISOString()
            });
            return;
        }
        try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
                updateSelectedDrop({
                    ...activeDrop,
                    countdownDate: d.toISOString()
                });
            }
        } catch (e) {
            console.warn("Invalid date entered:", e);
        }
    };

    const setCountdownPreset = (daysFromNow: number) => {
        if (!activeDrop) return;
        const targetDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();
        updateSelectedDrop({
            ...activeDrop,
            countdownDate: targetDate
        });
    };

    const getDropStatus = (dropTarget?: DropPageContent) => {
        const dropToEvaluate = dropTarget || activeDrop || cmsForm?.drop;
        if (!dropToEvaluate) return null;
        if (!dropToEvaluate.countdownDate) return { label: 'Draft', color: 'bg-gray-100 text-gray-700' };
        const target = new Date(dropToEvaluate.countdownDate).getTime();
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) {
            return { label: 'Live / Unlocked', color: 'bg-green-100 text-green-800 border-green-200' };
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        return { 
            label: `Live: ${days}d ${hours}h left`, 
            color: 'bg-amber-50 text-amber-900 border-amber-200' 
        };
    };

    const handleInitializeDrop = async () => {
        setIsSavingDrop(true);
        const initialProductIds = products && products.length > 0 
            ? products.slice(0, 4).map(p => p.id) 
            : [];
            
        const initialDrop: DropPageContent = {
            id: `drop_${Date.now()}`,
            title: 'Summer Solstice Capsule',
            subtitle: 'Limited Edition • 50 Pieces Worldwide',
            description: 'An exclusive atelier exploration of ethereal textures, hand-draped silhouettes, and bespoke craftsmanship. Once the countdown reaches zero, the capsule unlocks for 24 hours only. No restocks will be produced.',
            backgroundImages: [
                'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600'
            ],
            countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            productIds: initialProductIds,
            status: 'UPCOMING',
            createdAt: new Date().toISOString()
        };

        const currentDrops = activeDrops.length > 0 ? activeDrops : [];
        const newDrops = [...currentDrops, initialDrop];

        const updatedCms = {
            ...(cmsForm || {}),
            drop: newDrops[0],
            drops: newDrops
        };

        setCmsForm(updatedCms);
        setSelectedDropIndex(newDrops.length - 1);
        setExpandedSection('drop');

        try {
            await handleCMSUpdate(updatedCms);
            setDropNotification({
                type: 'success',
                message: 'New Drop initialized and saved to storefront!'
            });
        } catch (err: any) {
            console.error("Error saving initialized drop:", err);
            setDropNotification({
                type: 'success',
                message: 'New Drop initialized in editor. Click Save All Changes to confirm sync.'
            });
        } finally {
            setIsSavingDrop(false);
            setTimeout(() => setDropNotification(null), 5000);
        }
    };

    const handleAddNewDrop = () => {
        const initialProductIds = products && products.length > 0 ? products.slice(0, 3).map(p => p.id) : [];
        const nextNum = activeDrops.length + 1;
        const newDrop: DropPageContent = {
            id: `drop_${Date.now()}`,
            title: `Capsule Drop #${nextNum}`,
            subtitle: `Edition #${nextNum} • Exclusive Atelier Release`,
            description: `An exclusive atelier exploration of bespoke craftsmanship. Unlocks for a limited time only.`,
            backgroundImages: [
                'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1600',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600'
            ],
            countdownDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            productIds: initialProductIds,
            status: 'UPCOMING',
            createdAt: new Date().toISOString()
        };
        const currentDrops = activeDrops.length > 0 ? activeDrops : [];
        const newDrops = [...currentDrops, newDrop];
        setCmsForm({
            ...cmsForm,
            drop: newDrops[0],
            drops: newDrops
        });
        setSelectedDropIndex(newDrops.length - 1);
        setDropNotification({
            type: 'success',
            message: `Created Drop #${nextNum}. Don't forget to click 'Save All Changes' when ready.`
        });
        setTimeout(() => setDropNotification(null), 4000);
    };

    const handleDeleteDrop = (indexToDelete: number) => {
        if (activeDrops.length <= 1) {
            alert("At least one drop should remain in the system. You can edit its title and details instead.");
            return;
        }
        if (!confirm(`Are you sure you want to delete "${activeDrops[indexToDelete]?.title}"?`)) return;

        const updatedDrops = activeDrops.filter((_, i) => i !== indexToDelete);
        setCmsForm({
            ...cmsForm,
            drop: updatedDrops[0],
            drops: updatedDrops
        });
        setSelectedDropIndex(Math.max(0, indexToDelete - 1));
        setDropNotification({
            type: 'success',
            message: 'Drop removed. Click Save All Changes to persist this update.'
        });
        setTimeout(() => setDropNotification(null), 4000);
    };

    const handleSaveDropOnly = async () => {
        setIsSavingDrop(true);
        setDropNotification(null);
        try {
            await handleCMSUpdate(cmsForm);
            setDropNotification({
                type: 'success',
                message: `Drop details successfully published to public Drop Page!`
            });
        } catch (err: any) {
            console.error("Error saving drop:", err);
            setDropNotification({
                type: 'error',
                message: err?.message || 'Failed to update drop. Please try again.'
            });
        } finally {
            setIsSavingDrop(false);
            setTimeout(() => setDropNotification(null), 5000);
        }
    };

    const handleDropImagesUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !activeDrop) return;
        setIsUploadingDropImages(true);
        try {
            const fileArray = Array.from(files);
            const uploadedUrls: string[] = [];
            for (const file of fileArray) {
                try {
                    const compressedDataUrl = await processImageFile(file);
                    uploadedUrls.push(compressedDataUrl);
                } catch (err) {
                    console.warn("Could not process drop image:", err);
                }
            }
            if (uploadedUrls.length > 0) {
                const currentImages = activeDrop.backgroundImages || [];
                updateSelectedDrop({
                    ...activeDrop,
                    backgroundImages: [...currentImages, ...uploadedUrls]
                });
                setDropNotification({
                    type: 'success',
                    message: `Added ${uploadedUrls.length} background image(s) to this drop.`
                });
                setTimeout(() => setDropNotification(null), 3500);
            }
        } finally {
            setIsUploadingDropImages(false);
        }
    };

    const handleHeroPosterUpload = async (file?: File) => {
        if (!file) return;
        try {
            const url = await processImageFile(file);
            setCmsForm({
                ...cmsForm,
                hero: {
                    ...(cmsForm.hero || {}),
                    posterUrl: url
                }
            });
        } catch (err: any) {
            console.error("Poster upload failed:", err);
        }
    };

    const handleCampaignImageUpload = async (file: File | undefined, imageNum: number) => {
        if (!file) return;
        try {
            const url = await processImageFile(file);
            setCmsForm({
                ...cmsForm,
                campaign: {
                    ...(cmsForm.campaign || {}),
                    [`image${imageNum}`]: url
                }
            });
        } catch (err: any) {
            console.error(`Campaign image ${imageNum} upload failed:`, err);
        }
    };

    const handleAddImage = () => {
        if (!newImageUrl.trim() || !activeDrop) return;
        const currentImages = activeDrop.backgroundImages || [];
        updateSelectedDrop({
            ...activeDrop,
            backgroundImages: [...currentImages, newImageUrl.trim()]
        });
        setNewImageUrl('');
    };

    const handleRemoveImage = (indexToRemove: number) => {
        if (!activeDrop) return;
        const currentImages = activeDrop.backgroundImages || [];
        updateSelectedDrop({
            ...activeDrop,
            backgroundImages: currentImages.filter((_, i) => i !== indexToRemove)
        });
    };

    const handleToggleAllProducts = (selectAll: boolean) => {
        if (!activeDrop) return;
        updateSelectedDrop({
            ...activeDrop,
            productIds: selectAll ? products.map(p => p.id) : []
        });
    };

    const onSaveAll = async () => {
        setIsSavingAll(true);
        setSaveStatus(null);
        try {
            await handleCMSUpdate(cmsForm);
            setSaveStatus({
                type: 'success',
                message: 'All landing page changes, text, and images have been saved and published live!'
            });
        } catch (err: any) {
            console.error('Error saving CMS:', err);
            setSaveStatus({
                type: 'error',
                message: err?.message || 'Failed to save landing page changes. Please check connection and try again.'
            });
        } finally {
            setIsSavingAll(false);
            setTimeout(() => setSaveStatus(null), 6000);
        }
    };

    const handleEditorialUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploadingEditorial(true);
        try {
            const fileArr = Array.from(files);
            const urls: string[] = [];
            for (const file of fileArr) {
                try {
                    const u = await processImageFile(file);
                    urls.push(u);
                } catch (err) {
                    console.warn("Editorial upload notice:", err);
                }
            }
            if (urls.length > 0) {
                const current = cmsForm?.editorialImages || [];
                setCmsForm({
                    ...cmsForm,
                    editorialImages: [...current, ...urls]
                });
            }
        } finally {
            setIsUploadingEditorial(false);
        }
    };

    const handleAddEditorialUrl = () => {
        if (!newEditorialUrl.trim()) return;
        const current = cmsForm?.editorialImages || [];
        setCmsForm({
            ...cmsForm,
            editorialImages: [...current, newEditorialUrl.trim()]
        });
        setNewEditorialUrl('');
    };

    const handleRemoveEditorialImage = (index: number) => {
        const current = cmsForm?.editorialImages || [];
        setCmsForm({
            ...cmsForm,
            editorialImages: current.filter((_: any, i: number) => i !== index)
        });
    };

    const handleCampaignSlidesUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploadingCampaignSlide(true);
        try {
            const fileArr = Array.from(files);
            const urls: string[] = [];
            for (const file of fileArr) {
                try {
                    const u = await processImageFile(file);
                    urls.push(u);
                } catch (err) {
                    console.warn("Campaign slide upload notice:", err);
                }
            }
            if (urls.length > 0) {
                const current = cmsForm?.campaign?.images || [];
                setCmsForm({
                    ...cmsForm,
                    campaign: {
                        ...(cmsForm.campaign || {}),
                        images: [...current, ...urls]
                    }
                });
            }
        } finally {
            setIsUploadingCampaignSlide(false);
        }
    };

    const handleAddCampaignSlide = () => {
        if (!newCampaignSlideUrl.trim()) return;
        const current = cmsForm?.campaign?.images || [];
        setCmsForm({
            ...cmsForm,
            campaign: {
                ...(cmsForm.campaign || {}),
                images: [...current, newCampaignSlideUrl.trim()]
            }
        });
        setNewCampaignSlideUrl('');
    };

    const handleRemoveCampaignSlide = (index: number) => {
        const current = cmsForm?.campaign?.images || [];
        setCmsForm({
            ...cmsForm,
            campaign: {
                ...(cmsForm.campaign || {}),
                images: current.filter((_: any, i: number) => i !== index)
            }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
            {/* Header with Save & Live Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] uppercase font-bold tracking-widest rounded-xs">CMS</span>
                        <span className="text-xs text-luxury-gold uppercase font-bold tracking-wider">Homepage & Lookbook</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif italic text-luxury-black">Landing Page CMS</h2>
                    <p className="text-xs text-gray-500 mt-1">Curate public homepage video hero, capsule drops, lookbook editorial trends, campaign slides, and brand story.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {onNavigate && (
                        <button 
                            type="button"
                            onClick={() => onNavigate('LANDING')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors rounded-xs"
                            title="Open homepage to verify changes live"
                        >
                            <Eye size={14} /> Preview Landing Page
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={onSaveAll}
                        disabled={isSavingAll}
                        className="inline-flex items-center gap-2 bg-luxury-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-black transition-all shadow-md disabled:opacity-50 rounded-xs"
                    >
                        {isSavingAll ? (
                            <>
                                <RefreshCw size={14} className="animate-spin text-luxury-gold" />
                                <span>Publishing...</span>
                            </>
                        ) : (
                            <>
                                <Check size={14} />
                                <span>Save Landing Page</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Save Status Notification Banner */}
            {saveStatus && (
                <div className={`p-4 rounded-sm border flex items-center justify-between animate-fade-in ${saveStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <div className="flex items-center gap-3">
                        {saveStatus.type === 'success' ? (
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle size={18} className="text-red-600 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{saveStatus.message}</span>
                    </div>
                    {saveStatus.type === 'success' && onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('LANDING')}
                            className="text-xs font-bold uppercase tracking-wider underline hover:text-emerald-700"
                        >
                            View Live Now →
                        </button>
                    )}
                </div>
            )}

            {cmsForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Hero Section */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'hero' ? null : 'hero')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Video size={14} /> Hero Section</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'hero' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'hero' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title Line 1</label>
                                        <input 
                                            value={cmsForm.hero?.titleLine1 || ''}
                                            onChange={e => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), titleLine1: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title Line 2 (Italic)</label>
                                        <input 
                                            value={cmsForm.hero?.titleLine2 || ''}
                                            onChange={e => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), titleLine2: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle</label>
                                        <input 
                                            value={cmsForm.hero?.subtitle || ''}
                                            onChange={e => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), subtitle: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Hero Description</label>
                                        <textarea 
                                            value={cmsForm.hero?.description || ''}
                                            onChange={e => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), description: e.target.value}})}
                                            placeholder="Discover bespoke ready-to-wear, curated designer collections, and avant-garde couture from Africa's premier ateliers."
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white min-h-[70px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Video URL (MP4)</label>
                                            <input 
                                                value={cmsForm.hero?.videoUrl || ''}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), videoUrl: e.target.value}})}
                                                placeholder="https://..."
                                                className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Poster / Fallback Image</label>
                                            <div className="space-y-2">
                                                {cmsForm.hero?.posterUrl ? (
                                                    <div className="relative group rounded-sm overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                                                        <img 
                                                            src={cmsForm.hero.posterUrl} 
                                                            alt="Hero Poster Preview" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button 
                                                                type="button"
                                                                onClick={() => heroPosterInputRef.current?.click()}
                                                                className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 hover:bg-luxury-gold hover:text-black transition-colors"
                                                            >
                                                                <Upload size={12} /> Replace
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setCmsForm({ ...cmsForm, hero: { ...(cmsForm.hero || {}), posterUrl: '' } })}
                                                                className="p-1.5 bg-red-600 text-white rounded-xs hover:bg-red-700 transition-colors"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        onClick={() => heroPosterInputRef.current?.click()}
                                                        className="border-2 border-dashed border-gray-200 hover:border-black rounded-sm p-4 text-center cursor-pointer transition-colors aspect-video flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100"
                                                    >
                                                        <ImageIcon size={24} className="text-gray-400 mb-1" />
                                                        <span className="text-xs font-medium text-gray-600">Click to upload poster image</span>
                                                        <span className="text-[10px] text-gray-400 mt-0.5">JPEG / PNG, auto-compressed</span>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    ref={heroPosterInputRef} 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={e => handleHeroPosterUpload(e.target.files?.[0])}
                                                />
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Or paste direct image URL..."
                                                        value={heroPosterUrlInput}
                                                        onChange={e => setHeroPosterUrlInput(e.target.value)}
                                                        className="flex-1 text-xs border border-gray-200 px-3 py-1.5 rounded-sm outline-none focus:border-black font-mono"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            if (heroPosterUrlInput.trim()) {
                                                                setCmsForm({
                                                                    ...cmsForm,
                                                                    hero: { ...(cmsForm.hero || {}), posterUrl: heroPosterUrlInput.trim() }
                                                                });
                                                                setHeroPosterUrlInput('');
                                                            }
                                                        }}
                                                        disabled={!heroPosterUrlInput.trim()}
                                                        className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase rounded-sm disabled:opacity-40"
                                                    >
                                                        Set
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Primary Button Text</label>
                                            <input 
                                                value={cmsForm.hero?.buttonText || ''}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), buttonText: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Secondary Button Text</label>
                                            <input 
                                                value={cmsForm.hero?.secondaryButtonText || ''}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), secondaryButtonText: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section Visibility Toggles */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'sections' ? null : 'sections')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Section Visibility Toggles</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'sections' ? 'rotate-180' : ''}`} />
                            </button>

                            {expandedSection === 'sections' && (
                                <div className="p-6 space-y-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-4">Toggle components on or off on the main public landing page.</p>
                                    {[
                                        { key: 'showHero', label: 'Video Hero Banner', defaultVal: true },
                                        { key: 'showDrops', label: 'Capsule Drops Spotlight & Countdown', defaultVal: true },
                                        { key: 'showCampaign', label: 'Editorial Campaign Showcase', defaultVal: true },
                                        { key: 'showEditorial', label: 'Trends & Lookbook Gallery', defaultVal: true },
                                        { key: 'showDesigners', label: 'Featured Designers / Ateliers Grid', defaultVal: true },
                                        { key: 'showSpotlight', label: 'New Season Curation Banner', defaultVal: true }
                                    ].map(item => {
                                        const isChecked = cmsForm.sections ? cmsForm.sections[item.key] ?? item.defaultVal : item.defaultVal;
                                        return (
                                            <label key={item.key} className="flex items-center justify-between p-3 border border-gray-100 rounded-sm hover:bg-gray-50 cursor-pointer">
                                                <span className="text-xs font-medium text-gray-800">{item.label}</span>
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={e => {
                                                        setCmsForm({
                                                            ...cmsForm,
                                                            sections: {
                                                                ...(cmsForm.sections || {}),
                                                                [item.key]: e.target.checked
                                                            }
                                                        });
                                                    }}
                                                    className="w-4 h-4 accent-black rounded cursor-pointer"
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Multi-Drop & Countdown Capsule Editor */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'drop' ? null : 'drop')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-luxury-gold" />
                                    <span className="font-bold text-xs uppercase tracking-widest">
                                        The Drop & Countdown Capsules ({activeDrops.length})
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'drop' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'drop' && (
                                <div className="p-6 space-y-6 border-t border-gray-100">
                                    {/* Multi-drop selector tabs & Add button */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {activeDrops.map((d, idx) => (
                                                <button
                                                    key={d.id || idx}
                                                    type="button"
                                                    onClick={() => setSelectedDropIndex(idx)}
                                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 ${
                                                        selectedDropIndex === idx 
                                                            ? 'bg-black text-white shadow-sm' 
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <span>{d.title ? d.title.slice(0, 18) + (d.title.length > 18 ? '...' : '') : `Drop #${idx + 1}`}</span>
                                                    {getDropStatus(d)?.label && (
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddNewDrop}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-luxury-gold hover:text-black text-black text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
                                        >
                                            <Plus size={12} /> Add Drop
                                        </button>
                                    </div>

                                    {/* Drop Editor Notification Banner */}
                                    {dropNotification && (
                                        <div className={`p-3 rounded-sm text-xs font-medium flex items-center justify-between animate-fade-in ${
                                            dropNotification.type === 'success' 
                                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                                                : 'bg-red-50 text-red-900 border border-red-200'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                {dropNotification.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
                                                <span>{dropNotification.message}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setDropNotification(null)}
                                                className="p-1 hover:opacity-75"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {activeDrop ? (
                                        <div className="space-y-4">
                                            {/* Drop Title & Subtitle */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Drop Title</label>
                                                    <input 
                                                        value={activeDrop.title || ''}
                                                        onChange={e => updateSelectedDrop({ ...activeDrop, title: e.target.value })}
                                                        placeholder="e.g. Summer Solstice Capsule"
                                                        className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none font-medium"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Edition Subtitle</label>
                                                    <input 
                                                        value={activeDrop.subtitle || ''}
                                                        onChange={e => updateSelectedDrop({ ...activeDrop, subtitle: e.target.value })}
                                                        placeholder="e.g. Limited Edition • 50 Pieces Worldwide"
                                                        className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Atelier Description</label>
                                                <textarea 
                                                    value={activeDrop.description || ''}
                                                    onChange={e => updateSelectedDrop({ ...activeDrop, description: e.target.value })}
                                                    placeholder="Describe the inspiration, craftsmanship, and exclusivity of this capsule release..."
                                                    rows={3}
                                                    className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                                                />
                                            </div>

                                            {/* Countdown Date Picker & Presets */}
                                            <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-gray-600 uppercase font-bold flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-luxury-gold" />
                                                            Countdown Target Unlock Time
                                                        </label>
                                                        <span className="text-[10px] text-gray-400 block mt-0.5">
                                                            Selected: {activeDrop.countdownDate ? new Date(activeDrop.countdownDate).toLocaleString() : 'Not Set'}
                                                        </span>
                                                    </div>
                                                    <input 
                                                        type="datetime-local"
                                                        value={toLocalDateTimeInput(activeDrop.countdownDate)}
                                                        onChange={e => handleDateChange(e.target.value)}
                                                        className="border border-gray-300 p-2 text-xs font-mono rounded-sm bg-white focus:border-black outline-none"
                                                    />
                                                </div>
                                                
                                                {/* Presets */}
                                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Quick Presets:</span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCountdownPreset(1)}
                                                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-black hover:text-white border border-gray-200 rounded-xs transition-colors"
                                                    >
                                                        +24 Hours
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCountdownPreset(3)}
                                                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-black hover:text-white border border-gray-200 rounded-xs transition-colors"
                                                    >
                                                        +3 Days
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCountdownPreset(7)}
                                                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-black hover:text-white border border-gray-200 rounded-xs transition-colors"
                                                    >
                                                        +7 Days
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCountdownPreset(14)}
                                                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-black hover:text-white border border-gray-200 rounded-xs transition-colors"
                                                    >
                                                        +14 Days
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Drop Background Images */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] text-gray-400 uppercase font-bold">
                                                        Background & Lookbook Imagery ({activeDrop.backgroundImages?.length || 0})
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDropUrlFallback(!showDropUrlFallback)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black"
                                                    >
                                                        {showDropUrlFallback ? 'Hide URL Input' : '+ Paste Image URL'}
                                                    </button>
                                                </div>

                                                {/* File Dropzone */}
                                                <div 
                                                    onDragOver={e => { e.preventDefault(); setIsDragOverDrop(true); }}
                                                    onDragLeave={() => setIsDragOverDrop(false)}
                                                    onDrop={e => {
                                                        e.preventDefault();
                                                        setIsDragOverDrop(false);
                                                        handleDropImagesUpload(e.dataTransfer.files);
                                                    }}
                                                    onClick={() => dropFileInputRef.current?.click()}
                                                    className={`border-2 border-dashed p-4 rounded-sm text-center cursor-pointer transition-all ${
                                                        isDragOverDrop ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400 bg-gray-50/50'
                                                    }`}
                                                >
                                                    <input 
                                                        ref={dropFileInputRef} 
                                                        type="file" 
                                                        multiple 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={e => handleDropImagesUpload(e.target.files)}
                                                    />
                                                    <Upload size={18} className="mx-auto text-gray-400 mb-1" />
                                                    <p className="text-xs font-medium text-gray-700">Drag & drop high-res lookbook photos, or click to browse</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">JPEG / PNG / WebP automatically optimized</p>
                                                </div>

                                                {showDropUrlFallback && (
                                                    <div className="flex gap-2 animate-fade-in">
                                                        <input 
                                                            type="text"
                                                            value={newImageUrl}
                                                            onChange={e => setNewImageUrl(e.target.value)}
                                                            placeholder="https://images.unsplash.com/..."
                                                            className="flex-1 border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-black font-mono"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={handleAddImage}
                                                            disabled={!newImageUrl.trim()}
                                                            className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-sm disabled:opacity-50"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Thumbnails grid */}
                                                {activeDrop.backgroundImages && activeDrop.backgroundImages.length > 0 && (
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                                                        {activeDrop.backgroundImages.map((imgUrl, i) => (
                                                            <div key={i} className="relative group aspect-square rounded-sm overflow-hidden border border-gray-200 bg-gray-100">
                                                                <img src={imgUrl} alt={`Drop Image ${i + 1}`} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => handleRemoveImage(i)}
                                                                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                                        title="Delete image"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tagged Products in this Drop */}
                                            <div className="space-y-2 border-t border-gray-100 pt-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] text-gray-400 uppercase font-bold">
                                                        Exclusive Items In Capsule ({activeDrop.productIds?.length || 0} selected)
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleToggleAllProducts(true)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black"
                                                        >
                                                            Select All
                                                        </button>
                                                        <span className="text-gray-300">•</span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleToggleAllProducts(false)}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black"
                                                        >
                                                            Deselect All
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-sm p-2 bg-gray-50/50">
                                                    {products && products.length > 0 ? (
                                                        products.map(p => {
                                                            const isSelected = activeDrop.productIds?.includes(p.id);
                                                            return (
                                                                <label 
                                                                    key={p.id}
                                                                    className={`flex items-center justify-between p-2 rounded-xs cursor-pointer text-xs transition-colors ${
                                                                        isSelected ? 'bg-white border border-black/20 shadow-xs' : 'hover:bg-white'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={e => {
                                                                                const current = activeDrop.productIds || [];
                                                                                const updated = e.target.checked 
                                                                                    ? [...current, p.id] 
                                                                                    : current.filter(id => id !== p.id);
                                                                                updateSelectedDrop({ ...activeDrop, productIds: updated });
                                                                            }}
                                                                            className="w-3.5 h-3.5 accent-black rounded"
                                                                        />
                                                                        <span className="font-medium text-gray-800">{p.name}</span>
                                                                        <span className="text-gray-400 text-[10px]">({p.designer})</span>
                                                                    </div>
                                                                    <span className="font-mono text-gray-600 text-[11px]">${p.price}</span>
                                                                </label>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-xs text-gray-400 p-2 text-center">No products found in catalog.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Bar for Drop */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteDrop(selectedDropIndex)}
                                                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-bold uppercase tracking-wider"
                                                >
                                                    <Trash2 size={12} /> Delete This Drop
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveDropOnly}
                                                    disabled={isSavingDrop}
                                                    className="px-4 py-2 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black rounded-xs transition-all disabled:opacity-50"
                                                >
                                                    {isSavingDrop ? 'Saving Drop...' : 'Sync This Drop Live'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-xs text-gray-400 mb-3">No drops configured yet.</p>
                                            <button
                                                type="button"
                                                onClick={handleInitializeDrop}
                                                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-luxury-gold hover:text-black transition-colors"
                                            >
                                                Initialize Summer Solstice Drop
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Campaign Carousel & Slides */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'campaign' ? null : 'campaign')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> Campaign Editorial & Slides</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'campaign' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'campaign' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Campaign Title</label>
                                            <input 
                                                value={cmsForm.campaign?.title || ''}
                                                onChange={e => setCmsForm({...cmsForm, campaign: {...(cmsForm.campaign || {}), title: e.target.value}})}
                                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle</label>
                                            <input 
                                                value={cmsForm.campaign?.subtitle || ''}
                                                onChange={e => setCmsForm({...cmsForm, campaign: {...(cmsForm.campaign || {}), subtitle: e.target.value}})}
                                                className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* 4 Feature Quadrant Images */}
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block pt-2">Campaign Quadrant Imagery (1 - 4)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map(num => {
                                            const currentImg = cmsForm.campaign?.[`image${num}`];
                                            return (
                                                <div key={num} className="border border-gray-200 rounded-sm p-3 bg-gray-50/50 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] uppercase font-bold text-gray-600">Slide {num}</span>
                                                        {currentImg && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => setCmsForm({
                                                                    ...cmsForm,
                                                                    campaign: { ...(cmsForm.campaign || {}), [`image${num}`]: '' }
                                                                })}
                                                                className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    {currentImg ? (
                                                        <div className="aspect-square rounded-sm overflow-hidden bg-gray-200">
                                                            <img src={currentImg} alt={`Campaign ${num}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            onClick={() => campaignInputRefs.current[num]?.click()}
                                                            className="aspect-square border border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors"
                                                        >
                                                            <Upload size={16} className="text-gray-400 mb-1" />
                                                            <span className="text-[10px] text-gray-500">Upload Image</span>
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        ref={el => { campaignInputRefs.current[num] = el; }} 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={e => handleCampaignImageUpload(e.target.files?.[0], num)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Additional Campaign Slides Carousel */}
                                    <div className="space-y-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] text-gray-400 uppercase font-bold">
                                                Multi-Slide Lookbook Carousel ({cmsForm.campaign?.images?.length || 0})
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => extraCampaignFileInputRef.current?.click()}
                                                className="text-[10px] font-bold uppercase tracking-wider text-black underline hover:text-luxury-gold"
                                            >
                                                + Upload Slides
                                            </button>
                                        </div>
                                        <input 
                                            ref={extraCampaignFileInputRef}
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            className="hidden"
                                            onChange={e => handleCampaignSlidesUpload(e.target.files)}
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Or paste slide image URL..."
                                                value={newCampaignSlideUrl}
                                                onChange={e => setNewCampaignSlideUrl(e.target.value)}
                                                className="flex-1 text-xs border border-gray-200 px-3 py-1.5 rounded-sm outline-none focus:border-black font-mono"
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleAddCampaignSlide}
                                                disabled={!newCampaignSlideUrl.trim()}
                                                className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase rounded-sm disabled:opacity-40"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        {cmsForm.campaign?.images && cmsForm.campaign.images.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 pt-1">
                                                {cmsForm.campaign.images.map((img: string, idx: number) => (
                                                    <div key={idx} className="relative group aspect-square rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                                                        <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveCampaignSlide(idx)}
                                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Editorial Trends & Lookbook Gallery */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'editorial' ? null : 'editorial')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Editorial Trends & Lookbook Gallery</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'editorial' ? 'rotate-180' : ''}`} />
                            </button>

                            {expandedSection === 'editorial' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        These high-fashion editorial runway lookbook images appear in the Trends & Editorial showcase on the landing page.
                                    </p>

                                    <div 
                                        onClick={() => editorialFileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 hover:border-black p-4 rounded-sm text-center cursor-pointer transition-colors bg-gray-50/50"
                                    >
                                        <input 
                                            ref={editorialFileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => handleEditorialUpload(e.target.files)}
                                        />
                                        <Upload size={18} className="mx-auto text-gray-400 mb-1" />
                                        <span className="text-xs font-medium text-gray-700">Upload Editorial Lookbook Photos</span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">Auto-compressed for ultra-fast landing page loading</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={newEditorialUrl}
                                            onChange={e => setNewEditorialUrl(e.target.value)}
                                            placeholder="Or paste direct image URL..."
                                            className="flex-1 text-xs border border-gray-200 px-3 py-1.5 rounded-sm outline-none focus:border-black font-mono"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleAddEditorialUrl}
                                            disabled={!newEditorialUrl.trim()}
                                            className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase rounded-sm disabled:opacity-40"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {cmsForm.editorialImages && cmsForm.editorialImages.length > 0 && (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                                            {cmsForm.editorialImages.map((img: string, i: number) => (
                                                <div key={i} className="relative group aspect-square rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={img} alt={`Editorial ${i + 1}`} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveEditorialImage(i)}
                                                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* About / Maison Story & Philosophy */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} /> Maison Heritage & Philosophy</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
                            </button>

                            {expandedSection === 'about' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Philosophy Title</label>
                                        <input 
                                            value={cmsForm.about?.philosophy?.title || ''}
                                            onChange={e => setCmsForm({
                                                ...cmsForm,
                                                about: {
                                                    ...(cmsForm.about || {}),
                                                    philosophy: { ...(cmsForm.about?.philosophy || {}), title: e.target.value }
                                                }
                                            })}
                                            className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Philosophy Description 1</label>
                                        <textarea 
                                            value={cmsForm.about?.philosophy?.description1 || ''}
                                            onChange={e => setCmsForm({
                                                ...cmsForm,
                                                about: {
                                                    ...(cmsForm.about || {}),
                                                    philosophy: { ...(cmsForm.about?.philosophy || {}), description1: e.target.value }
                                                }
                                            })}
                                            rows={3}
                                            className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Philosophy Description 2</label>
                                        <textarea 
                                            value={cmsForm.about?.philosophy?.description2 || ''}
                                            onChange={e => setCmsForm({
                                                ...cmsForm,
                                                about: {
                                                    ...(cmsForm.about || {}),
                                                    philosophy: { ...(cmsForm.about?.philosophy || {}), description2: e.target.value }
                                                }
                                            })}
                                            rows={3}
                                            className="w-full border border-gray-200 p-2.5 text-xs focus:border-black outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
