import { DeterministicResult, RiskLevel, WarningSign } from '../types/index.js';

interface RuleDefinition {
  id: string;
  category: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  baseScore: number;
  reason: string;
  patterns: RegExp[];
}

export const DETERMINISTIC_RULES: RuleDefinition[] = [
  // 1. Credentials & Authentication Harvesting
  {
    id: 'credential_harvesting',
    category: 'Credential Harvesting',
    title: 'Request for Sensitive Credentials, OTP, or PIN',
    severity: 'critical',
    baseScore: 40,
    reason:
      'Legitimate organizations and financial institutions will never ask for your One-Time Password (OTP), password, PIN, or CVV. This is a primary indicator of unauthorized account takeover attempts.',
    patterns: [
      /\b(?:one[- ]?time[- ]?passcode|otp|verification[- ]?code|security[- ]?code)\b/i,
      /\b(?:send|share|confirm|provide|verify)\s+(?:your\s+)?(?:password|pin|passcode|cvv|security code|auth(?:entication)? token)\b/i,
      /\b(?:enter|type|input)\s+(?:your\s+)?(?:banking credentials|atm pin|card pin|login password)\b/i,
      /\b(?:ssn|social security number|national insurance number)\b/i,
    ],
  },

  // 2. Advance-Fee & Upfront Payment Traps
  {
    id: 'advance_fee',
    category: 'Advance-Fee / Suspicious Payment',
    title: 'Upfront Payment or Suspicious Fee Required',
    severity: 'high',
    baseScore: 30,
    reason:
      'Legitimate job offers, grants, and genuine prize winnings never require the recipient to pay an advance "processing fee", "refundable deposit", or "shipping charge" upfront.',
    patterns: [
      /\b(?:upfront|advance|processing|registration|clearance|courier|refundable)\s+(?:fee|deposit|payment|cost|charge)\b/i,
      /\b(?:pay|send|transfer)\s+(?:\$?\d+[\d,.]*|\d+\s*(?:dollars|usd|eur|gbp))\s+(?:first|in advance|before (?:receiving|release|dispatch))\b/i,
      /\b(?:wire transfer|western union|moneygram|crypto(?:currency)?|bitcoin|usdt|gift card(?:s)?|apple gift card|vanilla visa)\b/i,
      /\b(?:pay\s+(?:the\s+)?administrative fee to claim)\b/i,
    ],
  },

  // 3. Artificial Urgency & Coercive Deadlines
  {
    id: 'artificial_urgency',
    category: 'Urgency & Coercion',
    title: 'Artificial Deadlines or Threat of Immediate Loss',
    severity: 'medium',
    baseScore: 20,
    reason:
      'Scammers fabricate artificial urgency (e.g. 24 hours, immediate suspension, legal threats) to trigger panic and induce fast compliance before victims have time to consult others or verify.',
    patterns: [
      /\b(?:account\s+(?:is|has been|will be\s+)?(?:suspended|blocked|locked|terminated|closed|disabled))\b/i,
      /\b(?:urgent(?:ly)?|immediate(?:ly)?\s+action\s+required|reply\s+immediately|respond\s+immediately|act\s+now|time is running out|urgent\s+attention\s+required)\b/i,
      /\b(?:within\s+(?:24|48|12|2)\s*(?:hours|hrs)|failure to (?:respond|verify|comply) will result in)\b/i,
      /\b(?:warrant|legal\s+action|law\s+enforcement|arrest|court\s+summons)\s+(?:will be issued|pending)\b/i,
      /\b(?:final\s+notice|last\s+warning|expiring\s+today)\b/i,
    ],
  },

  // 4. Unrealistic Rewards, Prizes & Guaranteed Earnings
  {
    id: 'unrealistic_rewards',
    category: 'Exaggerated Promises',
    title: 'Unrealistic Financial Promises, Guaranteed Profits, or Prize Claims',
    severity: 'high',
    baseScore: 25,
    reason:
      'Guaranteed high-return investments, unsolicited lotteries, and extraordinarily easy remote jobs paying thousands for little work are hallmark recruitment and investment scams.',
    patterns: [
      /\b(?:congratulations|you\s+have\s+been\s+selected|winner|lucky\s+winner|won\s+a\s+prize|grand\s+prize|jackpot)\b/i,
      /\b(?:earn\s+\$?\d+[\d,.]*\s*(?:per|\/)\s*(?:day|hour|week)|guaranteed\s+(?:daily\s+)?income|passive\s+income\s+guarantee)\b/i,
      /\b(?:no\s+experience\s+(?:needed|necessary)|work\s+from\s+home\s+typing\s+simple\s+text)\b/i,
      /\b(?:100%|guaranteed|risk[- ]free)\s+(?:returns?|profit|investment)\b/i,
      /\b(?:awarded\s+a\s+(?:grant|scholarship)\s+without\s+application)\b/i,
    ],
  },

  // 5. Impersonation of Trusted Brands & Institutions
  {
    id: 'brand_impersonation',
    category: 'Brand Impersonation',
    title: 'Suspicious Mention or Claimed Association with Trusted Authority',
    severity: 'medium',
    baseScore: 20,
    reason:
      'Impersonating well-known institutions (banks, postal services, tax authorities, tech companies) creates false credibility to disarm the recipient’s natural defenses.',
    patterns: [
      /\b(?:paypal|amazon\s+security|netflix\s+billing|apple\s+id|microsoft\s+support|geek\s+squad|wells\s+fargo|chase\s+bank|bank\s+of\s+america)\b/i,
      /\b(?:irs|internal\s+revenue|hmrc|federal\s+reserve|usps\s+delivery|fedex\s+parcel|dhl\s+express|customs\s+and\s+border)\b/i,
      /\b(?:meta\s+security|google\s+verification\s+team|hr\s+department\s+of\s+telegram)\b/i,
      /\b(?:package\s+delivery\s+failed|parcel\s+detained|unauthorized\s+transaction\s+detected)\b/i,
    ],
  },

  // 6. Suspicious Shortened Links or Suspicious Domain Structures
  {
    id: 'suspicious_links',
    category: 'Suspicious Links & Domains',
    title: 'URL Shortener, Misleading Domain, or Obfuscated Link Detected',
    severity: 'high',
    baseScore: 25,
    reason:
      'Link shorteners hide the real destination, while unusual domain extensions and misspelled brand names are frequently used in phishing redirects to host look-alike scam portals.',
    patterns: [
      /\b(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|ow\.ly|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at)\/[a-zA-Z0-9_\-]+/i,
      /\bhttps?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?(?:\/[^\s]*)?/i,
      /\bhttps?:\/\/[a-zA-Z0-9.\-]+\.(?:xyz|top|work|buzz|click|cn|ru|gq|cf|ml|tk|fit|rest|site|live)\b/i,
      /\bhttps?:\/\/(?:[a-zA-Z0-9\-]+\.)*(?:paypal|amazon|apple|microsoft|netflix|google|chase|fedex|usps|dhl)[^/\s]*\.(?!com\b|org\b|net\b)[a-zA-Z]{2,}\b/i,
    ],
  },

  // 7. Off-Platform Redirection & Unofficial Channels
  {
    id: 'off_platform_redirection',
    category: 'Channel Redirection',
    title: 'Pressure to Move Conversation to Unofficial or Encrypted Channels',
    severity: 'medium',
    baseScore: 20,
    reason:
      'Fraudulent recruiters and sellers attempt to lure targets away from protected platforms onto Telegram or WhatsApp to evade monitoring and anti-fraud filters.',
    patterns: [
      /\b(?:contact|reach|message|text|dm|add)\s+(?:me|our\s+recruiter|the\s+hiring\s+manager)?\s*(?:on|via|at)\s+(?:whatsapp|telegram|signal|viber)\b/i,
      /\b(?:t\.me\/[a-zA-Z0-9_]+|wa\.me\/\d+)\b/i,
      /\b(?:contact\s+via\s+private\s+telegram|inbox\s+me\s+personally\s+on\s+whatsapp)\b/i,
    ],
  },
];

