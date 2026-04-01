import React from 'react';
import { Vendor } from '../../types';
import { Check, X, User } from 'lucide-react';

interface VendorReviewViewProps {
    vendors: Vendor[];
    onVerifyVendor: (vendor: Vendor, status: 'VERIFIED' | 'REJECTED') => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
}

export const VendorReviewView: React.FC<VendorReviewViewProps> = ({ vendors, onVerifyVendor, setIsSidebarOpen }) => {
    const pendingVendors = vendors.filter(v => v.verificationStatus === 'PENDING');

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">Vendor Applications</h2>
            </div>

            {pendingVendors.length === 0 ? (
                <div className="bg-white p-12 text-center border border-gray-100 rounded-sm">
                    <p className="text-gray-500">No pending vendor applications.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pendingVendors.map(vendor => (
                        <div key={vendor.id} className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm flex flex-col md:flex-row gap-6 items-start">
                            <img src={vendor.avatar} alt={vendor.name} className="w-20 h-20 rounded-full object-cover border border-gray-100" />
                            <div className="flex-1 space-y-2">
                                <h3 className="text-lg font-bold">{vendor.name}</h3>
                                <p className="text-sm text-gray-600">{vendor.bio}</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <p>Email: {vendor.email}</p>
                                    <p>Location: {vendor.location}</p>
                                    <p>Website: {vendor.website}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onVerifyVendor(vendor, 'VERIFIED')}
                                    className="p-3 bg-green-50 text-green-700 rounded-sm hover:bg-green-100 transition-colors"
                                    title="Approve"
                                >
                                    <Check size={20} />
                                </button>
                                <button 
                                    onClick={() => onVerifyVendor(vendor, 'REJECTED')}
                                    className="p-3 bg-red-50 text-red-700 rounded-sm hover:bg-red-100 transition-colors"
                                    title="Reject"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
