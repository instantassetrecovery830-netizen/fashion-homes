import React, { useState } from 'react';
import { Menu, Palette, ChevronDown, Video, Type, Sparkles, Image as ImageIcon, FileText, DollarSign } from 'lucide-react';
import { Product } from '../../types.ts';

interface StoreDesignViewProps {
    cmsForm: any;
    setCmsForm: (form: any) => void;
    handleCMSUpdate: () => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
    products: Product[];
}

export const StoreDesignView: React.FC<StoreDesignViewProps> = ({
    cmsForm,
    setCmsForm,
    handleCMSUpdate,
    setIsSidebarOpen,
    products
}) => {
    const [expandedSection, setExpandedSection] = useState<string | null>('theme');

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">Store Design</h2>
                <div className="flex gap-4">
                    <button 
                        onClick={handleCMSUpdate}
                        className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors hidden md:block"
                    >
                        Save All Changes
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>
            
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
                                            value={cmsForm.hero.titleLine1}
                                            onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine1: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title Line 2 (Italic)</label>
                                        <input 
                                            value={cmsForm.hero.titleLine2}
                                            onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, titleLine2: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle</label>
                                        <input 
                                            value={cmsForm.hero.subtitle}
                                            onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, subtitle: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Video URL</label>
                                            <input 
                                                value={cmsForm.hero.videoUrl}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, videoUrl: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Poster URL</label>
                                            <input 
                                                value={cmsForm.hero.posterUrl}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, posterUrl: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Button Text</label>
                                            <input 
                                                value={cmsForm.hero.buttonText}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, buttonText: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Secondary Button Text</label>
                                            <input 
                                                value={cmsForm.hero.secondaryButtonText || ''}
                                                onChange={e => setCmsForm({...cmsForm, hero: {...cmsForm.hero, secondaryButtonText: e.target.value}})}
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
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Type size={14} /> Sections</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'sections' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'sections' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Marquee Text</label>
                                        <textarea 
                                            value={cmsForm.marquee?.text || ''}
                                            onChange={e => setCmsForm({...cmsForm, marquee: { text: e.target.value }})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white min-h-[80px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Designers Title</label>
                                            <input 
                                                value={cmsForm.designers?.title || ''}
                                                onChange={e => setCmsForm({...cmsForm, designers: { ...cmsForm.designers, title: e.target.value }})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Spotlight Title</label>
                                            <input 
                                                value={cmsForm.spotlight?.title || ''}
                                                onChange={e => setCmsForm({...cmsForm, spotlight: { title: e.target.value }})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* The Drop */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'drop' ? null : 'drop')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> The Drop</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'drop' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'drop' && cmsForm.drop && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title</label>
                                        <input 
                                            value={cmsForm.drop.title}
                                            onChange={e => setCmsForm({...cmsForm, drop: {...cmsForm.drop!, title: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle</label>
                                        <input 
                                            value={cmsForm.drop.subtitle}
                                            onChange={e => setCmsForm({...cmsForm, drop: {...cmsForm.drop!, subtitle: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Description</label>
                                        <textarea 
                                            value={cmsForm.drop.description}
                                            onChange={e => setCmsForm({...cmsForm, drop: {...cmsForm.drop!, description: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white h-24"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Background Image URLs (comma separated)</label>
                                        <textarea 
                                            value={cmsForm.drop.backgroundImages.join(', ')}
                                            onChange={e => setCmsForm({...cmsForm, drop: {...cmsForm.drop!, backgroundImages: e.target.value.split(',').map(s => s.trim()).filter(s => s)}})}
                                            className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white h-24"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Products</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {products.map(product => (
                                                <div key={product.id} className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox"
                                                        checked={cmsForm.drop.productIds?.includes(product.id) || false}
                                                        onChange={e => {
                                                            const currentProductIds = cmsForm.drop.productIds || [];
                                                            const newProductIds = e.target.checked 
                                                                ? [...currentProductIds, product.id]
                                                                : currentProductIds.filter((id: string) => id !== product.id);
                                                            setCmsForm({...cmsForm, drop: {...cmsForm.drop!, productIds: newProductIds}});
                                                        }}
                                                        className="accent-black"
                                                    />
                                                    <span className="text-xs text-gray-600">{product.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Countdown Date (ISO)</label>
                                        <input 
                                            type="datetime-local"
                                            value={cmsForm.drop.countdownDate.slice(0, 16)}
                                            onChange={e => setCmsForm({...cmsForm, drop: {...cmsForm.drop!, countdownDate: new Date(e.target.value).toISOString()}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Campaign */}
                        <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedSection(expandedSection === 'campaign' ? null : 'campaign')}
                                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Campaign</span>
                                <ChevronDown size={16} className={`transition-transform ${expandedSection === 'campaign' ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSection === 'campaign' && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Campaign Title</label>
                                        <input 
                                            value={cmsForm.campaign.title}
                                            onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, title: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Overlay Text</label>
                                        <input 
                                            value={cmsForm.campaign.overlayText1}
                                            onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, overlayText1: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(num => (
                                            <div key={num}>
                                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Image {num} URL</label>
                                                <input 
                                                    // @ts-ignore
                                                    value={cmsForm.campaign[`image${num}`]}
                                                    // @ts-ignore
                                                    onChange={e => setCmsForm({...cmsForm, campaign: {...cmsForm.campaign, [`image${num}`]: e.target.value}})}
                                                    className="w-full border border-gray-200 p-3 text-xs focus:border-black outline-none font-mono text-gray-500 transition-colors bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                        ))}
                                    </div>
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
                                            value={cmsForm.about.philosophy.description1}
                                            onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, philosophy: {...cmsForm.about.philosophy, description1: e.target.value}}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-32 transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Email</label>
                                            <input 
                                                value={cmsForm.about.contact.email}
                                                onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, contact: {...cmsForm.about.contact, email: e.target.value}}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Phone</label>
                                            <input 
                                                value={cmsForm.about.contact.phone}
                                                onChange={e => setCmsForm({...cmsForm, about: {...cmsForm.about, contact: {...cmsForm.about.contact, phone: e.target.value}}})}
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
                            
                            {expandedSection === 'pricing' && cmsForm.pricing && (
                                <div className="p-6 space-y-4 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Title</label>
                                            <input 
                                                value={cmsForm.pricing.title}
                                                onChange={e => setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, title: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Subtitle</label>
                                            <input 
                                                value={cmsForm.pricing.subtitle}
                                                onChange={e => setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, subtitle: e.target.value}})}
                                                className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none transition-colors bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Description</label>
                                        <textarea 
                                            value={cmsForm.pricing.description}
                                            onChange={e => setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, description: e.target.value}})}
                                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none h-24 transition-colors bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Plans</h4>
                                        <div className="space-y-6">
                                            {cmsForm.pricing.plans.map((plan: any, index: number) => (
                                                <div key={index} className="border border-gray-200 p-4 rounded-sm bg-gray-50">
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Plan Name</label>
                                                            <input 
                                                                value={plan.name}
                                                                onChange={e => {
                                                                    const newPlans = [...cmsForm.pricing!.plans];
                                                                    newPlans[index].name = e.target.value;
                                                                    setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Price</label>
                                                            <input 
                                                                value={plan.price}
                                                                onChange={e => {
                                                                    const newPlans = [...cmsForm.pricing!.plans];
                                                                    newPlans[index].price = e.target.value;
                                                                    setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Description</label>
                                                        <input 
                                                            value={plan.description}
                                                            onChange={e => {
                                                                const newPlans = [...cmsForm.pricing!.plans];
                                                                newPlans[index].description = e.target.value;
                                                                setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, plans: newPlans}});
                                                            }}
                                                            className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white mb-4"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Period</label>
                                                            <input 
                                                                value={plan.period}
                                                                onChange={e => {
                                                                    const newPlans = [...cmsForm.pricing!.plans];
                                                                    newPlans[index].period = e.target.value;
                                                                    setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">CTA Text</label>
                                                            <input 
                                                                value={plan.cta}
                                                                onChange={e => {
                                                                    const newPlans = [...cmsForm.pricing!.plans];
                                                                    newPlans[index].cta = e.target.value;
                                                                    setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, plans: newPlans}});
                                                                }}
                                                                className="w-full border border-gray-200 p-2 text-sm focus:border-black outline-none bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mb-4 flex items-center gap-2">
                                                        <input 
                                                            type="checkbox"
                                                            checked={plan.highlight}
                                                            onChange={e => {
                                                                const newPlans = [...cmsForm.pricing!.plans];
                                                                newPlans[index].highlight = e.target.checked;
                                                                setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, plans: newPlans}});
                                                            }}
                                                            className="accent-black"
                                                        />
                                                        <label className="text-[10px] text-gray-400 uppercase font-bold block">Highlight Plan (Best Value)</label>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Features (comma separated)</label>
                                                        <textarea 
                                                            value={plan.features.join(', ')}
                                                            onChange={e => {
                                                                const newPlans = [...cmsForm.pricing!.plans];
                                                                newPlans[index].features = e.target.value.split(',').map((f: string) => f.trim()).filter((f: string) => f);
                                                                setCmsForm({...cmsForm, pricing: {...cmsForm.pricing!, plans: newPlans}});
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
            
            <div className="md:hidden mt-6">
                <button 
                    onClick={handleCMSUpdate}
                    className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};
