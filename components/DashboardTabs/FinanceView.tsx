import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Clock, TrendingUp, Activity, Download, CheckCircle, Menu, ArrowUpRight, 
  CreditCard, DollarSign, Percent, ShieldCheck, Filter, Search, ArrowDownRight, 
  Building, RefreshCw, AlertCircle, FileText, Check, ChevronRight, HelpCircle,
  FileCheck, Calendar, Zap, ExternalLink, Printer, CheckCircle2, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Order, User, Vendor, PayoutRecord } from '../../types.ts';
import { useCurrency } from '../../context/CurrencyContext.tsx';
import { getCommissionRate, getCommissionPercent, getPotentialSavingsMessage } from '../../utils/commission.ts';
import { generateTaxStatementData, downloadTaxStatementCSV, TaxStatementData } from '../../utils/taxStatement.ts';
import { fetchVendorPayouts, createPayoutInDb } from '../../services/dataService.ts';

interface FinanceViewProps {
  totalRevenue: number;
  myOrders: Order[];
  setIsSidebarOpen: (open: boolean) => void;
  currentUser?: User | Vendor | null;
  vendor?: Vendor | null;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ 
  totalRevenue, 
  myOrders, 
  setIsSidebarOpen,
  currentUser,
  vendor 
}) => {
  const { formatPrice, currency } = useCurrency();

  // Date Range Filter State
  const [dateRange, setDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_90_DAYS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'PORTAL' | 'STRIPE_CONNECT' | 'LEDGER' | 'PAYOUTS' | 'BANK_SETTINGS'>('PORTAL');

  // Modals & Forms
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastPayoutReceipt, setLastPayoutReceipt] = useState<PayoutRecord | null>(null);

  const [selectedTaxPeriod, setSelectedTaxPeriod] = useState<string>('FY_2026');
  const [payoutAmountInput, setPayoutAmountInput] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'STRIPE_CONNECT' | 'DIRECT_BANK'>('STRIPE_CONNECT');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Stripe Connect State
  const [stripeAccount, setStripeAccount] = useState({
    connected: vendor?.stripeConnect?.connected ?? true,
    stripeAccountId: vendor?.stripeConnect?.stripeAccountId || 'acct_1Ox9842MaisonAtelier',
    payoutSchedule: vendor?.stripeConnect?.payoutSchedule || 'WEEKLY',
    chargesEnabled: true,
    payoutsEnabled: true,
    instantPayoutEligible: true,
    connectedEmail: vendor?.stripeConnect?.connectedEmail || vendor?.email || 'finance@atelier-couture.com'
  });

  // Bank Info State
  const [bankInfo, setBankInfo] = useState({
    bankName: vendor?.bankDetails?.bankName || 'J.P. Morgan Chase & Co.',
    accountName: vendor?.bankDetails?.accountName || vendor?.name || 'Maison Atelier Inc.',
    accountNumber: vendor?.bankDetails?.accountNumber || '••••••••4242',
    routingNumber: vendor?.bankDetails?.routingNumber || '021000021',
    swiftCode: vendor?.bankDetails?.swiftCode || 'CHASUS33',
    country: vendor?.bankDetails?.country || 'United States'
  });

  // Initial Seed Records for initial fallback
  const initialPayouts: PayoutRecord[] = useMemo(() => [
    {
      id: 'PO-98421',
      vendorId: vendor?.id,
      date: '2026-08-15',
      amount: 2400.00,
      grossAmount: 2823.53,
      commissionFee: 423.53,
      commissionRate: 0.15,
      method: 'Stripe Connect Instant Payout',
      accountEnding: '••••4242',
      status: 'Completed',
      referenceNumber: 'REF-8842190',
      type: 'STRIPE_CONNECT',
      disbursedAt: '2026-08-15T14:32:00Z'
    },
    {
      id: 'PO-98305',
      vendorId: vendor?.id,
      date: '2026-07-30',
      amount: 1850.50,
      grossAmount: 2177.06,
      commissionFee: 326.56,
      commissionRate: 0.15,
      method: 'Direct Bank Wire (J.P. Morgan)',
      accountEnding: '••••4242',
      status: 'Completed',
      referenceNumber: 'REF-7639102',
      type: 'DIRECT_BANK',
      disbursedAt: '2026-07-30T10:15:00Z'
    },
    {
      id: 'PO-98112',
      vendorId: vendor?.id,
      date: '2026-07-01',
      amount: 3200.00,
      grossAmount: 3764.71,
      commissionFee: 564.71,
      commissionRate: 0.15,
      method: 'Stripe Connect Instant Payout',
      accountEnding: '••••4242',
      status: 'Completed',
      referenceNumber: 'REF-6520194',
      type: 'STRIPE_CONNECT',
      disbursedAt: '2026-07-01T16:45:00Z'
    }
  ], [vendor?.id]);

  // Payout History State
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>(initialPayouts);

  // Load Payouts from Firestore
  useEffect(() => {
    let isMounted = true;
    const loadPayouts = async () => {
      try {
        const records = await fetchVendorPayouts(vendor?.id);
        if (isMounted && records && records.length > 0) {
          setPayoutHistory(records);
        }
      } catch (err) {
        console.warn("Could not load remote payouts:", err);
      }
    };
    loadPayouts();
    return () => { isMounted = false; };
  }, [vendor?.id]);

  // Commission Rate calculation based on vendor active subscription plan (Atelier 15%, Couture 10%, Maison 5%)
  const commissionRate = useMemo(() => {
    return getCommissionRate(vendor?.subscriptionPlan);
  }, [vendor?.subscriptionPlan]);

  const commissionPercentStr = useMemo(() => {
    return getCommissionPercent(vendor?.subscriptionPlan);
  }, [vendor?.subscriptionPlan]);

  // Date Filter Logic
  const filteredOrders = useMemo(() => {
    let list = [...myOrders];

    const now = new Date('2026-09-02');
    if (dateRange === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter(o => new Date(o.date) >= startOfMonth);
    } else if (dateRange === 'LAST_MONTH') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      list = list.filter(o => {
        const d = new Date(o.date);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      });
    } else if (dateRange === 'LAST_90_DAYS') {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      list = list.filter(o => new Date(o.date) >= ninetyDaysAgo);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [myOrders, dateRange, searchQuery]);

  // Financial Calculations: Automated Platform Commission & Net Payout
  const grossSales = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  const totalCommissionDeducted = useMemo(() => {
    return grossSales * commissionRate;
  }, [grossSales, commissionRate]);

  const netEarnings = useMemo(() => {
    return grossSales - totalCommissionDeducted;
  }, [grossSales, totalCommissionDeducted]);

  // Lifetime Calculations
  const totalLifetimeGross = useMemo(() => {
    return myOrders.reduce((sum, o) => sum + o.total, 0);
  }, [myOrders]);

  const totalLifetimeNet = useMemo(() => {
    return totalLifetimeGross * (1 - commissionRate);
  }, [totalLifetimeGross, commissionRate]);

  // Payout Adjustments
  const totalPayoutsRequested = useMemo(() => {
    return payoutHistory
      .filter(p => p.status === 'Completed' || p.status === 'Processing')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payoutHistory]);

  // Pending Clearance (Orders currently in Processing status)
  const pendingClearance = useMemo(() => {
    return filteredOrders
      .filter(o => o.status === 'Processing')
      .reduce((sum, o) => sum + (o.total * (1 - commissionRate)), 0);
  }, [filteredOrders, commissionRate]);

  // Available Cleared Net Funds ready for payout
  const availableBalance = useMemo(() => {
    const totalClearedNet = totalLifetimeNet - pendingClearance;
    const balance = totalClearedNet - totalPayoutsRequested;
    return Math.max(0, balance);
  }, [totalLifetimeNet, pendingClearance, totalPayoutsRequested]);

  // Potential Commission Savings if vendor upgrades plan tier
  const potentialSavings = useMemo(() => {
    return getPotentialSavingsMessage(grossSales, vendor?.subscriptionPlan);
  }, [grossSales, vendor?.subscriptionPlan]);

  // Chart Data preparation
  const monthlyChartData = useMemo(() => {
    const monthlyMap: Record<string, { gross: number; commission: number; net: number }> = {};
    const sorted = [...myOrders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(order => {
      const d = new Date(order.date);
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlyMap[monthLabel]) {
        monthlyMap[monthLabel] = { gross: 0, commission: 0, net: 0 };
      }
      
      const gross = order.total;
      const comm = gross * commissionRate;
      const net = gross - comm;

      monthlyMap[monthLabel].gross += gross;
      monthlyMap[monthLabel].commission += comm;
      monthlyMap[monthLabel].net += net;
    });

    return Object.entries(monthlyMap).map(([month, vals]) => ({
      month,
      Gross: Math.round(vals.gross),
      Commission: Math.round(vals.commission),
      NetEarnings: Math.round(vals.net)
    }));
  }, [myOrders, commissionRate]);

  // Download CSV Handler
  const handleDownloadCSV = () => {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Items Count',
      'Items Description',
      'Order Status',
      'Gross Total (USD)',
      'Platform Fee Rate (%)',
      'Commission Fee Deducted (USD)',
      'Net Vendor Payout (USD)',
      'Clearance Status'
    ];

    const rows = filteredOrders.map(o => {
      const gross = o.total;
      const fee = gross * commissionRate;
      const net = gross - fee;
      const itemsStr = o.items.map(i => `${i.quantity}x ${i.name}`).join('; ');
      const isCleared = o.status !== 'Processing';

      return [
        `"${o.id}"`,
        `"${new Date(o.date).toLocaleDateString()}"`,
        `"${o.customerName}"`,
        o.items.length,
        `"${itemsStr.replace(/"/g, '""')}"`,
        `"${o.status}"`,
        gross.toFixed(2),
        `"${commissionPercentStr}"`,
        fee.toFixed(2),
        net.toFixed(2),
        `"${isCleared ? 'Cleared' : 'Pending Clearance'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MyFitStore_Vendor_Ledger_${dateRange}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tax Statement Generation
  const taxStatementData = useMemo(() => {
    return generateTaxStatementData(myOrders, vendor, selectedTaxPeriod.replace('_', ' '));
  }, [myOrders, vendor, selectedTaxPeriod]);

  const handleDownloadTaxStatement = () => {
    downloadTaxStatementCSV(taxStatementData);
  };

  // Submit Automated Payout Request
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }

    if (amountNum > availableBalance) {
      alert(`Requested amount exceeds available balance of ${formatPrice(availableBalance)}.`);
      return;
    }

    setIsSubmittingPayout(true);

    try {
      const isStripe = payoutMethod === 'STRIPE_CONNECT';
      const refNumber = `REF-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const payoutId = `PO-${Math.floor(10000 + Math.random() * 90000)}`;

      const newRecord: PayoutRecord = {
        id: payoutId,
        vendorId: vendor?.id || 'current_vendor',
        date: new Date().toISOString().slice(0, 10),
        amount: amountNum,
        grossAmount: amountNum / (1 - commissionRate),
        commissionFee: (amountNum / (1 - commissionRate)) * commissionRate,
        commissionRate: commissionRate,
        commissionPercentStr: commissionPercentStr,
        method: isStripe 
          ? `Stripe Connect Instant (${stripeAccount.stripeAccountId})` 
          : `Direct Bank Wire (${bankInfo.bankName})`,
        accountEnding: isStripe ? 'Stripe Debit Card / Bank' : (bankInfo.accountNumber.slice(-4) || '4242'),
        status: isStripe ? 'Processing' : 'Pending',
        referenceNumber: refNumber,
        type: isStripe ? 'STRIPE_CONNECT' : 'DIRECT_BANK',
        disbursedAt: new Date().toISOString(),
        notes: `Disbursement calculated minus ${commissionPercentStr} platform commission. 0% withdrawal processing fee.`
      };

      // Persist to Firestore
      await createPayoutInDb(newRecord);

      // Update local state
      setPayoutHistory([newRecord, ...payoutHistory]);
      setLastPayoutReceipt(newRecord);
      setPayoutSuccessMsg(`Payout of ${formatPrice(amountNum)} initiated via ${isStripe ? 'Stripe Connect' : 'Direct Bank Wire'}. Reference: ${refNumber}`);
      setPayoutAmountInput('');
      setIsPayoutModalOpen(false);
      setIsReceiptModalOpen(true);

      setTimeout(() => {
        setPayoutSuccessMsg(null);
      }, 7000);
    } catch (error) {
      console.error("Payout error:", error);
      alert("Failed to submit payout. Please try again.");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif italic text-black">Payouts & Financial Portal</h2>
            <span className="bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-luxury-gold/20 flex items-center gap-1">
              <ShieldCheck size={12} /> Tier: {vendor?.subscriptionPlan || 'Atelier'} ({commissionPercentStr} Platform Commission)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Automated vendor payouts calculated minus platform fee, integrated with Stripe Connect and Direct Bank Wire.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-white border border-gray-200 text-xs font-semibold px-3 py-2.5 rounded-xs focus:outline-none focus:border-black transition-colors"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="LAST_90_DAYS">Last 90 Days</option>
          </select>

          {/* Tax Statement Button */}
          <button
            onClick={() => setIsTaxModalOpen(true)}
            className="bg-gray-100 text-black border border-gray-200 px-4 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white transition-colors shadow-sm rounded-xs"
            title="Download official tax & commission breakdown statements"
          >
            <FileCheck size={15} className="text-luxury-gold" /> <span className="hidden sm:inline">Tax Statement</span>
          </button>

          {/* Export CSV Statement Button */}
          <button 
            onClick={handleDownloadCSV}
            className="bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-luxury-gold hover:text-black transition-colors shadow-sm rounded-xs"
            title="Download full itemized CSV revenue ledger"
          >
            <Download size={15} /> <span className="hidden sm:inline">Export Ledger</span> (CSV)
          </button>

          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2.5 border border-gray-200 rounded-sm">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {payoutSuccessMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs font-medium flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{payoutSuccessMsg}</span>
          </div>
          <button onClick={() => setPayoutSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </motion.div>
      )}

      {/* Tiered Commission Split Formula Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-900 to-black text-white p-5 rounded-sm border border-luxury-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-luxury-gold/20 text-luxury-gold rounded shrink-0 mt-0.5">
            <Percent size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold">Automated Payout Engine</span>
              <span className="text-[9px] bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 px-2 py-0.5 rounded font-bold uppercase">
                Active Plan: {vendor?.subscriptionPlan || 'Atelier'} ({commissionPercentStr} Commission)
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 font-mono">
              Net Vendor Earnings = Gross Sales - Platform Fee ({commissionPercentStr}) • All withdrawals have 0% disbursal surcharge
            </p>
          </div>
        </div>

        {potentialSavings && (
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-luxury-gold block">Upgrade & Save</span>
            <span className="text-xs text-gray-300 font-medium">{potentialSavings.savingsText}</span>
          </div>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Cleared Balance */}
        <div className="bg-black text-white p-6 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between border border-luxury-gold/30">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1">
                <Wallet size={12} className="text-luxury-gold" /> Available Balance
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">Ready</span>
            </div>
            <h3 className="text-3xl font-serif mb-1 font-semibold text-white">{formatPrice(availableBalance)}</h3>
            <p className="text-[10px] text-gray-400">Net cleared funds ready for instant disbursal</p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <button 
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={availableBalance <= 0}
              className={`w-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 rounded-xs ${
                availableBalance > 0 
                  ? 'bg-luxury-gold text-black hover:bg-white' 
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowUpRight size={14} /> Request Payout
            </button>
          </div>

          <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none">
            <Wallet size={130} />
          </div>
        </div>

        {/* Gross Sales */}
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Gross Sales</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                <DollarSign size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium text-black">{formatPrice(grossSales)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Total revenue across {filteredOrders.length} orders</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Period: <strong className="text-black">{dateRange}</strong></span>
            <span className="text-emerald-600 font-semibold text-[10px]">100% Volume</span>
          </div>
        </div>

        {/* Platform Commission Deducted */}
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Commission Deducted</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                <Percent size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium text-purple-900">-{formatPrice(totalCommissionDeducted)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Platform fee rate: <strong className="text-black font-semibold">{commissionPercentStr}</strong></p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Tier Rate</span>
            <span className="text-purple-600 font-bold text-[10px] uppercase">{vendor?.subscriptionPlan || 'Atelier'}</span>
          </div>
        </div>

        {/* Net Vendor Earnings */}
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Net Take-Home Earnings</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium text-emerald-700">{formatPrice(netEarnings)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Calculated net after {commissionPercentStr} commission</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Pending Clearance:</span>
            <span className="text-amber-600 font-mono font-bold text-[10px]">{formatPrice(pendingClearance)}</span>
          </div>
        </div>
      </div>

      {/* Monthly Sales vs Net Earnings Breakdown Chart */}
      <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
              <Activity size={16} className="text-luxury-gold" /> Gross Sales vs. Net Vendor Payout Trend
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Automated calculation of monthly gross revenue minus platform commission</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-black rounded-xs block"></span>
              <span className="text-gray-600">Gross Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-luxury-gold rounded-xs block"></span>
              <span className="text-gray-600">Net Take-Home</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                formatter={(value: any) => [formatPrice(Number(value)), '']}
                contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '4px', border: 'none', fontSize: '12px' }}
              />
              <Bar dataKey="Gross" fill="#0a0a0a" radius={[2, 2, 0, 0]} />
              <Bar dataKey="NetEarnings" fill="#C5A059" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Tab Navigation & Content */}
      <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
        {/* Navigation Bar */}
        <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('PORTAL')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'PORTAL'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <Wallet size={14} className="text-luxury-gold" /> Payout Portal & Disbursal
          </button>

          <button
            onClick={() => setActiveTab('STRIPE_CONNECT')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'STRIPE_CONNECT'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <CreditCard size={14} className="text-luxury-gold" /> Stripe Connect Hub
            {stripeAccount.connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'LEDGER'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <FileText size={14} /> Revenue Ledger ({filteredOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('PAYOUTS')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'PAYOUTS'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <Clock size={14} /> Payout History ({payoutHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('BANK_SETTINGS')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'BANK_SETTINGS'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <Building size={14} /> Direct Bank Payout Setup
          </button>
        </div>

        {/* Tab 0: Payout Portal & Quick Disbursal */}
        {activeTab === 'PORTAL' && (
          <div className="p-6 md:p-8 space-y-8 bg-gray-50/40">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Wallet Main Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-black via-zinc-900 to-black text-white p-6 md:p-8 rounded-sm shadow-xl border border-luxury-gold/30 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold flex items-center gap-1.5">
                      <Wallet size={16} /> Verified Disbursal Account
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Account Status: Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Available for Withdrawal</span>
                      <div className="text-3xl font-serif font-bold text-white">{formatPrice(availableBalance)}</div>
                      <span className="text-[10px] text-emerald-400 mt-1 block">Net cleared funds</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Pending Clearance</span>
                      <div className="text-2xl font-serif font-bold text-amber-300">{formatPrice(pendingClearance)}</div>
                      <span className="text-[10px] text-gray-400 mt-1 block">Under processing hold</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Total Lifetime Net</span>
                      <div className="text-2xl font-serif font-bold text-gray-200">{formatPrice(totalLifetimeNet)}</div>
                      <span className="text-[10px] text-gray-400 mt-1 block">Net after {commissionPercentStr} fee</span>
                    </div>
                  </div>
                </div>

                {/* Disbursal Destination Info */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <div className="p-2 bg-luxury-gold/10 text-luxury-gold rounded">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-bold">Primary Transfer Route</span>
                      <span className="font-semibold text-white">
                        {stripeAccount.connected ? `Stripe Connect (${stripeAccount.stripeAccountId})` : `${bankInfo.bankName} (${bankInfo.accountNumber.slice(-4)})`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsPayoutModalOpen(true)}
                      disabled={availableBalance <= 0}
                      className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                        availableBalance > 0
                          ? 'bg-luxury-gold text-black hover:bg-white'
                          : 'bg-white/10 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpRight size={16} /> Request Withdrawal
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Withdrawal Presets */}
              <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-1.5">
                      <Zap size={15} className="text-luxury-gold" /> Instant Withdrawal Presets
                    </h4>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Select a quick amount to initiate instant transfer to your connected account:
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => {
                        setPayoutAmountInput('500');
                        setIsPayoutModalOpen(true);
                      }}
                      disabled={availableBalance < 500}
                      className="p-2.5 border border-gray-200 rounded-xs text-xs font-bold font-mono text-gray-800 hover:border-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-center"
                    >
                      $500.00
                    </button>
                    <button
                      onClick={() => {
                        setPayoutAmountInput('1000');
                        setIsPayoutModalOpen(true);
                      }}
                      disabled={availableBalance < 1000}
                      className="p-2.5 border border-gray-200 rounded-xs text-xs font-bold font-mono text-gray-800 hover:border-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-center"
                    >
                      $1,000.00
                    </button>
                    <button
                      onClick={() => {
                        setPayoutAmountInput('2500');
                        setIsPayoutModalOpen(true);
                      }}
                      disabled={availableBalance < 2500}
                      className="p-2.5 border border-gray-200 rounded-xs text-xs font-bold font-mono text-gray-800 hover:border-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-center"
                    >
                      $2,500.00
                    </button>
                    <button
                      onClick={() => {
                        setPayoutAmountInput(availableBalance.toFixed(2));
                        setIsPayoutModalOpen(true);
                      }}
                      disabled={availableBalance <= 0}
                      className="p-2.5 bg-black text-luxury-gold border border-black rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center"
                    >
                      Max ({formatPrice(availableBalance)})
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Disbursal Fee:</span>
                    <strong className="text-emerald-600 font-bold uppercase">0% (Platform Absorbed)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Stripe Instant ETA:</span>
                    <strong className="text-black font-semibold">Under 30 Minutes</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Statement Summary Callout */}
            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                  <FileCheck size={16} className="text-luxury-gold" /> Need an itemized tax or commission summary?
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Generate official quarterly and annual VAT/platform fee statements for your atelier records.
                </p>
              </div>
              <button
                onClick={() => setIsTaxModalOpen(true)}
                className="bg-black text-white hover:bg-luxury-gold hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 rounded-xs"
              >
                Open Tax Generator
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Stripe Connect Hub */}
        {activeTab === 'STRIPE_CONNECT' && (
          <div className="p-8 max-w-4xl space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#635BFF]/10 text-[#635BFF] rounded">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif italic font-bold text-black flex items-center gap-2">
                    Stripe Connect Express Hub
                  </h3>
                  <p className="text-xs text-gray-500">
                    Direct automated payouts to your bank account or debit card via Stripe Connect.
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Status Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Stripe Express Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <strong className="text-sm font-mono text-black">{stripeAccount.stripeAccountId}</strong>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Stripe Express Dashboard session initiated for ${stripeAccount.stripeAccountId}.`)}
                    className="px-4 py-2 bg-white border border-gray-300 text-black hover:border-black text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} /> Stripe Dashboard
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Instant Payouts</span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Eligible (0% Surcharge)
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">Direct debit card and RTP transfers</p>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Automated Schedule</span>
                  <span className="text-xs font-bold text-black uppercase font-mono">
                    {stripeAccount.payoutSchedule}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">Funds sweep automatically</p>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Settlement Currency</span>
                  <span className="text-xs font-bold text-black font-mono">USD ($)</span>
                  <p className="text-[10px] text-gray-400 mt-1">Auto-converted for international banks</p>
                </div>
              </div>

              {/* Disbursal Schedule Selector */}
              <div className="pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                  Configure Automated Disbursal Frequency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setStripeAccount({ ...stripeAccount, payoutSchedule: freq as any })}
                      className={`p-2.5 border text-xs font-bold uppercase tracking-wider rounded-xs transition-all ${
                        stripeAccount.payoutSchedule === freq
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Automated schedules disburse cleared funds minus platform commission on a recurring basis. You can still initiate manual withdrawals anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Revenue Ledger */}
        {activeTab === 'LEDGER' && (
          <div>
            <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search by Order ID, Customer, Item..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black"
                />
              </div>
              <div className="text-xs text-gray-500 font-mono">
                Showing <strong className="text-black">{filteredOrders.length}</strong> revenue transactions
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Order ID & Customer</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4 text-right">Gross Total</th>
                    <th className="p-4 text-center">Platform Fee %</th>
                    <th className="p-4 text-right">Commission Fee</th>
                    <th className="p-4 text-right">Net Vendor Payout</th>
                    <th className="p-4 text-center">Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                        No order transactions found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const gross = order.total;
                      const fee = gross * commissionRate;
                      const net = gross - fee;
                      const isCleared = order.status !== 'Processing';

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="p-4 text-gray-500 whitespace-nowrap font-mono">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-black">{order.id}</div>
                            <div className="text-[10px] text-gray-400">{order.customerName}</div>
                          </td>
                          <td className="p-4 max-w-xs truncate text-gray-600">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </td>
                          <td className="p-4 text-right font-medium text-black whitespace-nowrap">
                            {formatPrice(gross)}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {commissionPercentStr}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono text-purple-700 whitespace-nowrap">
                            -{formatPrice(fee)}
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                            +{formatPrice(net)}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            {isCleared ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                <CheckCircle size={10} /> Cleared
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                <Clock size={10} /> Processing
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Payout History */}
        {activeTab === 'PAYOUTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Payout ID</th>
                  <th className="p-4">Request Date</th>
                  <th className="p-4">Disbursal Method</th>
                  <th className="p-4">Reference No.</th>
                  <th className="p-4 text-right">Net Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payoutHistory.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-bold text-black font-mono">{payout.id}</td>
                    <td className="p-4 text-gray-500 font-mono">{payout.date}</td>
                    <td className="p-4">
                      <div className="font-medium text-black">{payout.method}</div>
                      <div className="text-[10px] text-gray-400">Account: {payout.accountEnding}</div>
                    </td>
                    <td className="p-4 text-gray-500 font-mono">{payout.referenceNumber}</td>
                    <td className="p-4 text-right font-mono font-bold text-black">
                      {formatPrice(payout.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        payout.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {payout.status === 'Completed' ? <CheckCircle size={10} /> : <RefreshCw size={10} className="animate-spin" />}
                        {payout.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setLastPayoutReceipt(payout);
                          setIsReceiptModalOpen(true);
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <FileText size={12} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Direct Bank Settings */}
        {activeTab === 'BANK_SETTINGS' && (
          <div className="p-8 max-w-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <Building size={18} className="text-luxury-gold" /> Direct Bank Wire / ACH Account
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Funds requested during manual wire payouts are deposited to this account.</p>
              </div>
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-luxury-gold hover:text-black transition-colors"
              >
                Edit Bank
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xs border border-gray-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Bank Name</span>
                <span className="text-sm font-semibold text-black">{bankInfo.bankName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Account Holder</span>
                <span className="text-sm font-semibold text-black">{bankInfo.accountName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Account Number / IBAN</span>
                <span className="text-sm font-mono text-black">{bankInfo.accountNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Routing / SWIFT Code</span>
                <span className="text-sm font-mono text-black">{bankInfo.routingNumber} ({bankInfo.swiftCode})</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-xs flex items-start gap-3">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Security & KYC Compliance</strong>
                Direct bank accounts are verified against your submitted KYC documentation. Updates undergo automated compliance check before disbursements can be initiated.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Automated Request Payout Modal */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-sm shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6 border border-gray-100"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold block">Automated Transfer</span>
                  <h3 className="text-xl font-serif italic font-bold text-black flex items-center gap-2 mt-0.5">
                    <ArrowUpRight size={20} className="text-luxury-gold" /> Initiate Vendor Payout
                  </h3>
                </div>
                <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-400 hover:text-black font-bold text-xl">×</button>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-5">
                {/* Available Balance Preview */}
                <div className="bg-gray-50 p-4 rounded-xs border border-gray-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Available Net Balance</span>
                    <span className="text-xl font-serif font-bold text-emerald-700">{formatPrice(availableBalance)}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setPayoutAmountInput(availableBalance.toFixed(2))}
                    className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Withdrawal Amount ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="10"
                      max={availableBalance}
                      placeholder="0.00"
                      value={payoutAmountInput}
                      onChange={(e) => setPayoutAmountInput(e.target.value)}
                      required
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 text-sm rounded-xs focus:outline-none focus:border-black font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Disbursement Method */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Select Transfer Route
                  </label>
                  <div className="space-y-2">
                    <label 
                      onClick={() => setPayoutMethod('STRIPE_CONNECT')}
                      className={`p-3 border rounded-xs flex items-center justify-between cursor-pointer transition-all ${
                        payoutMethod === 'STRIPE_CONNECT' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={18} className={payoutMethod === 'STRIPE_CONNECT' ? "text-luxury-gold" : "text-[#635BFF]"} />
                        <div>
                          <span className="text-xs font-bold block">Stripe Connect Instant Payout</span>
                          <span className={`text-[10px] ${payoutMethod === 'STRIPE_CONNECT' ? 'text-gray-300' : 'text-gray-400'}`}>
                            Direct debit / RTP • ~30 minutes
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    </label>

                    <label 
                      onClick={() => setPayoutMethod('DIRECT_BANK')}
                      className={`p-3 border rounded-xs flex items-center justify-between cursor-pointer transition-all ${
                        payoutMethod === 'DIRECT_BANK' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building size={18} className={payoutMethod === 'DIRECT_BANK' ? "text-luxury-gold" : "text-gray-500"} />
                        <div>
                          <span className="text-xs font-bold block">Direct Bank Wire (Fedwire / ACH)</span>
                          <span className={`text-[10px] ${payoutMethod === 'DIRECT_BANK' ? 'text-gray-300' : 'text-gray-400'}`}>
                            {bankInfo.bankName} • 1-2 Business Days
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xs text-[11px] space-y-1.5 text-gray-600 font-mono">
                  <div className="flex justify-between">
                    <span>Platform Commission:</span>
                    <strong className="text-black font-semibold">Already Deducted ({commissionPercentStr})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Disbursal Transfer Fee:</span>
                    <strong className="text-emerald-700 font-bold">$0.00 (WAIVED)</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200 text-xs text-black font-bold">
                    <span>Net Disbursal to Atelier:</span>
                    <span className="text-emerald-700 font-bold">
                      {payoutAmountInput ? formatPrice(parseFloat(payoutAmountInput) || 0) : '$0.00'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="w-1/2 py-2.5 border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors rounded-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPayout || !payoutAmountInput || parseFloat(payoutAmountInput) <= 0}
                    className="w-1/2 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors rounded-xs shadow-md disabled:opacity-50"
                  >
                    {isSubmittingPayout ? 'Processing...' : 'Confirm Disbursal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Payout Receipt Certificate Modal */}
      <AnimatePresence>
        {isReceiptModalOpen && lastPayoutReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 border border-gray-100"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Disbursal Initiated
                  </span>
                  <h3 className="text-xl font-serif italic font-bold text-black mt-0.5">
                    Official Disbursal Receipt
                  </h3>
                </div>
                <button onClick={() => setIsReceiptModalOpen(false)} className="text-gray-400 hover:text-black font-bold text-xl">×</button>
              </div>

              {/* Receipt Content */}
              <div className="bg-gray-50 p-6 rounded-xs border border-gray-200 space-y-4 font-mono text-xs text-gray-800">
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 block font-sans font-bold">Transaction Ref</span>
                    <strong className="text-black">{lastPayoutReceipt.referenceNumber}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-400 block font-sans font-bold">Date</span>
                    <span>{lastPayoutReceipt.date}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Beneficiary Atelier:</span>
                    <strong className="text-black font-sans">{vendor?.name || 'Maison Atelier'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Disbursal Method:</span>
                    <span className="font-semibold text-black">{lastPayoutReceipt.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Destination:</span>
                    <span>{lastPayoutReceipt.accountEnding}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Fee Calculation:</span>
                    <span className="text-emerald-700 font-bold">{lastPayoutReceipt.commissionPercentStr || commissionPercentStr} Platform Commission Settled</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-bold">
                  <span>Net Disbursed Sum:</span>
                  <span className="text-emerald-700 text-base">{formatPrice(lastPayoutReceipt.amount)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-xs transition-colors"
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="w-1/2 py-2.5 bg-black hover:bg-luxury-gold hover:text-black text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Bank Info Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-6 space-y-6 border border-gray-100"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-lg font-serif italic font-bold text-black flex items-center gap-2">
                  <Building size={20} className="text-luxury-gold" /> Update Bank Details
                </h3>
                <button onClick={() => setIsBankModalOpen(false)} className="text-gray-400 hover:text-black font-bold">×</button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsBankModalOpen(false);
                  alert('Bank details updated successfully.');
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input 
                    type="text" 
                    value={bankInfo.bankName}
                    onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Account Holder Name
                  </label>
                  <input 
                    type="text" 
                    value={bankInfo.accountName}
                    onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Account / IBAN
                    </label>
                    <input 
                      type="text" 
                      value={bankInfo.accountNumber}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Routing / SWIFT
                    </label>
                    <input 
                      type="text" 
                      value={bankInfo.routingNumber}
                      onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBankModalOpen(false)}
                    className="w-1/2 py-2.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors rounded-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors rounded-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tax & Commission Breakdown Statement Generator Modal */}
      <AnimatePresence>
        {isTaxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-sm shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block">Official Platform Accounting</span>
                  <h3 className="text-xl font-serif italic font-bold text-black flex items-center gap-2 mt-0.5">
                    <FileCheck size={20} className="text-luxury-gold" /> Tax & Commission Statement
                  </h3>
                </div>
                <button onClick={() => setIsTaxModalOpen(false)} className="text-gray-400 hover:text-black font-bold text-xl">×</button>
              </div>

              {/* Period Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Select Tax & Accounting Period
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTaxPeriod('FY_2026')}
                    className={`p-2 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                      selectedTaxPeriod === 'FY_2026' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    FY 2026 Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTaxPeriod('Q2_2026')}
                    className={`p-2 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                      selectedTaxPeriod === 'Q2_2026' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Q2 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTaxPeriod('Q1_2026')}
                    className={`p-2 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                      selectedTaxPeriod === 'Q1_2026' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Q1 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTaxPeriod('THIS_MONTH')}
                    className={`p-2 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                      selectedTaxPeriod === 'THIS_MONTH' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Current Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTaxPeriod('ALL_TIME')}
                    className={`p-2 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                      selectedTaxPeriod === 'ALL_TIME' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </div>

              {/* Realtime Statement Document Preview */}
              <div className="bg-gray-900 text-white p-6 rounded-sm border border-gray-800 space-y-4 font-sans shadow-inner">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Document Reference</span>
                    <span className="font-mono text-luxury-gold font-bold">{taxStatementData.statementId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Tax ID / VAT Registration</span>
                    <span className="font-mono text-gray-200">{taxStatementData.taxId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Atelier Partner</span>
                    <span className="font-bold text-white block">{taxStatementData.vendorName}</span>
                    <span className="text-[10px] text-gray-400">{taxStatementData.vendorEmail}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Subscription Tier</span>
                    <span className="font-bold text-luxury-gold block uppercase">{taxStatementData.tier} ({taxStatementData.commissionRateStr} Commission)</span>
                    <span className="text-[10px] text-gray-400">Total Transactions: {taxStatementData.orderCount}</span>
                  </div>
                </div>

                {/* Financial Breakdown Ledger */}
                <div className="bg-black/80 p-4 rounded border border-gray-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-gray-300">
                    <span>Gross Platform Revenue:</span>
                    <span className="text-white font-bold">{formatPrice(taxStatementData.grossSales)}</span>
                  </div>
                  <div className="flex justify-between text-purple-400">
                    <span>Platform Commission ({taxStatementData.commissionRateStr}):</span>
                    <span>-{formatPrice(taxStatementData.totalCommission)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 text-[11px] pt-1 border-t border-gray-800">
                    <span>Est. Output VAT / Tax (5%):</span>
                    <span>${taxStatementData.estimatedTaxVAT.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-gray-700 text-sm">
                    <span>Net Disbursable Vendor Earnings:</span>
                    <span>{formatPrice(taxStatementData.netPayoutAmount)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 italic">
                  * Generated electronically under MyFitStore Merchant Terms of Service. Verified for accounting & tax reporting compliance.
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsTaxModalOpen(false)}
                  className="w-full sm:w-1/3 py-2.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors rounded-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadTaxStatement();
                    setIsTaxModalOpen(false);
                  }}
                  className="w-full sm:w-2/3 py-2.5 bg-black text-white hover:bg-luxury-gold hover:text-black text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md rounded-xs"
                >
                  <Download size={15} /> Download Official Statement (CSV)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
