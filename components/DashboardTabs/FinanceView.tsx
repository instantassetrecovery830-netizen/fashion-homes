
import React from 'react';
import { Wallet, Clock, TrendingUp, Activity, Download, CheckCircle, Menu } from 'lucide-react';

interface FinanceViewProps {
    totalRevenue: number;
    myOrders: any[];
    setIsSidebarOpen: (open: boolean) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ totalRevenue, myOrders, setIsSidebarOpen }) => {
    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">Finance & Payouts</h2>
                <div className="flex gap-4">
                    <button className="bg-luxury-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hidden md:flex items-center gap-2 hover:bg-luxury-gold transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Wallet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-luxury-black text-white p-8 rounded-sm shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
                        <h3 className="text-4xl font-serif mb-6">${(totalRevenue * 0.85).toLocaleString()}</h3>
                        <button className="bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-colors">
                            Request Payout
                        </button>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-white/5">
                        <Wallet size={150} />
                    </div>
                </div>

                <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-full">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending Clearance</span>
                    </div>
                    <h3 className="text-3xl font-serif">$1,250.00</h3>
                    <p className="text-[10px] text-gray-400 mt-2">Available on Nov 1st</p>
                </div>

                <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-full">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Earnings</span>
                    </div>
                    <h3 className="text-3xl font-serif">${totalRevenue.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 mt-2">Lifetime volume</p>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white border border-gray-100 overflow-hidden rounded-sm shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> Recent Transactions
                    </h3>
                </div>
                <table className="w-full text-left text-sm min-w-full">
                    <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold">
                        <tr>
                            <th className="p-6">Date</th>
                            <th className="p-6">Description</th>
                            <th className="p-6">Type</th>
                            <th className="p-6 text-right">Amount</th>
                            <th className="p-6 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {myOrders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="p-6 font-medium">Order #{order.id.slice(-6)}</td>
                                <td className="p-6"><span className="bg-green-50 text-green-700 px-2 py-1 rounded-sm text-[10px] uppercase font-bold">Sale</span></td>
                                <td className="p-6 text-right font-mono text-green-600">+${(order.total * 0.85).toFixed(2)}</td>
                                <td className="p-6 text-center">
                                    <span className="text-green-600 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                                        <CheckCircle size={10} /> Cleared
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {/* Mock Payout */}
                        <tr className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 text-gray-500">Oct 15, 2024</td>
                            <td className="p-6 font-medium">Payout to Bank •••• 4242</td>
                            <td className="p-6"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-sm text-[10px] uppercase font-bold">Withdrawal</span></td>
                            <td className="p-6 text-right font-mono text-black">-$2,400.00</td>
                            <td className="p-6 text-center">
                                <span className="text-gray-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                                    <CheckCircle size={10} /> Processed
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
