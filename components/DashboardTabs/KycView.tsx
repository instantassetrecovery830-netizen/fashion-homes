import React, { useState, useRef, useEffect } from 'react';
import { Vendor, KycDocuments, UserRole } from '../../types.ts';
import { ShieldCheck, Upload, AlertCircle, CheckCircle, FileText, Eye, Building2, CreditCard, User, Clock, X, Check, RefreshCw, AlertTriangle, ArrowRight, Lock, Image as ImageIcon } from 'lucide-react';

interface KycViewProps {
  vendor: Vendor;
  onUpdateVendor: (vendor: Vendor) => Promise<void>;
  userRole?: UserRole;
  setIsSidebarOpen?: (open: boolean) => void;
  allVendors?: Vendor[];
  onSelectVendorForKyc?: (vendor: Vendor) => void;
}

export const KycView: React.FC<KycViewProps> = ({ vendor, onUpdateVendor, userRole, setIsSidebarOpen, allVendors = [], onSelectVendorForKyc }) => {
  const [kycForm, setKycForm] = useState<KycDocuments>(vendor.kycDocuments || {
    businessName: vendor.brandName || vendor.name || '',
    bankName: vendor.bankDetails?.bankName || '',
    accountNumber: vendor.bankDetails?.accountNumber || '',
    accountName: vendor.bankDetails?.accountName || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState(vendor.kycDocuments?.adminNote || '');

  useEffect(() => {
    setKycForm(vendor.kycDocuments || {
      businessName: vendor.brandName || vendor.name || '',
      bankName: vendor.bankDetails?.bankName || '',
      accountNumber: vendor.bankDetails?.accountNumber || '',
      accountName: vendor.bankDetails?.accountName || ''
    });
    setAdminNoteInput(vendor.kycDocuments?.adminNote || '');
  }, [vendor]);

  // File Input Refs
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const proofAddressRef = useRef<HTMLInputElement>(null);
  const busRegRef = useRef<HTMLInputElement>(null);

  // Read local file as base64 DataURL for real document persistence
  const handleFileUpload = (field: keyof KycDocuments, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setKycForm(prev => ({
        ...prev,
        [field]: dataUrl
      }));
      setMsg({ type: 'success', text: `Attached document for ${field.replace(/([A-Z])/g, ' $1')}.` });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveKyc = async () => {
    // Validation check
    if (!kycForm.idFront || !kycForm.proofOfAddress) {
      setMsg({ type: 'error', text: 'Please upload at least Government ID Front and Proof of Address before submitting.' });
      return;
    }

    setIsSaving(true);
    setMsg(null);

    try {
      const updatedKyc: KycDocuments = {
        ...kycForm,
        submittedAt: new Date().toISOString()
      };

      const updatedVendor: Vendor = {
        ...vendor,
        kycDocuments: updatedKyc,
        verificationStatus: 'PENDING',
        bankDetails: {
          ...vendor.bankDetails,
          bankName: kycForm.bankName || vendor.bankDetails?.bankName,
          accountNumber: kycForm.accountNumber || vendor.bankDetails?.accountNumber,
          accountName: kycForm.accountName || vendor.bankDetails?.accountName
        }
      };

      await onUpdateVendor(updatedVendor);
      setMsg({ type: 'success', text: '🎉 Your KYC Verification documents have been submitted successfully! Platform admins will review within 24 hours.' });
    } catch (e: any) {
      setMsg({ type: 'error', text: 'Failed to submit KYC: ' + e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminVerify = async (newStatus: 'VERIFIED' | 'REJECTED') => {
    setIsSaving(true);
    try {
      const updatedVendor: Vendor = {
        ...vendor,
        verificationStatus: newStatus,
        approvalStatus: newStatus === 'VERIFIED' ? 'APPROVED' : 'REJECTED',
        subscriptionStatus: newStatus === 'VERIFIED' ? 'ACTIVE' : vendor.subscriptionStatus,
        kycDocuments: {
          ...vendor.kycDocuments,
          reviewedAt: new Date().toISOString(),
          adminNote: adminNoteInput || (newStatus === 'VERIFIED' ? 'Directly verified by Platform Admin (Manual Override)' : 'Rejected by Platform Admin')
        }
      };
      await onUpdateVendor(updatedVendor);
      setMsg({ type: 'success', text: `🎉 Vendor ${vendor.name || vendor.brandName} verification status updated to ${newStatus} with store access granted!` });
    } catch (e: any) {
      setMsg({ type: 'error', text: 'Failed to update status: ' + e.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Compute completion score
  const docCount = [kycForm.idFront, kycForm.idBack, kycForm.proofOfAddress, kycForm.businessRegistrationDoc].filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((docCount / 3) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Admin Vendor Selector */}
      {userRole === UserRole.ADMIN && allVendors.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck size={18} className="text-amber-600" /> Admin Inspection: Select Vendor Atelier
          </div>
          <select
            value={vendor.id}
            onChange={(e) => {
              const selected = allVendors.find(v => v.id === e.target.value);
              if (selected && onSelectVendorForKyc) {
                onSelectVendorForKyc(selected);
              }
            }}
            className="bg-white border border-amber-300 rounded px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-black cursor-pointer shadow-xs"
          >
            {allVendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.email || 'No email'}) — Status: {v.verificationStatus || 'NOT SUBMITTED'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-luxury-black text-luxury-gold rounded-xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif italic text-luxury-black">Atelier KYC Identity Verification</h2>
              <p className="text-xs text-gray-500 mt-0.5">Submit legal business credentials & official government ID for payout clearance.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-2 ${
            vendor.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            vendor.verificationStatus === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-red-50 text-red-800 border-red-200'
          }`}>
            {vendor.verificationStatus === 'VERIFIED' && <CheckCircle size={16} className="text-emerald-600" />}
            {vendor.verificationStatus === 'PENDING' && <Clock size={16} className="text-amber-600 animate-spin" />}
            {vendor.verificationStatus === 'REJECTED' && <AlertTriangle size={16} className="text-red-600" />}
            {(!vendor.verificationStatus || vendor.verificationStatus === ('NOT_SUBMITTED' as any)) && <AlertCircle size={16} className="text-gray-600" />}
            {vendor.verificationStatus || 'NOT SUBMITTED'}
          </span>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-sm text-xs font-bold transition-all ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Admin Review Note Callout if Rejected */}
      {vendor.verificationStatus === 'REJECTED' && vendor.kycDocuments?.adminNote && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={16} /> Admin Rejection Note:
          </div>
          <p className="text-xs text-red-700 font-medium italic">"{vendor.kycDocuments.adminNote}"</p>
          <p className="text-[11px] text-red-600">Please re-upload updated documents below and click "Re-Submit KYC Verification".</p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white p-6 rounded-sm shadow-xs border border-gray-100 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <span className="text-gray-600 flex items-center gap-1.5"><FileText size={14} className="text-luxury-gold" /> Verification Progress</span>
          <span className="text-luxury-black font-mono">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-luxury-gold transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* ADMIN VERIFICATION OVERRIDE (FOR ADMIN USERS) */}
      {userRole === UserRole.ADMIN && (
        <div className="bg-gradient-to-r from-luxury-black via-gray-900 to-black text-white p-6 rounded-sm border border-luxury-gold/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-luxury-gold font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={18} /> Admin Direct KYC Decision & Override
            </div>
            <span className="text-[10px] text-gray-300 font-normal italic">
              Inspecting: <strong className="text-luxury-gold font-bold">{vendor.name || vendor.brandName}</strong> ({vendor.email})
            </span>
          </div>

          <div className="bg-luxury-gold/10 border border-luxury-gold/20 p-3 rounded-xs text-[11px] text-gray-300">
            💡 <strong>Admin Power Override:</strong> As platform admin, you can personally verify and grant store approval to this vendor even if they have not applied or submitted KYC documents yet.
          </div>

          <div className="space-y-3">
            <label className="text-xs text-gray-300 font-bold block">Admin Review Note / Decision Audit Log:</label>
            <textarea
              rows={2}
              value={adminNoteInput}
              onChange={e => setAdminNoteInput(e.target.value)}
              placeholder="e.g. Manually verified business credentials and approved store access."
              className="w-full bg-white/10 border border-white/20 rounded-xs p-2 text-xs text-white placeholder-gray-400 outline-none focus:border-luxury-gold"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleAdminVerify('VERIFIED')}
                disabled={isSaving}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <Check size={14} /> Directly Verify & Approve KYC
              </button>
              <button
                onClick={() => handleAdminVerify('REJECTED')}
                disabled={isSaving}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <X size={14} /> Decline / Revoke Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: LEGAL BUSINESS DETAILS */}
      <div className="bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-gray-50 text-luxury-black rounded-xs">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-base font-serif italic text-luxury-black">1. Legal Entity & Registration Information</h3>
            <p className="text-xs text-gray-400">Provide official registered business details as listed in your tax records.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Legal Registered Business / Brand Name *</label>
            <input
              type="text"
              value={kycForm.businessName || ''}
              onChange={e => setKycForm({ ...kycForm, businessName: e.target.value })}
              placeholder="e.g. Maison de Luxe LLC"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">CAC / Registration Number *</label>
            <input
              type="text"
              value={kycForm.registrationNumber || ''}
              onChange={e => setKycForm({ ...kycForm, registrationNumber: e.target.value })}
              placeholder="e.g. RC-10928374"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Tax Identification Number (TIN / VAT)</label>
            <input
              type="text"
              value={kycForm.taxId || ''}
              onChange={e => setKycForm({ ...kycForm, taxId: e.target.value })}
              placeholder="e.g. TIN-9920193"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Official Contact Phone Number</label>
            <input
              type="text"
              value={kycForm.phone || ''}
              onChange={e => setKycForm({ ...kycForm, phone: e.target.value })}
              placeholder="e.g. +1 (555) 019-2831"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Registered Physical Business Address</label>
            <input
              type="text"
              value={kycForm.businessAddress || ''}
              onChange={e => setKycForm({ ...kycForm, businessAddress: e.target.value })}
              placeholder="Street Address, City, State, Country"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: OFFICIAL IDENTITY DOCUMENTS UPLOAD */}
      <div className="bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-gray-50 text-luxury-black rounded-xs">
            <Upload size={18} />
          </div>
          <div>
            <h3 className="text-base font-serif italic text-luxury-black">2. Official Identity & Registration Documents</h3>
            <p className="text-xs text-gray-400">Upload clear high-resolution scans or photos (PNG, JPG, or PDF).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Document 1: ID Front */}
          <div className="border border-gray-200 rounded-sm p-4 space-y-3 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-luxury-black">Govt ID / Passport (Front) *</span>
                {kycForm.idFront && <CheckCircle size={14} className="text-emerald-600" />}
              </div>
              <p className="text-[10px] text-gray-400 mb-3">Front photo of International Passport, Driver's License, or National ID.</p>
            </div>

            {kycForm.idFront ? (
              <div className="space-y-2">
                <div className="h-28 bg-gray-200 rounded overflow-hidden relative group border">
                  <img src={kycForm.idFront} alt="ID Front" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ title: 'Govt ID Front', url: kycForm.idFront! })}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-bold uppercase"
                  >
                    <Eye size={14} /> Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => idFrontRef.current?.click()}
                  className="w-full py-1.5 text-[10px] uppercase font-bold text-luxury-gold bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                  Change File
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => idFrontRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-luxury-gold rounded flex flex-col items-center justify-center p-3 text-center transition-colors bg-white"
              >
                <Upload size={20} className="text-gray-400 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold">Upload Front ID</span>
              </button>
            )}
            <input ref={idFrontRef} type="file" accept="image/*,.pdf" onChange={e => handleFileUpload('idFront', e.target.files?.[0] || null)} className="hidden" />
          </div>

          {/* Document 2: ID Back */}
          <div className="border border-gray-200 rounded-sm p-4 space-y-3 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-luxury-black">Govt ID (Back)</span>
                {kycForm.idBack && <CheckCircle size={14} className="text-emerald-600" />}
              </div>
              <p className="text-[10px] text-gray-400 mb-3">Back photo of Driver's License or National ID card.</p>
            </div>

            {kycForm.idBack ? (
              <div className="space-y-2">
                <div className="h-28 bg-gray-200 rounded overflow-hidden relative group border">
                  <img src={kycForm.idBack} alt="ID Back" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ title: 'Govt ID Back', url: kycForm.idBack! })}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-bold uppercase"
                  >
                    <Eye size={14} /> Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => idBackRef.current?.click()}
                  className="w-full py-1.5 text-[10px] uppercase font-bold text-luxury-gold bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                  Change File
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => idBackRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-luxury-gold rounded flex flex-col items-center justify-center p-3 text-center transition-colors bg-white"
              >
                <Upload size={20} className="text-gray-400 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold">Upload Back ID</span>
              </button>
            )}
            <input ref={idBackRef} type="file" accept="image/*,.pdf" onChange={e => handleFileUpload('idBack', e.target.files?.[0] || null)} className="hidden" />
          </div>

          {/* Document 3: Proof of Address */}
          <div className="border border-gray-200 rounded-sm p-4 space-y-3 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-luxury-black">Proof of Address *</span>
                {kycForm.proofOfAddress && <CheckCircle size={14} className="text-emerald-600" />}
              </div>
              <p className="text-[10px] text-gray-400 mb-3">Utility bill or bank statement issued within the last 3 months.</p>
            </div>

            {kycForm.proofOfAddress ? (
              <div className="space-y-2">
                <div className="h-28 bg-gray-200 rounded overflow-hidden relative group border flex items-center justify-center">
                  {kycForm.proofOfAddress.startsWith('data:image') ? (
                    <img src={kycForm.proofOfAddress} alt="Proof of Address" className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={32} className="text-gray-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ title: 'Proof of Address', url: kycForm.proofOfAddress! })}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-bold uppercase"
                  >
                    <Eye size={14} /> Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => proofAddressRef.current?.click()}
                  className="w-full py-1.5 text-[10px] uppercase font-bold text-luxury-gold bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                  Change File
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => proofAddressRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-luxury-gold rounded flex flex-col items-center justify-center p-3 text-center transition-colors bg-white"
              >
                <Upload size={20} className="text-gray-400 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold">Upload Utility Bill</span>
              </button>
            )}
            <input ref={proofAddressRef} type="file" accept="image/*,.pdf" onChange={e => handleFileUpload('proofOfAddress', e.target.files?.[0] || null)} className="hidden" />
          </div>

          {/* Document 4: CAC / Business Cert */}
          <div className="border border-gray-200 rounded-sm p-4 space-y-3 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-luxury-black">CAC / Business Cert</span>
                {kycForm.businessRegistrationDoc && <CheckCircle size={14} className="text-emerald-600" />}
              </div>
              <p className="text-[10px] text-gray-400 mb-3">Certificate of Incorporation or Business Registration license.</p>
            </div>

            {kycForm.businessRegistrationDoc ? (
              <div className="space-y-2">
                <div className="h-28 bg-gray-200 rounded overflow-hidden relative group border flex items-center justify-center">
                  {kycForm.businessRegistrationDoc.startsWith('data:image') ? (
                    <img src={kycForm.businessRegistrationDoc} alt="Business Certificate" className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={32} className="text-gray-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ title: 'Business Registration Cert', url: kycForm.businessRegistrationDoc! })}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-bold uppercase"
                  >
                    <Eye size={14} /> Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => busRegRef.current?.click()}
                  className="w-full py-1.5 text-[10px] uppercase font-bold text-luxury-gold bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                  Change File
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => busRegRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-luxury-gold rounded flex flex-col items-center justify-center p-3 text-center transition-colors bg-white"
              >
                <Upload size={20} className="text-gray-400 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold">Upload CAC Cert</span>
              </button>
            )}
            <input ref={busRegRef} type="file" accept="image/*,.pdf" onChange={e => handleFileUpload('businessRegistrationDoc', e.target.files?.[0] || null)} className="hidden" />
          </div>
        </div>
      </div>

      {/* SECTION 3: BANK ACCOUNT PAYOUT MATCH */}
      <div className="bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-gray-50 text-luxury-black rounded-xs">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="text-base font-serif italic text-luxury-black">3. Payout Bank Account Verification</h3>
            <p className="text-xs text-gray-400">Ensure account name matches your registered identity to avoid payout holds.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Bank Name</label>
            <input
              type="text"
              value={kycForm.bankName || ''}
              onChange={e => setKycForm({ ...kycForm, bankName: e.target.value })}
              placeholder="e.g. Chase Bank / GTBank / Access"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Account Number</label>
            <input
              type="text"
              value={kycForm.accountNumber || ''}
              onChange={e => setKycForm({ ...kycForm, accountNumber: e.target.value })}
              placeholder="e.g. 0123456789"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Account Name</label>
            <input
              type="text"
              value={kycForm.accountName || ''}
              onChange={e => setKycForm({ ...kycForm, accountName: e.target.value })}
              placeholder="Account holder name"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-xs text-luxury-black font-medium outline-none focus:border-luxury-gold"
            />
          </div>
        </div>
      </div>

      {/* SUBMISSION SUBMIT BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-50 rounded-sm border border-gray-200">
        <div className="text-xs text-gray-500">
          <span className="font-bold text-luxury-black block">Encrypted Data Transmission</span>
          All submitted identity documents are encrypted and accessible exclusively by verified platform compliance admins.
        </div>

        <button
          onClick={handleSaveKyc}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 bg-luxury-black text-white hover:bg-luxury-gold transition-colors text-xs font-bold uppercase tracking-widest rounded-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
          {vendor.verificationStatus === 'REJECTED' ? 'Re-Submit KYC Verification' : 'Submit KYC for Verification'}
        </button>
      </div>

      {/* DOCUMENT FULLSCREEN PREVIEW MODAL */}
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
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
