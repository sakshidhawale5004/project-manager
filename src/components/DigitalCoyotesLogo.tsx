import React from 'react';

interface DigitalCoyotesLogoProps {
  className?: string;
  size?: number;
}

export const DigitalCoyotesLogo: React.FC<DigitalCoyotesLogoProps> = ({
  className = 'w-7 h-7',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Digital Coyotes Logo"
    >
      {/* Precision Geometric Origami Coyote Head */}
      <g
        stroke="#F05A28"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left Ear Upper Diamond */}
        <polygon points="35,14 28,44 40,54 46,44" fill="none" />
        
        {/* Right Ear Upper Diamond */}
        <polygon points="65,14 54,44 60,54 72,44" fill="none" />

        {/* Center Brow V-Valley */}
        <line x1="46" y1="44" x2="50" y2="48" />
        <line x1="54" y1="44" x2="50" y2="48" />

        {/* Left Cheek Triangular Outer Wing */}
        <polygon points="28,44 26,65 39,58" fill="none" />

        {/* Right Cheek Triangular Outer Wing */}
        <polygon points="72,44 61,58 74,65" fill="none" />

        {/* Central Snout Wedge */}
        <polygon points="46,44 54,44 50,67" fill="none" />

        {/* Left Mid Facet */}
        <polygon points="40,54 46,44 50,67 42,67" fill="none" />
        <line x1="39" y1="58" x2="42" y2="67" />

        {/* Right Mid Facet */}
        <polygon points="60,54 54,44 50,67 58,67" fill="none" />
        <line x1="61" y1="58" x2="58" y2="67" />

        {/* Lower Chin Radiating Facets */}
        {/* Outer Jaw to Chin */}
        <line x1="26" y1="65" x2="50" y2="96" />
        <line x1="74" y1="65" x2="50" y2="96" />

        {/* Left Chin Intermediate */}
        <line x1="42" y1="67" x2="50" y2="96" />

        {/* Center Vertical Chin Ridge */}
        <line x1="50" y1="67" x2="50" y2="96" />

        {/* Right Chin Intermediate */}
        <line x1="58" y1="67" x2="50" y2="96" />
      </g>
    </svg>
  );
};
