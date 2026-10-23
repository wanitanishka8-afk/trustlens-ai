import React, { useState } from 'react';
import { History, Trash2, ExternalLink, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { HistoryItemSummary, RiskLevel } from '../types/index.js';

interface HistorySectionProps {
  history: HistoryItemSummary[];
  onSelect: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelect,
  onDelete,
  isLoading,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    if (filterLevel === 'all') return true;
    return item.overallRiskLevel.toLowerCase() === filterLevel.toLowerCase();
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this analysis report from history?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getRiskBadgeColor = (level: RiskLevel): string => {
    switch (level) {
      case 'Critical':
        return 'badge-critical';
      case 'High':
        return 'badge-high';
      case 'Moderate':
        return 'badge-moderate';
      case 'Low':
      default:
        return 'badge-low';
    }
  };

  return (
    <section className="history-page-section">
      <div className="history-header-row">
        <div>
          <h2 className="section-main-title">Analysis History</h2>
          <p className="section-main-subtitle">
            Securely stored local SQLite records of past scam risk assessments. PII is minimized.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-pill-group">
          {['all', 'critical', 'high', 'moderate', 'low'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`filter-pill ${filterLevel === lvl ? 'active' : ''}`}
              onClick={() => setFilterLevel(lvl)}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && history.length === 0 ? (
        <div className="history-loading-state">
          <div className="spinner"></div>
          <p>Loading saved threat analyses...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-history-card">
          <History size={40} className="empty-icon text-muted" />
          <h3>No Analysis Records Found</h3>
          <p>
            {history.length === 0
              ? 'Analyze a message or email in the Dashboard to generate your first risk report.'
              : 'No records match the selected risk filter.'}
          </p>
        </div>
      ) : (
        <div className="history-list-grid">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="history-card"
              onClick={() => onSelect(item.id)}
              role="button"
              tabIndex={0}
            >
              <div className="history-card-top">
                <div className="history-meta-left">
                  <span className={`risk-badge-small ${getRiskBadgeColor(item.overallRiskLevel)}`}>
                    {item.overallRiskLevel} ({item.overallScore}/100)
                  </span>
                  <span className="history-mode-tag">
                    {item.analysisMode === 'hybrid' ? (
                      <>
                        <Sparkles size={11} /> Hybrid
                      </>
                    ) : (
                      <>
                        <Layers size={11} /> Rules-Only
                      </>
                    )}
                  </span>
                </div>

                <div className="history-actions">
                  <span className="history-date">
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    type="button"
                    className="delete-item-btn"
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Delete record"
                    disabled={deletingId === item.id}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Truncated text */}
              <p className="history-snippet">{item.snippet}</p>

              <div className="history-card-bottom">
                <span className="warning-count-pill">
                  <AlertCircle size={13} />
                  {item.warningCount} {item.warningCount === 1 ? 'warning sign' : 'warning signs'}
                </span>
                <span className="open-report-hint">
                  View Full Report <ExternalLink size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
