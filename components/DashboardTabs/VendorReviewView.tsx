import React, { useState } from 'react';
import { Vendor } from '../../types.ts';
import { Check, X, ShieldCheck, FileText, Eye, Building2, CreditCard, ExternalLink, Calendar } from 'lucide-react';

interface VendorReviewViewProps {
    vendors: Vendor[];
    onVerifyVendor: (vendor: Vendor, status: 'VERIFIED' | 'REJECTED') => Promise<void>;
    setIsSidebarOpen: (open: boolean) => void;
}

export const VendorReviewView: React.FC<VendorReviewViewProps> = ({ vendors, onVerifyVendor, setIsSidebarOpen }) => {
    const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

    const pendingVendors = vendors.filter(v => v.verificationStatus === 'PENDING' || v.approvalStatus === 'PENDING');

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-8 max-w-7xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-serif italic text-luxury-black">Vendor KYC & Application Reviews</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Review uploaded government IDs, business registration records, and legal details submitted by ateliers.
                    </p>
                </div>
                <div className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start md:self-auto">
                    <ShieldCheck size={16} /> {pendingVendors.length} Pending Review{pendingVendors.length === 1 ? '' : 's'}
                </div>
            </div>

            {pendingVendors.length === 0 ? (
                <div className="bg-white p-12 text-center border border-gray-100 rounded-sm shadow-xs space-y-3">
                    <ShieldCheck size={40} className="mx-auto text-emerald-600" />
                    <h3 className="text-lg font-serif italic">All Applications Reviewed</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                        There are currently no pending atelier KYC verification requests. All registered vendors are fully verified.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pendingVendors.map(vendor => {
                        const kyc = vendor.kycDocuments || {};
                        const note = adminNotes[vendor.id] || '';

                        return (
                            <div key={vendor.id} className="bg-white p-6 md:p-8 border border-gray-100 rounded-sm shadow-xs space-y-6">
                                {/* Header Info */}
                                <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-gray-100 pb-6">
                                    <div className="flex items-center gap-4">
                                        <img src={vendor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'} alt={vendor.name} className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                                        <div>
                                            <h3 className="text-xl font-serif italic font-bold text-luxury-black">{vendor.name}</h3>
                                            <p className="text-xs text-gray-500">{vendor.brandName || vendor.name} • {vendor.email}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{vendor.location || 'Location Not Specified'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onVerifyVendor(vendor, 'VERIFIED')}
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
                                        >
                                            <Check size={16} /> Approve & Verify
                                        </button>
                                        <button 
                                            onClick={() => onVerifyVendor(vendor, 'REJECTED')}
                                            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
                                        >
                                            <X size={16} /> Reject Application
                                        </button>
                                    </div>
                                </div>

                                {/* Submitted Business Credentials */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-sm border border-gray-200 text-xs">
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <Building2 size={14} className="text-luxury-gold" /> Legal Business Info
                                        </h4>
                                        <div className="space-y-1 text-gray-600">
                                            <p><strong>Business Name:</strong> {kyc.businessName || vendor.brandName || vendor.name}</p>
                                            <p><strong>CAC / Reg No:</strong> {kyc.registrationNumber || 'Not provided'}</p>
                                            <p><strong>Tax ID (TIN):</strong> {kyc.taxId || 'Not provided'}</p>
                                            <p><strong>Phone:</strong> {kyc.phone || 'Not provided'}</p>
                                            <p><strong>Address:</strong> {kyc.businessAddress || vendor.location || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <CreditCard size={14} className="text-luxury-gold" /> Payout Bank Details
                                        </h4>
                                        <div className="space-y-1 text-gray-600">
                                            <p><strong>Bank Name:</strong> {kyc.bankName || vendor.bankDetails?.bankName || 'Not provided'}</p>
                                            <p><strong>Account Number:</strong> {kyc.accountNumber || vendor.bankDetails?.accountNumber || 'Not provided'}</p>
                                            <p><strong>Account Name:</strong> {kyc.accountName || vendor.bankDetails?.accountName || 'Not provided'}</p>
                                            <p><strong>Submitted Date:</strong> {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'Recent'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* KYC Uploaded Document Files */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                        <FileText size={14} className="text-luxury-gold" /> Attached KYC Documents
                                    </h4>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { label: 'ID Front', url: kyc.idFront },
                                            { label: 'ID Back', url: kyc.idBack },
                                            { label: 'Proof of Address', url: kyc.proofOfAddress },
                                            { label: 'CAC Certificate', url: kyc.businessRegistrationDoc }
                                        ].map((doc, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded p-3 bg-white space-y-2 flex flex-col justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block truncate">{doc.label}</span>
                                                {doc.url ? (
                                                    <button
                                                        onClick={() => setPreviewDoc({ title: `${vendor.name} - ${doc.label}`, url: doc.url! })}
                                                        className="w-full h-24 bg-gray-100 rounded overflow-hidden relative group border flex items-center justify-center"
                                                    >
                                                        {doc.url.startsWith('data:image') || doc.url.startsWith('http') ? (
                                                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FileText size={24} className="text-gray-400" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-bold uppercase">
                                                            <Eye size={12} /> Inspect
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <div className="h-24 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">
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

            {/* DOCUMENT PREVIEW MODAL */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-sm max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h4 className="font-serif italic text-lg font-bold">{previewDoc.title}</h4>
                            <button onClick={() => setPreviewDoc(null)} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex items-center justify-center p-2 bg-gray-100 rounded">
                            {previewDoc.url.startsWith('data:image') || previewDoc.url.startsWith('http') ? (
                                <img src={previewDoc.url} alt="Document Preview" className="max-h-[60vh] object-contain rounded" />
                            ) : (
                                <iframe src={previewDoc.url} title="Document Preview" className="w-full h-[60vh] rounded" />
                            )}
                        </div>
                        <div className="text-right">
                            <button onClick={() => setPreviewDoc(null)} className="px-5 py-2 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider rounded-xs">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
