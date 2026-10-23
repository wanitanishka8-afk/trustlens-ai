import { describe, it, expect } from 'vitest';
import { analyzeDeterministically } from '../src/engine/deterministic.js';

describe('Deterministic Risk Engine', () => {
  it('detects high-risk credential and OTP harvesting requests', () => {
    const text = 'URGENT: Your account is suspended. Reply immediately with your One-Time Passcode (OTP) and confirm your password to verify.';
    const result = analyzeDeterministically(text);

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(['High', 'Critical']).toContain(result.riskLevel);
    expect(result.warningSigns.some((w) => w.id === 'credential_harvesting')).toBe(true);

    const credSign = result.warningSigns.find((w) => w.id === 'credential_harvesting');
    expect(credSign?.evidence.length).toBeGreaterThan(0);
    expect(credSign?.reason).toContain('Legitimate organizations');
  });

  it('detects advance-fee and upfront payment scams', () => {
    const text = 'Congratulations! To claim your approval grant, you must pay an upfront processing fee of $200 via wire transfer or gift cards.';
    const result = analyzeDeterministically(text);

    expect(result.score).toBeGreaterThanOrEqual(55);
    expect(['High', 'Critical']).toContain(result.riskLevel);
    expect(result.warningSigns.some((w) => w.id === 'advance_fee')).toBe(true);
    expect(result.warningSigns.some((w) => w.id === 'unrealistic_rewards')).toBe(true);
  });

  it('detects suspicious work-from-home job offers with private Telegram shift', () => {
    const text = 'Work from home typing simple text. Earn $500 per day with no experience needed! Contact our recruiter on Telegram @FastJobRecruiter.';
    const result = analyzeDeterministically(text);

    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(['Moderate', 'High', 'Critical']).toContain(result.riskLevel);
    expect(result.warningSigns.some((w) => w.id === 'unrealistic_rewards')).toBe(true);
    expect(result.warningSigns.some((w) => w.id === 'off_platform_redirection')).toBe(true);
  });

  it('detects suspicious scholarship notifications with suspicious domains', () => {
    const text = 'You have been awarded a scholarship without application! Claim your approved grant before it expires today at http://free-scholarship-money.xyz/claim.';
    const result = analyzeDeterministically(text);

    expect(result.score).toBeGreaterThanOrEqual(45);
    expect(result.warningSigns.some((w) => w.id === 'suspicious_links')).toBe(true);
  });

  it('evaluates harmless, benign messages as Low risk', () => {
    const harmless = 'Hi Sarah, let us meet tomorrow at 2 PM in the library study room for group revision. Bring your biology notes!';
    const result = analyzeDeterministically(harmless);

    expect(result.score).toBeLessThanOrEqual(15);
    expect(result.riskLevel).toBe('Low');
    expect(result.warningSigns.length).toBe(0);
  });

  it('bounds scores strictly between 0 and 100', () => {
    const massiveScam = `
      URGENT ACTION REQUIRED: Account suspended within 2 hours!
      Send your OTP, password, PIN, and CVV to verify.
      Pay advance fee deposit of $500 via cryptocurrency bitcoin or apple gift card.
      Earn $5000 per day guaranteed no experience needed!
      PayPal security alert: delivery failed.
      Click http://192.168.1.50/login.xyz and message on WhatsApp wa.me/123456.
    `;
    const result = analyzeDeterministically(massiveScam);

    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.riskLevel).toBe('Critical');
  });

  it('applies sub-additive scaling to prevent runaway scores from repeated keywords in same rule', () => {
    const repeated = 'OTP OTP OTP OTP verification code security code enter PIN';
    const single = 'Please send your OTP';

    const resRepeated = analyzeDeterministically(repeated);
    const resSingle = analyzeDeterministically(single);

    // Repeated keywords should not multiply uncontrollably
    expect(resRepeated.score).toBeLessThanOrEqual(resSingle.score * 1.5);
  });
});
