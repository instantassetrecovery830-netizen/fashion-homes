
import React, { useState, useMemo, useCallback } from 'react';
import { BadgeCheck, FileText, CreditCard, Menu, Loader, Check, X, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { Vendor } from '../../types.ts';
// @ts-ignore
import { usePaystackPayment } from 'react-paystack';

interface SubscriptionViewProps {
    storefrontForm: Vendor | null;
    setIsSidebarOpen: (open: boolean) => void;
    onUpdateVendor?: (vendor: Vendor) => Promise<void>;
}

const PLANS = [
    {
        id: 'ATELIER',
        name: 'Atelier',
        price: 0,
        features: ['Up to 20 monthly uploads', 'Standard analytics', 'Basic storefront', '15% commission'],
        color: 'bg-gray-100'
    },
    {
        id: 'COUTURE',
        name: 'Couture',
        price: 99,
        features: ['Unlimited uploads', 'Advanced analytics', 'Custom domain support', '10% commission', 'Priority support'],
        color: 'bg-luxury-gold'
    },
    {
        id: 'MAISON',
        name: 'Maison',
        price: 299,
        features: ['White-glove logistics', 'Priority placement', '5% commission', 'Dedicated account manager', 'Early access to drops'],
        color: 'bg-luxury-black'
    }
];

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ storefrontForm, setIsSidebarOpen, onUpdateVendor }) => {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Paystack Public Key (Placeholder)
    const PAYSTACK_PUBLIC_KEY = "pk_test_placeholder_123456789";

    const paystackConfig = useMemo(() => ({
        email: storefrontForm?.email || '',
        amount: (selectedPlan?.price || 0) * 100,
        publicKey: PAYSTACK_PUBLIC_KEY,
    }), [storefrontForm?.email, selectedPlan, PAYSTACK_PUBLIC_KEY]);

    // @ts-ignore
    const initializePayment = usePaystackPayment(paystackConfig);

    const handleUpgrade = useCallback(async () => {
        if (!selectedPlan || !storefrontForm) return;

        if (selectedPlan.price === 0) {
            // Downgrade or stay on free
            if (onUpdateVendor) {
                await onUpdateVendor({
                    ...storefrontForm,
                    subscriptionPlan: selectedPlan.id as any,
                    subscriptionStatus: 'ACTIVE'
                });
            }
            setIsUpgradeModalOpen(false);
            return;
        }

        setIsProcessing(true);
        const onSuccess = (reference: any) => {
            if (onUpdateVendor) {
                onUpdateVendor({
                    ...storefrontForm,
                    subscriptionPlan: selectedPlan.id as any,
                    subscriptionStatus: 'ACTIVE'
                }).then(() => {
                    setIsUpgradeModalOpen(false);
                    setIsProcessing(false);
                    alert(`Successfully upgraded to ${selectedPlan.name}!`);
                });
            }
        };
        const onClose = () => {
            setIsProcessing(false);
        };
        // @ts-ignore
        initializePayment(onSuccess, onClose);
    }, [selectedPlan, storefrontForm, onUpdateVendor, initializePayment]);

    if (!storefrontForm) return <div className="p-8"><Loader className="animate-spin text-luxury-gold" /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">Membership & Plan</h2>
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                    <Menu size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm md:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                        <BadgeCheck size={14} /> Current Status
                    </h3>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-sm mb-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Plan</p>
                            <p className="text-2xl font-serif italic">{storefrontForm.subscriptionPlan || 'Atelier'}</p>
                        </div>
                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${storefrontForm.subscriptionStatus === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {storefrontForm.subscriptionStatus || 'Inactive'}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-2">Renews automatically</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wide">Billing History</h4>
                        <div className="border border-gray-100 rounded-sm overflow-hidden">
                            {[1, 2].map(i => (
                                <div key={i} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                            <FileText size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">Invoice #{2024000 + i}</p>
                                            <p className="text-[10px] text-gray-400">Oct {10 - i}, 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">$165.00</span>
                                        <button className="text-[10px] uppercase font-bold text-luxury-gold hover:underline">Download</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
                        <CreditCard size={14} /> Payment Method
                    </h3>
                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm mb-4">
                        <div className="w-10 h-6 bg-blue-900 rounded-sm" /> 
                        <div>
                            <p className="text-xs font-bold">•••• 4242</p>
                            <p className="text-[10px] text-gray-400">Expires 12/25</p>
                        </div>
                    </div>
                    <button className="w-full border border-black text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                        Update Card
                    </button>
                </div>
            </div>

            <div className="bg-luxury-black text-white p-8 md:p-12 rounded-sm shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h3 className="text-2xl font-serif italic mb-2">Upgrade Your Atelier</h3>
                        <p className="text-gray-400 text-sm max-w-lg">Unlock white-glove logistics, priority placement in "The Drop", and reduced commission rates.</p>
                    </div>
                    <button 
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="bg-luxury-gold text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                    >
                        View Plans
                    </button>
                </div>
            </div>

            {/* Upgrade Modal */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-scale-in text-black">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-serif italic">Select Your Plan</h2>
                                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Elevate your digital storefront</p>
                            </div>
                            <button onClick={() => setIsUpgradeModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {PLANS.map(plan => (
                                <div 
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`relative p-6 border transition-all cursor-pointer flex flex-col ${selectedPlan?.id === plan.id ? 'border-luxury-gold ring-1 ring-luxury-gold shadow-lg' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    {plan.id === 'COUTURE' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-luxury-gold text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                            Most Popular
                                        </div>
                                    )}
                                    <h3 className="text-lg font-serif italic mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-2xl font-bold">${plan.price}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">/ month</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest text-center transition-colors ${selectedPlan?.id === plan.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                                        {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="text-luxury-gold" size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest">Secure Checkout</p>
                                    <p className="text-[10px] text-gray-400">Payments processed securely by Paystack</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleUpgrade}
                                disabled={!selectedPlan || isProcessing}
                                className="w-full md:w-auto bg-luxury-black text-white px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>Processing <Loader className="animate-spin" size={14} /></>
                                ) : (
                                    <>Confirm & Pay <Lock size={14} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
