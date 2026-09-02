
import React, { useState, useMemo } from 'react';
import { Store, Search, Filter, Menu, CheckCircle, XCircle, Eye, MoreVertical, MapPin, Clock, ShieldCheck, AlertTriangle, FileText, Globe, Mail, X, Check } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [inspectVendor, setInspectVendor] = useState<Vendor | null>(null);

    const pendingCount = useMemo(() => vendors.filter(v => v.verificationStatus === 'PENDING' || v.approvalStatus === 'PENDING').length, [vendors]);
    const approvedCount = useMemo(() => vendors.filter(v => v.verificationStatus === 'VERIFIED' || v.approvalStatus === 'APPROVED').length, [vendors]);
    const rejectedCount = useMemo(() => vendors.filter(v => v.verificationStatus === 'REJECTED' || v.approvalStatus === 'REJECTED').length, [vendors]);

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor => {
            const matchesSearch = searchQuery === '' || 
                vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (vendor.location && vendor.location.toLowerCase().includes(searchQuery.toLowerCase()));

            const isPending = vendor.verificationStatus === 'PENDING' || vendor.approvalStatus === 'PENDING';
            const isApproved = vendor.verificationStatus === 'VERIFIED' || vendor.approvalStatus === 'APPROVED';
            const isRejected = vendor.verificationStatus === 'REJECTED' || vendor.approvalStatus === 'REJECTED';

            if (statusFilter === 'PENDING') return matchesSearch && isPending;
            if (statusFilter === 'APPROVED') return matchesSearch && isApproved;
            if (statusFilter === 'REJECTED') return matchesSearch && isRejected;

            return matchesSearch;
        });
    }, [vendors, searchQuery, statusFilter]);

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-3xl font-serif italic">Vendor Onboarding & Ateliers</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Review new seller applications, verify credentials, and approve storefronts before publication.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-sm shadow-sm">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search brand or email..." 
                            className="text-xs outline-none bg-transparent w-40 md:w-56" 
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-black text-xs">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {setVendorForm && (
                        <button 
                            onClick={() => setVendorForm({ name: '', email: '', location: '', bio: '', avatar: '', verificationStatus: 'PENDING', approvalStatus: 'PENDING' })}
                            className="bg-black text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            + Add Vendor
                        </button>
                    )}
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Tabs & Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                    onClick={() => setStatusFilter('ALL')}
                    className={`p-4 border text-left rounded-sm transition-all ${statusFilter === 'ALL' ? 'bg-black text-white border-black shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${statusFilter === 'ALL' ? 'text-gray-300' : 'text-gray-400'}`}>Total Ateliers</p>
                    <p className="text-2xl font-serif font-bold mt-1">{vendors.length}</p>
                </button>

                <button 
                    onClick={() => setStatusFilter('PENDING')}
                    className={`p-4 border text-left rounded-sm transition-all relative ${statusFilter === 'PENDING' ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-sm' : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'}`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${statusFilter === 'PENDING' ? 'text-amber-200' : 'text-amber-700'}`}>Pending Review</p>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-2xl font-serif font-bold">{pendingCount}</p>
                        {pendingCount > 0 && (
                            <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500"></span>
                        )}
                    </div>
                </button>

                <button 
                    onClick={() => setStatusFilter('APPROVED')}
                    className={`p-4 border text-left rounded-sm transition-all ${statusFilter === 'APPROVED' ? 'bg-emerald-900 text-emerald-50 border-emerald-900 shadow-sm' : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'}`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${statusFilter === 'APPROVED' ? 'text-emerald-200' : 'text-emerald-700'}`}>Live Ateliers</p>
                    <p className="text-2xl font-serif font-bold mt-1">{approvedCount}</p>
                </button>

                <button 
                    onClick={() => setStatusFilter('REJECTED')}
                    className={`p-4 border text-left rounded-sm transition-all ${statusFilter === 'REJECTED' ? 'bg-red-900 text-red-50 border-red-900 shadow-sm' : 'bg-red-50/50 border-red-200 hover:bg-red-50'}`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${statusFilter === 'REJECTED' ? 'text-red-200' : 'text-red-700'}`}>Declined</p>
                    <p className="text-2xl font-serif font-bold mt-1">{rejectedCount}</p>
                </button>
            </div>

            {/* Vendor Table */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-200">
                            <tr>
                                <th className="p-4">Vendor / Atelier</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Plan Tier</th>
                                <th className="p-4">Approval Status</th>
                                <th className="p-4">Registered Date</th>
                                <th className="p-4 text-right">Review Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVendors.map((vendor) => {
                                const isPending = vendor.verificationStatus === 'PENDING' || vendor.approvalStatus === 'PENDING';
                                const isApproved = vendor.verificationStatus === 'VERIFIED' || vendor.approvalStatus === 'APPROVED';
                                const isRejected = vendor.verificationStatus === 'REJECTED' || vendor.approvalStatus === 'REJECTED';

                                return (
                                    <tr key={vendor.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                                    <img src={vendor.avatar || `https://picsum.photos/seed/${vendor.id}/100/100`} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{vendor.name}</p>
                                                    <p className="text-[10px] text-gray-400">{vendor.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} className="text-gray-400" />
                                                {vendor.location || 'Global'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[10px]">
                                                {vendor.subscriptionPlan || 'Atelier'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {isPending && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                    <Clock size={12} /> Pending Approval
                                                </span>
                                            )}
                                            {isApproved && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    <ShieldCheck size={12} /> Approved
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-red-50 text-red-800 border border-red-200">
                                                    <AlertTriangle size={12} /> Declined
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500 text-[11px]">
                                            {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'Recent'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setInspectVendor(vendor)}
                                                    className="px-2.5 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded text-[11px] font-medium flex items-center gap-1"
                                                    title="Inspect Dossier"
                                                >
                                                    <Eye size={12} /> Inspect
                                                </button>
                                                {isPending ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleVerifyVendor(vendor, 'VERIFIED')}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors"
                                                            title="Approve Onboarding"
                                                        >
                                                            <Check size={12} /> Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleVerifyVendor(vendor, 'REJECTED')}
                                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors"
                                                            title="Decline Store"
                                                        >
                                                            <X size={12} /> Decline
                                                        </button>
                                                    </>
                                                ) : isApproved ? (
                                                    <button 
                                                        onClick={() => handleVerifyVendor(vendor, 'REJECTED')}
                                                        className="px-2 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded text-[10px] font-bold uppercase"
                                                    >
                                                        Revoke
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleVerifyVendor(vendor, 'VERIFIED')}
                                                        className="px-2 py-1 border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded text-[10px] font-bold uppercase"
                                                    >
                                                        Re-Approve
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredVendors.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Store size={40} className="mb-3 opacity-20" />
                                            <p className="text-sm font-serif italic text-gray-600">No vendor applications match your filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vendor Onboarding Inspection Modal */}
            {inspectVendor && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-md shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
                        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img src={inspectVendor.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" alt="" />
                                <div>
                                    <h3 className="font-serif italic text-xl font-bold">{inspectVendor.name}</h3>
                                    <p className="text-xs text-gray-400">{inspectVendor.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setInspectVendor(null)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                            <div className="bg-gray-50 p-4 rounded border border-gray-100 space-y-2">
                                <p className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">Brand Bio & Vision</p>
                                <p className="text-gray-600 leading-relaxed italic">{inspectVendor.bio || 'No brand story provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-gray-100 p-3 rounded">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Location / Base</p>
                                    <p className="font-bold text-gray-800 mt-0.5">{inspectVendor.location || 'Global'}</p>
                                </div>
                                <div className="border border-gray-100 p-3 rounded">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Subscription Tier</p>
                                    <p className="font-bold text-gray-800 mt-0.5">{inspectVendor.subscriptionPlan || 'Atelier'}</p>
                                </div>
                            </div>

                            <div className="border border-gray-100 p-3 rounded space-y-1">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Digital Footprint</p>
                                <p className="text-gray-700 font-mono text-[11px]">Website: {inspectVendor.website || 'Not provided'}</p>
                                <p className="text-gray-700 font-mono text-[11px]">Social: {inspectVendor.instagram || 'None'}</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                                <p className="text-[10px] font-bold uppercase text-amber-900">KYC Verification Check</p>
                                <p className="text-[11px] text-amber-800 mt-0.5">
                                    Identity credentials, email domain, and business registration filed under review.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <button 
                                onClick={() => setInspectVendor(null)}
                                className="px-4 py-2 border border-gray-300 rounded text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                            >
                                Close
                            </button>
                            <div className="flex gap-2">
                                <button 
                                    onClick={async () => {
                                        await handleVerifyVendor(inspectVendor, 'REJECTED');
                                        setInspectVendor(null);
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                                >
                                    <X size={14} /> Decline Application
                                </button>
                                <button 
                                    onClick={async () => {
                                        await handleVerifyVendor(inspectVendor, 'VERIFIED');
                                        setInspectVendor(null);
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                                >
                                    <Check size={14} /> Approve Store
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

