import React from "react";

interface UpayaLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  theme?: "light" | "dark";
  className?: string;
}

export const UpayaLogo: React.FC<UpayaLogoProps> = ({
  size = "md",
  showTagline = true,
  theme = "light",
  className = "",
}) => {
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.3 : 1;
  const isDark = theme === "dark";

  const textColor = isDark ? "text-white" : "text-[#18181B]";
  const subtextColor = isDark ? "text-zinc-400" : "text-[#18181B]";
  const taglineColor = isDark ? "text-zinc-300" : "text-[#18181B]";
  const uFillColor = isDark ? "#FFFFFF" : "#18181B";
  const waveStrokeColor = isDark ? "#18181B" : "#18181B"; // Or contrasting wave

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Brand Icon (Stylized U with Wifi Waves & Lime Accent) */}
      <div
        className="relative flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: `${95 * scale}px`, height: `${95 * scale}px` }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main U Curve */}
          <path
            d="M 45,30 
               L 80,30 
               L 80,110 
               C 80,140 120,140 120,110 
               L 120,70 
               L 155,70 
               L 155,110 
               C 155,165 45,165 45,110 
               Z"
            fill={uFillColor}
          />

          {/* Top-Right Lime Green Accent Tip */}
          <path
            d="M 120,30 
               L 155,30 
               L 155,70 
               L 120,70 
               Z"
            fill="#84CC16"
          />

          {/* Smooth Inner Junction Fill */}
          <path
            d="M 120,70
               C 120,85 155,85 155,70
               Z"
            fill={uFillColor}
          />

          {/* Wifi / NFC Signal Waves inside the U */}
          <path
            d="M 92,105 A 10,10 0 0,1 108,105"
            stroke={waveStrokeColor}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M 86,96 A 18,18 0 0,1 114,96"
            stroke={waveStrokeColor}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M 80,87 A 26,26 0 0,1 120,87"
            stroke={waveStrokeColor}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Name Text: UPAYA */}
      <div
        className={`font-black tracking-[0.25em] ${textColor} flex items-center justify-center font-mono mt-1.5`}
        style={{ fontSize: `${26 * scale}px` }}
      >
        <span>UP</span>
        {/* Stylized A with Lime Triangle center */}
        <span className="relative inline-block mx-0.5">
          <span>A</span>
          <span
            className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4.5px] border-r-[4.5px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#84CC16]"
          />
        </span>
        <span>Y</span>
        {/* Stylized A with Lime Triangle center */}
        <span className="relative inline-block mx-0.5">
          <span>A</span>
          <span
            className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4.5px] border-r-[4.5px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#84CC16]"
          />
        </span>
      </div>

      {/* Subtitle: DIGITAL LOYALTY */}
      <div
        className={`tracking-[0.4em] ${subtextColor} font-bold uppercase text-center mt-1`}
        style={{ fontSize: `${10.5 * scale}px` }}
      >
        DIGITAL LOYALTY
      </div>

      {showTagline && (
        <>
          {/* Lime Accent Line */}
          <div
            className="h-[3px] bg-[#84CC16] rounded-full my-2.5"
            style={{ width: `${34 * scale}px` }}
          />

          {/* Tagline: TAP. CONNECT. RETURN. */}
          <div
            className={`tracking-[0.3em] ${taglineColor} font-bold uppercase text-center`}
            style={{ fontSize: `${9 * scale}px` }}
          >
            TAP . CONNECT . RETURN.
          </div>
        </>
      )}
    </div>
  );
};
