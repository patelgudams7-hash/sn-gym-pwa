import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, ArrowRight, User } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import { SNGymLogoMini } from "../../components/brand/SNGymLogo";

// ── Google icon SVG ─────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ── Shared input field ───────────────────────────────────────────────────────
const AuthInput = ({ icon: Icon, type, placeholder, value, onChange, rightEl }) => (
  <div className="relative shadow-[0_6px_20px_rgba(0,0,0,0.04)] rounded-full border border-gray-100 bg-white">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon size={16} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
      className="w-full pl-12 pr-12 py-4 rounded-full bg-transparent text-sm text-charcoal font-semibold placeholder-gray-400 outline-none transition-all"
    />
    {rightEl && (
      <div className="absolute right-5 top-1/2 -translate-y-1/2">{rightEl}</div>
    )}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
const LoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle, resetPassword, authError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    clearError();
    setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);
    if (result.success) {
      if (!result.user.emailVerified) {
        navigate("/verify-email");
      } else {
        navigate("/");
      }
    }
  };

  const handleGoogle = async () => {
    clearError();
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) navigate("/");
  };

  const handleReset = async () => {
    if (!resetEmail) return;
    const result = await resetPassword(resetEmail);
    if (result.success) setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col pt-12">
      {/* Back button */}
      <button
        onClick={() => navigate("/welcome")}
        className="w-10 h-10 ml-6 rounded-full bg-white/40 backdrop-blur-sm border border-gray-100 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all select-none"
      >
        <ArrowLeft size={18} className="text-[#1a1a1a]" />
      </button>

      <div className="flex-1 px-8 pt-10 pb-10 flex flex-col justify-between">
        <div className="flex flex-col mb-10 select-none">
          <img src="/logo-barbell.jpg" alt="SN GYM" className="h-16 w-auto object-contain self-start mb-5" />
          <h1 className="text-[54px] font-black text-black leading-none tracking-tight">Hello</h1>
          <p className="text-gray-400 font-bold text-sm tracking-wide mt-2">Sign in to your account</p>
        </div>

        {/* Error message */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3 mb-5"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{authError}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <AuthInput
            icon={User}
            type="email"
            placeholder="Username or Email"
            value={email}
            onChange={e => { clearError(); setEmail(e.target.value); }}
          />
          <AuthInput
            icon={Lock}
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => { clearError(); setPassword(e.target.value); }}
            rightEl={
              <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="self-end text-xs font-bold text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            Forgot your password?
          </button>

          {/* F4 Sign in + Right arrow circle button */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <span className="text-xl font-black text-[#1a1a1a]">Sign in</span>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-13 h-13 rounded-full bg-linear-to-r from-orange-accent to-[#FF9500] text-white shadow-[0_6px_20px_rgba(255,107,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-60 transition-all border border-white/20"
            >
              <ArrowRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Social login divider & Google */}
        <div className="flex flex-col gap-4 mt-12">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-150" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Or sign in with</span>
            <div className="flex-1 h-px bg-gray-150" />
          </div>
          
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3.5 rounded-full border border-gray-150 bg-white flex items-center justify-center gap-3 font-extrabold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-xs"
          >
            <GoogleIcon />
            {googleLoading ? "Connecting…" : "Google Connection"}
          </button>
        </div>

        {/* Switch to signup: "Don't have an account? Create" */}
        <p className="text-center text-xs text-gray-500 font-bold mt-12 select-none">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => { clearError(); navigate("/signup"); }}
            className="text-[#1a1a1a] hover:underline font-extrabold"
          >
            Create
          </button>
        </p>
      </div>

      {/* Forgot password modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-t-[28px] w-full max-w-md px-6 pt-6 pb-10 shadow-2xl"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="font-black text-lg text-charcoal mb-1">Reset Password</h3>
            <p className="text-gray-500 text-sm mb-5">We'll send a reset link to your email.</p>

            {resetSent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 text-green-700 text-sm font-semibold text-center">
                ✅ Reset link sent! Check your inbox.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AuthInput
                  icon={Mail}
                  type="email"
                  placeholder="Your email address"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                />
                <button
                  onClick={handleReset}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #FF6B00, #FF9A3C)" }}
                >
                  Send Reset Link
                </button>
              </div>
            )}
            <button
              onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }}
              className="w-full mt-3 py-3 text-sm text-gray-500 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
