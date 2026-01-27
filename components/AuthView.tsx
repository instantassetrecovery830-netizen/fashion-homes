import React, { useState } from 'react';
import { ArrowRight, Loader, Shield, AlertCircle, Eye, EyeOff, Upload, Camera, Mail, CheckCircle } from 'lucide-react';
import { UserRole, ViewState, Vendor } from '../types';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { createVendorInDb, createUserInDb } from '../services/dataService';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
  onNavigate: (view: ViewState) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onNavigate }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BUYER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification State
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setError(null);
    setName('');
    setBrandName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAvatar('');
    setAvatarFile(null);
    setVerificationNeeded(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    handleReset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        if (isRegister) {
            // Validation
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            // Register Flow
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const finalAvatar = avatar || 'https://via.placeholder.com/150';

            // Save to Database
            if (selectedRole === UserRole.VENDOR) {
                const newVendor: Vendor = {
                    id: user.uid,
                    name: brandName || name || 'New Brand',
                    bio: 'No bio yet.',
                    avatar: finalAvatar,
                    verificationStatus: 'PENDING',
                    subscriptionStatus: 'INACTIVE',
                    location: 'Unknown',
                    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
                    email: user.email || '',
                    subscriptionPlan: 'Atelier'
                };
                await createVendorInDb(newVendor);
            } else {
                await createUserInDb({
                    id: user.uid,
                    name: name || 'New User',
                    email: user.email || '',
                    role: UserRole.BUYER,
                    avatar: finalAvatar
                });
            }

            // Send Verification Email
            await sendEmailVerification(user);
            
            // Sign out immediately so they can't access the app yet
            await signOut(auth);

            // Show Verification Screen
            setVerificationEmail(user.email || email);
            setVerificationNeeded(true);

        } else {
            // Login Flow
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if verified
            if (!user.emailVerified) {
                await signOut(auth);
                setVerificationEmail(user.email || email);
                setVerificationNeeded(true);
                return;
            }
            
            const adminEmails = ['instantassetrecovery830@gmail.com', 'juliemtrice7@proton.me'];
            if (adminEmails.includes(user.email?.toLowerCase() || '')) {
                onLogin(UserRole.ADMIN);
            } else {
                // App.tsx will handle the DB lookup to switch role to Vendor if needed
                onLogin(selectedRole); 
            }
        }
    } catch (err: any) {
        console.error("Auth Error:", err);
        // Map Firebase errors to user-friendly messages
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError("Password or Email Incorrect");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("User already exists. Sign in?");
        } else {
            setError(err.message || "Authentication failed. Please check your credentials.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  if (verificationNeeded) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 animate-fade-in">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center mb-6">
                    <Mail size={32} />
                </div>
                <h2 className="text-2xl font-serif italic mb-4">Verify Your Email</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    We have sent you a verification email to <span className="font-bold text-black">{verificationEmail}</span>. 
                    <br />Verify it and log in.
                </p>
                <button 
                    onClick={() => {
                        setVerificationNeeded(false);
                        setIsRegister(false); // Switch to login mode
                        setPassword(''); // Clear password for security
                        setConfirmPassword('');
                    }}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors"
                >
                    Log In
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 animate-fade-in">
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                 <h1 className="text-4xl font-serif italic mb-2">MyFitStore</h1>
                 <p className="text-gray-400 text-sm uppercase tracking-widest">
                     {isRegister ? 'Join the Community' : 'Welcome Back'}
                 </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                 {/* Role Selection for Register */}
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

                 {isRegister && (
                    <>
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

                        {selectedRole === UserRole.VENDOR && (
                             <div>
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
                    </>
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
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-sm">
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
                           {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
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
  );
};