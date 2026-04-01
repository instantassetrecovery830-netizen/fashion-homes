import React from 'react';
import { Users, Search, Mail, ShieldCheck, ShieldAlert, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

interface Follower {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  isVerified: boolean;
  totalSpent: number;
}

interface FollowersViewProps {
  followers: Follower[];
  setIsSidebarOpen: (open: boolean) => void;
}

export const FollowersView: React.FC<FollowersViewProps> = ({ followers, setIsSidebarOpen }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic">Your Community</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and engage with your followers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search followers..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-sm text-sm focus:border-black outline-none w-64 transition-all"
            />
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
            <Users size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Total Followers</p>
          <p className="text-2xl font-serif">{followers.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">New This Month</p>
          <p className="text-2xl font-serif text-green-600">+12</p>
        </div>
        <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Engagement Rate</p>
          <p className="text-2xl font-serif text-luxury-gold">4.8%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Follower</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Join Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Spent</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {followers.map((follower) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={follower.id} 
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                        <img src={follower.avatar} alt={follower.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm flex items-center gap-1">
                          {follower.name}
                          {follower.isVerified && <ShieldCheck size={12} className="text-blue-500" />}
                        </p>
                        <p className="text-xs text-gray-500">{follower.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{follower.joinDate}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter ${follower.totalSpent > 1000 ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                      {follower.totalSpent > 1000 ? 'VIP Client' : 'Follower'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">${follower.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
