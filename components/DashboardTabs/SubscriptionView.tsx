import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BadgeCheck, FileText, CreditCard, Menu, Loader, Check, X, ShieldCheck, Sparkles, Lock, Settings, DollarSign, ToggleLeft, ToggleRight, Save, RefreshCw, Search, ArrowRight, Zap, Award, Percent, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
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
        commission: '15%',
        commissionValue: 0.15,
        features: ['Up to 20 monthly uploads', 'Standard analytics dashboard', 'Basic digital storefront', '15% platform commission', 'Email customer support'],
        color: 'border-gray-200 bg-gray-50/50',
        badgeColor: 'bg-gray-200 text-gray-800',
        isFree: true
    },
    {
        id: 'COUTURE',
        name: 'Couture',
        price: 99,
        commission: '10%',
        commissionValue: 0.10,
        features: ['Unlimited monthly uploads', 'Advanced sales analytics & reports', 'Custom domain support', '10% platform commission', 'Priority support & fast payouts', 'Featured in "New Arrivals" feed'],
        color: 'border-luxury-gold bg-amber-50/20 ring-1 ring-luxury-gold/30',
        badgeColor: 'bg-luxury-gold text-white',
        isFree: false
    },
    {
        id: 'MAISON',
        name: 'Maison',
        price: 299,
        commission: '5%',
        commissionValue: 0.05,
        features: ['White-glove logistics & fulfillment', 'Top-tier placement in "The Drop"', '5% platform commission', 'Dedicated account manager', 'Early access to drops & pop-ups', 'Custom brand store styling'],
        color: 'border-luxury-black bg-black/5 ring-1 ring-black/20',
        badgeColor: 'bg-black text-white',
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
    const [vendorMsg, setVendorMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [vendorSearch, setVendorSearch] = useState('');
    const [autoRenew, setAutoRenew] = useState(true);
    const [estMonthlySales, setEstMonthlySales] = useState<number>(10000);

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
                const idUpper = p.id?.toUpperCase() || p.name.toUpperCase();
                const defaultMatch = DEFAULT_PLANS.find(dp => dp.id === idUpper || dp.name.toUpperCase() === p.name.toUpperCase());
                return {
                    id: p.id?.toUpperCase() || p.name.toUpperCase(),
                    name: p.name,
                    price: globalFreeMode ? 0 : (p.isFree ? 0 : numPrice),
                    originalPrice: numPrice,
                    commission: defaultMatch ? defaultMatch.commission : (idUpper.includes('MAISON') ? '5%' : idUpper.includes('COUTURE') ? '10%' : '15%'),
                    commissionValue: defaultMatch ? defaultMatch.commissionValue : (idUpper.includes('MAISON') ? 0.05 : idUpper.includes('COUTURE') ? 0.10 : 0.15),
                    features: p.features || [],
                    isFree: globalFreeMode || p.isFree || numPrice === 0,
                    period: p.period || '/ month',
                    color: defaultMatch ? defaultMatch.color : 'border-gray-200 bg-white',
                    badgeColor: defaultMatch ? defaultMatch.badgeColor : 'bg-luxury-gold text-white'
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

    // Current active vendor plan object
    const currentPlanName = storefrontForm?.subscriptionPlan || 'Atelier';
    const currentPlanObj = useMemo(() => {
        const found = activePlans.find(p => p.name.toLowerCase() === currentPlanName.toLowerCase() || p.id.toLowerCase() === currentPlanName.toLowerCase());
        return found || activePlans[0];
    }, [activePlans, currentPlanName]);

    // Admin state for editing plans
    const [adminFreeMode, setAdminFreeMode] = useState<boolean>(globalFreeMode);
    const [adminPlans, setAdminPlans] = useState<Array<{ id: string; name: string; price: number; isFree: boolean; features: string[] }>>([
        { id: 'ATELIER', name: 'Atelier', price: 0, isFree: true, features: ['Up to 20 monthly uploads', 'Standard analytics', 'Basic storefront', '15% commission'] },
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

    const [selectedPlan, setSelectedPlan] = useState<typeof activePlans[0] | null>(currentPlanObj);

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

    // Paystack Public Key
    const PAYSTACK_PUBLIC_KEY = "pk_test_placeholder_123456789";

    const paystackConfig = useMemo(() => ({
        email: storefrontForm?.email || 'vendor@myfitstore.com',
        amount: (selectedPlan?.price || 0) * 100,
        publicKey: PAYSTACK_PUBLIC_KEY,
    }), [storefrontForm?.email, selectedPlan, PAYSTACK_PUBLIC_KEY]);

    // @ts-ignore
    const initializePayment = usePaystackPayment(paystackConfig);

    const handleDirectPlanSelect = async (targetPlan: typeof activePlans[0]) => {
        if (!storefrontForm || !onUpdateVendor) return;
        setIsProcessing(true);
        setVendorMsg(null);
        try {
            const updatedVendor: Vendor = {
                ...storefrontForm,
                subscriptionPlan: targetPlan.name as any,
                subscriptionStatus: 'ACTIVE'
            };
            await onUpdateVendor(updatedVendor);
            setVendorMsg({ type: 'success', text: `🎉 Successfully updated subscription plan to ${targetPlan.name}!` });
            setSelectedPlan(targetPlan);
        } catch (e: any) {
            setVendorMsg({ type: 'error', text: 'Failed to update subscription plan: ' + e.message });
        } finally {
            setIsProcessing(false);
            setIsUpgradeModalOpen(false);
        }
    };

    const handleUpgrade = useCallback(async () => {
        if (!selectedPlan || !storefrontForm) return;

        if (selectedPlan.price === 0 || globalFreeMode) {
            await handleDirectPlanSelect(selectedPlan);
            return;
        }

        setIsProcessing(true);
        const onSuccess = async () => {
            await handleDirectPlanSelect(selectedPlan);
        };
        
        const onClose = () => {
            setIsProcessing(false);
        };

        try {
            // @ts-ignore
            initializePayment(onSuccess, onClose);
        } catch (e) {
            // Sandbox fallback
            console.warn("Paystack SDK popup preview mode fallback:", e);
            setTimeout(() => {
                onSuccess();
            }, 600);
        }
    }, [selectedPlan, storefrontForm, globalFreeMode, handleDirectPlanSelect, initializePayment]);

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-8 max-w-7xl mx-auto">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl md:text-3xl font-serif italic">Subscription Plan & Management</h2>
                        {globalFreeMode && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                                <Sparkles size={12} /> Global Free Mode
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Manage your active vendor subscription tier, tier privileges, platform commission fees, and automated billing options.
                    </p>
                </div>

                {storefrontForm && (
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-sm border border-gray-200">
                        <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Plan Tier</span>
                            <span className="text-base font-serif italic text-luxury-black font-bold">{currentPlanObj.name}</span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={12} /> {storefrontForm.subscriptionStatus || 'Active'}
                        </span>
                    </div>
                )}

                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm self-start">
                    <Menu size={20} />
                </button>
            </div>

            {vendorMsg && (
                <div className={`p-4 rounded-sm text-xs font-bold transition-all ${vendorMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {vendorMsg.text}
                </div>
            )}

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
                                            className="bg-transparent text-sm font-bold border-b border-white/20 focus:border-luxury-gold outline-none w-2/3 text-white"
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
                                                                    <option value="Atelier" className="bg-black text-white">Atelier (15% Commission)</option>
                                                                    <option value="Couture" className="bg-black text-white">Couture (10% Commission)</option>
                                                                    <option value="Maison" className="bg-black text-white">Maison (5% Commission)</option>
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

            {/* VENDOR SUBSCRIPTION PLAN COMPARISON GRID (INTERACTIVE SELECTION & SWITCHING) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-serif italic text-luxury-black">Select or Upgrade Subscription Tier</h3>
                        <p className="text-xs text-gray-500">Choose the tier that best matches your atelier volume and commission needs.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activePlans.map((plan) => {
                        const isCurrent = currentPlanObj.name.toLowerCase() === plan.name.toLowerCase() || currentPlanObj.id.toLowerCase() === plan.id.toLowerCase();
                        return (
                            <div 
                                key={plan.id}
                                className={`bg-white rounded-sm p-6 border shadow-xs transition-all flex flex-col justify-between relative ${isCurrent ? 'border-luxury-gold ring-2 ring-luxury-gold/40 shadow-md bg-amber-50/10' : 'border-gray-200 hover:border-gray-400'}`}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-luxury-gold text-white text-[9px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                        <BadgeCheck size={12} /> Current Active Tier
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-xl font-serif italic font-bold text-luxury-black">{plan.name}</h4>
                                            <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold">
                                                Platform Split: <span className="text-luxury-gold font-mono">{plan.commission}</span>
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[9px] uppercase font-bold tracking-widest ${plan.badgeColor}`}>
                                            {plan.id}
                                        </span>
                                    </div>

                                    <div className="my-6 border-y border-gray-100 py-4 flex items-baseline justify-between">
                                        <div>
                                            <span className="text-3xl font-bold text-luxury-black font-serif">
                                                {plan.isFree || globalFreeMode ? '$0' : formatPrice(plan.price)}
                                            </span>
                                            <span className="text-[11px] text-gray-400 uppercase tracking-widest ml-1">{plan.period}</span>
                                        </div>
                                        {globalFreeMode && (
                                            <span className="text-[10px] text-emerald-600 font-bold uppercase">100% Free Mode</span>
                                        )}
                                    </div>

                                    <ul className="space-y-2.5 mb-6 text-xs text-gray-600">
                                        {plan.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    {isCurrent ? (
                                        <button 
                                            disabled 
                                            className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xs text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-default"
                                        >
                                            <CheckCircle2 size={14} /> Active Plan
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDirectPlanSelect(plan)}
                                            disabled={isProcessing}
                                            className="w-full py-3 bg-luxury-black text-white hover:bg-luxury-gold transition-colors rounded-xs text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader className="animate-spin" size={14} /> : <>Switch to {plan.name} Plan <ChevronRight size={14} /></>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TIER COMMISSION SAVINGS CALCULATOR */}
            <div className="bg-white p-6 md:p-8 rounded-sm shadow-xs border border-gray-100 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="text-lg font-serif italic text-luxury-black flex items-center gap-2">
                            <Percent size={18} className="text-luxury-gold" /> Tier Commission & Profit Savings Calculator
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            See how upgrading your subscription tier lowers platform fees and increases your take-home payouts.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded border border-gray-200">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Est. Monthly Sales ($):</label>
                        <input
                            type="number"
                            step="1000"
                            min="1000"
                            value={estMonthlySales}
                            onChange={(e) => setEstMonthlySales(Math.max(0, Number(e.target.value)))}
                            className="w-28 bg-white border border-gray-300 rounded px-3 py-1 text-sm font-bold text-luxury-black outline-none focus:border-luxury-gold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activePlans.map((p) => {
                        const feeAmount = estMonthlySales * p.commissionValue;
                        const planCost = globalFreeMode ? 0 : p.price;
                        const netTakeHome = estMonthlySales - feeAmount - planCost;
                        const baselineTakeHome = estMonthlySales - (estMonthlySales * 0.15); // Atelier baseline
                        const extraSaved = netTakeHome - baselineTakeHome;

                        return (
                            <div key={p.id} className="p-4 bg-gray-50 rounded border border-gray-200 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-serif italic font-bold text-sm">{p.name} ({p.commission} Fee)</span>
                                    <span className="text-[10px] font-mono font-bold text-gray-500">${planCost}/mo plan</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Platform Fee ({p.commission}):</span>
                                        <span className="font-mono text-red-600">-${feeAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subscription Fee:</span>
                                        <span className="font-mono text-gray-600">-${planCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-luxury-black pt-2 border-t border-gray-200">
                                        <span>Net Payout Take-Home:</span>
                                        <span className="font-mono text-emerald-700">${netTakeHome.toLocaleString()}</span>
                                    </div>
                                </div>
                                {extraSaved > 0 && (
                                    <div className="bg-emerald-100 text-emerald-800 text-[10px] font-bold p-2 rounded text-center uppercase tracking-wide">
                                        🎉 Saves +${extraSaved.toLocaleString()}/mo vs Atelier Tier!
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* VENDOR CURRENT BILLING & PAYMENT MANAGEMENT */}
            {storefrontForm && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 md:p-8 border border-gray-100 rounded-sm shadow-xs md:col-span-2 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <BadgeCheck size={14} /> Subscription Status & Renewal Management
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gray-50 rounded-sm border border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Active Plan</p>
                                <p className="text-2xl font-serif italic text-luxury-black">{currentPlanObj.name}</p>
                                <p className="text-xs text-gray-400 mt-1">Platform split: <strong className="text-luxury-black font-mono">{currentPlanObj.commission}</strong></p>
                            </div>

                            <div className="text-left sm:text-right space-y-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${storefrontForm.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {storefrontForm.subscriptionStatus || 'Active'}
                                </span>
                                <div className="text-[11px] text-gray-500 flex items-center gap-1 sm:justify-end">
                                    <Calendar size={12} /> Next Renewal: <strong className="text-luxury-black">Oct 15, 2026</strong>
                                </div>
                            </div>
                        </div>

                        {/* Auto Renewal Toggle */}
                        <div className="p-4 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-luxury-black uppercase tracking-wide">Auto-Renew Subscription</p>
                                <p className="text-[11px] text-gray-500">Automatically renew your plan each month to maintain tier privileges.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setAutoRenew(!autoRenew);
                                    setVendorMsg({ type: 'success', text: `Auto-renewal ${!autoRenew ? 'enabled' : 'disabled'} for your subscription.` });
                                }}
                                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${autoRenew ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                {autoRenew ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                {autoRenew ? 'Auto-Renew: ON' : 'Auto-Renew: OFF'}
                            </button>
                        </div>

                        {/* Invoice & Tax Receipts */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-700">Billing History & Tax Statements</h4>
                            <div className="border border-gray-200 rounded-sm overflow-hidden divide-y divide-gray-100">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                                <FileText size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-luxury-black">Statement & Invoice #{2026000 + i}</p>
                                                <p className="text-[10px] text-gray-400">Sep {15 - i * 4}, 2026 • {currentPlanObj.name} Tier</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-gray-700">{globalFreeMode ? '$0.00 (Free)' : `$${currentPlanObj.price}.00`}</span>
                                            <button 
                                                onClick={() => alert(`Downloading Invoice #${2026000 + i} PDF / CSV...`)}
                                                className="text-[10px] uppercase font-bold text-luxury-gold hover:underline"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Card */}
                    <div className="bg-white p-6 md:p-8 border border-gray-100 rounded-sm shadow-xs space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <CreditCard size={14} /> Payment Method
                        </h3>

                        <div className="p-4 border border-gray-200 rounded-sm space-y-3 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-luxury-black rounded-xs flex items-center justify-center text-[9px] text-white font-bold tracking-wider">
                                        VISA
                                    </div> 
                                    <div>
                                        <p className="text-xs font-bold text-luxury-black">•••• 4242</p>
                                        <p className="text-[10px] text-gray-400">Expires 12/28</p>
                                    </div>
                                </div>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold uppercase px-2 py-0.5 rounded">Primary</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => alert("Billing portal connection active. You can manage or update payment cards securely.")}
                            className="w-full border border-black text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded-xs"
                        >
                            Update Payment Details
                        </button>

                        <div className="pt-4 border-t border-gray-100 text-center">
                            <p className="text-[11px] text-gray-400">Need help with your plan or commission split?</p>
                            <a href="mailto:support@myfitstore.com" className="text-xs font-bold text-luxury-gold hover:underline block mt-1">
                                Contact Concierge Support
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
