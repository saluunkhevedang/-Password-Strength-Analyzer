// Fully local password analysis — nothing ever leaves the browser.

export interface SecurityCheck {
  id: string;
  label: string;
  passed: boolean;
  suggestion: string;
}

export type StrengthLevel = "Very Weak" | "Weak" | "Moderate" | "Strong" | "Very Strong";

export interface PasswordAnalysis {
  length: number;
  score: number; // 0-8
  maxScore: number;
  strength: StrengthLevel;
  checks: SecurityCheck[];
  suggestions: string[];
}

const COMMON_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234",
  "111111", "1234567", "dragon", "123123", "baseball", "abc123", "football",
  "monkey", "letmein", "696969", "shadow", "master", "666666", "qwertyuiop",
  "123321", "mustang", "1234567890", "michael", "654321", "superman",
  "1qaz2wsx", "7777777", "121212", "000000", "qazwsx", "123qwe", "killer",
  "trustno1", "jordan", "jennifer", "zxcvbnm", "asdfgh", "hunter", "buster",
  "soccer", "harley", "batman", "andrew", "tigger", "sunshine", "iloveyou",
  "2000", "charlie", "robert", "thomas", "hockey", "ranger", "daniel",
  "starwars", "klaster", "112233", "george", "computer", "michelle", "jessica",
  "pepper", "1111", "zxcvbn", "555555", "11111111", "131313", "freedom",
  "777777", "pass", "maggie", "159753", "aaaaaa", "ginger", "princess",
  "joshua", "cheese", "amanda", "summer", "love", "ashley", "nicole",
  "chelsea", "biteme", "matthew", "access", "yankees", "987654321",
  "dallas", "austin", "thunder", "taylor", "matrix", "mobilemail", "mom",
  "monitor", "monitoring", "montana", "moon", "moscow", "admin", "welcome",
  "login", "passw0rd", "p@ssw0rd", "p@ssword", "qwerty123", "password1",
  "password123", "changeme", "secret", "hello123", "test123", "root",
]);

function hasExcessiveRepeats(pw: string): boolean {
  if (pw.length === 0) return false;
  // 3+ identical characters in a row
  if (/(.)\1{2,}/.test(pw)) return true;
  // one character makes up more than 50% of the password
  const counts = new Map<string, number>();
  for (const ch of pw) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const n of counts.values()) {
    if (pw.length >= 4 && n / pw.length > 0.5) return true;
  }
  return false;
}

export function analyzePassword(pw: string): PasswordAnalysis {
  const lower = pw.toLowerCase();
  const checks: SecurityCheck[] = [
    {
      id: "min8",
      label: "Minimum 8 characters",
      passed: pw.length >= 8,
      suggestion: "Use at least 8 characters",
    },
    {
      id: "min12",
      label: "At least 12 characters",
      passed: pw.length >= 12,
      suggestion: "Use 12 or more characters",
    },
    {
      id: "upper",
      label: "Contains uppercase letters",
      passed: /[A-Z]/.test(pw),
      suggestion: "Add at least one uppercase letter",
    },
    {
      id: "lower",
      label: "Contains lowercase letters",
      passed: /[a-z]/.test(pw),
      suggestion: "Add at least one lowercase letter",
    },
    {
      id: "number",
      label: "Contains numbers",
      passed: /[0-9]/.test(pw),
      suggestion: "Add numbers",
    },
    {
      id: "special",
      label: "Contains special characters",
      passed: /[^A-Za-z0-9]/.test(pw),
      suggestion: "Add special characters (!@#$%^&*…)",
    },
    {
      id: "common",
      label: "Not a commonly used password",
      passed: pw.length > 0 && !COMMON_PASSWORDS.has(lower),
      suggestion: "Avoid commonly used passwords",
    },
    {
      id: "repeats",
      label: "No excessive repeated characters",
      passed: pw.length > 0 && !hasExcessiveRepeats(pw),
      suggestion: "Avoid repeated characters",
    },
  ];

  const score = checks.filter((c) => c.passed).length;
  const strength: StrengthLevel =
    pw.length === 0
      ? "Very Weak"
      : score <= 2
        ? "Very Weak"
        : score === 3
          ? "Weak"
          : score <= 5
            ? "Moderate"
            : score <= 7
              ? "Strong"
              : "Very Strong";

  return {
    length: pw.length,
    score,
    maxScore: checks.length,
    strength,
    checks,
    suggestions: checks.filter((c) => !c.passed).map((c) => c.suggestion),
  };
}

export function strengthColor(strength: StrengthLevel): string {
  switch (strength) {
    case "Very Weak":
      return "var(--danger)";
    case "Weak":
      return "oklch(0.7 0.19 45)";
    case "Moderate":
      return "var(--warning)";
    case "Strong":
      return "oklch(0.8 0.18 175)";
    case "Very Strong":
      return "var(--success)";
  }
}

export interface HistoryEntry {
  length: number;
  score: number;
  maxScore: number;
  strength: StrengthLevel;
  timestamp: number;
}

const HISTORY_KEY = "psa-session-history";

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 25)));
  } catch {
    /* storage unavailable — ignore */
  }
}
