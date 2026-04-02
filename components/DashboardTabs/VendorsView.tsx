
import React from 'react';
import { Store, Search, Filter, Menu, CheckCircle, XCircle, Eye, MoreVertical, MapPin } from 'lucide-react';
import { Vendor } from '../../types.ts';

interface VendorsViewProps {
    vendors: Vendor[];
    setIsSidebarOpen: (open: boolean) => void;
    handleVerifyVendor: (vendor: Vendor, status: 'VERIFIED' | 'REJECTED') => Promise<void>;
    setVendors?: (vendors: Vendor[]) => Promise<void>;
    setVendorForm?: (form: any) => void;
    selectedVendorForReview?: Vendor | null;
    setSelectedVendorForReview?: (vendor: Vendor | null) => void;
    onDesignerClick?: (designerName: string) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({ 
    vendors, 
    setIsSidebarOpen, 
    handleVerifyVendor,
    setVendors,
    setVendorForm,
    selectedVendorForReview,
    setSelectedVendorForReview,
    onDesignerClick
}) => {
    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">Vendor Directory</h2>
                <div className="flex gap-4">
                    <div className="hidden md:flex items-center bg-white border border-gray-200 px-4 py-2 rounded-sm">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input placeholder="Search vendors..." className="text-sm outline-none bg-transparent w-48" />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-sm hover:bg-gray-50">
                        <Filter size={20} />
                    </button>
                    {setVendorForm && (
                        <button 
                            onClick={() => setVendorForm({ name: '', email: '', location: '', description: '', avatar: '', banner: '', verificationStatus: 'PENDING' })}
                            className="bg-black text-white px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                        >
                            Add Vendor
                        </button>
                    )}
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold">
                            <tr>
                                <th className="p-6">Vendor / Brand</th>
                                <th className="p-6">Location</th>
                                <th className="p-6">Subscription</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Joined</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-sm bg-gray-50 border border-gray-100 overflow-hidden">
                                                <img src={vendor.avatar || `https://picsum.photos/seed/${vendor.id}/100/100`} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{vendor.name}</p>
                                                <p className="text-[10px] text-gray-400">{vendor.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} />
                                            {vendor.location || 'Remote'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">{vendor.subscriptionPlan || 'N/A'}</span>
                                            <span className={`text-[10px] uppercase ${vendor.subscriptionStatus === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                                                {vendor.subscriptionStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-bold ${
                                            vendor.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-700' :
                                            vendor.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                                            'bg-yellow-50 text-yellow-700'
                                        }`}>
                                            {vendor.verificationStatus}
                                        </span>
                                    </td>
                                    <td className="p-6 text-gray-500">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black" title="View Storefront">
                                                <Eye size={16} />
                                            </button>
                                            {vendor.verificationStatus === 'PENDING' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleVerifyVendor(vendor, 'VERIFIED')}
                                                        className="p-2 hover:bg-gray-100 rounded-full text-green-400 hover:text-green-600" 
                                                        title="Verify Vendor"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleVerifyVendor(vendor, 'REJECTED')}
                                                        className="p-2 hover:bg-gray-100 rounded-full text-red-400 hover:text-red-600" 
                                                        title="Reject Vendor"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {vendors.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Store size={48} className="mb-4 opacity-20" />
                                            <p className="text-sm font-serif italic">No vendors found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
