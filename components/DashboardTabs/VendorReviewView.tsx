import React, { useState, useMemo } from 'react';
import { Vendor } from '../../types.ts';
import { Check, X, ShieldCheck, FileText, Eye, Building2, CreditCard, Search, Clock, AlertTriangle, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface VendorReviewViewProps {
    vendors: Vendor[];
    onVerifyVendor: (vendor: Vendor, status: 'VERIFIED' | 'REJECTED') => Promise<void>;
    setIsSidebarOpen?: (open: boolean) => void;
}

export const VendorReviewView: React.FC<VendorReviewViewProps> = ({ vendors, onVerifyVendor, setIsSidebarOpen }) => {
    const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'UNVERIFIED' | 'VERIFIED'>('ALL');
    const [processingVendorId, setProcessingVendorId] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<{ id: string; msg: string } | null>(null);

    const counts = useMemo(() => {
        const pending = vendors.filter(v => v.verificationStatus === 'PENDING' || v.approvalStatus === 'PENDING').length;
        const verified = vendors.filter(v => v.verificationStatus === 'VERIFIED' || v.approvalStatus === 'APPROVED').length;
        const unverified = vendors.filter(v => v.verificationStatus !== 'VERIFIED' && v.approvalStatus !== 'APPROVED').length;
        return { pending, verified, unverified, all: vendors.length };
    }, [vendors]);

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor => {
            const matchesSearch = searchQuery === '' ||
                vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (vendor.brandName && vendor.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (vendor.location && vendor.location.toLowerCase().includes(searchQuery.toLowerCase()));

            const isPending = vendor.verificationStatus === 'PENDING' || vendor.approvalStatus === 'PENDING';
            const isVerified = vendor.verificationStatus === 'VERIFIED' || vendor.approvalStatus === 'APPROVED';
            const isUnverified = !isVerified;

            if (statusFilter === 'PENDING') return matchesSearch && isPending;
            if (statusFilter === 'VERIFIED') return matchesSearch && isVerified;
            if (statusFilter === 'UNVERIFIED') return matchesSearch && isUnverified;

            return matchesSearch;
        });
    }, [vendors, searchQuery, statusFilter]);

    const handleAction = async (vendor: Vendor, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
        setProcessingVendorId(vendor.id);
        setActionMsg(null);
        try {
            await onVerifyVendor(vendor, status);
            setActionMsg({
                id: vendor.id,
                msg: status === 'VERIFIED' 
                    ? `✓ Successfully verified KYC & approved store for ${vendor.name || vendor.brandName}`
                    : `Declined application for ${vendor.name || vendor.brandName}`
            });
        } catch (e: any) {
            alert('Failed to update vendor: ' + e.message);
        } finally {
            setProcessingVendorId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-8 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-serif italic text-luxury-black">Vendor KYC & Verification Hub</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Review uploaded credentials, inspect government IDs & CAC documents, and personally verify vendors with 1-click admin authority.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                        <Clock size={14} className="text-amber-600" /> {counts.pending} Pending Review
                    </div>
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 size={14} className="text-emerald-600" /> {counts.verified} Verified Ateliers
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-sm border border-gray-100 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                            statusFilter === 'ALL' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All Ateliers ({counts.all})
                    </button>
                    <button
                        onClick={() => setStatusFilter('PENDING')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                            statusFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                    >
                        <Clock size={12} /> Pending Applications ({counts.pending})
                    </button>
                    <button
                        onClick={() => setStatusFilter('UNVERIFIED')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                            statusFilter === 'UNVERIFIED' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                        }`}
                        title="Vendors who haven't applied or haven't been verified yet"
                    >
                        <AlertCircle size={12} /> Unverified / Not Applied ({counts.unverified})
                    </button>
                    <button
                        onClick={() => setStatusFilter('VERIFIED')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                            statusFilter === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                        <Check size={12} /> Verified ({counts.verified})
                    </button>
                </div>

                <div className="flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-sm w-full sm:w-64">
                    <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search vendor name or email..."
                        className="text-xs outline-none bg-transparent w-full"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-black text-xs">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* List of Vendors for Review */}
            {filteredVendors.length === 0 ? (
                <div className="bg-white p-12 text-center border border-gray-100 rounded-sm shadow-xs space-y-3">
                    <ShieldCheck size={40} className="mx-auto text-gray-300" />
                    <h3 className="text-lg font-serif italic">No Ateliers Found</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                        No vendor profiles matched the selected filter criteria.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredVendors.map(vendor => {
                        const kyc = vendor.kycDocuments || {};
                        const isVerified = vendor.verificationStatus === 'VERIFIED' || vendor.approvalStatus === 'APPROVED';
                        const isPending = vendor.verificationStatus === 'PENDING' || vendor.approvalStatus === 'PENDING';
                        const isNotApplied = !isVerified && !isPending;
                        const isProcessing = processingVendorId === vendor.id;
                        const hasUploadedDocs = Boolean(kyc.idFront || kyc.idBack || kyc.proofOfAddress || kyc.businessRegistrationDoc);

                        return (
                            <div key={vendor.id} className="bg-white p-6 md:p-8 border border-gray-100 rounded-sm shadow-xs space-y-6 hover:border-gray-300 transition-all">
                                {actionMsg && actionMsg.id === vendor.id && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-2">
                                        <CheckCircle2 size={14} /> {actionMsg.msg}
                                    </div>
                                )}

                                {/* Header Info */}
                                <div className="flex flex-col lg:flex-row gap-6 items-start justify-between border-b border-gray-100 pb-6">
                                    <div className="flex items-start gap-4">
                                        <img 
                                            src={vendor.avatar || `https://picsum.photos/seed/${vendor.id}/100/100`} 
                                            alt={vendor.name} 
                                            className="w-16 h-16 rounded-full object-cover border border-gray-200 shrink-0" 
                                        />
                                        <div>
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h3 className="text-xl font-serif italic font-bold text-luxury-black">{vendor.name}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                                                    isVerified 
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                        : isPending 
                                                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                                                }`}>
                                                    {isVerified && <CheckCircle2 size={12} className="text-emerald-600" />}
                                                    {isPending && <Clock size={12} className="text-amber-600" />}
                                                    {isNotApplied && <AlertCircle size={12} className="text-blue-600" />}
                                                    KYC: {vendor.verificationStatus || (isVerified ? 'VERIFIED' : 'NOT APPLIED')}
                                                </span>
                                                {vendor.subscriptionStatus === 'ACTIVE' && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase rounded">
                                                        {vendor.subscriptionPlan || 'Atelier'} Tier
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{vendor.brandName || vendor.name} • {vendor.email}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{vendor.location || 'Location Not Specified'}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Direct Admin Verification */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {!isVerified ? (
                                            <>
                                                <button 
                                                    onClick={() => handleAction(vendor, 'VERIFIED')}
                                                    disabled={isProcessing}
                                                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                                                    title="Personally verify KYC and activate vendor store even without application"
                                                >
                                                    <ShieldCheck size={16} /> 
                                                    {isPending ? 'Approve & Verify KYC' : 'Personally Verify KYC (Manual)'}
                                                </button>
                                                {isPending && (
                                                    <button 
                                                        onClick={() => handleAction(vendor, 'REJECTED')}
                                                        disabled={isProcessing}
                                                        className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                                                    >
                                                        <X size={16} /> Reject Application
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-bold uppercase tracking-wider">
                                                    <ShieldCheck size={14} className="text-emerald-600" /> KYC Verified & Cleared
                                                </div>
                                                <button 
                                                    onClick={() => handleAction(vendor, 'REJECTED')}
                                                    disabled={isProcessing}
                                                    className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                                    title="Revoke KYC clearance"
                                                >
                                                    Revoke Clearance
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Submitted Business Credentials & Bank Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-sm border border-gray-200 text-xs">
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <Building2 size={14} className="text-luxury-gold" /> Legal Business Info
                                        </h4>
                                        <div className="space-y-1.5 text-gray-600">
                                            <p><strong>Business Name:</strong> {kyc.businessName || vendor.brandName || vendor.name || 'Not provided'}</p>
                                            <p><strong>CAC / Reg No:</strong> {kyc.registrationNumber || 'Not provided'}</p>
                                            <p><strong>Tax ID (TIN):</strong> {kyc.taxId || 'Not provided'}</p>
                                            <p><strong>Phone:</strong> {kyc.phone || 'Not provided'}</p>
                                            <p><strong>Business Address:</strong> {kyc.businessAddress || vendor.location || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <CreditCard size={14} className="text-luxury-gold" /> Payout Bank Details
                                        </h4>
                                        <div className="space-y-1.5 text-gray-600">
                                            <p><strong>Bank Name:</strong> {kyc.bankName || vendor.bankDetails?.bankName || 'Not provided'}</p>
                                            <p><strong>Account Number:</strong> {kyc.accountNumber || vendor.bankDetails?.accountNumber || 'Not provided'}</p>
                                            <p><strong>Account Name:</strong> {kyc.accountName || vendor.bankDetails?.accountName || 'Not provided'}</p>
                                            <p><strong>Submission Date:</strong> {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : (hasUploadedDocs ? 'Uploaded' : 'No submission yet')}</p>
                                            {kyc.adminNote && (
                                                <p className="text-amber-800 italic pt-1">
                                                    <strong>Admin Note:</strong> {kyc.adminNote}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* KYC Uploaded Document Files & In-App Lightbox View */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                            <FileText size={14} className="text-luxury-gold" /> Uploaded KYC Identification Documents
                                        </h4>
                                        <span className="text-[11px] text-gray-400">
                                            {hasUploadedDocs ? 'Click any document to inspect full-size' : 'No documents uploaded yet'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Government ID Front', url: kyc.idFront },
                                            { label: 'Government ID Back', url: kyc.idBack },
                                            { label: 'Proof of Address (Utility)', url: kyc.proofOfAddress },
                                            { label: 'CAC Registration Cert', url: kyc.businessRegistrationDoc }
                                        ].map((doc, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded p-3 bg-white space-y-2 flex flex-col justify-between shadow-xs">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 block truncate">{doc.label}</span>
                                                {doc.url ? (
                                                    <div className="space-y-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewDoc({ title: `${vendor.name} — ${doc.label}`, url: doc.url! })}
                                                            className="w-full h-28 bg-gray-100 rounded overflow-hidden relative group border flex items-center justify-center cursor-pointer"
                                                        >
                                                            {doc.url.startsWith('data:image') || doc.url.startsWith('http') ? (
                                                                <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            ) : (
                                                                <FileText size={24} className="text-gray-400" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[11px] font-bold uppercase">
                                                                <Eye size={14} /> View File
                                                            </div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewDoc({ title: `${vendor.name} — ${doc.label}`, url: doc.url! })}
                                                            className="w-full py-1 text-[10px] font-bold uppercase bg-gray-900 hover:bg-luxury-gold hover:text-black text-white rounded transition-colors text-center block"
                                                        >
                                                            Inspect
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-28 bg-gray-50 border border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-[10px] text-gray-400 font-bold uppercase text-center p-2">
                                                        <FileText size={18} className="opacity-30 mb-1" />
                                                        Not Uploaded
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* DOCUMENT PREVIEW LIGHTBOX MODAL */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-sm max-w-4xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-luxury-gold" />
                                <h4 className="font-serif italic text-lg font-bold text-luxury-black">{previewDoc.title}</h4>
                            </div>
                            <button 
                                onClick={() => setPreviewDoc(null)} 
                                className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex items-center justify-center p-4 bg-gray-950 rounded border border-gray-800 min-h-[300px]">
                            {previewDoc.url.startsWith('data:image') || previewDoc.url.startsWith('http') ? (
                                <img src={previewDoc.url} alt="Document Preview" className="max-h-[65vh] object-contain rounded shadow-lg" />
                            ) : (
                                <iframe src={previewDoc.url} title="Document Preview" className="w-full h-[65vh] rounded bg-white" />
                            )}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <a
                                href={previewDoc.url}
                                download="kyc-document"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xs"
                            >
                                Download Original
                            </a>
                            <button 
                                onClick={() => setPreviewDoc(null)} 
                                className="px-6 py-2 bg-luxury-black hover:bg-luxury-gold hover:text-black text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
