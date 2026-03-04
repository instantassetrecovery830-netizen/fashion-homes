
import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader, AlertCircle, Eye, EyeOff, Upload, Camera, Mail, CheckCircle, ArrowLeft, RefreshCw, Briefcase, ShoppingBag } from 'lucide-react';
import { UserRole, ViewState, Vendor, LandingPageContent } from '../types.ts';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, signInWithGoogle, sendPasswordResetEmail } from '../services/firebase.ts';
import { createVendorInDb, createUserInDb, getUserByEmail, getVendorByEmail } from '../services/dataService.ts';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
  onNavigate: (view: ViewState) => void;
  cmsContent?: LandingPageContent;
  initialMode?: 'LOGIN' | 'REGISTER';
  initialRole?: UserRole;
  initialPlan?: 'Atelier' | 'Maison' | 'Couture';
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onNavigate, cmsContent, initialMode = 'LOGIN', initialRole = UserRole.BUYER, initialPlan }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'REGISTER');
  const [isResetingPassword, setIsResetingPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification State
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Password Reset State
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  
  // Get images from CMS or fallbacks
  const loginImage = cmsContent?.auth?.loginImage || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070";
  const registerImage = cmsContent?.auth?.registerImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574";

  // Check for existing unverified session on mount
  useEffect(() => {
    // If user is logged in but stuck in verification flow
    if (auth.currentUser && !auth.currentUser.emailVerified) {
        setVerificationEmail(auth.currentUser.email || '');
        setVerificationNeeded(true);
    }
  }, []);

  // Update Role state when props change
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

  const handleReset = () => {
    setError(null);
    setName('');
    setBrandName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAvatar('');
    setVerificationNeeded(false);
    setResendStatus('idle');
    setResetEmailSent(false);
    setIsResetingPassword(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    handleReset();
  };

  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
        setError("Session expired. Please sign in again.");
        return;
    }

    setResendStatus('sending');
    try {
        await sendEmailVerification(user);
        setResendStatus('sent');
        // Reset to idle after 5 seconds so they can send again if needed
        setTimeout(() => setResendStatus('idle'), 5000); 
    } catch (e) {
        console.error("Resend failed", e);
        setError("Failed to resend email. Please try again.");
        setResendStatus('idle');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError("Please enter your email address to reset password.");
        return;
    }
    setError(null);
    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, email);
        setResetEmailSent(true);
    } catch (err: any) {
        console.error("Reset Password Error:", err);
        setError("Failed to send reset email. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      if (!user.email) throw new Error("Google account email not found.");

      // Attempt to create user in DB if they don't exist
      try {
         const displayName = user.displayName || 'Google User';
         const photoURL = user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200';

         if (selectedRole === UserRole.VENDOR) {
            // Check if vendor already exists to avoid overwriting details
            const vendor = await getVendorByEmail(user.email);
            if (!vendor) {
                await createVendorInDb({
                    id: user.uid,
                    name: brandName || displayName, // Fallback to displayName if brandName not set
                    bio: 'Joined via Google',
                    avatar: photoURL,
                    verificationStatus: 'PENDING',
                    subscriptionStatus: 'INACTIVE',
                    location: 'Unknown',
                    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200',
                    email: user.email,
                    subscriptionPlan: initialPlan || 'Atelier',
                    website: '',
                    instagram: '',
                    twitter: ''
                });
            }
         } else {
            const dbUser = await getUserByEmail(user.email);
            if (!dbUser) {
                await createUserInDb({
                    id: user.uid,
                    name: displayName,
                    email: user.email,
                    role: UserRole.BUYER,
                    avatar: photoURL,
                    status: 'ACTIVE'
                });
            }
         }
      } catch (dbError) {
          console.warn("DB user creation check skipped/failed:", dbError);
          // User likely exists or DB error - we proceed to routeUser which handles lookup
      }

      await routeUser(user);
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError("Google Sign In Failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  // Helper to route user based on DB role
  const routeUser = async (user: any) => {
      const adminEmails = [
          'instantassetrecovery830@gmail.com', 
          'juliemtrice7@proton.me', 
          'mikelarry00764@proton.me'
      ];
      if (adminEmails.includes(user.email?.toLowerCase() || '')) {
          onLogin(UserRole.ADMIN);
          return;
      } 
      
      try {
          // Optimized parallel lookup to minimize delay
          const [dbUser, dbVendor] = await Promise.all([
              getUserByEmail(user.email || ''),
              getVendorByEmail(user.email || '')
          ]);
          
          if (dbUser && dbUser.role) {
              onLogin(dbUser.role);
              return;
          }

          if (dbVendor) {
              onLogin(UserRole.VENDOR);
              return;
          }

          // Fallback: If DB entry doesn't exist yet, use the role they selected on the toggle
          onLogin(selectedRole); 
      } catch {
          onLogin(selectedRole);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        if (isRegister) {
            // Registration Flow
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            if (!name) {
                throw new Error("Name is required");
            }
            if (selectedRole === UserRole.VENDOR && !brandName) {
                throw new Error("Business Name is required for vendors");
            }

            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            const finalAvatar = avatar || 'https://via.placeholder.com/150';

            // Save to Database based on Role
            if (selectedRole === UserRole.VENDOR) {
                const newVendor: Vendor = {
                    id: user.uid,
                    name: brandName,
                    bio: `Bio for ${name}`,
                    avatar: finalAvatar,
                    verificationStatus: 'PENDING',
                    subscriptionStatus: 'INACTIVE',
                    location: 'Unknown',
                    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
                    email: user.email || '',
                    subscriptionPlan: initialPlan || 'Atelier'
                };
                await createVendorInDb(newVendor);
            } else {
                await createUserInDb({
                    id: user.uid,
                    name: name,
                    email: user.email || '',
                    role: UserRole.BUYER,
                    avatar: finalAvatar,
                    status: 'ACTIVE'
                });
            }

            // If user is auto-verified (as per simplified req), skip verification screen
            if (user.emailVerified) {
                await routeUser(user);
            } else {
                // Send Verification Email
                await sendEmailVerification(user);
                // Show Verification Screen immediately
                setVerificationEmail(user.email || email);
                setVerificationNeeded(true);
            }

        } else {
            // Login Flow
            const { user } = await signInWithEmailAndPassword(auth, email, password);

            // Check verification status
            if (!user.emailVerified) {
                setVerificationEmail(user.email || email);
                setVerificationNeeded(true);
                return; 
            }
            
            await routeUser(user);
        }
    } catch (err: any) {
        // Suppress expected operational errors from console to avoid alarming logs
        const expectedAuthErrors = ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password', 'auth/email-already-in-use'];
        if (!expectedAuthErrors.includes(err.code)) {
             console.error("Auth Error:", err);
        }

        // Specific Error Handling as requested
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError("Password or Email Incorrect");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("User already exists. Sign in?");
        } else {
            setError(err.message || "Authentication failed.");
        }
    } finally {
        // isLoading handled in routeUser if checking DB, otherwise false
        if (error) setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
                await routeUser(auth.currentUser);
                setVerificationNeeded(false);
            } else {
                setError("Email not verified yet. Please check your inbox or wait a moment.");
            }
        }
    } catch(e) {
         console.error(e);
         setError("Failed to check verification status.");
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

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-sm mb-6 text-left">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                
                <button 
                    onClick={handleCheckVerification}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors mb-3 flex justify-center items-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? <Loader className="animate-spin" size={16} /> : "I've Verified My Email"}
                </button>

                <button 
                    onClick={async () => {
                        await signOut(auth);
                        setVerificationNeeded(false);
                        setIsRegister(false);
                        setVerificationEmail('');
                        setError(null);
                    }}
                    className="w-full bg-white border border-gray-200 text-black py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors mb-6 flex justify-center items-center gap-2"
                >
                    Sign Out & Log In
                </button>
                
                <div className="bg-gray-50 p-4 rounded-sm">
                    <p className="text-xs text-gray-500 mb-3">Didn't receive the email?</p>
                    
                    {resendStatus === 'sent' ? (
                        <div className="text-green-600 text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
                            <CheckCircle size={14} /> Link Sent!
                        </div>
                    ) : (
                        <button
                            onClick={handleResendVerification}
                            disabled={resendStatus === 'sending'}
                            className="text-xs text-black font-bold uppercase tracking-widest hover:text-luxury-gold underline transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                        >
                            {resendStatus === 'sending' ? (
                                <><Loader size={12} className="animate-spin" /> Sending...</>
                            ) : (
                                <><RefreshCw size={12} /> Resend Link</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // Reset Password Flow View
  if (isResetingPassword) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 animate-fade-in">
            <div className="w-full max-w-md">
                <button onClick={() => setIsResetingPassword(false)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black mb-8">
                    <ArrowLeft size={16} /> Back to Sign In
                </button>
                
                <div className="text-center mb-10">
                     <h1 className="text-3xl font-serif italic mb-2">Reset Password</h1>
                     <p className="text-gray-400 text-sm">Enter your email to receive recovery instructions.</p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
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

                     {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-sm">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                     )}

                     {resetEmailSent && (
                        <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 p-3 rounded-sm animate-fade-in">
                            <CheckCircle size={14} />
                            <span>Password reset email sent to {email}. Check your inbox.</span>
                        </div>
                     )}

                     {!resetEmailSent && (
                         <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                         >
                            {isLoading ? <Loader className="animate-spin" size={16} /> : (
                                <>
                                   Send Reset Link <ArrowRight size={16} />
                                </>
                            )}
                         </button>
                     )}
                     
                     {resetEmailSent && (
                         <button 
                            type="button" 
                            onClick={() => setIsResetingPassword(false)}
                            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex justify-center items-center gap-2"
                         >
                            Return to Login
                         </button>
                     )}
                </form>
            </div>
        </div>
      );
  }

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

                     {!isRegister && (
                        <div className="flex justify-end mt-1">
                            <button
                                type="button"
                                onClick={() => { setIsResetingPassword(true); setError(null); }}
                                className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-black transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                     )}

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
                               {isRegister ? (selectedRole === UserRole.VENDOR ? 'Apply for Vendor Access' : 'Create Buyer Account') : (selectedRole === UserRole.VENDOR ? 'Vendor Sign In' : 'Buyer Sign In')} <ArrowRight size={16} />
                            </>
                        )}
                     </button>

                     {/* Google Sign In Separator */}
                     <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-medium">
                            <span className="bg-white px-3 text-gray-400">Or Continue With</span>
                        </div>
                     </div>

                     <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white border border-gray-200 text-luxury-black py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 group hover:border-black hover:bg-gray-50 shadow-sm hover:shadow-md"
                     >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Google</span>
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
