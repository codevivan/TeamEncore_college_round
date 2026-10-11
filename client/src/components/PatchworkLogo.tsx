import React from 'react';

interface PatchworkLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PatchworkIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AXON Icon"
    >
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="#1B133C" />
      <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="#1B133C" />
    </svg>
  );
}

export function PatchworkLogo({ className = '', iconOnly = false, size = 'md' }: PatchworkLogoProps) {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm tracking-wider',
    md: 'text-base tracking-wider',
    lg: 'text-xl tracking-widest',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-semibold ${className}`}>
      <PatchworkIcon className={iconSizes[size]} />
      {!iconOnly && (
        <span className={`font-sans font-extrabold uppercase text-[#1B133C] tracking-tight ${textSizes[size]}`}>
          AXON
        </span>
      )}
    </div>
  );
}

export const AxonLogo = PatchworkLogo;
export const AxonIcon = PatchworkIcon;
