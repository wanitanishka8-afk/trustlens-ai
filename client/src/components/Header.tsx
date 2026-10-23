import React from 'react';
import { ShieldAlert, ShieldCheck, History, Info, Sparkles } from 'lucide-react';
import { HealthStatus } from '../types/index.js';

interface HeaderProps {
  activeTab: 'dashboard' | 'history' | 'about';
  setActiveTab: (tab: 'dashboard' | 'history' | 'about') => void;
  health: HealthStatus | null;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  health,
  historyCount,
}) => {
  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Mark */}
        <div className="brand" onClick={() => setActiveTab('dashboard')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <ShieldAlert className="brand-icon" size={26} />
            <span className="brand-pulse"></span>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">
              TrustLens <span className="brand-ai">AI</span>
            </h1>
            <span className="brand-tagline">Cyber Threat & Scam Intelligence</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            aria-label="Navigate to Threat Dashboard"
          >
            <ShieldCheck size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            aria-label="Navigate to Analysis History"
          >
            <History size={18} />
            <span>History</span>
            {historyCount > 0 && <span className="badge-count">{historyCount}</span>}
          </button>

          <button
            className={`nav-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
            aria-label="Navigate to Safety and About"
          >
            <Info size={18} />
            <span>Safety & About</span>
          </button>
        </nav>

        {/* Engine Status Badge */}
        <div className="header-status">
          <div className="status-pill" title={health ? `Uptime: ${health.uptimeSeconds}s` : 'Connecting...'}>
            <span className={`status-dot ${health?.status === 'healthy' ? 'online' : 'connecting'}`}></span>
            <span className="status-text">
              {health?.geminiConfigured ? (
                <>
                  <Sparkles size={12} className="ai-sparkle-icon" /> Hybrid Engine Active
                </>
              ) : (
                'Local Rules Engine'
              )}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
