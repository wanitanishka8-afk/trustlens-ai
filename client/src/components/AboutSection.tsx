import React from 'react';
import { Sparkles, Layers, Lock, AlertTriangle, CheckSquare, Search, Eye, ExternalLink } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="about-section-container">
      {/* Intro Hero */}
      <div className="about-hero">
        <h2 className="section-main-title">About TrustLens AI</h2>
        <p className="section-main-subtitle">
          TrustLens AI is an open cybersecurity intelligence initiative engineered to protect individuals and
          enterprises from advanced social engineering, phishing campaigns, deceptive recruitment, scholarship
          grants, and payment extortion scams.
        </p>
      </div>

      {/* Dual Engine Architecture Explanation */}
      <div className="about-card-grid">
        <div className="about-feature-card">
          <div className="feature-card-header">
            <div className="feature-icon-badge bg-indigo-soft">
              <Layers className="text-indigo" size={22} />
            </div>
            <h3>Layer 1: Deterministic Threat Heuristics</h3>
          </div>
          <p>
            An independent, non-probabilistic rule engine executes first. It performs pattern matching and token
            analysis across seven documented attack categories. It enforces mathematical sub-additive scoring and
            critical synergy floors to eliminate duplicate keyword runaway while ensuring high-risk combinations
            (such as urgent deadlines + OTP requests) trigger decisive escalation.
          </p>
          <ul className="feature-bullets">
            <li>Zero latency, runs 100% locally and deterministically</li>
            <li>No hallucination risk or external cloud dependency</li>
            <li>Precise evidence extraction with character-level citations</li>
          </ul>
        </div>

        <div className="about-feature-card">
          <div className="feature-card-header">
            <div className="feature-icon-badge bg-violet-soft">
              <Sparkles className="text-violet" size={22} />
            </div>
            <h3>Layer 2: Google Gemini AI Analysis</h3>
          </div>
          <p>
            When configured with a backend API key, submitted content is evaluated by Google Gemini 3.8 Flash
            via the official <code>@google/genai</code> SDK. Gemini assesses deep psychological manipulation,
            conversational coercion, subtle tone shifts, brand pretexting, and contextual nuances that rigid
            regex engines cannot detect.
          </p>
          <ul className="feature-bullets">
            <li>Strict JSON Schema enforcement with Zod validation</li>
            <li>Backend-isolated execution; API keys never touch the browser</li>
            <li>Graceful degradation: transparent fallback to Local Rules if offline</li>
          </ul>
        </div>
      </div>

      {/* The 7 Core Threat Vectors */}
      <div className="about-threat-vectors-card">
        <h3 className="sub-heading">The 7 Primary Threat Vectors Analyzed</h3>
        <div className="vector-grid">
          <div className="vector-item">
            <div className="vector-num">01</div>
            <div>
              <strong>Credential & OTP Harvesting:</strong> Demands for verification codes, passwords, ATM PINs,
              or CVV numbers.
            </div>
          </div>
          <div className="vector-item">
            <div className="vector-num">02</div>
            <div>
              <strong>Advance-Fee & Deposit Traps:</strong> Demands for upfront "processing fees", "courier deposits",
              or crypto/gift-card payments.
            </div>
          </div>
          <div className="vector-item">
            <div className="vector-num">03</div>
            <div>
              <strong>Artificial Urgency:</strong> Fabricated countdowns, threats of account closure within hours, or
              fake legal/law enforcement action.
            </div>
          </div>
          <div className="vector-item">
            <div className="vector-num">04</div>
            <div>
              <strong>Unrealistic Rewards & Income:</strong> Guarantees of hundreds of dollars per hour with no experience,
              lottery wins, or unsolicited grants.
            </div>
          </div>
          <div className="vector-item">
            <div className="vector-num">05</div>
            <div>
              <strong>Brand & Agency Impersonation:</strong> Pretexting as PayPal, Amazon, IRS, banks, delivery couriers,
              or government departments.
            </div>
          </div>
          <div className="vector-item">
            <div className="vector-num">06</div>
            <div>
              <strong>Obfuscated URLs & Domains:</strong> Use of shorteners (bit.ly), raw IP addresses, suspicious TLDs,
              or deceptive subdomains.
            </div>
          </div>
          <div className="vector-item">
            <div className="vector-num">07</div>
            <div>
              <strong>Channel Migration:</strong> Urgent requests to leave secure platforms to chat privately via Telegram
              or WhatsApp.
            </div>
          </div>
        </div>
      </div>

      {/* Independent Verification Guide */}
      <div className="verification-guide-card">
        <div className="guide-header">
          <CheckSquare className="text-emerald" size={24} />
          <div>
            <h3>How to Independently Verify Suspicious Claims</h3>
            <p>Always practice Out-of-Band (OOB) verification before taking action or sending funds.</p>
          </div>
        </div>

        <div className="guide-steps-grid">
          <div className="guide-box">
            <Search className="guide-icon text-indigo" size={20} />
            <h4>1. Navigate Directly to Official Portals</h4>
            <p>
              Never click links embedded inside suspicious messages. Type the known official URL (e.g., paypal.com,
              usps.com, or your university student portal) manually in a new browser tab.
            </p>
          </div>

          <div className="guide-box">
            <Lock className="guide-icon text-violet" size={20} />
            <h4>2. Inspect Sender Domain Headers</h4>
            <p>
              Scammers often use look-alike sender domains (e.g. <code>support@paypa1-security.com</code> instead of{' '}
              <code>@paypal.com</code>). Check full email headers for SPF and DKIM authentication.
            </p>
          </div>

          <div className="guide-box">
            <Eye className="guide-icon text-amber" size={20} />
            <h4>3. Call Official Public Phone Numbers</h4>
            <p>
              If a message claims your bank card or delivery parcel is frozen, call the customer service number
              printed on the back of your physical card or the company's verified public directory.
            </p>
          </div>

          <div className="guide-box">
            <ExternalLink className="guide-icon text-sky" size={20} />
            <h4>4. Remember the Golden Rule</h4>
            <p>
              Genuine employers will never ask you to buy your own equipment with reimbursement promises, and genuine
              lotteries never require a fee to release your prize.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Limitations */}
      <div className="about-limitations-box">
        <div className="limitations-title-row">
          <AlertTriangle className="text-amber" size={20} />
          <h4>Advisory Notice & Disclaimer</h4>
        </div>
        <p>
          TrustLens AI generates probabilistic and heuristic risk assessments designed for advisory guidance only.
          It does not provide absolute certification of safety or definitive proof of fraud. Emerging zero-day attack
          vectors or sophisticated personalized spear-phishing may evade automated detection. Users must maintain
          vigilance and conduct secondary verification before taking financial, legal, or credential-related actions.
        </p>
      </div>
    </section>
  );
};
