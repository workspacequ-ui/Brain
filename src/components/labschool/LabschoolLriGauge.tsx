import React from 'react';

interface LabschoolLriGaugeProps {
  score: number; // 0 to 100
  size?: number; // width/height scale
  showNeedle?: boolean;
  showTicks?: boolean;
  className?: string;
}

export const LabschoolLriGauge: React.FC<LabschoolLriGaugeProps> = ({
  score = 86.5,
  size = 220,
  showNeedle = true,
  showTicks = true,
  className = ''
}) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Center & Radius
  const cx = 110;
  const cy = 100;
  const r = 78;
  const strokeWidth = 14;

  // Total Arc Length for semi-circle (PI * r)
  const arcLength = Math.PI * r;
  
  // Progress ratio (0 to 1)
  const progressRatio = clampedScore / 100;
  const progressOffset = arcLength * (1 - progressRatio);

  // Needle angle: 0% = 180deg (left), 50% = 90deg (top), 100% = 0deg (right)
  // Standard math angle from positive X axis: 180 - (score * 1.8)
  const needleAngle = 180 - clampedScore * 1.8;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLength = r - 12;

  const needleX = cx + needleLength * Math.cos(needleRad);
  const needleY = cy - needleLength * Math.sin(needleRad);

  // Target passing grade tick (83.5%)
  const targetScore = 83.5;
  const targetAngle = 180 - targetScore * 1.8;
  const targetRad = (targetAngle * Math.PI) / 180;
  const targetTickX1 = cx + (r - 18) * Math.cos(targetRad);
  const targetTickY1 = cy - (r - 18) * Math.sin(targetRad);
  const targetTickX2 = cx + (r + 4) * Math.cos(targetRad);
  const targetTickY2 = cy - (r + 4) * Math.sin(targetRad);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 220 125"
        className="w-full max-w-[240px] overflow-visible"
        style={{ height: 'auto' }}
      >
        <defs>
          {/* Gradient for progress arc */}
          <linearGradient id="lriGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />     {/* Rose / Red */}
            <stop offset="40%" stopColor="#fbbf24" />    {/* Amber / Yellow */}
            <stop offset="70%" stopColor="#10b981" />    {/* Emerald / Green */}
            <stop offset="100%" stopColor="#06b6d4" />   {/* Cyan / Blue */}
          </linearGradient>

          {/* Background track gradient */}
          <linearGradient id="lriTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* 1. Track Background Arc (Semi-circle: from left (cx-r, cy) to right (cx+r, cy)) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#lriTrackGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 2. Color Zones Backdrop Highlights (Subtle) */}
        {/* Zone 1: 0-60% (Red/Rose) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(244, 63, 94, 0.15)"
          strokeWidth={strokeWidth - 4}
          strokeDasharray={`${arcLength * 0.6} ${arcLength}`}
          strokeDashoffset={0}
        />
        {/* Zone 2: 60-75% (Amber) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(251, 191, 36, 0.2)"
          strokeWidth={strokeWidth - 4}
          strokeDasharray={`${arcLength * 0.15} ${arcLength}`}
          strokeDashoffset={-arcLength * 0.6}
        />
        {/* Zone 3: 75-85% (Emerald) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(16, 185, 129, 0.25)"
          strokeWidth={strokeWidth - 4}
          strokeDasharray={`${arcLength * 0.1} ${arcLength}`}
          strokeDashoffset={-arcLength * 0.75}
        />
        {/* Zone 4: 85-100% (Cyan) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(6, 182, 212, 0.3)"
          strokeWidth={strokeWidth - 4}
          strokeDasharray={`${arcLength * 0.15} ${arcLength}`}
          strokeDashoffset={-arcLength * 0.85}
        />

        {/* 3. Dynamic Animated Progress Arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#lriGaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={progressOffset}
          filter="url(#gaugeGlow)"
          className="transition-all duration-1000 ease-out"
        />

        {/* 4. Ticks & Labels */}
        {showTicks && (
          <>
            {/* 0% Tick */}
            <text x={cx - r - 6} y={cy + 14} fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="bold">
              0
            </text>

            {/* 50% Tick */}
            <text x={cx} y={cy - r - 6} fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="bold">
              50
            </text>

            {/* 83.5% Passing Grade Marker */}
            <line
              x1={targetTickX1}
              y1={targetTickY1}
              x2={targetTickX2}
              y2={targetTickY2}
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 100% Tick */}
            <text x={cx + r + 6} y={cy + 14} fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="bold">
              100
            </text>
          </>
        )}

        {/* 5. Needle Pointer */}
        {showNeedle && (
          <g className="transition-all duration-700 ease-out">
            {/* Needle line */}
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke="#f8fafc"
              strokeWidth="3"
              strokeLinecap="round"
              filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.8))"
            />
            {/* Needle core pin */}
            <circle cx={cx} cy={cy} r="6.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r="2.5" fill="#38bdf8" />
          </g>
        )}

        {/* Center Base Baseline */}
        <line
          x1={cx - r - 8}
          y1={cy + 1}
          x2={cx + r + 8}
          y2={cy + 1}
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
};
