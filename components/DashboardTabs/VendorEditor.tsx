
import React from 'react';
import { X, Loader } from 'lucide-react';
import { Vendor } from '../../types.ts';

interface VendorEditorProps {
    vendorForm: Partial<Vendor>;
    setVendorForm: (vendor: Partial<Vendor> | null) => void;
    handleSaveVendor: () => Promise<void>;
    isSavingVendor: boolean;
}

export const VendorEditor: React.FC<VendorEditorProps> = ({
    vendorForm,
    setVendorForm,
    handleSaveVendor,
    isSavingVendor
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVendorForm(null)} />
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-slide-up rounded-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                    <h2 className="text-xl font-serif italic">{vendorForm.id ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                    <button onClick={() => setVendorForm(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Brand Name *</label>
                            <input 
                                type="text" 
                                value={vendorForm.name || ''}
                                onChange={e => setVendorForm({...vendorForm, name: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                placeholder="Maison Omega"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Email *</label>
                            <input 
                                type="email" 
                                value={vendorForm.email || ''}
                                onChange={e => setVendorForm({...vendorForm, email: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                placeholder="contact@maisonomega.com"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Location</label>
                            <input 
                                type="text" 
                                value={vendorForm.location || ''}
                                onChange={e => setVendorForm({...vendorForm, location: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                placeholder="Paris, France"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Website</label>
                            <input 
                                type="url" 
                                value={vendorForm.website || ''}
                                onChange={e => setVendorForm({...vendorForm, website: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Avatar URL</label>
                            <input 
                                type="url" 
                                value={vendorForm.avatar || ''}
                                onChange={e => setVendorForm({...vendorForm, avatar: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Cover Image URL</label>
                            <input 
                                type="url" 
                                value={vendorForm.coverImage || ''}
                                onChange={e => setVendorForm({...vendorForm, coverImage: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Subscription Plan</label>
                            <select 
                                value={vendorForm.subscriptionPlan || 'BASIC'}
                                onChange={e => setVendorForm({...vendorForm, subscriptionPlan: e.target.value as any})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                            >
                                <option value="BASIC">Basic</option>
                                <option value="PRO">Pro</option>
                                <option value="ENTERPRISE">Enterprise</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Verification Status</label>
                            <select 
                                value={vendorForm.verificationStatus || 'PENDING'}
                                onChange={e => setVendorForm({...vendorForm, verificationStatus: e.target.value as any})}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-black outline-none bg-transparent"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Bio</label>
                        <textarea 
                            value={vendorForm.bio || ''}
                            onChange={e => setVendorForm({...vendorForm, bio: e.target.value})}
                            className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none bg-gray-50 h-24 resize-none"
                            placeholder="Brand bio..."
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                        <button 
                            onClick={() => setVendorForm(null)}
                            className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveVendor}
                            disabled={isSavingVendor}
                            className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSavingVendor ? <Loader size={16} className="animate-spin" /> : (vendorForm.id ? 'Save Changes' : 'Add Vendor')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
