import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { AnalysisReport, WarningSign } from '../types/index.js';
import { RiskMeter } from './RiskMeter.js';

interface ResultDashboardProps {
  report: AnalysisReport;
  onReset: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ report, onReset }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showFullOriginal, setShowFullOriginal] = useState<boolean>(false);

  const copySummary = () => {
    const textToCopy = `TrustLens AI Risk Report\nScore: ${report.overallScore}/100 (${report.overallRiskLevel} Risk)\nMode: ${report.analysisMode}\nIndicators: ${report.combinedWarningSigns.length} detected\nKey Signs: ${report.combinedWarningSigns.map(w => w.title).join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadgeClass = (severity: WarningSign['severity']) => {
    switch (severity) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
      default:
        return 'severity-low';
    }
  };

  return (
    <section className="results-container">
      {/* Top Header Card */}
      <div className="results-hero-card">
        <div className="results-hero-left">
          <div className="hero-status-row">
            <span className="results-timestamp">
              Analyzed on {new Date(report.timestamp).toLocaleString()}
            </span>
            <span className={`analysis-mode-badge mode-${report.analysisMode}`}>
              {report.analysisMode === 'hybrid' ? (
                <>
                  <Sparkles size={13} /> Hybrid Intelligence (Rules + Gemini)
                </>
              ) : (
                <>
                  <Layers size={13} /> Local Rules-Only Analysis
                </>
              )}
            </span>
          </div>

          <h2 className="results-headline">Threat & Risk Assessment</h2>
          <p className="results-subtext">
            {report.overallRiskLevel === 'Low'
              ? 'Minimal suspicious indicators found. However, remain vigilant and verify unsolicited requests through authentic channels.'
              : report.overallRiskLevel === 'Moderate'
              ? 'Moderate caution advised. Multiple anomalies or suspicious requests were identified that warrant secondary verification.'
              : report.overallRiskLevel === 'High'
              ? 'High scam probability. Strong hallmarks of deceptive social engineering or advance-fee fraud detected.'
              : 'CRITICAL THREAT. High likelihood of credential harvesting, unauthorized account takeover, or financial extraction.'}
          </p>

          {/* Engine Consensus / Divergence Box */}
          <div className="consensus-callout">
            <div className="consensus-icon">
              {report.overallRiskLevel === 'Critical' || report.overallRiskLevel === 'High' ? (
                <AlertOctagon size={18} />
              ) : (
                <Shield size={18} />
              )}
            </div>
            <div className="consensus-text">
              <strong>Engine Correlation:</strong> {report.agreementNote}
            </div>
          </div>
        </div>

        {/* Visual Risk Meter */}
        <div className="results-hero-right">
          <RiskMeter score={report.overallScore} level={report.overallRiskLevel} />
        </div>
      </div>

      {/* Layer Breakdown Row: Deterministic vs Gemini AI */}
      <div className="engine-breakdown-grid">
        {/* Deterministic Rules Engine Card */}
        <div className="engine-card">
          <div className="engine-card-header">
            <div className="engine-title-wrap">
              <Layers className="engine-icon text-indigo" size={18} />
              <h3 className="engine-title">Deterministic Risk Engine</h3>
            </div>
            <div className="engine-score-pill">
              Score: <strong>{report.deterministic.score}/100</strong>
            </div>
          </div>
          <p className="engine-summary">{report.deterministic.summary}</p>
          <div className="engine-meta">
            <span>Threat Categories Checked: 7</span>
            <span>Triggered: {report.deterministic.totalIndicatorsDetected}</span>
          </div>
        </div>

        {/* Gemini AI Layer Card */}
        <div className="engine-card">
          <div className="engine-card-header">
            <div className="engine-title-wrap">
              <Sparkles className="engine-icon text-violet" size={18} />
              <h3 className="engine-title">Google Gemini AI Analysis</h3>
            </div>
            <div className="engine-score-pill">
              {report.gemini.available && report.gemini.result ? (
                <>
                  Score: <strong>{report.gemini.result.aiRiskScore}/100</strong>
                </>
              ) : (
                <span className="pill-inactive">Unavailable</span>
              )}
            </div>
          </div>

          {report.gemini.available && report.gemini.result ? (
            <>
              <p className="engine-summary">{report.gemini.result.summary}</p>
              <div className="engine-meta">
                <span>Model: {report.gemini.model || 'gemini-3.8-flash'}</span>
                <span>Confidence: {report.gemini.result.confidence}</span>
              </div>
              {report.gemini.result.discrepanciesOrNuance && (
                <div className="nuance-box">
                  <span className="nuance-label">Contextual Nuance:</span>
                  <p className="nuance-text">{report.gemini.result.discrepanciesOrNuance}</p>
                </div>
              )}
            </>
          ) : (
            <div className="fallback-notice">
              <AlertTriangle size={16} className="fallback-icon" />
              <div>
                <strong>Local Rules-Only Analysis:</strong>
                <p>{report.gemini.note || 'Gemini API key is not configured. Results generated solely by deterministic pattern engine.'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning Signs & Evidence Section */}
      <div className="warning-signs-section">
        <div className="section-title-row">
          <h3 className="section-title">
            Key Warning Signs Detected ({report.combinedWarningSigns.length})
          </h3>
          <span className="section-subtitle">
            Specific patterns, urgency signals, and evidence extracted from the input
          </span>
        </div>

        {report.combinedWarningSigns.length === 0 ? (
          <div className="empty-warning-card">
            <CheckCircle className="empty-icon text-emerald" size={32} />
            <div className="empty-text">
              <h4>No Critical Warning Signs Flagged</h4>
              <p>
                No typical phishing patterns, credential demands, or extortion threats were matched in the submitted text.
              </p>
            </div>
          </div>
        ) : (
          <div className="warning-signs-grid">
            {report.combinedWarningSigns.map((sign, idx) => (
              <div key={sign.id || idx} className="warning-sign-card">
                <div className="warning-sign-header">
                  <div className="sign-category-row">
                    <span className={`severity-tag ${getSeverityBadgeClass(sign.severity)}`}>
                      {sign.severity.toUpperCase()}
                    </span>
                    <span className="sign-category">{sign.category}</span>
                  </div>
                  <span className="sign-contribution">+{sign.score} Risk</span>
                </div>

                <h4 className="sign-title">{sign.title}</h4>
                <p className="sign-reason">{sign.reason}</p>

                {sign.evidence && sign.evidence.length > 0 && (
                  <div className="sign-evidence-box">
                    <span className="evidence-label">Matched Evidence from Submitted Text:</span>
                    <div className="evidence-tags">
                      {sign.evidence.map((snippet, sIdx) => (
                        <code key={sIdx} className="evidence-snippet">
                          "{snippet}"
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Safe Next Steps */}
      <div className="action-steps-section">
        <h3 className="section-title">Recommended Safe Next Steps</h3>
        <p className="section-subtitle">
          Follow defensive cybersecurity best practices to safely verify claims without exposing yourself to harm.
        </p>

        <div className="steps-list">
          {report.recommendedNextSteps.map((step, idx) => (
            <div key={idx} className="step-item">
              <div className="step-number">{idx + 1}</div>
              <p className="step-text">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Original Submitted Text (Safe Truncated / Collapsible) */}
      <div className="original-content-card">
        <div
          className="original-content-toggle"
          onClick={() => setShowFullOriginal(!showFullOriginal)}
          role="button"
          tabIndex={0}
        >
          <div className="toggle-left">
            <ExternalLink size={16} />
            <span>Submitted Content Sandbox Inspection</span>
          </div>
          <div className="toggle-right">
            <span>{showFullOriginal ? 'Hide Full Content' : 'View Full Content'}</span>
            {showFullOriginal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        <div className="original-snippet-preview">
          <p className="snippet-quote">
            {showFullOriginal ? report.fullSubmittedText : report.submittedSnippet}
          </p>
        </div>
      </div>

      {/* Limitations and Uncertainty Notice */}
      <div className="limitations-banner">
        <div className="limitations-header">
          <AlertTriangle size={18} className="text-amber" />
          <h4>Assessment Limitations & Uncertainty Caveats</h4>
        </div>
        <ul className="limitations-list">
          {report.limitationsAndCaveats.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
        <p className="disclaimer-note">
          <strong>Official Notice:</strong> {report.disclaimer}
        </p>
      </div>

      {/* Bottom Action Bar */}
      <div className="results-action-bar">
        <button type="button" className="action-btn secondary" onClick={onReset}>
          <RotateCcw size={16} />
          <span>Analyze Another Message</span>
        </button>

        <button type="button" className="action-btn primary" onClick={copySummary}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Summary Copied!' : 'Copy Risk Summary'}</span>
        </button>
      </div>
    </section>
  );
};
