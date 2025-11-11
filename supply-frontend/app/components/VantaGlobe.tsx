"use client";
import React, { useEffect, useRef } from 'react';

interface VantaGlobeProps {
  className?: string;
}

declare global {
  interface Window {
    VANTA: {
      GLOBE: (config: any) => {
        destroy: () => void;
      };
    };
  }
}

const VantaGlobe: React.FC<VantaGlobeProps> = ({ className = "" }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    const loadVanta = async () => {
      // Check if VANTA is already loaded
      if (window.VANTA && typeof window.VANTA.GLOBE === 'function') {
        initVanta();
        return;
      }

      try {
        // Load Three.js
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        threeScript.async = true;

        // Load VANTA Globe
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
        vantaScript.async = true;

        const initVantaAfterLoad = () => {
          if (window.VANTA && typeof window.VANTA.GLOBE === 'function') {
            initVanta();
          }
        };

        vantaScript.onload = initVantaAfterLoad;

        document.head.appendChild(threeScript);
        document.head.appendChild(vantaScript);

        // Cleanup function
        return () => {
          if (vantaEffect.current) {
            vantaEffect.current.destroy();
          }
          document.head.removeChild(threeScript);
          document.head.removeChild(vantaScript);
        };
      } catch (error) {
        console.error('Error loading VANTA Globe:', error);
      }
    };

    const initVanta = () => {
      if (vantaRef.current && window.VANTA && typeof window.VANTA.GLOBE === 'function') {
        vantaEffect.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xffaa00,
          color2: 0xff8800,
          size: 1.20,
          backgroundColor: 0xfffff7
        });
      }
    };

    loadVanta();

    // Cleanup on unmount
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className={`absolute inset-0 ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};

export default VantaGlobe;
