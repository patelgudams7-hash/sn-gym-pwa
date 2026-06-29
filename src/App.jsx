import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { GymProvider } from "./store/GymContext";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { AnimatePresence } from "framer-motion";

// ── Pages ──────────────────────────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Library from "./pages/Library";
import Diet from "./pages/Diet";
import Profile from "./pages/Profile";
import Builder from "./pages/Builder";
import ActiveWorkout from "./pages/ActiveWorkout";

// ── Auth Pages ─────────────────────────────────────────────────────────────
import SplashScreen from "./pages/auth/SplashScreen";
import WelcomeScreen from "./pages/auth/WelcomeScreen";
import LoginScreen from "./pages/auth/LoginScreen";
import SignupScreen from "./pages/auth/SignupScreen";
import EmailVerifyScreen from "./pages/auth/EmailVerifyScreen";

// ── Layout ─────────────────────────────────────────────────────────────────
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";
import PageWrapper from "./components/layout/PageWrapper";
import ApexCoach from "./components/workout/ApexCoach";
import CenterPlusMenu from "./components/workout/CenterPlusMenu";

// ─────────────────────────────────────────────────────────────────────────
// AUTHENTICATION AND NAVIGATION ROUTER
// ─────────────────────────────────────────────────────────────────────────

// ── Fluid Vector Blobs Background matching mockup ────────────────────────────
const FluidBackground = () => (
  <div className="absolute inset-0 bg-[#FFFFFF] overflow-hidden pointer-events-none -z-10 select-none">
    {/* Top Right Organic Orange Liquid Blob */}
    <svg 
      className="absolute -top-16 -right-16 w-80 h-80 filter drop-shadow-sm opacity-95 animate-fade-in" 
      viewBox="0 0 200 200"
    >
      <defs>
        <linearGradient id="orangeBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFAE35" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
      </defs>
      <path 
        fill="url(#orangeBlobGrad)" 
        d="M38.5,-64.5C51.6,-57.4,65.2,-49,72.7,-36.8C80.2,-24.5,81.5,-8.3,77.7,6.3C73.8,21,64.8,34.1,54.5,45.8C44.1,57.5,32.3,67.8,18.8,71.2C5.3,74.5,-9.9,70.9,-23.7,65.1C-37.5,59.3,-49.9,51.4,-59.8,40.3C-69.8,29.3,-77.3,15.1,-79,-0.8C-80.8,-16.8,-76.8,-34.5,-66.6,-46.5C-56.3,-58.5,-39.8,-64.8,-24.9,-69.9C-10.1,-75.1,3.1,-79.1,17.4,-77C31.7,-74.9,25.3,-71.6,38.5,-64.5Z" 
        transform="translate(100 100)" 
      />
    </svg>

    {/* Bottom Left Organic Blue Liquid Blob */}
    <svg 
      className="absolute -bottom-24 -left-20 w-80 h-80 filter drop-shadow-sm opacity-95 animate-fade-in" 
      viewBox="0 0 200 200"
    >
      <defs>
        <linearGradient id="blueBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="60%" stopColor="#0099FF" />
          <stop offset="100%" stopColor="#0072FF" />
        </linearGradient>
      </defs>
      <path 
        fill="url(#blueBlobGrad)" 
        d="M44,-66.5C58.3,-59.4,72.2,-49,78.2,-35.1C84.2,-21.2,82.3,-3.8,78,12.8C73.7,29.5,67,45.3,55.3,55.9C43.6,66.5,26.9,71.9,9.8,75C-7.4,78.1,-25.1,78.8,-39.8,72.4C-54.5,66,-66.2,52.5,-73.4,37.1C-80.7,21.7,-83.4,4.4,-81.1,-12.3C-78.7,-29,-71.3,-45.1,-59.6,-53.4C-47.9,-61.8,-31.9,-62.4,-17.1,-65.9C-2.4,-69.5,11.2,-75.9,25.8,-76C40.3,-76.1,29.7,-73.6,44,-66.5Z" 
        transform="translate(100 100)" 
      />
    </svg>
  </div>
);

function AppContent() {
  const location = useLocation();
  const { user, loading, isVerified } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showWorkoutMenu, setShowWorkoutMenu] = useState(false);

  const isWorkoutActive = location.pathname.includes("/workout/active");

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/plans") return "Workout Plans";
    if (path === "/library") return "Exercise Library";
    if (path === "/diet") return "Diet & Nutrition";
    if (path === "/profile") return "User Profile";
    if (path === "/builder") return "Workout Builder";
    return null;
  };

  // 1. Show high-fidelity animated splash screen first
  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  // 2. While Firebase resolves initial auth state, show a subtle loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-orange-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // 3. User is not authenticated: restrict them to public auth views only
  if (!user) {
    return (
      <div className="min-h-screen text-charcoal max-w-md mx-auto relative flex flex-col shadow-2xl border-x border-orange-accent/10 overflow-hidden">
        <FluidBackground />
        <Routes>
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </div>
    );
  }

  // 4. User is logged in but has not verified their email
  if (!isVerified) {
    return (
      <div className="min-h-screen text-charcoal max-w-md mx-auto relative flex flex-col shadow-2xl border-x border-orange-accent/10 overflow-hidden">
        <FluidBackground />
        <Routes>
          <Route path="/verify-email" element={<EmailVerifyScreen />} />
          <Route path="*" element={<Navigate to="/verify-email" replace />} />
        </Routes>
      </div>
    );
  }

  // 5. Main App: User is authenticated and email is verified
  return (
    <div className="min-h-screen text-charcoal max-w-md mx-auto relative flex flex-col shadow-2xl border-x border-orange-accent/10 overflow-hidden">
      <FluidBackground />
      {!isWorkoutActive && <Header title={getPageTitle()} />}
      
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/plans" element={<PageWrapper><Plans /></PageWrapper>} />
            <Route path="/library" element={<PageWrapper><Library /></PageWrapper>} />
            <Route path="/diet" element={<PageWrapper><Diet /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/builder" element={<PageWrapper><Builder /></PageWrapper>} />
            <Route path="/workout/active/:planId" element={<PageWrapper className="pb-8"><ActiveWorkout /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      {!isWorkoutActive && <BottomNav onCenterPlusClick={() => setShowWorkoutMenu(true)} />}
      {!isWorkoutActive && <ApexCoach />}

      {/* Center Plus bottom sheet menu */}
      <CenterPlusMenu isOpen={showWorkoutMenu} onClose={() => setShowWorkoutMenu(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GymProvider>
        <Router>
          <AppContent />
        </Router>
      </GymProvider>
    </AuthProvider>
  );
}

export default App;
