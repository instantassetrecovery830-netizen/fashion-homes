import React, { useState } from 'react';
import { Vendor, KycDocuments } from '../../types';
import { ShieldCheck, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface KycViewProps {
  vendor: Vendor;
  onUpdateVendor: (vendor: Vendor) => Promise<void>;
}

export const KycView: React.FC<KycViewProps> = ({ vendor, onUpdateVendor }) => {
  const [kycForm, setKycForm] = useState<KycDocuments>(vendor.kycDocuments || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (field: keyof KycDocuments, file: File | null) => {
    // In a real app, you would upload the file to a storage service here
    // For this prototype, we'll just store a dummy URL
    if (file) {
      setKycForm(prev => ({ ...prev, [field]: `https://example.com/uploads/${file.name}` }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateVendor({
      ...vendor,
      kycDocuments: { ...kycForm, submittedAt: new Date().toISOString() },
      verificationStatus: 'PENDING'
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif italic">KYC Verification</h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
          vendor.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-700' :
          vendor.verificationStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
          'bg-red-50 text-red-700'
        }`}>
          {vendor.verificationStatus === 'VERIFIED' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {vendor.verificationStatus || 'NOT SUBMITTED'}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
        <p className="text-sm text-gray-600">Please upload the required documents to verify your identity.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['idFront', 'idBack', 'proofOfAddress'] as const).map((field) => (
            <div key={field} className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors">
              <Upload className="text-gray-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{field.replace(/([A-Z])/g, ' $1')}</span>
              <input 
                type="file" 
                onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
                className="hidden"
                id={field}
              />
              <label htmlFor={field} className="cursor-pointer text-xs text-luxury-gold hover:underline">Upload</label>
              {kycForm[field] && <span className="text-xs text-green-600">File selected</span>}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-luxury-black text-white px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </div>
    </div>
  );
};
