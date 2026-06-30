import React from "react";
import { useGym } from "../../store/GymContext";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const { profile } = useGym();
  
  // Initials (default to SN)
  const initials = profile?.name ? profile.name.slice(0, 2).toUpperCase() : "SN";

  return (
    <header className="sticky top-0 z-40 w-full bg-[rgba(255,255,255,0.85)] backdrop-blur-[20px] border-b border-[rgba(255,107,0,0.1)] px-5 py-1.5 flex items-center justify-between shadow-xs select-none">
      {/* Left: User avatar circle */}
      <Link 
        to="/profile" 
        className="w-9 h-9 rounded-full bg-linear-to-tr from-orange-accent to-[#FF9500] p-0.5 hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center justify-center shadow-md"
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-orange-accent">
          {initials}
        </div>
      </Link>

      {/* Center: App logo "SN GYM" */}
      <Link to="/" className="flex items-center active:scale-98 transition-transform">
        <img src="/logo-dumbbell-new.png" alt="SN GYM" className="h-18 w-auto object-contain" />
      </Link>

      {/* Right: Bell notification icon + dot badge */}
      <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#1a1a1a] hover:bg-gray-100 active:scale-95 transition-all cursor-pointer">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-linear-to-r from-orange-accent to-[#FF9500] border-2 border-white shadow-xs" />
      </button>

      {/* Subtle orange glow line at very bottom of header */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-orange-accent to-transparent opacity-30" />
    </header>
  );
};

export default Header;

