"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';
import { Wallet, Fuel, ArrowUpRight } from 'lucide-react';
import VantaGlobe from './VantaGlobe';

interface LandingPageProps {
  onConnectWallet: () => Promise<void>;
  isConnecting: boolean;
}

const cursorSpringConfig = { damping: 20, stiffness: 150 };

const cursorVariants = {
  default: {
    scale: 1,
    backgroundColor: "rgba(255, 165, 0, 0.45)",
    border: "2px solid rgba(255, 140, 0, 0.75)",
    boxShadow: "0 0 8px rgba(255, 140, 0, 0.6)",
  },
  button: {
    scale: 1.5,
    backgroundColor: "rgba(255, 165, 0, 0.15)",
    border: "1.5px solid rgba(255, 165, 0, 0.4)",
    boxShadow: "0 0 8px rgba(255, 165, 0, 0.4)",
  },
  text: {
    scale: 1.8,
    backgroundColor: "rgba(255, 165, 0, 0.12)",
    border: "1.5px solid rgba(255, 165, 0, 0.3)",
    boxShadow: "0 0 6px rgba(255, 165, 0, 0.3)",
  }
};

const buttonMovementMultiplier = 0.12;

const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, isConnecting }) => {
  const [cursorVariant, setCursorVariant] = useState("default");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorXSpring = useSpring(cursorX, cursorSpringConfig);
  const cursorYSpring = useSpring(cursorY, cursorSpringConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  const handleButtonMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    buttonRef.current.style.transition = 'transform 0.15s ease-out';
    buttonRef.current.style.transform = `translate(${x * buttonMovementMultiplier}px, ${y * buttonMovementMultiplier}px)`;
  }, []);

  const handleButtonMouseLeave = useCallback(() => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transition = 'transform 0.3s ease-in-out';
    buttonRef.current.style.transform = 'translate(0, 0)';
  }, []);

  // Consolidated common transition config for reusable animations
  const commonTransition = { type: "spring" as const, stiffness: 300, damping: 22 };

  return (
    <div
      className="min-h-screen text-gray-900 overflow-hidden relative"
      style={{ cursor: 'none' }}
    >
      {/* VANTA Globe Background */}
      <VantaGlobe />

      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] rounded-full"
        style={{ x: cursorXSpring, y: cursorYSpring }}
        variants={cursorVariants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
      />
      {/* Inner cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 pointer-events-none z-[9999] rounded-full bg-orange-400"
        style={{
          x: useTransform(cursorXSpring, x => x + 14),
          y: useTransform(cursorYSpring, y => y + 14),
        }}
      />

      {/* Subtle backdrop for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-white/10 to-amber-50/15 z-[5]" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24 max-w-5xl mx-auto select-none">
        {/* Logo */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onMouseEnter={() => setCursorVariant("button")}
          onMouseLeave={() => setCursorVariant("default")}
        >
          <motion.div
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
          >
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-xl"
          onMouseEnter={() => setCursorVariant("text")}
          onMouseLeave={() => setCursorVariant("default")}
        >
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_3px_rgba(255,140,0,0.7)]">
            SunByte Gas Tank
          </h1>
        </motion.div>

        <motion.p
          className="text-lg md:text-xl text-gray-700 mb-16 text-center max-w-3xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
          onMouseEnter={() => setCursorVariant("text")}
          onMouseLeave={() => setCursorVariant("default")}
        >
          Multi-chain gas tank vault for seamless DeFi operations
        </motion.p>

        {/* Connect Button */}
        <motion.button
          ref={buttonRef}
          onClick={onConnectWallet}
          disabled={isConnecting}
          onMouseMove={handleButtonMouseMove}
          onMouseEnter={() => setCursorVariant("button")}
          onMouseLeave={() => {
            handleButtonMouseLeave();
            setCursorVariant("default");
          }}
          className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ cursor: 'none', transition: "transform 0.22s ease-out" }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          aria-busy={isConnecting}
        >
          <div className="relative px-9 py-4 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 rounded-xl font-semibold text-white text-base flex items-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-300 hover:shadow-orange-500/25 border border-orange-300/20">
            <motion.div
              animate={{ rotate: isConnecting ? 360 : 0 }}
              transition={{
                rotate: { duration: 1.2, repeat: isConnecting ? Infinity : 0, ease: "linear" },
              }}
            >
              {isConnecting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
            </motion.div>
            <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </motion.button>

        {/* Stats */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-20 max-w-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
        >
          {[
            { value: '$2.4B+', label: 'Total Value Locked' },
            { value: '6', label: 'Supported Chains' },
            { value: '125K+', label: 'Active Users' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center cursor-default"
              whileHover={{ y: -6 }}
              transition={commonTransition}
              onMouseEnter={() => setCursorVariant("button")}
              onMouseLeave={() => setCursorVariant("default")}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-1 drop-shadow-sm">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 font-medium select-text">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-default"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          onMouseEnter={() => setCursorVariant("button")}
          onMouseLeave={() => setCursorVariant("default")}
          aria-label="Scroll down indicator"
        >
          <div className="w-6 h-10 border-2 border-orange-400/60 rounded-full p-1">
            <motion.div
              className="w-1.5 h-1.5 bg-orange-500 rounded-full mx-auto"
              animate={{ y: [0, 12, 0], opacity: [1, 0.25, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
