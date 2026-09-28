import React, { useState, useRef, useMemo } from 'react';
import { 
    Menu, Palette, ChevronDown, Video, Type, Sparkles, Image as ImageIcon, 
    FileText, DollarSign, Plus, Trash2, ExternalLink, Calendar, RefreshCw, 
    Check, CheckCircle2, AlertCircle, Eye, Clock, Layers, Upload, X
} from 'lucide-react';
import { Product, DropPageContent } from '../../types.ts';

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

interface StoreDesignViewProps {
    cmsForm: any;
    setCmsForm: (form: any) => void;
    handleCMSUpdate: (customForm?: any) => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
    products: Product[];
    onNavigate?: (view: any) => void;
}

export const StoreDesignView: React.FC<StoreDesignViewProps> = ({
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

    // Date input safety helpers to prevent timezone jumping & invalid date crashes
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

        const updatedDrops = [...activeDrops, newDrop];
        setCmsForm({
            ...cmsForm,
            drop: updatedDrops[0],
            drops: updatedDrops
        });
        setSelectedDropIndex(updatedDrops.length - 1);
        setDropNotification({
            type: 'success',
            message: `Created Drop #${nextNum}. Edit details below.`
        });
    };

    const handleSaveDropOnly = async () => {
        setIsSavingDrop(true);
        try {
            await handleCMSUpdate(cmsForm);
            setDropNotification({
                type: 'success',
                message: `All ${activeDrops.length} Drop(s) saved and published to storefront successfully!`
            });
        } catch (err: any) {
            setDropNotification({
                type: 'error',
                message: 'Failed to save drops: ' + (err.message || 'Error occurred')
            });
        } finally {
            setIsSavingDrop(false);
            setTimeout(() => setDropNotification(null), 4000);
        }
    };

    const handleRemoveCurrentDrop = async (indexToDelete: number) => {
        if (!window.confirm("Are you sure you want to delete this Drop?")) return;
        
        setIsSavingDrop(true);
        const currentDrops = [...activeDrops];
        
        if (currentDrops.length <= 1) {
            const updated = { ...cmsForm };
            delete updated.drop;
            delete updated.drops;
            setCmsForm(updated);
            setSelectedDropIndex(0);
        } else {
            currentDrops.splice(indexToDelete, 1);
            const updatedCms = {
                ...cmsForm,
                drop: currentDrops[0],
                drops: currentDrops
            };
            setCmsForm(updatedCms);
            setSelectedDropIndex(Math.max(0, indexToDelete - 1));
        }

        try {
            await handleCMSUpdate(cmsForm);
            setDropNotification({
                type: 'success',
                message: 'Drop removed successfully.'
            });
        } catch (e: any) {
            setDropNotification({
                type: 'error',
                message: 'Error removing drop: ' + e.message
            });
        } finally {
            setIsSavingDrop(false);
            setTimeout(() => setDropNotification(null), 4000);
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
                    const url = await processImageFile(file);
                    uploadedUrls.push(url);
                } catch (err) {
                    console.warn('Error processing image:', err);
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
                    message: `Uploaded ${uploadedUrls.length} image(s) to ${activeDrop.title || 'Drop'}.`
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

    const handleExtraCampaignUpload = async (files: FileList | null) => {
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
                    <h2 className="text-2xl sm:text-3xl font-serif italic text-luxury-black">Landing Page CMS & Store Design</h2>
                    <p className="text-xs text-gray-500 mt-1">Live visual editor for hero banners, editorial trends, drops, and marketing copy.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {onNavigate && (
                        <button 
                            type="button"
                            onClick={() => onNavigate('LANDING')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors rounded-xs"
                            title="Open storefront to verify changes live"
                        >
                            <Eye size={14} /> Preview Storefront
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
                                <span>Save All Changes</span>
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
                        {/* Theme Settings */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'theme' ? null : 'theme')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Palette size={14} /> Theme Settings</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'theme' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'theme' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Primary Color</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="color"
                                                    value={cmsForm.theme?.primaryColor || '#000000'}
                                                    onChange={e => setCmsForm({...cmsForm, theme: {...(cmsForm.theme || {}), primaryColor: e.target.value} as any})}
                                                    className="w-8 h-8 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
                                                />
                                                <input 
                                                    value={cmsForm.theme?.primaryColor || '#000000'}
                                                    onChange={e => setCmsForm({...cmsForm, theme: {...(cmsForm.theme || {}), primaryColor: e.target.value} as any})}
                                                    className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Accent Color</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="color"
                                                    value={cmsForm.theme?.accentColor || '#D4AF37'}
                                                    onChange={e => setCmsForm({...cmsForm, theme: {...(cmsForm.theme || {}), accentColor: e.target.value} as any})}
                                                    className="w-8 h-8 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
                                                />
                                                <input 
                                                    value={cmsForm.theme?.accentColor || '#D4AF37'}
                                                    onChange={e => setCmsForm({...cmsForm, theme: {...(cmsForm.theme || {}), accentColor: e.target.value} as any})}
                                                    className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Font Family</label>
                                            <select 
                                                value={cmsForm.theme?.fontFamily || 'Serif'}
                                                onChange={e => setCmsForm({...cmsForm, theme: {...(cmsForm.theme || {}), fontFamily: e.target.value as any} as any})}
                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                            >
                                                <option value="Serif">Serif (Editorial)</option>
                                                <option value="Sans">Sans (Modern)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Border Radius</label>
                                            <select 
                                                value={cmsForm.theme?.borderRadius || 'sm'}
                                                onChange={e => setCmsForm({...cmsForm, theme: {...(cmsForm.theme || {}), borderRadius: e.target.value as any} as any})}
                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                            >
                                                <option value="none">None (Sharp)</option>
                                                <option value="sm">Small (Subtle)</option>
                                                <option value="md">Medium (Friendly)</option>
                                                <option value="full">Full (Pill)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

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
                                                                onClick={() => setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), posterUrl: ''}})}
                                                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                                title="Remove poster"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => heroPosterInputRef.current?.click()}
                                                            className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-black rounded-sm text-gray-500 hover:text-black transition-colors flex flex-col items-center justify-center gap-1 bg-gray-50 hover:bg-white"
                                                        >
                                                            <Upload size={16} className="text-gray-400" />
                                                            <span className="text-xs font-bold uppercase tracking-wider">Upload Poster Image</span>
                                                            <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
                                                        </button>
                                                        <div className="flex gap-1.5">
                                                            <input 
                                                                type="url"
                                                                value={heroPosterUrlInput}
                                                                onChange={e => setHeroPosterUrlInput(e.target.value)}
                                                                placeholder="Or paste image URL"
                                                                className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none bg-white"
                                                            />
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    if (heroPosterUrlInput.trim()) {
                                                                        setCmsForm({...cmsForm, hero: {...(cmsForm.hero || {}), posterUrl: heroPosterUrlInput.trim()}});
                                                                        setHeroPosterUrlInput('');
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-luxury-gold transition-colors"
                                                            >
                                                                Set
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    ref={heroPosterInputRef} 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    onChange={e => handleHeroPosterUpload(e.target.files?.[0])}
                                                />
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

                        {/* Sections */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'sections' ? null : 'sections')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Type size={14} /> Headings & Sections</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'sections' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'sections' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Running Marquee Text</label>
                                        <textarea 
                                            value={cmsForm.marquee?.text || ''}
                                            onChange={e => setCmsForm({...cmsForm, marquee: { text: e.target.value }})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white min-h-[80px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Designers Subtitle</label>
                                            <input 
                                                value={cmsForm.designers?.subtitle || ''}
                                                onChange={e => setCmsForm({...cmsForm, designers: { ...(cmsForm.designers || {}), subtitle: e.target.value }})}
                                                placeholder="The Ateliers"
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Designers Section Title</label>
                                            <input 
                                                value={cmsForm.designers?.title || ''}
                                                onChange={e => setCmsForm({...cmsForm, designers: { ...(cmsForm.designers || {}), title: e.target.value }})}
                                                placeholder="Shop by Designer"
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Spotlight / Editor's Pick Title</label>
                                        <input 
                                            value={cmsForm.spotlight?.title || ''}
                                            onChange={e => setCmsForm({...cmsForm, spotlight: { title: e.target.value }})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* The Drops Manager (Multi-Drop) */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'drop' ? null : 'drop')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-luxury-gold" /> Storefront Drops ({activeDrops.length})</span>
                                    {getDropStatus(activeDrop) && (
                                        <span className={`text-[9px] px-2.5 py-0.5 uppercase tracking-wider font-bold rounded-full border ${getDropStatus(activeDrop)?.color}`}>
                                            {getDropStatus(activeDrop)?.label}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'drop' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'drop' && (
                                <div className="border-t border-gray-100">
                                    {dropNotification && (
                                        <div className={`p-4 mx-6 mt-6 text-xs flex items-center justify-between gap-2 rounded-sm ${
                                            dropNotification.type === 'success' 
                                                ? 'bg-green-50 text-green-800 border border-green-200' 
                                                : 'bg-red-50 text-red-800 border border-red-200'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                {dropNotification.type === 'success' ? <Check size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-red-600" />}
                                                <span>{dropNotification.message}</span>
                                            </div>
                                            <button onClick={() => setDropNotification(null)} className="text-gray-400 hover:text-black">
                                                &times;
                                            </button>
                                        </div>
                                    )}

                                    {/* Multi-Drop Navigation Tabs */}
                                    <div className="p-6 pb-0">
                                        <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto">
                                            <div className="flex items-center gap-2 min-w-max">
                                                {activeDrops.map((drop, idx) => (
                                                    <button
                                                        key={drop.id || idx}
                                                        type="button"
                                                        onClick={() => setSelectedDropIndex(idx)}
                                                        className={`px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                                                            selectedDropIndex === idx
                                                                ? 'bg-black text-white shadow-sm'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <span>Drop #{idx + 1}</span>
                                                        <span className="text-[10px] opacity-75 font-serif italic truncate max-w-[100px]">{drop.title || 'Untitled'}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleAddNewDrop}
                                                className="px-3.5 py-2 bg-luxury-gold hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                                            >
                                                <Plus size={14} /> Add New Drop
                                            </button>
                                        </div>
                                    </div>

                                    {activeDrop ? (
                                        <div className="p-6 pt-0 space-y-6">
                                            {/* Action Bar inside Drop */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-sm border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                                        Editing Drop #{selectedDropIndex + 1}: {activeDrop.title}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {onNavigate && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => onNavigate('THE_DROP')}
                                                            className="px-3 py-1.5 bg-white border border-gray-200 hover:border-black text-[10px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 transition-colors"
                                                            title="View Live Drop Page"
                                                        >
                                                            <Eye size={12} /> Preview Live
                                                        </button>
                                                    )}
                                                    <button 
                                                        type="button"
                                                        onClick={handleSaveDropOnly}
                                                        disabled={isSavingDrop}
                                                        className="px-4 py-1.5 bg-black hover:bg-luxury-gold text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                                    >
                                                        {isSavingDrop ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                                                        Publish All Drops
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveCurrentDrop(selectedDropIndex)}
                                                        disabled={isSavingDrop}
                                                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                                                        title="Delete Selected Drop"
                                                    >
                                                        <Trash2 size={12} /> Delete Drop
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Drop Title</label>
                                                <input 
                                                    value={activeDrop.title || ''}
                                                    onChange={e => updateSelectedDrop({ ...activeDrop, title: e.target.value })}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                                    placeholder="e.g. Summer Solstice Capsule"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle / Edition Badge</label>
                                                <input 
                                                    value={activeDrop.subtitle || ''}
                                                    onChange={e => updateSelectedDrop({ ...activeDrop, subtitle: e.target.value })}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                                    placeholder="e.g. Limited Edition • 50 Pieces Worldwide"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Editorial Narrative / Description</label>
                                                <textarea 
                                                    value={activeDrop.description || ''}
                                                    onChange={e => updateSelectedDrop({ ...activeDrop, description: e.target.value })}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white h-24"
                                                    placeholder="Describe the inspiration, craftsmanship, and exclusivity of this drop..."
                                                />
                                            </div>

                                            {/* Countdown Schedule */}
                                            <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1.5">
                                                        <Clock size={13} className="text-luxury-gold" /> Countdown Target Date
                                                    </label>
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        {activeDrop.countdownDate ? new Date(activeDrop.countdownDate).toUTCString() : 'Not Set'}
                                                    </span>
                                                </div>
                                                <input 
                                                    type="datetime-local"
                                                    value={toLocalDateTimeInput(activeDrop.countdownDate)}
                                                    onChange={e => handleDateChange(e.target.value)}
                                                    className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-white font-mono"
                                                />
                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mr-1">Quick Presets:</span>
                                                    {[
                                                        { label: '+24 Hours', days: 1 },
                                                        { label: '+3 Days', days: 3 },
                                                        { label: '+7 Days', days: 7 },
                                                        { label: '+14 Days', days: 14 },
                                                        { label: '+30 Days', days: 30 },
                                                    ].map(preset => (
                                                        <button
                                                            key={preset.days}
                                                            type="button"
                                                            onClick={() => setCountdownPreset(preset.days)}
                                                            className="px-2.5 py-1 bg-white border border-gray-200 hover:border-black text-[10px] font-semibold rounded-sm transition-colors text-gray-600 hover:text-black"
                                                        >
                                                            {preset.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Background Images Upload */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] text-gray-400 uppercase font-bold block">Editorial Background Images (Slideshow)</label>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowDropUrlFallback(!showDropUrlFallback)}
                                                        className="text-[10px] text-gray-400 hover:text-black underline font-mono"
                                                    >
                                                        {showDropUrlFallback ? 'Hide URL Input' : 'Or Paste Image URL'}
                                                    </button>
                                                </div>

                                                {/* Drag & Drop Zone + Upload Button */}
                                                <div 
                                                    onDragOver={e => { e.preventDefault(); setIsDragOverDrop(true); }}
                                                    onDragLeave={() => setIsDragOverDrop(false)}
                                                    onDrop={e => {
                                                        e.preventDefault();
                                                        setIsDragOverDrop(false);
                                                        handleDropImagesUpload(e.dataTransfer.files);
                                                    }}
                                                    className={`border-2 border-dashed rounded-sm p-5 text-center transition-all ${
                                                        isDragOverDrop 
                                                            ? 'border-black bg-gray-100 scale-[1.01]' 
                                                            : 'border-gray-200 hover:border-gray-400 bg-gray-50/70 hover:bg-white'
                                                    }`}
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-600">
                                                            {isUploadingDropImages ? (
                                                                <RefreshCw size={18} className="animate-spin text-black" />
                                                            ) : (
                                                                <Upload size={18} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-800">
                                                                {isUploadingDropImages ? 'Processing & Optimizing Images...' : 'Upload Drop Photos'}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                                Drag and drop photos here or click below to select multiple files
                                                            </p>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            disabled={isUploadingDropImages}
                                                            onClick={() => dropFileInputRef.current?.click()}
                                                            className="mt-1 px-5 py-2.5 bg-black hover:bg-luxury-gold text-white text-xs font-bold uppercase tracking-widest rounded-xs transition-colors shadow-xs inline-flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <Upload size={14} />
                                                            Upload Images
                                                        </button>
                                                        <input 
                                                            type="file"
                                                            ref={dropFileInputRef}
                                                            accept="image/*"
                                                            multiple
                                                            className="hidden"
                                                            onChange={e => handleDropImagesUpload(e.target.files)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Visual Gallery Thumbnails */}
                                                {activeDrop.backgroundImages && activeDrop.backgroundImages.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Slideshow Gallery ({activeDrop.backgroundImages.length})</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {activeDrop.backgroundImages.map((imgUrl: string, idx: number) => (
                                                                <div key={idx} className="relative group rounded-sm overflow-hidden border border-gray-200 aspect-video bg-gray-100 shadow-xs">
                                                                    <img 
                                                                        src={imgUrl} 
                                                                        alt={`Drop asset ${idx + 1}`} 
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveImage(idx)}
                                                                            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                                                                            title="Remove image"
                                                                        >
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </div>
                                                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-mono rounded">
                                                                        #{idx + 1}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Optional URL Fallback */}
                                                {showDropUrlFallback && (
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm space-y-2 animate-fadeIn">
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold block">Add Image by Web Link</label>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="url"
                                                                value={newImageUrl}
                                                                onChange={e => setNewImageUrl(e.target.value)}
                                                                placeholder="Paste direct URL (https://...)"
                                                                className="flex-1 border border-gray-200 px-3 py-2 text-xs focus:border-black outline-none bg-white font-mono"
                                                            />
                                                            <button 
                                                                type="button"
                                                                onClick={handleAddImage}
                                                                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Products Assigned */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[10px] text-gray-400 uppercase font-bold">Capsule Products</label>
                                                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded-full">
                                                            {activeDrop.productIds?.length || 0} / {products.length}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateSelectedDrop({ ...activeDrop, productIds: products.map(p => p.id) })}
                                                            className="text-[10px] font-bold text-luxury-gold hover:underline uppercase tracking-wider"
                                                        >
                                                            Select All
                                                        </button>
                                                        <span className="text-gray-300">|</span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateSelectedDrop({ ...activeDrop, productIds: [] })}
                                                            className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-wider"
                                                        >
                                                            Clear All
                                                        </button>
                                                    </div>
                                                </div>

                                                {products.length === 0 ? (
                                                    <p className="text-xs text-gray-400 py-3 italic">No products available in inventory yet.</p>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                                                        {products.map(product => {
                                                            const isChecked = activeDrop.productIds?.includes(product.id) || false;
                                                            return (
                                                                <label 
                                                                    key={product.id} 
                                                                    className={`flex items-center gap-3 p-2.5 border rounded-sm cursor-pointer transition-all ${
                                                                        isChecked 
                                                                            ? 'border-black bg-gray-50/80 shadow-xs' 
                                                                            : 'border-gray-100 hover:border-gray-200 bg-white'
                                                                    }`}
                                                                >
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={e => {
                                                                            const currentProductIds = activeDrop.productIds || [];
                                                                            const newProductIds = e.target.checked 
                                                                                ? [...currentProductIds, product.id]
                                                                                : currentProductIds.filter((id: string) => id !== product.id);
                                                                            updateSelectedDrop({ ...activeDrop, productIds: newProductIds });
                                                                        }}
                                                                        className="accent-black w-4 h-4"
                                                                    />
                                                                    {product.images && product.images[0] && (
                                                                        <img 
                                                                            src={product.images[0]} 
                                                                            alt={product.name} 
                                                                            className="w-9 h-9 object-cover rounded-xs border border-gray-100" 
                                                                        />
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                                                                        <p className="text-[10px] text-gray-400 font-mono">${product.price}</p>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom Save Shortcut */}
                                            <div className="pt-2 border-t border-gray-100 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveDropOnly}
                                                    disabled={isSavingDrop}
                                                    className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-luxury-gold text-white text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                                >
                                                    {isSavingDrop ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                    Publish All Drops
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center space-y-4">
                                            <div className="w-14 h-14 bg-amber-50 border border-amber-200/60 rounded-full flex items-center justify-center mx-auto text-luxury-gold shadow-xs">
                                                <Sparkles size={24} />
                                            </div>
                                            <div className="max-w-md mx-auto">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1">
                                                    Timed Capsule & Drop System
                                                </h4>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    Create multiple exclusive capsule releases with live countdowns, background slideshow galleries, limited edition inventory locks, and VIP email waitlists.
                                                </p>
                                            </div>
                                            <div className="pt-2">
                                                <button 
                                                    id="initialize-drop-btn"
                                                    type="button"
                                                    disabled={isSavingDrop}
                                                    onClick={handleInitializeDrop}
                                                    className="px-8 py-4 bg-black text-white hover:bg-luxury-gold rounded-sm text-xs font-bold uppercase tracking-[0.25em] transition-all inline-flex items-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
                                                >
                                                    {isSavingDrop ? (
                                                        <>
                                                            <RefreshCw size={16} className="animate-spin" />
                                                            Initializing & Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus size={16} />
                                                            Initialize First Drop
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Campaign */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'campaign' ? null : 'campaign')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Campaign Showcase</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'campaign' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'campaign' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Campaign Subtitle</label>
                                            <input 
                                                value={cmsForm.campaign?.subtitle || ''}
                                                onChange={e => setCmsForm({...cmsForm, campaign: {...(cmsForm.campaign || {}), subtitle: e.target.value}})}
                                                placeholder="The Campaign"
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Campaign Title</label>
                                            <input 
                                                value={cmsForm.campaign?.title || ''}
                                                onChange={e => setCmsForm({...cmsForm, campaign: {...(cmsForm.campaign || {}), title: e.target.value}})}
                                                placeholder="Urban Chronicles"
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Overlay Badge Text</label>
                                        <input 
                                            value={cmsForm.campaign?.overlayText1 || ''}
                                            onChange={e => setCmsForm({...cmsForm, campaign: {...(cmsForm.campaign || {}), overlayText1: e.target.value}})}
                                            placeholder="Street Edition"
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>

                                    {/* 4 Featured Campaign Images */}
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-3">Featured Campaign Photos (Up to 4)</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[1, 2, 3, 4].map(num => {
                                                // @ts-ignore
                                                const imgVal = cmsForm.campaign?.[`image${num}`] || '';
                                                return (
                                                    <div key={num} className="p-3 border border-gray-200 rounded-sm bg-gray-50/50 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] text-gray-600 uppercase font-bold">Campaign Photo {num}</label>
                                                            {imgVal && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setCmsForm({
                                                                        ...cmsForm, 
                                                                        campaign: { ...(cmsForm.campaign || {}), [`image${num}`]: '' }
                                                                    })}
                                                                    className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase tracking-wider"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>

                                                        {imgVal ? (
                                                            <div className="relative group rounded-sm overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                                                                <img 
                                                                    src={imgVal} 
                                                                    alt={`Campaign ${num}`} 
                                                                    className="w-full h-full object-cover" 
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => campaignInputRefs.current[num]?.click()}
                                                                        className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 hover:bg-luxury-gold hover:text-black transition-colors"
                                                                    >
                                                                        <Upload size={12} /> Replace
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => campaignInputRefs.current[num]?.click()}
                                                                    className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-black rounded-sm text-gray-500 hover:text-black transition-colors flex flex-col items-center justify-center gap-1 bg-white"
                                                                >
                                                                    <Upload size={16} className="text-gray-400" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload Photo {num}</span>
                                                                </button>
                                                                <div className="flex gap-1">
                                                                    <input 
                                                                        type="url"
                                                                        placeholder="Or paste image URL"
                                                                        onKeyDown={e => {
                                                                            if (e.key === 'Enter') {
                                                                                const val = (e.target as HTMLInputElement).value.trim();
                                                                                if (val) {
                                                                                    setCmsForm({
                                                                                        ...cmsForm,
                                                                                        campaign: { ...(cmsForm.campaign || {}), [`image${num}`]: val }
                                                                                    });
                                                                                }
                                                                            }
                                                                        }}
                                                                        onBlur={e => {
                                                                            const val = e.target.value.trim();
                                                                            if (val) {
                                                                                setCmsForm({
                                                                                    ...cmsForm,
                                                                                    campaign: { ...(cmsForm.campaign || {}), [`image${num}`]: val }
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="flex-1 border border-gray-200 p-1.5 text-xs focus:border-black outline-none bg-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <input 
                                                            type="file"
                                                            ref={el => { campaignInputRefs.current[num] = el; }}
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={e => handleCampaignImageUpload(e.target.files?.[0], num)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Additional Campaign Slideshow Images */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-black">Additional Slideshow Photos</h4>
                                                <p className="text-[10px] text-gray-500">Add more photos to the animated campaign banner on the landing page.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => extraCampaignFileInputRef.current?.click()}
                                                disabled={isUploadingCampaignSlide}
                                                className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors rounded-xs flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Upload size={12} /> Upload Slides
                                            </button>
                                        </div>

                                        <input 
                                            type="file"
                                            ref={extraCampaignFileInputRef}
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={e => handleExtraCampaignUpload(e.target.files)}
                                        />

                                        <div className="flex gap-2 mb-3">
                                            <input 
                                                type="url"
                                                value={newCampaignSlideUrl}
                                                onChange={e => setNewCampaignSlideUrl(e.target.value)}
                                                placeholder="Or paste slide image URL (https://...)"
                                                className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none bg-white"
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleAddCampaignSlide}
                                                className="px-4 py-2 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors"
                                            >
                                                Add Slide
                                            </button>
                                        </div>

                                        {Array.isArray(cmsForm.campaign?.images) && cmsForm.campaign.images.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                                {cmsForm.campaign.images.map((slideUrl: string, idx: number) => (
                                                    <div key={idx} className="relative group aspect-video rounded-xs overflow-hidden border border-gray-200 bg-gray-100">
                                                        <img src={slideUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveCampaignSlide(idx)}
                                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                            title="Remove slide"
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

                        {/* Editorial Fashion Trend Showcase */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'editorial' ? null : 'editorial')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Editorial Trends Grid</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'editorial' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'editorial' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-black">Landing Page Editorial Showcase</h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5">These high-resolution photos populate the stylish 2-column fashion lookbook grid on the storefront.</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input 
                                            type="url"
                                            value={newEditorialUrl}
                                            onChange={e => setNewEditorialUrl(e.target.value)}
                                            placeholder="Paste editorial image URL (https://...)"
                                            className="flex-1 border border-gray-200 p-2 text-xs focus:border-black outline-none bg-white"
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={handleAddEditorialUrl}
                                                className="px-4 py-2 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors whitespace-nowrap"
                                            >
                                                Add URL
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => editorialFileInputRef.current?.click()}
                                                disabled={isUploadingEditorial}
                                                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Upload size={12} />
                                                <span>{isUploadingEditorial ? 'Uploading...' : 'Upload Photos'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <input 
                                        type="file"
                                        ref={editorialFileInputRef}
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={e => handleEditorialUpload(e.target.files)}
                                    />

                                    {Array.isArray(cmsForm.editorialImages) && cmsForm.editorialImages.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                            {cmsForm.editorialImages.map((imgUrl: string, idx: number) => (
                                                <div key={idx} className="relative group aspect-3/4 rounded-xs overflow-hidden border border-gray-200 bg-gray-100 shadow-xs">
                                                    <img src={imgUrl} alt={`Editorial ${idx + 1}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveEditorialImage(idx)}
                                                            className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 hover:bg-red-700 transition-colors shadow-md"
                                                        >
                                                            <Trash2 size={12} /> Remove
                                                        </button>
                                                    </div>
                                                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-xs font-mono">
                                                        #{idx + 1}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 border-2 border-dashed border-gray-200 text-center rounded-sm text-gray-400 text-xs">
                                            No custom editorial images uploaded yet. The landing page is displaying curated default fashion looks.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* About Page */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> About & Contact</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'about' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Philosophy Text 1</label>
                                        <textarea 
                                            value={cmsForm.about?.philosophy?.description1 || ''}
                                            onChange={e => setCmsForm({...cmsForm, about: {...(cmsForm.about || {}), philosophy: {...(cmsForm.about?.philosophy || {}), description1: e.target.value}}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-32 transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Email</label>
                                            <input 
                                                value={cmsForm.about?.contact?.email || ''}
                                                onChange={e => setCmsForm({...cmsForm, about: {...(cmsForm.about || {}), contact: {...(cmsForm.about?.contact || {}), email: e.target.value}}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Phone</label>
                                            <input 
                                                value={cmsForm.about?.contact?.phone || ''}
                                                onChange={e => setCmsForm({...cmsForm, about: {...(cmsForm.about || {}), contact: {...(cmsForm.about?.contact || {}), phone: e.target.value}}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pricing Page */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'pricing' ? null : 'pricing')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} /> Pricing Page</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'pricing' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'pricing' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    {/* Global Free Subscriptions Toggle */}
                                    <div className="bg-luxury-gold/10 border border-luxury-gold/30 p-4 rounded-sm flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-xs uppercase tracking-wide text-gray-900">Global Free Subscriptions Mode</h4>
                                            <p className="text-[11px] text-gray-600 mt-0.5">Toggle ON to make all vendor membership plans 100% FREE ($0).</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentIsFree = cmsForm.pricing?.isFreeMode || false;
                                                setCmsForm({
                                                    ...cmsForm,
                                                    pricing: { ...(cmsForm.pricing || { title: '', subtitle: '', description: '', plans: [] }), isFreeMode: !currentIsFree },
                                                    subscriptionSettings: { ...(cmsForm.subscriptionSettings || {}), isFreeMode: !currentIsFree }
                                                });
                                            }}
                                            className={`px-4 py-2 rounded-xs text-[10px] font-bold uppercase tracking-widest transition-colors ${cmsForm.pricing?.isFreeMode ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                        >
                                            {cmsForm.pricing?.isFreeMode ? 'Free Subscriptions: ON' : 'Free Subscriptions: OFF'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title</label>
                                            <input 
                                                value={cmsForm.pricing?.title || ''}
                                                onChange={e => setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), title: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle</label>
                                            <input 
                                                value={cmsForm.pricing?.subtitle || ''}
                                                onChange={e => setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), subtitle: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Description</label>
                                        <textarea 
                                            value={cmsForm.pricing?.description || ''}
                                            onChange={e => setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), description: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-24 transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Plans & Tier Pricing</h4>
                                        <div className="space-y-6">
                                            {(cmsForm.pricing?.plans || []).map((plan: any, index: number) => (
                                                <div key={index} className="border border-gray-200 p-4 rounded-sm bg-gray-50 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Plan Name</label>
                                                            <input 
                                                                value={plan.name || ''}
                                                                onChange={e => {
                                                                    const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                    newPlans[index] = {...newPlans[index], name: e.target.value};
                                                                    setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Price Label (e.g. $99 or Free)</label>
                                                            <input 
                                                                value={plan.price || ''}
                                                                onChange={e => {
                                                                    const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                    newPlans[index] = {...newPlans[index], price: e.target.value};
                                                                    setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-white p-3 border border-gray-200 rounded-xs">
                                                        <input
                                                            type="checkbox"
                                                            id={`cms-free-${index}`}
                                                            checked={plan.isFree || cmsForm.pricing?.isFreeMode || false}
                                                            onChange={e => {
                                                                const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                newPlans[index] = {
                                                                    ...newPlans[index], 
                                                                    isFree: e.target.checked,
                                                                    price: e.target.checked ? '$0' : newPlans[index].price
                                                                };
                                                                setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                            }}
                                                            className="accent-luxury-gold"
                                                        />
                                                        <label htmlFor={`cms-free-${index}`} className="text-xs font-bold text-gray-700">
                                                            Mark this subscription plan as FREE ($0)
                                                        </label>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Description</label>
                                                        <input 
                                                            value={plan.description || ''}
                                                            onChange={e => {
                                                                const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                newPlans[index] = {...newPlans[index], description: e.target.value};
                                                                setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                            }}
                                                            className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white mb-2"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Period</label>
                                                            <input 
                                                                value={plan.period || ''}
                                                                onChange={e => {
                                                                    const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                    newPlans[index] = {...newPlans[index], period: e.target.value};
                                                                    setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">CTA Text</label>
                                                            <input 
                                                                value={plan.cta || ''}
                                                                onChange={e => {
                                                                    const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                    newPlans[index] = {...newPlans[index], cta: e.target.value};
                                                                    setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mb-4 flex items-center gap-2">
                                                        <input 
                                                            type="checkbox"
                                                            checked={plan.highlight || false}
                                                            onChange={e => {
                                                                const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                newPlans[index] = {...newPlans[index], highlight: e.target.checked};
                                                                setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                            }}
                                                            className="accent-black"
                                                        />
                                                        <label className="text-[10px] text-gray-400 uppercase font-bold block">Highlight Plan (Best Value)</label>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Features (comma separated)</label>
                                                        <textarea 
                                                            value={(plan.features || []).join(', ')}
                                                            onChange={e => {
                                                                const newPlans = [...(cmsForm.pricing?.plans || [])];
                                                                newPlans[index] = {...newPlans[index], features: e.target.value.split(',').map((f: string) => f.trim()).filter((f: string) => f)};
                                                                setCmsForm({...cmsForm, pricing: {...(cmsForm.pricing || {}), plans: newPlans}});
                                                            }}
                                                            className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white h-20"
                                                            placeholder="Feature 1, Feature 2, Feature 3"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-sm shadow-xs">
                <div className="text-xs text-gray-500">
                    {saveStatus?.type === 'success' ? (
                        <span className="text-green-600 font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Changes successfully published to storefront!
                        </span>
                    ) : saveStatus?.type === 'error' ? (
                        <span className="text-red-600 font-bold flex items-center gap-1.5">
                            <AlertCircle size={14} /> Error saving changes. Please retry.
                        </span>
                    ) : (
                        <span>Edits made here update the storefront immediately upon saving.</span>
                    )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                        type="button"
                        onClick={onSaveAll}
                        disabled={isSavingAll}
                        className="flex-1 sm:flex-initial bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-black transition-colors rounded-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {isSavingAll ? (
                            <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Publishing...</span>
                            </>
                        ) : (
                            <>
                                <Check size={14} />
                                <span>Save All Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
