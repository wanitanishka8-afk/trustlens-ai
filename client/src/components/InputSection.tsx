import React, { useState } from 'react';
import { Search, RotateCcw, AlertTriangle, Briefcase, GraduationCap, CreditCard, CheckCircle2, Shield } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (content: string) => Promise<void>;
  isLoading: boolean;
}

export const SAMPLE_PROMPTS = [
  {
    id: 'job_scam',
    title: 'Suspicious Job Offer',
    icon: Briefcase,
    content:
      'Hello dear candidate! Congratulations, our international hiring team at Global Talent Solutions has reviewed your profile. We are offering you an immediate remote Online Data Assessor position. Earn $650 per day with no previous experience needed! Flexible 1-2 hours daily. Before your orientation kit and company MacBook can be shipped, you must transfer a $150 refundable registration and insurance deposit via Bitcoin or Apple Gift Cards. Please contact our HR manager on Telegram immediately at @GlobalRecruiter_99 to claim your slot before it expires today!',
  },
  {
    id: 'scholarship_scam',
    title: 'Scholarship / Grant',
    icon: GraduationCap,
    content:
      'OFFICIAL NOTIFICATION: You have been selected as a finalist for the 2026 International Merit Education Grant of $15,000! No GPA check or essay submission required. To release your approved scholarship funds directly to your bank account, you must pay a one-time courier clearance fee of $85 within 24 hours. Failure to respond will forfeit your grant to the next alternate candidate. Click here immediately to settle your fee: http://merit-grant-funds.xyz/claim',
  },
  {
    id: 'payment_scam',
    title: 'Urgent Payment Alert',
    icon: CreditCard,
    content:
      'URGENT SECURITY ALERT: We detected unauthorized transaction attempts of $849.00 on your PayPal account. Your account has been temporarily locked to prevent fraud. You must verify your identity within 2 hours or your account will be permanently suspended and law enforcement notified. Reply immediately with your One-Time Passcode (OTP) and enter your ATM card PIN at: http://192.168.1.104/paypal-verification',
  },
  {
    id: 'legitimate_message',
    title: 'Legitimate Message',
    icon: CheckCircle2,
    content:
      'Hi Mark, this is Professor Davis from the Biology Department. Just a reminder that our study group meets tomorrow at 3:30 PM in Room 402 of the Science Center. Please bring your notes on cellular metabolism and the draft of your lab report. No preparation fees or forms are needed. See you then!',
  },
];

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [content, setContent] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setValidationError('Please enter or paste suspicious content to analyze.');
      return;
    }
    if (content.trim().length < 5) {
      setValidationError('Please provide at least 5 characters for an accurate assessment.');
      return;
    }
    if (content.length > 10000) {
      setValidationError('Content exceeds the maximum character limit of 10,000.');
      return;
    }
    setValidationError(null);
    onAnalyze(content.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const loadSample = (sampleText: string) => {
    setContent(sampleText);
    setValidationError(null);
  };

  const clearContent = () => {
    setContent('');
    setValidationError(null);
  };

  return (
    <section className="input-hero-section">
      <div className="hero-heading">
        <div className="hero-pill">
          <Shield size={14} className="hero-pill-icon" />
          <span>Advanced Scam & Social Engineering Detection</span>
        </div>
        <h2 className="hero-title">
          See the Risk <span className="highlight-gradient">Before You Trust.</span>
        </h2>
        <p className="hero-subtitle">
          Evaluate suspicious emails, text messages, job offers, scholarships, unexpected invoices, and payment
          demands with dual-layer deterministic threat heuristics and Google Gemini AI.
        </p>
      </div>

      {/* Preset Example Buttons */}
      <div className="sample-presets-bar">
        <span className="preset-label">Test with real-world scenarios:</span>
        <div className="preset-buttons">
          {SAMPLE_PROMPTS.map((sample) => {
            const Icon = sample.icon;
            return (
              <button
                key={sample.id}
                type="button"
                className="preset-btn"
                onClick={() => loadSample(sample.content)}
                title={`Load sample: ${sample.title}`}
              >
                <Icon size={15} className="preset-icon" />
                <span>{sample.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Form Card */}
      <div className="input-card">
        <form onSubmit={handleSubmit}>
          <div className="textarea-container">
            <textarea
              className={`input-textarea ${validationError ? 'has-error' : ''}`}
              rows={6}
              placeholder="Paste the suspicious text, email, SMS, recruiter message, scholarship claim, or URL context here..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={10000}
              aria-label="Suspicious message content to analyze"
            />

            <div className="textarea-footer">
              <div className="char-counter">
                <span className={content.length > 9000 ? 'char-warning' : ''}>
                  {content.length.toLocaleString()}
                </span>
                <span className="char-limit"> / 10,000 characters</span>
              </div>

              {content && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={clearContent}
                  title="Clear input text"
                >
                  <RotateCcw size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {validationError && (
            <div className="validation-error-banner" role="alert">
              <AlertTriangle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          <div className="form-action-row">
            <div className="input-tip">
              <span className="tip-badge">Safe Sandbox</span>
              <span className="tip-text">
                Submitted text is treated as untrusted data. URLs are never visited automatically.
              </span>
            </div>

            <button
              type="submit"
              className="analyze-cta-button"
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Scanning Threat Vectors...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Analyze Suspicious Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
