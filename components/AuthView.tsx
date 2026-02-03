
import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader, AlertCircle, Eye, EyeOff, Upload, Camera, Mail, CheckCircle, ArrowLeft, RefreshCw, Briefcase, ShoppingBag } from 'lucide-react';
import { UserRole, ViewState, Vendor, LandingPageContent } from '../types';
import { authService } from '../services/auth';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
  onNavigate: (view: ViewState) => void;
  cmsContent?: LandingPageContent;
  initialMode?: 'LOGIN' | 'REGISTER';
  initialRole?: UserRole;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onNavigate, cmsContent, initialMode = 'LOGIN', initialRole = UserRole.BUYER }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'REGISTER');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  
  const loginImage = cmsContent?.auth?.loginImage || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070";
  const registerImage = cmsContent?.auth?.registerImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574";

  useEffect(() => {
    setIsRegister(initialMode === 'REGISTER');
    setSelectedRole(initialRole);
  }, [initialMode, initialRole]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        if (isRegister) {
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            if (!name) {
                throw new Error("Name is required");
            }
            if (selectedRole === UserRole.VENDOR && !brandName) {
                throw new Error("Business Name is required for vendors");
            }

            const details = {
              name,
              brandName,
              avatar
            };

            const user = await authService.register(email, password, selectedRole, details);
            onLogin(user.role);

        } else {
            const user = await authService.signIn(email, password);
            onLogin(user.role);
        }
    } catch (err: any) {
        console.error("Auth Error:", err);
        setError(err.message || "Authentication failed.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fade-in">
        {/* Image Section */}
        <div className="hidden lg:block w-1/2 relative bg-gray-100 overflow-hidden">
             <img 
               src={isRegister ? registerImage : loginImage} 
               alt="Editorial" 
               className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
               key={isRegister ? 'register' : 'login'} 
             />
             <div className="absolute inset-0 bg-black/20" />
             <div className="absolute bottom-12 left-12 text-white max-w-md z-10 animate-slide-up">
                 <h2 className="text-4xl font-serif italic mb-4">
                    {isRegister ? "Join the Vanguard." : "Welcome Home."}
                 </h2>
                 <p className="text-sm font-light tracking-wide opacity-90">
                    {isRegister 
                        ? "Become part of a curated community redefining luxury digital commerce." 
                        : "Access your personalized dashboard, order history, and exclusive drops."}
                 </p>
             </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 lg:p-12 overflow-y-auto">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                     <h1 className="text-4xl font-serif italic mb-2">MyFitStore</h1>
                     <p className="text-gray-400 text-sm uppercase tracking-widest">
                         {isRegister ? 'Join the Community' : 'Welcome Back'}
                     </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                     {/* Role Selection Tabs */}
                     <div className="flex p-1 rounded-full border border-gray-100 mb-8 relative bg-gray-50/50">
                         {/* Sliding Background */}
                         <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm rounded-full transition-all duration-300 ease-in-out ${selectedRole === UserRole.VENDOR ? 'left-[calc(50%+2px)]' : 'left-1'}`} />
                         
                         <button
                            type="button" 
                            onClick={() => setSelectedRole(UserRole.BUYER)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all relative z-10 flex items-center justify-center gap-2 ${selectedRole === UserRole.BUYER ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                             <ShoppingBag size={14} /> Buyer
                         </button>
                         <button 
                            type="button"
                            onClick={() => setSelectedRole(UserRole.VENDOR)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all relative z-10 flex items-center justify-center gap-2 ${selectedRole === UserRole.VENDOR ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                             <Briefcase size={14} /> Vendor
                         </button>
                     </div>

                     {isRegister && (
                        <div className="animate-fade-in space-y-5">
                             {/* Profile Photo Upload */}
                             <div className="flex justify-center mb-4">
                                <div className="relative w-24 h-24 rounded-full bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center group cursor-pointer">
                                    {avatar ? (
                                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-gray-300" size={32} />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload className="text-white" size={20} />
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 mb-4">Upload Profile Photo</p>

                            {/* Name Input */}
                            <div>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none bg-transparent"
                                />
                            </div>

                            {/* Business Name (Vendor Only) */}
                            {selectedRole === UserRole.VENDOR && (
                                 <div className="animate-fade-in">
                                    <input 
                                        type="text"
                                        required
                                        placeholder="Business / Atelier Name"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none bg-transparent"
                                    />
                                 </div>
                            )}
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

                     <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none bg-transparent pr-10"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-3 text-gray-400 hover:text-black"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>

                     {isRegister && (
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Repeat Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none bg-transparent pr-10"
                            />
                        </div>
                     )}

                     {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-sm animate-fade-in">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                     )}

                     <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex justify-center items-center gap-2 mt-8 disabled:opacity-70"
                     >
                        {isLoading ? <Loader className="animate-spin" size={16} /> : (
                            <>
                               {isRegister ? (selectedRole === UserRole.VENDOR ? 'Apply for Vendor Access' : 'Create Buyer Account') : (selectedRole === UserRole.VENDOR ? 'Vendor Sign In' : 'Buyer Sign In')} <ArrowRight size={16} />
                            </>
                        )}
                     </button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={toggleMode}
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
    </div>
  );
};