/**
 * Score calculation and combination algorithm:
 * - Each rule calculates an independent contribution based on matched evidence.
 * - Diminishing returns within the same category to prevent multi-keyword spam runaway.
 * - Bounded accumulation across distinct categories.
 * - Critical escalation floor if credential harvesting or explicit advance fees are matched alongside urgency or impersonation.
 * - Score bounded between 0 and 100.
 */
export function analyzeDeterministically(text: string): DeterministicResult {
  const cleanText = text.trim();
  const warningSigns: WarningSign[] = [];
  const categoryScores: Record<string, number[]> = {};

  for (const rule of DETERMINISTIC_RULES) {
    const matchedEvidence: string[] = [];

    for (const pattern of rule.patterns) {
      const match = cleanText.match(pattern);
      if (match) {
        // Collect exact matched snippet
        const snippet = match[0];
        if (!matchedEvidence.includes(snippet)) {
          matchedEvidence.push(snippet);
        }
      }
    }

    if (matchedEvidence.length > 0) {
      // Sub-additive contribution: first match is 100%, each additional match in same rule adds 20% of baseScore up to 1.4x
      const multiplier = 1 + Math.min(0.4, (matchedEvidence.length - 1) * 0.2);
      const ruleContribution = Math.round(rule.baseScore * multiplier);

      warningSigns.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        severity: rule.severity,
        score: ruleContribution,
        reason: rule.reason,
        evidence: matchedEvidence,
      });

      if (!categoryScores[rule.category]) {
        categoryScores[rule.category] = [];
      }
      categoryScores[rule.category].push(ruleContribution);
    }
  }

  // Combine across categories
  let rawAccumulated = 0;
  for (const scores of Object.values(categoryScores)) {
    // Top score in category + 30% of secondary in same category
    scores.sort((a, b) => b - a);
    const catScore = scores[0] + (scores.slice(1).reduce((sum, s) => sum + s, 0) * 0.3);
    rawAccumulated += catScore;
  }

  // Synergy / Escalation floor:
  // If credential harvesting is present alongside urgency or impersonation, floor is 75 (High to Critical)
  const hasCredentials = warningSigns.some((w) => w.id === 'credential_harvesting');
  const hasUrgency = warningSigns.some((w) => w.id === 'artificial_urgency');
  const hasImpersonation = warningSigns.some((w) => w.id === 'brand_impersonation');
  const hasAdvanceFee = warningSigns.some((w) => w.id === 'advance_fee');

  if (hasCredentials && (hasUrgency || hasImpersonation)) {
    rawAccumulated = Math.max(rawAccumulated, 85);
  } else if (hasAdvanceFee && (hasUrgency || hasImpersonation)) {
    rawAccumulated = Math.max(rawAccumulated, 75);
  } else if (hasCredentials) {
    rawAccumulated = Math.max(rawAccumulated, 65);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(rawAccumulated)));
  const riskLevel = determineRiskLevel(finalScore);

  let summary = 'No high-risk scam patterns or suspicious keywords detected.';
  if (warningSigns.length > 0) {
    summary = `Detected ${warningSigns.length} suspicious pattern category(ies) including: ${warningSigns
      .map((w) => w.title)
      .join(', ')}.`;
  }

  const methodology =
    'Deterministic scoring evaluates multi-factor threat vectors (credentials, advance fees, artificial urgency, unrealistic rewards, brand impersonation, link obfuscation, and channel shifting). Scores accumulate sub-additively with critical synergy floors to prevent runaway spam while accurately escalating dangerous combinations.';

  return {
    score: finalScore,
    riskLevel,
    warningSigns,
    totalIndicatorsDetected: warningSigns.length,
    summary,
    methodology,
  };
}

export function determineRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
}
