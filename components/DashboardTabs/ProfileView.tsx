import React, { useState, useEffect } from 'react';
import { User, Lock, Settings, CheckCircle, AlertCircle, Menu, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../../services/firebase';
import { UserRole, FeatureFlags, User as AppUser } from '../../types';

interface ProfileViewProps {
  role: UserRole;
  newPassword: string;
  setNewPassword: (password: string) => void;
  passwordMsg: string;
  handlePasswordUpdate: (e: React.FormEvent) => void;
  onUpdateUser?: (user: AppUser) => Promise<void>;
  users: AppUser[];
  featureFlags: FeatureFlags;
  toggleFeatureFlag: (key: keyof FeatureFlags) => void;
  setIsSidebarOpen: (open: boolean) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  role,
  newPassword,
  setNewPassword,
  passwordMsg,
  handlePasswordUpdate,
  onUpdateUser,
  users,
  featureFlags,
  toggleFeatureFlag,
  setIsSidebarOpen
}) => {
  const currentUser = users.find(u => u.email === auth.currentUser?.email);
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && onUpdateUser) {
      await onUpdateUser({ ...currentUser, name, avatar });
      alert('Profile updated successfully.');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif italic">Account Settings</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
          <Menu size={20} />
        </button>
      </div>
      
      {/* Profile Update */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
          <User size={14} /> Personal Details
        </h3>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-md relative group">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="m-auto mt-8 text-gray-400" />
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera size={24} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors"
                placeholder="Full Name"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors shadow-md"
          >
            Update Profile
          </button>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
          <Lock size={14} /> Security
        </h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">New Password</label>
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          {passwordMsg && (
            <div className={`text-xs p-3 rounded-sm flex items-center gap-2 ${passwordMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
              {passwordMsg.includes('success') ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {passwordMsg}
            </div>
          )}
          <button 
            type="submit" 
            disabled={!newPassword}
            className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Update Password
          </button>
        </form>
      </motion.div>
      
      {/* Feature Flags (Admin Only) */}
      {role === UserRole.ADMIN && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-400">
            <Settings size={14} /> System Controls
          </h3>
          <div className="space-y-4">
            {Object.entries(featureFlags).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button 
                  onClick={() => toggleFeatureFlag(key as keyof FeatureFlags)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
