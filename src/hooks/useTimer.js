import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for countdown timer
 * @param {Function} onComplete - Callback function when timer hits zero
 * @returns {object} { timeLeft, duration, isActive, start, pause, resume, reset, percentage }
 */
export function useTimer(onComplete) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(60); // Default 60 seconds
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  const start = (seconds) => {
    clearInterval(timerRef.current);
    setDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const pause = () => {
    setIsActive(false);
  };

  const resume = () => {
    if (timeLeft > 0) {
      setIsActive(true);
    }
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, onComplete]);

  const percentage = duration > 0 ? (timeLeft / duration) * 100 : 0;

  return {
    timeLeft,
    duration,
    isActive,
    start,
    pause,
    resume,
    reset,
    percentage
  };
}
