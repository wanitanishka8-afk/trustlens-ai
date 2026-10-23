import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Header } from './components/Header.js';
import { InputSection } from './components/InputSection.js';
import { ResultDashboard } from './components/ResultDashboard.js';
import { HistorySection } from './components/HistorySection.js';
import { AboutSection } from './components/AboutSection.js';
import {
  analyzeContent,
  checkHealth,
  deleteHistoryItem,
  fetchHistory,
  fetchHistoryItem,
} from './api/client.js';
import { AnalysisReport, HealthStatus, HistoryItemSummary } from './types/index.js';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'about'>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItemSummary[]>([]);
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load initial health status and history
  const loadHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      const items = await fetchHistory();
      setHistoryItems(items);
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        const h = await checkHealth();
        setHealth(h);
      } catch (err) {
        console.warn('Backend health check error:', err);
      }
      await loadHistory();
    };

    initApp();
  }, [loadHistory]);

  // Handler for analyzing new content
  const handleAnalyze = async (content: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const report = await analyzeContent(content);
      setCurrentReport(report);
      await loadHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please check your network or try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for opening a saved item from history
  const handleSelectHistoryItem = async (id: string) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const report = await fetchHistoryItem(id);
      setCurrentReport(report);
      setActiveTab('dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve analysis report.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for deleting a history item
  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      if (currentReport && currentReport.id === id) {
        setCurrentReport(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete record.';
      setApiError(msg);
    }
  };

  const handleReset = () => {
    setCurrentReport(null);
    setApiError(null);
  };

  return (
    <div className="app-root">
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setApiError(null);
        }}
        health={health}
        historyCount={historyItems.length}
      />

      <main className="main-content">
        {apiError && (
          <div className="validation-error-banner" style={{ marginBottom: '1.5rem' }} role="alert">
            <AlertCircle size={18} />
            <div style={{ flex: 1 }}>
              <strong>Analysis Notice:</strong> {apiError}
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            {currentReport ? (
              <ResultDashboard report={currentReport} onReset={handleReset} />
            ) : (
              <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}
          </>
        )}

        {activeTab === 'history' && (
          <HistorySection
            history={historyItems}
            onSelect={handleSelectHistoryItem}
            onDelete={handleDeleteHistoryItem}
            isLoading={isHistoryLoading}
          />
        )}

        {activeTab === 'about' && <AboutSection />}
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>TrustLens AI</strong> — See the Risk Before You Trust.
          </div>
          <div className="footer-disclaimer">
            Advisory threat intelligence. Results are risk evaluations, not absolute safety guarantees.
          </div>
          <div className="footer-links">
            <span className="footer-link" onClick={() => setActiveTab('about')}>
              Safety Principles
            </span>
            <span className="footer-link" onClick={() => setActiveTab('history')}>
              History ({historyItems.length})
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
