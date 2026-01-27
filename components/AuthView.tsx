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
    
    // Immediate Login - "Real Time" feel
    // In a full implementation, we would verify credentials against DB here
    // For now, we instantly log the user in based on their selection
    
    setTimeout(() => {
        if (email.toLowerCase() === 'instantassetrecovery830@gmail.com') {
          onLogin(UserRole.ADMIN);
        } else {
          onLogin(selectedRole);
        }
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 animate-fade-in">
        <div className="w-full max-w-md">
            <div className="text-center mb-12">
                 <h1 className="text-4xl font-serif italic mb-2">MyFitStore</h1>
                 <p className="text-gray-400 text-sm uppercase tracking-widest">
                     {isRegister ? 'Join the Community' : 'Welcome Back'}
                 </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Role Selection for Register or easy switching in demo */}
                 <div className="flex bg-gray-50 p-1 rounded-sm mb-6">
                     <button
                        type="button" 
                        onClick={() => setSelectedRole(UserRole.BUYER)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all ${selectedRole === UserRole.BUYER ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-black'}`}
                     >
                         Buyer
                     </button>
                     <button 
                        type="button"
                        onClick={() => setSelectedRole(UserRole.VENDOR)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all ${selectedRole === UserRole.VENDOR ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-black'}`}
                     >
                         Vendor
                     </button>
                 </div>

                 {isRegister && selectedRole === UserRole.VENDOR && (
                     <div>
                        <input 
                            type="text"
                            required
                            placeholder="Brand / Atelier Name"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none bg-transparent"
                        />
                     </div>
                 )}

                 <div>
                    <input 
                        type="email"
                        required
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none bg-transparent"
                    />
                 </div>

                 <div>
                    <input 
                        type="password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none bg-transparent"
                    />
                 </div>

                 <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex justify-center items-center gap-2 mt-8 disabled:opacity-70"
                 >
                    {isLoading ? <Loader className="animate-spin" size={16} /> : (
                        <>
                           {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
                        </>
                    )}
                 </button>
            </form>

            <div className="mt-8 text-center">
                <button 
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-xs text-gray-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5"
                >
                    {isRegister ? 'Already have an account? Sign In' : 'New to MyFitStore? Apply for Access'}
                </button>
            </div>
            
            <div className="mt-12 text-center">
                 <button onClick={() => onNavigate('LANDING')} className="text-[10px] text-gray-300 uppercase tracking-widest hover:text-black transition-colors">
                     Back to Store
                 </button>
            </div>
        </div>
    </div>
  );
};