
import React from 'react';
import { Save, X, Menu, Layout, Type, Image as ImageIcon, Plus, Trash2, Grid } from 'lucide-react';

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
    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-5xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('OVERVIEW')} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                    <h2 className="text-3xl font-serif italic">Landing Page Editor</h2>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleCmsSave}
                        className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors hidden md:block"
                    >
                        Publish Changes
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-gray-400">
                            <Layout size={14} /> Hero Section
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Headline</label>
                                <input 
                                    value={cmsForm.heroTitle || ''}
                                    onChange={(e) => setCmsForm({...cmsForm, heroTitle: e.target.value})}
                                    className="w-full border-b border-gray-200 py-3 text-lg font-serif italic focus:border-black outline-none bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Subheadline</label>
                                <textarea 
                                    value={cmsForm.heroSubtitle || ''}
                                    onChange={(e) => setCmsForm({...cmsForm, heroSubtitle: e.target.value})}
                                    className="w-full border border-gray-200 p-4 text-sm focus:border-black outline-none bg-gray-50 h-24 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Featured Collections */}
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-gray-400">
                            <Grid size={14} /> Featured Collections
                        </h3>
                        <div className="space-y-6">
                            {cmsForm.featuredCollections?.map((collection: any, idx: number) => (
                                <div key={idx} className="p-6 border border-gray-100 rounded-sm bg-gray-50/50 relative group">
                                    <button 
                                        onClick={() => {
                                            const newCollections = [...cmsForm.featuredCollections];
                                            newCollections.splice(idx, 1);
                                            setCmsForm({...cmsForm, featuredCollections: newCollections});
                                        }}
                                        className="absolute top-2 right-2 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Collection Title</label>
                                            <input 
                                                value={collection.title}
                                                onChange={(e) => {
                                                    const newCollections = [...cmsForm.featuredCollections];
                                                    newCollections[idx].title = e.target.value;
                                                    setCmsForm({...cmsForm, featuredCollections: newCollections});
                                                }}
                                                className="w-full border-b border-gray-200 py-2 text-sm font-bold focus:border-black outline-none bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Collection Image URL</label>
                                            <input 
                                                value={collection.image}
                                                onChange={(e) => {
                                                    const newCollections = [...cmsForm.featuredCollections];
                                                    newCollections[idx].image = e.target.value;
                                                    setCmsForm({...cmsForm, featuredCollections: newCollections});
                                                }}
                                                className="w-full border-b border-gray-200 py-2 text-xs focus:border-black outline-none bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => {
                                    const newCollections = [...(cmsForm.featuredCollections || []), { title: 'New Collection', image: '', description: '' }];
                                    setCmsForm({...cmsForm, featuredCollections: newCollections});
                                }}
                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-sm text-gray-400 text-xs font-bold uppercase tracking-widest hover:border-luxury-gold hover:text-luxury-gold transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Collection
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Global Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Announcement Bar</label>
                                <input 
                                    value={cmsForm.announcement || ''}
                                    onChange={(e) => setCmsForm({...cmsForm, announcement: e.target.value})}
                                    className="w-full border-b border-gray-200 py-2 text-xs focus:border-black outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:hidden mt-6 pb-20">
                <button 
                    onClick={handleCmsSave}
                    className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                >
                    Publish Changes
                </button>
            </div>
        </div>
    );
};
