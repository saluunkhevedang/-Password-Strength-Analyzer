import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ScanSearch,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileBarChart2,
  History,
  Lock,
  Trash2,
  Fingerprint,
  Gauge,
  KeyRound,
} from "lucide-react";
import {
  analyzePassword,
  loadHistory,
  saveHistory,
  strengthColor,
  type HistoryEntry,
} from "@/lib/password-analysis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Password Strength Analyzer — Local Security Check" },
      {
        name: "description",
        content:
          "Analyze password strength in real time with 8 security checks, a live strength meter, improvement suggestions, and session history — 100% local, nothing leaves your browser.",
      },
      { property: "og:title", content: "Password Strength Analyzer" },
      {
        property: "og:description",
        content:
          "A professional cybersecurity tool that scores password strength locally in your browser — no data ever sent to a server.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [report, setReport] = useState<ReturnType<typeof analyzePassword> | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const analysis = useMemo(() => analyzePassword(password), [password]);

  const runAnalysis = () => {
    if (!password) return;
    const a = analyzePassword(password);
    setReport(a);
    const entry: HistoryEntry = {
      length: a.length,
      score: a.score,
      maxScore: a.maxScore,
      strength: a.strength,
      timestamp: Date.now(),
    };
    const next = [entry, ...history].slice(0, 25);
    setHistory(next);
    saveHistory(next);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const meterPct = (analysis.score / analysis.maxScore) * 100;
  const meterColor = strengthColor(analysis.strength);

  return (
    <div className="relative min-h-screen bg-background bg-cyber-grid">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.87 0.19 155 / 0.09), transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary glow-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-bold tracking-tight text-foreground">
                Password Strength Analyzer
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                local · private · real-time
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground sm:flex">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            0 bytes sent to server
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            How strong is your{" "}
            <span className="text-primary">password</span>?
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Instant analysis against 8 security checks — strength scoring,
            breach-list screening, and actionable fixes. Everything runs in
            your browser; your password never leaves this page.
          </p>
        </section>

        {/* Input card */}
        <section className="mx-auto mt-10 max-w-2xl">
          <div className="card-surface rounded-2xl p-6 sm:p-8">
            <label
              htmlFor="password-input"
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Enter password to test
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  id="password-input"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
                  placeholder="Type or paste a password…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-input bg-background/70 px-4 py-3 pr-12 font-mono text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:glow-primary"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={!password}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <ScanSearch className="h-4 w-4" />
                Analyze Password
              </button>
            </div>

            {/* Strength meter */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  <Gauge className="h-3.5 w-3.5" />
                  Strength
                </span>
                <span className="flex items-baseline gap-3">
                  <span
                    className="font-display text-sm font-bold transition-colors"
                    style={{ color: password ? meterColor : "var(--muted-foreground)" }}
                  >
                    {password ? analysis.strength : "—"}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {password ? `${analysis.score}/${analysis.maxScore}` : "0/8"}
                  </span>
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${password ? meterPct : 0}%`,
                    background: `linear-gradient(90deg, ${meterColor}, ${meterColor})`,
                    boxShadow: password ? `0 0 12px ${meterColor}` : undefined,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                <span>Very Weak</span>
                <span>Weak</span>
                <span>Moderate</span>
                <span>Strong</span>
                <span>Very Strong</span>
              </div>
            </div>
          </div>
        </section>

        {/* Checks + Suggestions */}
        <section className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="card-surface rounded-2xl p-6 lg:col-span-3">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Security Checks
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {analysis.checks.map((check) => (
                <li
                  key={check.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 transition-colors"
                >
                  {check.passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span
                    className={`text-sm ${check.passed ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface rounded-2xl p-6 lg:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-warning" />
              Improvement Suggestions
            </h2>
            {password && analysis.suggestions.length === 0 ? (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-foreground">
                  Excellent — this password passes every check. Consider using a
                  password manager to store it safely.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {(password ? analysis.suggestions : [
                  "Start typing a password to get tailored suggestions",
                ]).map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-2.5"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    <span className="text-sm text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Report */}
        {report && (
          <section className="mt-8">
            <div className="card-surface rounded-2xl p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <FileBarChart2 className="h-4 w-4 text-terminal" />
                Password Analysis Report
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-center">
                  <Fingerprint className="mx-auto h-5 w-5 text-terminal" />
                  <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                    {report.length}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Password Length
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-center">
                  <Gauge className="mx-auto h-5 w-5 text-terminal" />
                  <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                    {report.score}/{report.maxScore}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Security Score
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-center">
                  <ShieldCheck
                    className="mx-auto h-5 w-5"
                    style={{ color: strengthColor(report.strength) }}
                  />
                  <p
                    className="mt-2 font-mono text-2xl font-bold"
                    style={{ color: strengthColor(report.strength) }}
                  >
                    {report.strength}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Strength Level
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Checks passed
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.checks.map((c) => (
                      <span
                        key={c.id}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] ${
                          c.passed
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-destructive/40 bg-destructive/10 text-destructive"
                        }`}
                      >
                        {c.passed ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Suggested improvements
                  </p>
                  {report.suggestions.length === 0 ? (
                    <p className="mt-2 text-sm text-primary">
                      None — all checks passed.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {report.suggestions.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-warning" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Session history */}
        <section className="mt-8">
          <div className="card-surface rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <History className="h-4 w-4 text-terminal" />
                Session History
              </h2>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Passwords are never stored — only length, score, strength, and time.
            </p>
            {history.length === 0 ? (
              <p className="mt-5 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No analyses yet this session. Run an analysis to see it here.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Time</th>
                      <th className="pb-3 pr-4 font-medium">Length</th>
                      <th className="pb-3 pr-4 font-medium">Score</th>
                      <th className="pb-3 font-medium">Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={h.timestamp + i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {new Date(h.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">
                          {h.length} chars
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">
                          {h.score}/{h.maxScore}
                        </td>
                        <td className="py-3">
                          <span
                            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold"
                            style={{ color: strengthColor(h.strength) }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: strengthColor(h.strength) }}
                            />
                            {h.strength}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="relative mt-12 border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center sm:px-6">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 Password Strength Analyzer | Built with Python Concepts &amp;
            Modern Web Technologies
          </p>
        </div>
      </footer>
    </div>
  );
}
