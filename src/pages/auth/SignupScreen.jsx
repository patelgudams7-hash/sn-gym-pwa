import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle2, ArrowRight, Phone } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import { SNGymLogoMini } from "../../components/brand/SNGymLogo";

// Google icon SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AuthInput = ({ icon: Icon, type, placeholder, value, onChange, rightEl }) => (
  <div className="relative shadow-[0_6px_20px_rgba(0,0,0,0.04)] rounded-full border border-gray-100 bg-white">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={16} /></div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
      className="w-full pl-12 pr-12 py-4 rounded-full bg-transparent text-sm text-charcoal font-semibold placeholder-gray-400 outline-none transition-all"
    />
    {rightEl && <div className="absolute right-5 top-1/2 -translate-y-1/2">{rightEl}</div>}
  </div>
);

// Password strength meter
const StrengthBar = ({ password }) => {
  const strength = !password ? 0
    : password.length < 6 ? 1
    : password.length < 8 || !/[A-Z]/.test(password) ? 2
    : !/[0-9]/.test(password) ? 3
    : 4;

  const colors = ["", "#EF4444", "#F97316", "#EAB308", "#22C55E"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return password ? (
    <div className="mt-1.5 px-3 select-none">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : "#E5E7EB" }}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </div>
  ) : null;
};

// ────────────────────────────────────────────────────────────────────────────
const SignupScreen = () => {
  const navigate = useNavigate();
  const { signupWithEmail, loginWithGoogle, authError, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const pwMatch = password && confirmPw && password === confirmPw;
  const pwMismatch = confirmPw && password !== confirmPw;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !agreed || pwMismatch) return;
    clearError();
    setLoading(true);
    const result = await signupWithEmail(email, password, name);
    setLoading(false);
    if (result.success) navigate("/verify-email");
  };

  const handleGoogle = async () => {
    clearError();
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) navigate("/");
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col pt-12">
      {/* Back button */}
      <button
        onClick={() => navigate("/login")}
        className="w-10 h-10 ml-6 rounded-full bg-white/40 backdrop-blur-sm border border-gray-100 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all select-none"
      >
        <ArrowLeft size={18} className="text-[#1a1a1a]" />
      </button>

      <div className="flex-1 px-8 pt-8 pb-10 flex flex-col justify-between overflow-y-auto no-scrollbar">
        <div className="flex flex-col mb-8 select-none">
          <h1 className="text-3xl font-black text-black leading-none tracking-tight">Create account</h1>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3 mb-4"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{authError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <AuthInput icon={User} type="text" placeholder="Name" value={name} onChange={e => { clearError(); setName(e.target.value); }} />
          <div>
            <AuthInput
              icon={Lock}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => { clearError(); setPassword(e.target.value); }}
              rightEl={
                <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 cursor-pointer p-1">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <StrengthBar password={password} />
          </div>

          <div className="relative">
            <AuthInput
              icon={Lock}
              type="password"
              placeholder="Confirm Password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              rightEl={
                pwMatch ? <CheckCircle2 size={15} className="text-green-500" />
                : pwMismatch ? <AlertCircle size={15} className="text-red-500" />
                : null
              }
            />
            {pwMismatch && (
              <p className="text-[10px] text-red-500 font-semibold mt-1 px-3">Passwords do not match</p>
            )}
          </div>

          <AuthInput icon={Mail} type="email" placeholder="E-mail" value={email} onChange={e => { clearError(); setEmail(e.target.value); }} />
          <AuthInput icon={Phone} type="tel" placeholder="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} />

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 mt-1.5 cursor-pointer select-none">
            <div
              onClick={() => setAgreed(a => !a)}
              className="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: agreed ? "#FF6B00" : "#D1D5DB",
                background: agreed ? "#FF6B00" : "white"
              }}
            >
              {agreed && <span className="text-white text-[10px] font-black">✓</span>}
            </div>
            <span className="text-xs text-gray-500 font-bold leading-normal">
              I agree to the <span className="text-charcoal font-black underline">Terms</span> and <span className="text-charcoal font-black underline">Privacy</span>
            </span>
          </label>

          {/* F4 Create account + Right arrow circle button */}
          <div className="flex items-center justify-end gap-4 mt-4">
            <span className="text-xl font-black text-[#1a1a1a]">Create</span>
            <button
              type="submit"
              disabled={loading || !name || !email || !password || !agreed || !!pwMismatch}
              className="w-13 h-13 rounded-full bg-linear-to-r from-orange-accent to-[#FF9500] text-white shadow-[0_6px_20px_rgba(255,107,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-60 transition-all border border-white/20"
            >
              <ArrowRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Social login divider & Mock social buttons */}
        <div className="flex flex-col gap-4 mt-8 select-none">
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">Or create account using social media</p>
          <div className="flex justify-center gap-4">
            <button type="button" onClick={handleGoogle} className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-all">
              <GoogleIcon />
            </button>
            <button type="button" onClick={() => alert("Connecting to Facebook...")} className="w-10 h-10 rounded-full bg-[#3B5998] text-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-all font-black text-sm">
              f
            </button>
            <button type="button" onClick={() => alert("Connecting to Twitter...")} className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-all font-black text-sm">
              t
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 font-bold mt-10">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-[#1a1a1a] hover:underline font-extrabold cursor-pointer">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
