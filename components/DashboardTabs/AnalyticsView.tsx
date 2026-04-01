import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, Package, Users, DollarSign, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';
import { fetchVendorAnalytics } from '../../services/dataService';
import { auth } from '../../services/firebase';

interface AnalyticsViewProps {
  products: any[];
  orders: any[];
  vendorId?: string;
  vendorName?: string;
}

const COLORS = ['#0a0a0a', '#C5A059', '#8B8580', '#E5E5E5', '#4A0404', '#1B2432'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ products, orders, vendorId, vendorName }) => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!vendorId) return;
      try {
        const data = await fetchVendorAnalytics(vendorId);
        setAnalyticsData(data);
      } catch (e) {
        console.error("Error loading analytics:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, [vendorId]);

  const stats = useMemo(() => {
    const views = analyticsData.filter(d => d.type === 'VIEW').length;
    const cartAdds = analyticsData.filter(d => d.type === 'CART_ADD').length;
    const sales = analyticsData.filter(d => d.type === 'SALE').length;
    const conversionRate = views > 0 ? ((sales / views) * 100).toFixed(1) : '0';
    
    // Calculate revenue only for the vendor's items in the orders
    const totalRevenue = orders.reduce((sum, o) => {
      const vendorItems = o.items.filter((i: any) => i.designer === vendorName);
      const vendorItemsTotal = vendorItems.reduce((s: number, i: any) => s + (i.price * (i.quantity || 1)), 0);
      return sum + vendorItemsTotal;
    }, 0);

    return { views, cartAdds, sales, conversionRate, totalRevenue };
  }, [analyticsData, orders, vendorName]);

  const dailyData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayViews = analyticsData.filter(d => d.type === 'VIEW' && d.timestamp.startsWith(date)).length;
      const daySales = analyticsData.filter(d => d.type === 'SALE' && d.timestamp.startsWith(date)).length;
      return {
        name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        views: dayViews,
        sales: daySales
      };
    });
  }, [analyticsData]);

  const topProducts = useMemo(() => {
    const productSales: Record<string, number> = {};
    analyticsData.filter(d => d.type === 'SALE').forEach(d => {
      productSales[d.product_id] = (productSales[d.product_id] || 0) + 1;
    });

    return Object.entries(productSales)
      .map(([id, sales]) => {
        const product = products.find(p => p.id === id);
        return { name: product?.name || 'Unknown', sales };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [analyticsData, products]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach((i: any) => {
        if (data[i.category]) data[i.category] += 1;
        else data[i.category] = 1;
      });
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-luxury-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif italic">Performance Insights</h2>
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          Last 7 Days
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12%', up: true },
          { title: 'Profile Views', value: stats.views.toLocaleString(), icon: Eye, trend: '+5%', up: true },
          { title: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, trend: '-2%', up: false },
          { title: 'Cart Additions', value: stats.cartAdds.toLocaleString(), icon: ShoppingCart, trend: '+18%', up: true },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-sm">
                <kpi.icon size={18} className="text-luxury-gold" />
              </div>
              <div className={`flex items-center text-[10px] font-bold ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{kpi.title}</p>
            <p className="text-2xl font-serif">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Trends */}
        <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest">Engagement Trends</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-luxury-gold" />
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-black" />
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Sales</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af'}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '0px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#C5A059" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                <Area type="monotone" dataKey="sales" stroke="#000000" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-8">Top Performing Pieces</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#4b5563', width: 100}}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '0px', border: '1px solid #f0f0f0' }}
                />
                <Bar dataKey="sales" fill="#0a0a0a" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conversion Funnel & Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-8">Inventory Status</h3>
          <div className="space-y-6">
            {products.slice(0, 4).map((p, i) => {
              const stockPercent = Math.min(100, (p.stock / 50) * 100);
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="truncate max-w-[150px]">{p.name}</span>
                    <span className={p.stock < 10 ? 'text-red-500' : 'text-gray-400'}>{p.stock} units</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${p.stock < 10 ? 'bg-red-500' : 'bg-luxury-gold'}`}
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-8 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-colors">
            Manage Inventory
          </button>
        </div>

        <div className="lg:col-span-2 bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-8">Sales by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length > 0 ? categoryData : [{ name: 'No Sales', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.length > 0 ? categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )) : <Cell fill="#f0f0f0" />}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
