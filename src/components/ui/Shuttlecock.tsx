import React from 'react';

interface ShuttlecockProps {
  className?: string;
  animate?: 'spin' | 'bounce' | 'float' | 'spin-slow' | 'none';
}

export const Shuttlecock: React.FC<ShuttlecockProps> = ({ className = '', animate = 'none' }) => {
  const getAnimationClass = () => {
    switch (animate) {
      case 'spin': return 'animate-spin';
      case 'spin-slow': return 'animate-[spin_3s_linear_infinite]';
      case 'bounce': return 'animate-bounce';
      case 'float': return 'animate-float'; // Necessita de keyframes no index.css
      default: return '';
    }
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`${className} ${getAnimationClass()}`}
    >
      {/* Penas (Feathers) */}
      <path d="M12 16L6 3l3 2 3-3 3 3 3-2-6 13Z" />
      {/* Fitas horizontais */}
      <path d="M8 9h8" />
      <path d="M9.5 12h5" />
      {/* Linhas internas das penas */}
      <path d="M9 5l3 11" />
      <path d="M15 5l-3 11" />
      {/* Base de cortiça (Cork) preenchida parcialmente */}
      <path d="M9 16c0 3 1.5 5 3 5s3-2 3-5Z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
};
