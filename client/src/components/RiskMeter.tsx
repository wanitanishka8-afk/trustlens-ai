import React from 'react';
import { RiskLevel } from '../types/index.js';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  size?: 'normal' | 'compact';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level, size = 'normal' }) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));

  // Gauge geometry: Semi-circle from -90 to +90 degrees (or 180 to 360)
  // In angle representation: 0 score = -90 deg, 100 score = +90 deg
  const needleAngle = -90 + (clampedScore / 100) * 180;

  const getLevelColor = (lvl: RiskLevel): string => {
    switch (lvl) {
      case 'Critical':
        return '#EF4444'; // Red
      case 'High':
        return '#F97316'; // Orange
      case 'Moderate':
        return '#F59E0B'; // Amber
      case 'Low':
      default:
        return '#10B981'; // Emerald
    }
  };

  const currentColor = getLevelColor(level);

  return (
    <div className={`risk-meter-container ${size}`}>
      <div className="gauge-svg-wrap">
        <svg viewBox="0 0 200 125" className="gauge-svg">
          <defs>
            {/* Background Arc Gradient */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="30%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={currentColor} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="251.3"
            strokeDashoffset="0"
            opacity="0.85"
          />

          {/* Threshold Tick Marks */}
          {/* 0% */}
          <text x="18" y="122" fill="#9CA3AF" fontSize="10" textAnchor="middle" fontWeight="500">0</text>
          {/* 50% */}
          <text x="100" y="24" fill="#9CA3AF" fontSize="10" textAnchor="middle" fontWeight="500">50</text>
          {/* 100% */}
          <text x="182" y="122" fill="#9CA3AF" fontSize="10" textAnchor="middle" fontWeight="500">100</text>

          {/* Pivot Base */}
          <circle cx="100" cy="105" r="10" fill="#1F2937" stroke="#374151" strokeWidth="3" />

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: '100px 105px',
              transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            filter="url(#needleGlow)"
          >
            {/* Needle line tapering to tip */}
            <line
              x1="100"
              y1="105"
              x2="100"
              y2="34"
              stroke={currentColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="100" cy="105" r="5" fill={currentColor} />
          </g>
        </svg>
      </div>

      {/* Numerical Score and Badge */}
      <div className="meter-meta">
        <div className="score-number-display" style={{ color: currentColor }}>
          <span className="score-value">{clampedScore}</span>
          <span className="score-max">/100</span>
        </div>
        <div
          className={`risk-badge level-${level.toLowerCase()}`}
          style={{ borderColor: currentColor, color: currentColor }}
        >
          <span className="badge-bullet" style={{ backgroundColor: currentColor }}></span>
          {level} Risk
        </div>
      </div>
    </div>
  );
};
