
import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader, Shield, AlertCircle, Eye, EyeOff, Upload, Camera, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { UserRole, ViewState, Vendor, LandingPageContent } from '../types';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, signInWithGoogle, onAuthStateChanged } from '../services/firebase';
import { createVendorInDb, createUserInDb } from '../services/dataService';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
  onNavigate: (view: ViewState) => void;
  cmsContent?: LandingPageContent;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onNavigate, cmsContent }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BUYER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification State
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Form states
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Get images from CMS or fallbacks
  const loginImage = cmsContent?.auth?.loginImage || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070";
  const registerImage = cmsContent?.auth?.registerImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574";

  // Check for existing unverified session on mount (e.g. refresh)
  useEffect(() => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
        setVerificationEmail(auth.currentUser.email || '');
        setVerificationNeeded(true);
    }
  }, []);

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
    setResendStatus('idle');
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    handleReset();
  };

  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
        setError("Session expired. Please sign in again to resend email.");
        return;
    }

    setResendStatus('sending');
    try {
        await sendEmailVerification(user);
        setResendStatus('sent');
        setTimeout(() => setResendStatus('idle'), 5000); // Reset message after 5s
    } catch (e) {
        console.error("Resend failed", e);
        setResendStatus('idle');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // @ts-ignore - signInWithGoogle returns a UserCredential-like object in mock, or real one
      const { user } = await signInWithGoogle(auth);
      
      // Attempt to create user in DB. If ID exists, this catches and we assume user is already registered.
      try {
         const displayName = user.displayName || 'Google User';
         const photoURL = user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200';

         if (selectedRole === UserRole.VENDOR) {
            await createVendorInDb({
                id: user.uid,
                name: displayName,
                bio: 'Joined via Google',
                avatar: photoURL,
                verificationStatus: 'PENDING',
                subscriptionStatus: 'INACTIVE',
                location: 'Unknown',
                coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200',
                email: user.email || '',
                subscriptionPlan: 'Atelier',
                website: '',
                instagram: '',
                twitter: ''
            });
         } else {
            await createUserInDb({
                id: user.uid,
                name: displayName,
                email: user.email || '',
                role: UserRole.BUYER,
                avatar: photoURL,
                status: 'ACTIVE'
            });
         }
      } catch (dbError) {
          console.log("User likely exists in DB, proceeding with login.");
      }

      const adminEmails = ['instantassetrecovery830@gmail.com', 'juliemtrice7@proton.me'];
      if (adminEmails.includes(user.email?.toLowerCase() || '')) {
          onLogin(UserRole.ADMIN);
      } else {
          onLogin(selectedRole);
      }
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError("Google Sign In Failed");
    } finally {
        setIsLoading(false);
    }
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
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
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
                    avatar: finalAvatar,
                    status: 'ACTIVE'
                });
            }

            // Send Verification Email
            await sendEmailVerification(user);
            
            // Note: We keep the user signed in so we can access auth.currentUser for resending verification.
            // The App component will treat them as logged out because emailVerified is false.

            // Show Verification Screen
            setVerificationEmail(user.email || email);
            setVerificationNeeded(true);

        } else {
            // Login Flow
            const { user } = await signInWithEmailAndPassword(auth, email, password);

            // Check if verified
            if (!user.emailVerified) {
                // Keep user signed in for resend functionality
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
                    Verify it and log in.
                </p>
                <button 
                    onClick={async () => {
                        // Sign out so they can log in again to refresh their token status
                        await signOut(auth);
                        setVerificationNeeded(false);
                        setIsRegister(false); // Switch to login mode
                        setPassword(''); // Clear password for security
                        setConfirmPassword('');
                        setResendStatus('idle');
                    }}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors mb-6"
                >
                    Log In
                </button>
                
                <div>
                    {resendStatus === 'sent' ? (
                        <p className="text-green-600 text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
                            <CheckCircle size={14} /> Email sent successfully!
                        </p>
                    ) : (
                        <button
                            onClick={handleResendVerification}
                            disabled={resendStatus === 'sending'}
                            className="text-xs text-gray-400 hover:text-black underline transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                        >
                            {resendStatus === 'sending' ? (
                                <><Loader size={12} className="animate-spin" /> Sending...</>
                            ) : (
                                "Didn't receive it? Resend Email"
                            )}
                        </button>
                    )}
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <button 
                        onClick={async () => {
                            await signOut(auth);
                            setVerificationNeeded(false);
                            onNavigate('LANDING');
                        }}
                        className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                    >
                        Sign Out / Back to Store
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex animate-fade-in">
        {/* Image Section - Hidden on mobile, 50% on desktop */}
        <div className="hidden lg:block w-1/2 relative bg-gray-100 overflow-hidden">
             <img 
               src={isRegister ? registerImage : loginImage} 
               alt="Editorial" 
               className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
               key={isRegister ? 'register' : 'login'} // Force re-render/anim for key change
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
                            <span>
                                {error === "User already exists. Sign in?" ? (
                                    <>
                                        User already exists. <button type="button" onClick={() => { setIsRegister(false); setError(null); }} className="underline font-bold hover:text-red-700">Sign in?</button>
                                    </>
                                ) : (
                                    error
                                )}
                            </span>
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

                     {/* Google Sign In */}
                     <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">Or continue with</span>
                        </div>
                     </div>

                     <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full border border-gray-200 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors flex justify-center items-center gap-2"
                     >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
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
