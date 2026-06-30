import React from "react";
import { useNavigate } from "react-router-dom";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white flex flex-col items-center justify-center select-none">
      {/* Onboarding Image */}
      <img 
        src="/welcome-bg.png" 
        alt="Welcome to SN Gym" 
        className="w-full h-full object-cover absolute inset-0"
      />

      {/* Interactive Overlay Layer */}
      <div className="absolute inset-x-0 bottom-11 px-8 flex flex-col gap-3.5 z-10">
        {/* Transparent Get Started Button (places over the orange button) */}
        <button
          onClick={() => navigate("/signup")}
          className="w-full h-15 bg-transparent cursor-pointer rounded-full active:scale-97 transition-all"
          aria-label="Get Started"
        />

        {/* Transparent Login Button (places over the white login outline button) */}
        <button
          onClick={() => navigate("/login")}
          className="w-full h-15 bg-transparent cursor-pointer rounded-full active:scale-97 transition-all mt-1"
          aria-label="Login"
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;
