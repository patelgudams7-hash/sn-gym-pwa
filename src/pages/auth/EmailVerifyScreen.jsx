import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, RefreshCw, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import SNGymLogo from "../../components/brand/SNGymLogo";

const EmailVerifyScreen = () => {
  const navigate = useNavigate();
  const { user, logout, resendVerification, refreshUser } = useAuth();
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  // Poll every 4 seconds to detect when user clicks the verification link
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const isVerified = await refreshUser();
        if (isVerified) {
          setVerified(true);
          clearInterval(interval);
          setTimeout(() => navigate("/"), 1800);
        }
      } catch (_) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  // Resend cooldown counter
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
    await resendVerification();
    setResent(true);
    setCountdown(45);
  };

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      const isVerified = await refreshUser();
      if (isVerified) {
        setVerified(true);
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (_) {}
    setChecking(false);
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 14 }}
          className="flex flex-col items-center gap-5"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          >
            <CheckCircle2 size={44} className="text-white" />
          </div>
          <div className="text-center">
            <h2 className="font-black text-2xl text-charcoal">Email Verified!</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Welcome to SN Gym. Taking you in…</p>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [0.3,1,0.3], scale: [0.8,1.2,0.8] }}
                transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header gradient */}
      <div
        className="h-60 relative flex flex-col items-center justify-end pb-8"
        style={{ background: "linear-gradient(160deg, #FF6B00 0%, #FF9A3C 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <SNGymLogo size={64} />
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10">
        {/* Email icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 14 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center -mt-10 shadow-xl"
          style={{ background: "linear-gradient(135deg, #FF6B00, #FF9A3C)" }}
        >
          <Mail size={36} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <h1 className="font-black text-2xl text-charcoal">Verify Your Email</h1>
          <p className="text-gray-500 text-sm font-medium mt-2 leading-relaxed">
            We've sent a verification link to{" "}
            <span className="font-bold text-charcoal">{user?.email}</span>.<br />
            Check your inbox and click the link to activate your account.
          </p>
        </motion.div>

        {/* Steps card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 w-full bg-orange-50 border border-orange-100 rounded-2xl p-5"
        >
          <p className="font-bold text-charcoal text-sm mb-3">How to verify:</p>
          {[
            "Open your email inbox",
            "Find the email from SN Gym",
            "Click the 'Verify Email' button",
            "Come back to this app"
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 mb-2.5 last:mb-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-black"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FF9A3C)" }}
              >
                {i + 1}
              </div>
              <span className="text-sm text-gray-700 font-medium">{step}</span>
            </div>
          ))}
        </motion.div>

        {/* Resent confirmation */}
        {resent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            Verification email resent! Check your inbox.
          </motion.div>
        )}

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="w-full flex flex-col gap-3 mt-8">
          <button
            onClick={handleCheckNow}
            disabled={checking}
            className="w-full py-4 rounded-2xl text-white font-black text-sm tracking-wide active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF9A3C)" }}
          >
            {checking ? "Checking…" : "✓ I've Verified — Enter App"}
          </button>

          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className="w-full py-3.5 rounded-2xl border-2 border-gray-200 font-semibold text-sm text-charcoal flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={countdown > 0 ? "" : "animate-spin-once"} />
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Verification Email"}
          </button>

          <button
            onClick={logout}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm text-gray-400 font-medium cursor-pointer"
          >
            <LogOut size={14} />
            Sign out and use different account
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifyScreen;
