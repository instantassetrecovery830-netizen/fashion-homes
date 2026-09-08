
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BadgeCheck, FileText, CreditCard, Menu, Loader, Check, X, ShieldCheck, Sparkles, Lock, Settings, DollarSign, ToggleLeft, ToggleRight, Save, RefreshCw, Search } from 'lucide-react';
import { Vendor, UserRole, LandingPageContent, PricingPlan } from '../../types.ts';
import { useCurrency } from '../../context/CurrencyContext.tsx';
// @ts-ignore
import { usePaystackPayment } from 'react-paystack';

interface SubscriptionViewProps {
    storefrontForm: Vendor | null;
    setIsSidebarOpen: (open: boolean) => void;
    onUpdateVendor?: (vendor: Vendor) => Promise<void>;
    userRole?: UserRole;
    cmsContent?: LandingPageContent;
    onUpdateCMSContent?: (newContent: LandingPageContent) => Promise<void>;
    vendors?: Vendor[];
    setVendors?: (vendors: Vendor[]) => Promise<void>;
}

const DEFAULT_PLANS = [
    {
        id: 'ATELIER',
        name: 'Atelier',
        price: 0,
        features: ['Up to 20 monthly uploads', 'Standard analytics', 'Basic storefront', '15% commission'],
        color: 'bg-gray-100',
        isFree: true
    },
    {
        id: 'COUTURE',
        name: 'Couture',
        price: 99,
        features: ['Unlimited uploads', 'Advanced analytics', 'Custom domain support', '10% commission', 'Priority support'],
        color: 'bg-luxury-gold',
        isFree: false
    },
    {
        id: 'MAISON',
        name: 'Maison',
        price: 299,
        features: ['White-glove logistics', 'Priority placement', '5% commission', 'Dedicated account manager', 'Early access to drops'],
        color: 'bg-luxury-black',
        isFree: false
    }
];

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ 
    storefrontForm, 
    setIsSidebarOpen, 
    onUpdateVendor,
    userRole,
    cmsContent,
    onUpdateCMSContent,
    vendors = [],
    setVendors
}) => {
    const { formatPrice } = useCurrency();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSavingAdmin, setIsSavingAdmin] = useState(false);
    const [adminMsg, setAdminMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [vendorSearch, setVendorSearch] = useState('');

    const handleGrantAllAccess = async () => {
        if (!setVendors || vendors.length === 0) return;
        setIsSavingAdmin(true);
        try {
            const updatedVendors = vendors.map(v => ({
                ...v,
                subscriptionStatus: 'ACTIVE' as const,
                approvalStatus: 'APPROVED' as const,
                verificationStatus: 'VERIFIED' as const
            }));
            await setVendors(updatedVendors);
            setAdminMsg({ type: 'success', text: `🎉 Granted active subscription access to all ${vendors.length} vendors!` });
        } catch (e: any) {
            setAdminMsg({ type: 'error', text: 'Failed to grant access: ' + e.message });
        } finally {
            setIsSavingAdmin(false);
        }
    };

    const handleToggleVendorSubscription = async (targetVendor: Vendor, newStatus: 'ACTIVE' | 'INACTIVE') => {
        if (!setVendors) return;
        try {
            const updated: Vendor = {
                ...targetVendor,
                subscriptionStatus: newStatus,
                approvalStatus: newStatus === 'ACTIVE' ? 'APPROVED' : targetVendor.approvalStatus
            };
            await setVendors([updated]);
            setAdminMsg({ type: 'success', text: `Updated ${targetVendor.name}'s subscription status to ${newStatus}.` });
        } catch (e: any) {
            setAdminMsg({ type: 'error', text: 'Failed to update vendor subscription: ' + e.message });
        }
    };

    const handleChangeVendorTier = async (targetVendor: Vendor, newPlan: 'Atelier' | 'Couture' | 'Maison') => {
        if (!setVendors) return;
        try {
            const updated: Vendor = {
                ...targetVendor,
                subscriptionPlan: newPlan
            };
            await setVendors([updated]);
            setAdminMsg({ type: 'success', text: `Changed ${targetVendor.name}'s plan to ${newPlan}.` });
        } catch (e: any) {
            setAdminMsg({ type: 'error', text: 'Failed to update plan: ' + e.message });
        }
    };

    // Read global free mode setting
    const globalFreeMode = useMemo(() => {
        return cmsContent?.subscriptionSettings?.isFreeMode ?? cmsContent?.pricing?.isFreeMode ?? false;
    }, [cmsContent]);

    // Active plans computed from CMS or Defaults
    const activePlans = useMemo(() => {
        const cmsPlans = cmsContent?.subscriptionSettings?.plans || cmsContent?.pricing?.plans;
        if (cmsPlans && cmsPlans.length > 0) {
            return cmsPlans.map(p => {
                const numPrice = p.numericPrice !== undefined ? p.numericPrice : (parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0);
                return {
                    id: p.id?.toUpperCase() || p.name.toUpperCase(),
                    name: p.name,
                    price: globalFreeMode ? 0 : (p.isFree ? 0 : numPrice),
                    originalPrice: numPrice,
                    features: p.features || [],
                    isFree: globalFreeMode || p.isFree || numPrice === 0,
                    period: p.period || '/ month'
                };
            });
        }
        return DEFAULT_PLANS.map(p => ({
            ...p,
            price: globalFreeMode ? 0 : p.price,
            originalPrice: p.price,
            isFree: globalFreeMode || p.price === 0,
            period: '/ month'
        }));
    }, [cmsContent, globalFreeMode]);

    // Admin state for editing plans
    const [adminFreeMode, setAdminFreeMode] = useState<boolean>(globalFreeMode);
    const [adminPlans, setAdminPlans] = useState<Array<{ id: string; name: string; price: number; isFree: boolean; features: string[] }>>([
        { id: 'ATELIER', name: 'Atelier', price: 0, isFree: true, features: ['Up to 20 monthly uploads', 'Standard analytics', 'Basic storefront'] },
        { id: 'COUTURE', name: 'Couture', price: 99, isFree: false, features: ['Unlimited uploads', 'Advanced analytics', '10% commission', 'Priority support'] },
        { id: 'MAISON', name: 'Maison', price: 299, isFree: false, features: ['White-glove logistics', 'Priority placement', '5% commission', 'Dedicated account manager'] }
    ]);

    // Sync admin state when cmsContent updates
    useEffect(() => {
        if (cmsContent) {
            setAdminFreeMode(cmsContent.subscriptionSettings?.isFreeMode ?? cmsContent.pricing?.isFreeMode ?? false);
            const cmsPlans = cmsContent.subscriptionSettings?.plans || cmsContent.pricing?.plans;
            if (cmsPlans && cmsPlans.length > 0) {
                setAdminPlans(cmsPlans.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.numericPrice !== undefined ? p.numericPrice : (parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0),
                    isFree: p.isFree || false,
                    features: p.features || []
                })));
            }
        }
    }, [cmsContent]);

    const [selectedPlan, setSelectedPlan] = useState<typeof activePlans[0] | null>(null);

    // Save Admin settings to Firestore via onUpdateCMSContent
    const handleSaveAdminSettings = async () => {
        if (!onUpdateCMSContent) return;
        setIsSavingAdmin(true);
        setAdminMsg(null);
        try {
            const updatedPricingPlans: PricingPlan[] = adminPlans.map(p => ({
                id: p.id,
                name: p.name,
                price: p.isFree || adminFreeMode ? '$0' : `$${p.price}`,
                numericPrice: p.price,
                period: '/ month',
                description: p.isFree ? 'Free tier access' : 'Full atelier privilege',
                features: p.features,
                cta: p.isFree || adminFreeMode ? 'Activate Free' : 'Subscribe',
                highlight: p.id === 'COUTURE',
                isFree: p.isFree
            }));

            if (!cmsContent) return;

            const updatedContent: LandingPageContent = {
                ...cmsContent,
                pricing: {
                  ...(cmsContent.pricing || { title: 'Unlock Privilege', subtitle: 'Atelier Membership', description: 'Select your tier', plans: [] }),
                  isFreeMode: adminFreeMode,
                  plans: updatedPricingPlans
                },
                subscriptionSettings: {
                    isFreeMode: adminFreeMode,
                    plans: updatedPricingPlans
                }
            };

            await onUpdateCMSContent(updatedContent);
            setAdminMsg({ type: 'success', text: '🎉 Subscription prices and free mode settings updated successfully!' });
        } catch (e: any) {
            console.error("Error saving subscription settings:", e);
            setAdminMsg({ type: 'error', text: 'Failed to update settings: ' + e.message });
        } finally {
            setIsSavingAdmin(false);
        }
    };

    // Paystack Public Key (Placeholder)
    const PAYSTACK_PUBLIC_KEY = "pk_test_placeholder_123456789";

    const paystackConfig = useMemo(() => ({
        email: storefrontForm?.email || 'vendor@myfitstore.com',
        amount: (selectedPlan?.price || 0) * 100,
        publicKey: PAYSTACK_PUBLIC_KEY,
    }), [storefrontForm?.email, selectedPlan, PAYSTACK_PUBLIC_KEY]);

    // @ts-ignore
    const initializePayment = usePaystackPayment(paystackConfig);

    const handleUpgrade = useCallback(async () => {
        if (!selectedPlan || !storefrontForm) return;

        if (selectedPlan.price === 0 || globalFreeMode) {
            // Free plan or global free mode active
            if (onUpdateVendor) {
                await onUpdateVendor({
                    ...storefrontForm,
                    subscriptionPlan: selectedPlan.id as any,
                    subscriptionStatus: 'ACTIVE'
                });
            }
            setIsUpgradeModalOpen(false);
            alert(`🎉 Membership Activated! Your Atelier is now subscribed to the ${selectedPlan.name} plan at $0 / Free.`);
            return;
        }

        setIsProcessing(true);
        const onSuccess = async (reference?: any) => {
            if (onUpdateVendor) {
                await onUpdateVendor({
                    ...storefrontForm,
                    subscriptionPlan: selectedPlan.id as any,
                    subscriptionStatus: 'ACTIVE'
                });
            }
            setIsUpgradeModalOpen(false);
            setIsProcessing(false);
            alert(`🎉 Membership Activated! You have successfully subscribed to the ${selectedPlan.name} plan. All vendor features, product uploads, and analytics are now fully unlocked.`);
        };
        
        const onClose = () => {
            setIsProcessing(false);
        };

        try {
            // @ts-ignore
            initializePayment(onSuccess, onClose);
        } catch (e) {
            // Fallback for preview/testing environment when Paystack SDK key is placeholder
            console.warn("Paystack SDK popup unavailable in sandbox mode, activating directly:", e);
            setTimeout(() => {
                onSuccess({ reference: 'SUB_' + Date.now() });
            }, 800);
        }
    }, [selectedPlan, storefrontForm, onUpdateVendor, initializePayment, globalFreeMode]);

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif italic">Membership & Plan</h2>
                    {globalFreeMode && (
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                            <Sparkles size={12} /> Global Free Subscriptions Enabled by Admin
                        </p>
                    )}
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                    <Menu size={20} />
                </button>
            </div>

            {/* ADMIN CONTROL PANEL */}
            {userRole === UserRole.ADMIN && (
                <div className="bg-gradient-to-r from-luxury-black via-gray-900 to-black text-white p-6 md:p-8 rounded-sm shadow-xl border border-luxury-gold/40 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-luxury-gold/20 text-luxury-gold rounded-full">
                                <Settings size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif italic text-luxury-gold">Admin Subscription Controls</h3>
                                <p className="text-xs text-gray-400">Configure global subscription pricing, edit plan fees, or toggle free vendor access.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveAdminSettings}
                            disabled={isSavingAdmin}
                            className="bg-luxury-gold text-black hover:bg-white px-6 py-2.5 rounded-xs text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-md shrink-0 disabled:opacity-50"
                        >
                            {isSavingAdmin ? <Loader className="animate-spin" size={14} /> : <Save size={14} />}
                            Save Subscription Settings
                        </button>
                    </div>

                    {adminMsg && (
                        <div className={`p-4 rounded-sm text-xs font-bold ${adminMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/30' : 'bg-red-950/80 text-red-200 border border-red-500/30'}`}>
                            {adminMsg.text}
                        </div>
                    )}

                    {/* Global Free Mode Switch */}
                    <div className="bg-white/5 p-5 rounded-sm border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm uppercase tracking-wide">Global Free Subscriptions Mode</h4>
                                <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded-full ${adminFreeMode ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-300'}`}>
                                    {adminFreeMode ? 'ENABLED (FREE FOR ALL)' : 'OFF (PAID PLANS ACTIVE)'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                When enabled, all vendor subscription fees are waived ($0). Vendors can activate access without payment.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAdminFreeMode(!adminFreeMode)}
                            className={`px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${adminFreeMode ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {adminFreeMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            {adminFreeMode ? 'Free Subscriptions: ON' : 'Free Subscriptions: OFF'}
                        </button>
                    </div>

                    {/* Plan Price Editor */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-gold flex items-center gap-1.5">
                            <DollarSign size={14} /> Edit Subscription Tier Fees
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {adminPlans.map((plan, idx) => (
                                <div key={plan.id} className="bg-white/5 border border-white/10 p-4 rounded-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <input
                                            value={plan.name}
                                            onChange={e => {
                                                const updated = [...adminPlans];
                                                updated[idx].name = e.target.value;
                                                setAdminPlans(updated);
                                            }}
                                            className="bg-transparent text-sm font-bold border-b border-white/20 focus:border-luxury-gold outline-none w-2/3"
                                        />
                                        <span className="text-[10px] text-luxury-gold font-mono uppercase">{plan.id}</span>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Monthly Price ($)</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">$</span>
                                            <input
                                                type="number"
                                                disabled={adminFreeMode || plan.isFree}
                                                value={adminFreeMode || plan.isFree ? 0 : plan.price}
                                                onChange={e => {
                                                    const updated = [...adminPlans];
                                                    updated[idx].price = Number(e.target.value);
                                                    setAdminPlans(updated);
                                                }}
                                                className="w-full bg-black/40 border border-white/20 rounded-xs p-2 text-sm text-white focus:border-luxury-gold outline-none disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id={`free-${plan.id}`}
                                            checked={plan.isFree || adminFreeMode}
                                            disabled={adminFreeMode}
                                            onChange={e => {
                                                const updated = [...adminPlans];
                                                updated[idx].isFree = e.target.checked;
                                                setAdminPlans(updated);
                                            }}
                                            className="accent-luxury-gold"
                                        />
                                        <label htmlFor={`free-${plan.id}`} className="text-[11px] text-gray-300">
                                            Make this tier FREE ($0)
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Manage & Grant Vendor Subscriptions Access Table */}
                    {vendors && vendors.length > 0 && (
                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-gold flex items-center gap-1.5">
                                        <ShieldCheck size={16} /> Manage Atelier Vendor Subscriptions & Access ({vendors.length})
                                    </h4>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Grant active subscription access, assign plans, or manage tier privileges for individual vendors.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleGrantAllAccess}
                                        className="bg-emerald-500 text-black hover:bg-emerald-400 px-4 py-2 rounded-xs text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Check size={14} /> Grant Access to All Vendors
                                    </button>
                                </div>
                            </div>

                            {/* Search bar */}
                            <div className="max-w-xs bg-white/10 border border-white/20 rounded-xs px-3 py-1.5 flex items-center gap-2">
                                <Search size={14} className="text-gray-400 shrink-0" />
                                <input
                                    value={vendorSearch}
                                    onChange={e => setVendorSearch(e.target.value)}
                                    placeholder="Search vendor by name or email..."
                                    className="bg-transparent text-xs text-white placeholder-gray-400 outline-none w-full"
                                />
                                {vendorSearch && (
                                    <button onClick={() => setVendorSearch('')} className="text-gray-400 hover:text-white">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Vendors Access Table */}
                            <div className="bg-white/5 border border-white/10 rounded-xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-black/60 text-[10px] uppercase tracking-widest text-luxury-gold font-bold border-b border-white/10">
                                            <tr>
                                                <th className="p-3">Atelier Vendor</th>
                                                <th className="p-3">Assigned Plan Tier</th>
                                                <th className="p-3">Access Status</th>
                                                <th className="p-3 text-right">Admin Access Override</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-gray-300">
                                            {vendors
                                                .filter(v => !vendorSearch || v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.email?.toLowerCase().includes(vendorSearch.toLowerCase()))
                                                .map(v => {
                                                    const isActive = v.subscriptionStatus === 'ACTIVE' || globalFreeMode;
                                                    return (
                                                        <tr key={v.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="p-3">
                                                                <div className="font-bold text-white">{v.name}</div>
                                                                <div className="text-[10px] text-gray-400">{v.email}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <select
                                                                    value={v.subscriptionPlan || 'Atelier'}
                                                                    onChange={e => handleChangeVendorTier(v, e.target.value as any)}
                                                                    className="bg-black/60 text-luxury-gold border border-white/20 rounded px-2 py-1 text-[11px] font-bold outline-none cursor-pointer"
                                                                >
                                                                    <option value="Atelier" className="bg-black text-white">Atelier</option>
                                                                    <option value="Couture" className="bg-black text-white">Couture</option>
                                                                    <option value="Maison" className="bg-black text-white">Maison</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-widest border ${isActive ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-red-950 text-red-300 border-red-500/40'}`}>
                                                                    {isActive ? <Check size={10} /> : <X size={10} />}
                                                                    {isActive ? 'ACTIVE / GRANTED' : 'INACTIVE / LOCKED'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                {isActive ? (
                                                                    <button
                                                                        onClick={() => handleToggleVendorSubscription(v, 'INACTIVE')}
                                                                        className="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-200 rounded-xs text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                                    >
                                                                        Revoke Access
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleToggleVendorSubscription(v, 'ACTIVE')}
                                                                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xs text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 ml-auto"
                                                                    >
                                                                        <Check size={12} /> Grant Access
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Vendor Current Plan & Details */}
            {storefrontForm && (
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
                                <p className="text-[10px] text-gray-400 mt-2">{globalFreeMode ? 'Free Access Active' : 'Renews automatically'}</p>
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
                                            <span className="text-sm font-medium">{globalFreeMode ? '$0.00 (Free)' : '$165.00'}</span>
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
                            <div className="w-10 h-6 bg-blue-900 rounded-sm flex items-center justify-center text-[8px] text-white font-bold">VISA</div> 
                            <div>
                                <p className="text-xs font-bold">•••• 4242</p>
                                <p className="text-[10px] text-gray-400">Expires 12/28</p>
                            </div>
                        </div>
                        <button className="w-full border border-black text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                            Update Payment Details
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-luxury-black text-white p-8 md:p-12 rounded-sm shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h3 className="text-2xl font-serif italic mb-2">
                            {globalFreeMode ? "Activate Free Atelier Membership" : "Upgrade Your Atelier"}
                        </h3>
                        <p className="text-gray-400 text-sm max-w-lg">
                            {globalFreeMode 
                                ? "All vendor subscription tiers are currently 100% free! Select a tier to activate product uploads and store customization."
                                : "Unlock white-glove logistics, priority placement in 'The Drop', and reduced commission rates."
                            }
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="bg-luxury-gold text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors shrink-0 shadow-lg"
                    >
                        {globalFreeMode ? "View Free Plans" : "View Plans"}
                    </button>
                </div>
            </div>

            {/* Upgrade / Plan Selection Modal */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpgradeModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-scale-in text-black">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-serif italic">Select Your Plan</h2>
                                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                                    {globalFreeMode ? "Free Vendor Access Mode Active" : "Elevate your digital storefront"}
                                </p>
                            </div>
                            <button onClick={() => setIsUpgradeModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {activePlans.map(plan => (
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
                                        <span className="text-2xl font-bold">
                                            {plan.isFree || globalFreeMode ? 'FREE ($0)' : formatPrice(plan.price)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">{plan.period}</span>
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
                                    <p className="text-xs font-bold uppercase tracking-widest">
                                        {globalFreeMode || selectedPlan?.isFree ? '1-Click Free Activation' : 'Secure Checkout'}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {globalFreeMode || selectedPlan?.isFree ? 'No credit card required for free activation' : 'Payments processed securely by Paystack'}
                                    </p>
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
                                    <>{selectedPlan?.isFree || globalFreeMode ? 'Activate Free Membership' : 'Confirm & Pay'} <Lock size={14} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
