import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    checkUser,
    sendOtp, 
    verifyOtp, 
    setPinAndRegister, 
    loginWithPin 
  } = useAuth();

  // Mode: 'email' -> 'otp' -> 'create_pin' OR 'pin_login'
  const [step, setStep] = useState<'email' | 'otp' | 'create_pin' | 'pin_login'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loginPin, setLoginPin] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailNotConfigured, setEmailNotConfigured] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Auto-initialize with remembered email and direct 4-digit PIN login
  React.useEffect(() => {
    if (isAuthModalOpen) {
      try {
        const lastEmail = localStorage.getItem('anshsflix_last_email');
        if (lastEmail && lastEmail.includes('@')) {
          setEmail(lastEmail);
          setIsExistingUser(true);
          setStep('pin_login');
        } else {
          setStep('email');
        }
      } catch {
        setStep('email');
      }
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    // Reset state
    setTimeout(() => {
      setStep('email');
      setEmail('');
      setOtp('');
      setPin('');
      setConfirmPin('');
      setLoginPin('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setEmailNotConfigured(false);
    }, 200);
  };

  // Step 1: Submit Email -> If already registered with PIN, go DIRECT to 4-Digit PIN (No OTP needed!)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmailNotConfigured(false);

    // Check if account already exists with a PIN
    const status = await checkUser(cleanEmail);

    if (status.exists && status.hasPin) {
      // Existing user: DIRECT TO 4-DIGIT PIN LOGIN! NO OTP REQUIRED!
      setIsLoading(false);
      setIsExistingUser(true);
      setStep('pin_login');
      return;
    }

    // New user (or no PIN set yet): Send OTP
    const res = await sendOtp(cleanEmail);
    setIsLoading(false);

    if (res.success) {
      setIsExistingUser(!!res.isRegistered);
      setSuccessMsg(`Verification code sent to ${cleanEmail}. Please check your inbox and spam.`);
      setStep('otp');
    } else {
      if (res.emailNotConfigured) {
        setEmailNotConfigured(true);
      }
      setErrorMsg(res.error || 'Failed to send verification code. Please check your email configuration.');
    }
  };

  // Switch to PIN Login
  const handleSwitchToPinLogin = () => {
    setErrorMsg(null);
    setStep('pin_login');
  };

  // Send OTP for Forgot PIN or verification
  const handleRequestOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setStep('email');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    const res = await sendOtp(email);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(`Verification code sent to ${email}.`);
      setStep('otp');
    } else {
      setErrorMsg(res.error || 'Failed to send OTP to email');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setErrorMsg('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await verifyOtp(email, otp);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('OTP verified successfully!');
      setStep('create_pin');
    } else {
      setErrorMsg(res.error || 'Invalid verification code');
    }
  };

  // Step 3: Create 4-Digit PIN & Register
  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setErrorMsg('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await setPinAndRegister(email, otp, pin);
    setIsLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setErrorMsg(res.error || 'Failed to set PIN');
    }
  };

  // Fast Login with 4-Digit PIN
  const handleLoginWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPin.length !== 4) {
      setErrorMsg('Please enter your 4-digit PIN');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await loginWithPin(email, loginPin);
    setIsLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setErrorMsg(res.error || 'Incorrect 4-digit PIN');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-600/30 mb-3">
            {step === 'create_pin' || step === 'pin_login' ? (
              <Lock className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {step === 'email' && 'Sign In to Remix Ansh\'s Flix'}
            {step === 'otp' && 'Verify Email OTP'}
            {step === 'create_pin' && (isExistingUser ? 'Reset Your 4-Digit PIN' : 'Create 4-Digit Security PIN')}
            {step === 'pin_login' && 'Enter 4-Digit PIN'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {step === 'email' && 'Save your Continue Watching, Watchlist & Streaming Preferences across devices.'}
            {step === 'otp' && `Enter the 6-digit OTP code sent to ${email}`}
            {step === 'create_pin' && 'Set a 4-digit PIN for instant access anytime.'}
            {step === 'pin_login' && `Welcome back! Enter your 4-digit PIN for ${email}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">{errorMsg}</span>
              {emailNotConfigured && (
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  To send real OTP emails directly to your inbox, open <strong>Project Settings → Secrets</strong> and add your <strong>GMAIL_USER</strong> and <strong>GMAIL_APP_PASSWORD</strong> (or SMTP credentials).
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Enter Email Form */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Account...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                Existing users login instantly with 4-Digit PIN. New users verify with OTP.
              </span>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span>Verification code sent to </span>
                <strong className="text-white font-mono">{email}</strong>.
                <span className="text-slate-400 block mt-1 text-[11px] leading-relaxed">
                  Please check your inbox and spam folder for your 6-digit OTP.
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Enter 6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg tracking-[0.3em] font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="text-slate-400 hover:text-slate-200 hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>

              {isExistingUser && (
                <button
                  type="button"
                  onClick={handleSwitchToPinLogin}
                  className="text-sky-400 hover:underline cursor-pointer font-medium text-[11px]"
                >
                  Log in with 4-digit PIN
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Create 4-Digit PIN & Register */}
        {step === 'create_pin' && (
          <form onSubmit={handleSetPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Set 4-Digit Security PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2.5 text-center text-2xl tracking-[0.5em] font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2.5 text-center text-2xl tracking-[0.5em] font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.length !== 4 || pin !== confirmPin}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving PIN...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Complete & Start Watching</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Direct PIN Login */}
        {step === 'pin_login' && (
          <form onSubmit={handleLoginWithPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter your 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2.5 text-center text-2xl tracking-[0.5em] font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || loginPin.length !== 4}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock Account</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Different Email
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Forgot PIN? Reset with OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
