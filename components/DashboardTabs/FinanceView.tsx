import React, { useState, useMemo } from 'react';
import { 
  Wallet, Clock, TrendingUp, Activity, Download, CheckCircle, Menu, ArrowUpRight, 
  CreditCard, DollarSign, Percent, ShieldCheck, Filter, Search, ArrowDownRight, 
  Building, RefreshCw, AlertCircle, FileText, Check, ChevronRight, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Order, User, Vendor } from '../../types';
import { useCurrency } from '../../context/CurrencyContext.tsx';

interface FinanceViewProps {
  totalRevenue: number;
  myOrders: Order[];
  setIsSidebarOpen: (open: boolean) => void;
  currentUser?: User | Vendor | null;
  vendor?: Vendor | null;
}

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  accountEnding: string;
  status: 'Completed' | 'Processing' | 'Pending';
  referenceNumber: string;
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
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'PAYOUTS' | 'BANK_SETTINGS'>('LEDGER');

  // Modals
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [payoutAmountInput, setPayoutAmountInput] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'STRIPE' | 'PAYSTACK'>('BANK_TRANSFER');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Bank Info State
  const [bankInfo, setBankInfo] = useState({
    bankName: vendor?.bankDetails?.bankName || 'J.P. Morgan Chase & Co.',
    accountName: vendor?.bankDetails?.accountName || vendor?.name || 'Maison Atelier Inc.',
    accountNumber: vendor?.bankDetails?.accountNumber || '••••••••4242',
    routingNumber: vendor?.bankDetails?.routingNumber || '021000021',
    swiftCode: 'CHASUS33',
    country: 'United States'
  });

  // Payout History State
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([
    {
      id: 'PO-98421',
      date: '2026-08-15',
      amount: 2400.00,
      method: 'Bank Wire (USD)',
      accountEnding: '••••4242',
      status: 'Completed',
      referenceNumber: 'REF-8842190'
    },
    {
      id: 'PO-98305',
      date: '2026-07-30',
      amount: 1850.50,
      method: 'Bank Wire (USD)',
      accountEnding: '••••4242',
      status: 'Completed',
      referenceNumber: 'REF-7639102'
    },
    {
      id: 'PO-98112',
      date: '2026-07-01',
      amount: 3200.00,
      method: 'Bank Wire (USD)',
      accountEnding: '••••4242',
      status: 'Completed',
      referenceNumber: 'REF-6520194'
    }
  ]);

  // Commission Rate calculation based on subscription plan
  const commissionRate = useMemo(() => {
    const plan = vendor?.subscriptionPlan || 'BASIC';
    if (plan === 'Couture' || plan === 'Maison') return 0.10; // 10% Couture/Maison plan
    if (plan === 'Atelier') return 0.12; // 12% Atelier plan
    return 0.15; // 15% Standard/BASIC plan
  }, [vendor]);

  const commissionPercentStr = `${(commissionRate * 100).toFixed(0)}%`;

  // Date Filter Logic
  const filteredOrders = useMemo(() => {
    let list = [...myOrders];

    const now = new Date('2026-09-02'); // Current simulated platform date
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

  // Financial Calculations
  const grossSales = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  const totalCommissionDeducted = useMemo(() => {
    return grossSales * commissionRate;
  }, [grossSales, commissionRate]);

  const netEarnings = useMemo(() => {
    return grossSales - totalCommissionDeducted;
  }, [grossSales, totalCommissionDeducted]);

  // Payout Adjustments
  const totalPayoutsRequested = useMemo(() => {
    return payoutHistory
      .filter(p => p.status === 'Completed' || p.status === 'Processing')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payoutHistory]);

  const totalLifetimeNet = useMemo(() => {
    const lifetimeGross = myOrders.reduce((sum, o) => sum + o.total, 0);
    return lifetimeGross * (1 - commissionRate);
  }, [myOrders, commissionRate]);

  // Pending vs Available Clearance logic
  const pendingClearance = useMemo(() => {
    // Orders in Processing status or within last 3 days
    return filteredOrders
      .filter(o => o.status === 'Processing')
      .reduce((sum, o) => sum + (o.total * (1 - commissionRate)), 0);
  }, [filteredOrders, commissionRate]);

  const availableBalance = useMemo(() => {
    const totalClearedNet = totalLifetimeNet - pendingClearance;
    const balance = totalClearedNet - totalPayoutsRequested;
    return Math.max(0, balance);
  }, [totalLifetimeNet, pendingClearance, totalPayoutsRequested]);

  // Chart Data preparation
  const monthlyChartData = useMemo(() => {
    const monthlyMap: Record<string, { gross: number; commission: number; net: number }> = {};
    
    // Sort orders chronologically
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
      'Gross Amount (USD)',
      'Commission Rate (%)',
      'Commission Fee (USD)',
      'Net Vendor Earnings (USD)',
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
    link.setAttribute('download', `MyFitStore_Revenue_Statement_${dateRange}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Payout Request Handler
  const handleRequestPayout = (e: React.FormEvent) => {
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

    const newRecord: PayoutRecord = {
      id: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().slice(0, 10),
      amount: amountNum,
      method: payoutMethod === 'BANK_TRANSFER' ? `Bank Wire (${bankInfo.bankName})` : payoutMethod,
      accountEnding: bankInfo.accountNumber.slice(-4) || '4242',
      status: 'Processing',
      referenceNumber: `REF-${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    setPayoutHistory([newRecord, ...payoutHistory]);
    setPayoutSuccessMsg(`Payout request of ${formatPrice(amountNum)} submitted successfully. Reference: ${newRecord.referenceNumber}`);
    setPayoutAmountInput('');
    setIsPayoutModalOpen(false);

    setTimeout(() => {
      setPayoutSuccessMsg(null);
    }, 6000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif italic text-black">Payout & Earnings</h2>
            <span className="bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-luxury-gold/20 flex items-center gap-1">
              <ShieldCheck size={12} /> Tier: {vendor?.subscriptionPlan || 'STANDARD'} ({commissionPercentStr} Fee)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time financial dashboard with gross revenue, platform deductions, clearance schedules, and automated payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-white border border-gray-200 text-xs font-semibold px-3 py-2.5 rounded-sm focus:outline-none focus:border-black transition-colors"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="LAST_90_DAYS">Last 90 Days</option>
          </select>

          {/* Export CSV Statement Button */}
          <button 
            onClick={handleDownloadCSV}
            className="bg-luxury-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-luxury-gold transition-colors shadow-sm"
            title="Download full itemized CSV revenue statement"
          >
            <Download size={15} /> <span className="hidden sm:inline">Export Statement</span> (CSV)
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
            <CheckCircle size={16} className="text-emerald-600" />
            <span>{payoutSuccessMsg}</span>
          </div>
          <button onClick={() => setPayoutSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </motion.div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Balance / Wallet Card */}
        <div className="bg-luxury-black text-white p-6 rounded-sm shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1">
                <Wallet size={12} className="text-luxury-gold" /> Available Balance
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">Ready</span>
            </div>
            <h3 className="text-3xl font-serif mb-1 font-semibold text-white">{formatPrice(availableBalance)}</h3>
            <p className="text-[10px] text-gray-400">Cleared net funds ready for withdrawal</p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <button 
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={availableBalance <= 0}
              className={`w-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${
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

        {/* Platform Commission Deductions */}
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
            <span>Atelier Tier</span>
            <span className="text-purple-600 font-bold text-[10px] uppercase">{vendor?.subscriptionPlan || 'STANDARD'}</span>
          </div>
        </div>

        {/* Net Earnings */}
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Net Earnings</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium text-emerald-700">{formatPrice(netEarnings)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Gross sales minus {commissionPercentStr} commission</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Pending Clearance:</span>
            <span className="text-amber-600 font-mono font-bold text-[10px]">{formatPrice(pendingClearance)}</span>
          </div>
        </div>
      </div>

      {/* Recharts Monthly Sales vs Net Earnings Breakdown */}
      <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
              <Activity size={16} className="text-luxury-gold" /> Monthly Revenue & Net Payout Trend
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Comparison of gross order revenue vs. net vendor earnings after commission</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-black rounded-xs block"></span>
              <span className="text-gray-600">Gross Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-luxury-gold rounded-xs block"></span>
              <span className="text-gray-600">Net Vendor Earnings</span>
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
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'LEDGER'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <FileText size={14} /> Revenue Ledger ({filteredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('PAYOUTS')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'PAYOUTS'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <Clock size={14} /> Payout History ({payoutHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('BANK_SETTINGS')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'BANK_SETTINGS'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <Building size={14} /> Bank & Payment Setup
          </button>
        </div>

        {/* Search Bar for Ledger */}
        {activeTab === 'LEDGER' && (
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
        )}

        {/* Tab 1: Revenue Ledger */}
        {activeTab === 'LEDGER' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Order ID & Customer</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4 text-right">Gross Total</th>
                  <th className="p-4 text-center">Fee Rate</th>
                  <th className="p-4 text-right">Commission Fee</th>
                  <th className="p-4 text-right">Net Payout</th>
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
                              <Clock size={10} /> Pending
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
        )}

        {/* Tab 2: Payout History */}
        {activeTab === 'PAYOUTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Payout ID</th>
                  <th className="p-4">Request Date</th>
                  <th className="p-4">Method & Account</th>
                  <th className="p-4">Reference No.</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payoutHistory.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-bold text-black">{payout.id}</td>
                    <td className="p-4 text-gray-500 font-mono">{payout.date}</td>
                    <td className="p-4">
                      <div className="font-medium text-black">{payout.method}</div>
                      <div className="text-[10px] text-gray-400">Account ending in {payout.accountEnding}</div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Bank & Payment Setup */}
        {activeTab === 'BANK_SETTINGS' && (
          <div className="p-8 max-w-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <Building size={18} className="text-luxury-gold" /> Payout Disbursement Account
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Funds requested during payouts are automatically deposited to this account.</p>
              </div>
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-luxury-gold transition-colors"
              >
                Edit Details
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded border border-gray-100">
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
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Routing / SWIFT</span>
                <span className="text-sm font-mono text-black">{bankInfo.routingNumber}</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs flex items-start gap-3">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Security & Compliance Notice</strong>
                All payout disbursement details are verified against seller KYC documentation. Changes to bank details undergo a 24-hour security hold before disbursements can be initiated.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-sm shadow-2xl max-w-md w-full p-6 space-y-6 border border-gray-100"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-lg font-serif italic font-bold text-black flex items-center gap-2">
                  <ArrowUpRight size={20} className="text-luxury-gold" /> Request Payout
                </h3>
                <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-400 hover:text-black font-bold">×</button>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Available Balance</span>
                    <span className="text-lg font-serif font-bold text-emerald-700">{formatPrice(availableBalance)}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setPayoutAmountInput(availableBalance.toFixed(2))}
                    className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Payout Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="1"
                      max={availableBalance}
                      placeholder="0.00"
                      value={payoutAmountInput}
                      onChange={(e) => setPayoutAmountInput(e.target.value)}
                      required
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 text-sm rounded-sm focus:outline-none focus:border-black font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Disbursement Method
                  </label>
                  <select 
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-200 text-xs font-medium rounded-sm focus:outline-none focus:border-black"
                  >
                    <option value="BANK_TRANSFER">Direct Bank Wire ({bankInfo.bankName})</option>
                    <option value="STRIPE">Stripe Connect Instant Payout</option>
                    <option value="PAYSTACK">Paystack Transfer (NGN/USD)</option>
                  </select>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-100 rounded text-[11px] space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Disbursement Fee:</span>
                    <strong className="text-emerald-600 font-mono">FREE ($0.00)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Processing:</span>
                    <strong className="text-black">1-2 Business Days</strong>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="w-1/2 py-2.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold transition-colors"
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Bank Info Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                    className="w-1/2 py-2.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
