"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Send, XCircle } from "lucide-react";
import { formatDuration } from "@/lib/format";
import type { AttemptSummary, OptionLabel, PublicQuestionPackage } from "@/lib/types";

type PracticeClientProps = {
  questionPackage: PublicQuestionPackage;
  history: AttemptSummary[];
};

type ResultPayload = {
  attempt: AttemptSummary;
  result: {
    score: number;
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    blankCount: number;
  };
};

export function PracticeClient({ questionPackage, history }: PracticeClientProps) {
  const [answers, setAnswers] = useState<Record<string, OptionLabel | null>>({});
  const [remaining, setRemaining] = useState(questionPackage.durationSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useMemo(() => new Date().toISOString(), []);
  const answersRef = useRef(answers);
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  async function submitAttempt(finalRemaining = remaining) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    setError(null);

    const elapsedSeconds = Math.min(
      questionPackage.durationSeconds,
      Math.max(0, questionPackage.durationSeconds - finalRemaining),
    );

    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: questionPackage.category,
        packageNumber: questionPackage.packageNumber,
        answers: answersRef.current,
        elapsedSeconds,
        startedAt,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Jawaban gagal disimpan.");
      submittedRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const payload = (await response.json()) as ResultPayload;
    setResult(payload);
    setIsSubmitting(false);
  }

  useEffect(() => {
    if (result) return;
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          void submitAttempt(0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
    // submitAttempt intentionally reads from refs and latest state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const unansweredCount = questionPackage.questions.length - answeredCount;

  function setAnswer(questionId: string, label: OptionLabel) {
    if (result) return;
    setAnswers((current) => ({
      ...current,
      [questionId]: current[questionId] === label ? null : label,
    }));
  }

  return (
    <div className="question-grid" style={{ marginTop: 24 }}>
      <section className="question-list">
        {error && <div className="alert">{error}</div>}
        {result && (
          <div className="wire-panel panel-pad accent-green">
            <p className="micro-label">
              <CheckCircle2 aria-hidden="true" size={16} /> RESULT
            </p>
            <h3 className="brand-small">Skor {result.result.score}/40</h3>
            <p>
              Benar {result.result.correctCount}, salah {result.result.wrongCount}, kosong{" "}
              {result.result.blankCount}.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="rough-button primary" href="/dashboard">
                Dashboard
              </Link>
              <Link className="rough-button" href="/history">
                Lihat Histori
              </Link>
            </div>
          </div>
        )}

        {questionPackage.questions.map((question) => (
          <article className="wire-panel panel-pad question-card" id={question.id} key={question.id}>
            <div className="split-row">
              <p className="micro-label">NO. {question.number.toString().padStart(2, "0")}</p>
              <span className="muted">{question.isDecimal ? "decimal" : "integer"}</span>
            </div>
            <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{question.expression}</h3>
            <div className="answer-grid" role="radiogroup" aria-label={`Jawaban nomor ${question.number}`}>
              {question.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={`option-button ${answers[question.id] === option.label ? "selected" : ""}`}
                  onClick={() => setAnswer(question.id, option.label)}
                  aria-pressed={answers[question.id] === option.label}
                >
                  {option.label}. {option.display}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <aside className="sticky-note">
        <div className="wire-panel panel-pad accent-red">
          <p className="micro-label">
            <Clock3 aria-hidden="true" size={16} /> TIMER
          </p>
          <div className="stat-number" style={{ color: remaining <= 60 ? "var(--red)" : "var(--ink)" }}>
            {formatDuration(remaining)}
          </div>
          <p className="muted">
            Terjawab {answeredCount}; belum {unansweredCount}
          </p>
          <button
            className="rough-button primary"
            type="button"
            onClick={() => void submitAttempt()}
            disabled={isSubmitting || Boolean(result)}
            style={{ width: "100%" }}
          >
            <Send aria-hidden="true" size={17} /> {isSubmitting ? "Menyimpan..." : "Selesai"}
          </button>
        </div>

        <div className="wire-panel-dashed panel-pad" style={{ marginTop: 18 }}>
          <p className="micro-label">MONITOR</p>
          <div className="monitor-grid">
            {questionPackage.questions.map((question) => (
              <a
                className={`monitor-dot ${answers[question.id] ? "done" : ""}`}
                href={`#${question.id}`}
                key={question.id}
                aria-label={`Nomor ${question.number} ${answers[question.id] ? "sudah dijawab" : "belum dijawab"}`}
              >
                {question.number}
              </a>
            ))}
          </div>
        </div>

        <div className="wire-panel-dashed panel-pad" style={{ marginTop: 18 }}>
          <p className="micro-label">HISTORI PAKET</p>
          {history.length === 0 ? (
            <p className="muted">Belum pernah dikerjakan.</p>
          ) : (
            <div className="grid">
              {history.slice(0, 5).map((attempt) => (
                <div className="split-row" key={attempt.id}>
                  <span>{new Date(attempt.submitted_at).toLocaleDateString("id-ID")}</span>
                  <strong>{attempt.score}/40</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {remaining === 0 && !result && (
          <div className="alert" style={{ marginTop: 18 }}>
            <XCircle aria-hidden="true" size={16} /> Waktu habis. Menyimpan jawaban...
          </div>
        )}
      </aside>
    </div>
  );
}

