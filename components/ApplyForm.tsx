"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { APPLICATION_QUESTIONS, SITE } from "@/lib/content";

type Answers = Record<string, string>;

function validate(id: string, value: string): string | null {
  const v = value.trim();
  if (!v) return "This field is required.";

  switch (id) {
    case "name":
      if (v.length < 2) return "Please enter your name.";
      if (v.length > 100) return "That name is too long.";
      return null;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return "Enter a valid email address.";
      return null;
    case "phone": {
      const digits = v.replace(/[\s\-().+]/g, "");
      if (!/^\d{7,15}$/.test(digits))
        return "Enter a valid phone number (7–15 digits).";
      return null;
    }
    case "brag":
      if (v.length < 50)
        return "Tell us a little more — at least 50 characters.";
      return null;
    case "failure":
      if (v.length < 30) return "A bit more, please — at least 30 characters.";
      return null;
    case "food":
      if (v.length < 10) return "A little more detail helps.";
      return null;
    default:
      return null;
  }
}

export function ApplyForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const q = APPLICATION_QUESTIONS[step];
  const isLast = step === APPLICATION_QUESTIONS.length - 1;
  const total = APPLICATION_QUESTIONS.length;
  const value = answers[q?.id] ?? "";

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Animate each question in; focus the field.
  useEffect(() => {
    if (done) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (cardRef.current && !reduce) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    }
    inputRef.current?.focus();
  }, [step, done]);

  const submit = (finalAnswers: Answers) => {
    if (honeypot) {
      setDone(true);
      return;
    }
    setSubmitting(true);
    // Apps Script accepts a simple JSON body; we don't need the response, and
    // no-cors keeps the browser from blocking the opaque cross-origin reply.
    fetch(SITE.applyEndpoint, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(finalAnswers),
    })
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
        setDone(true);
      });
  };

  const next = () => {
    const err = validate(q.id, value);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    if (isLast) {
      if (submitting) return;
      submit(answers);
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && q.type !== "textarea") {
      e.preventDefault();
      next();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && q.type === "textarea") {
      e.preventDefault();
      next();
    }
  };

  const setValue = (val: string) => {
    setAnswers((a) => ({ ...a, [q.id]: val }));
    if (error) setError("");
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-stretch justify-center overflow-y-auto bg-coal/95 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Apply to hack47"
    >
      <button
        type="button"
        aria-label="Close application"
        onClick={onClose}
        className="fixed right-5 top-5 z-10 flex h-11 w-11 items-center justify-center text-chalk/70 transition-colors hover:text-chalk"
      >
        <X size={22} strokeWidth={1.6} />
      </button>

      <div className="flex w-full max-w-[720px] flex-col px-6 py-20 sm:px-10">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-volt">
              <Check size={26} strokeWidth={2} className="text-chalk" />
            </div>
            <h2
              className="mb-4 font-medium"
              style={{
                fontSize: "clamp(30px,5vw,52px)",
                lineHeight: 1,
                letterSpacing: "-.03em",
              }}
            >
              application received.
            </h2>
            <p className="mx-auto mb-8 max-w-[440px] text-[17px] leading-[1.55] text-chalk/70">
              Thanks for putting yourself forward. We read every application by
              hand and will be in touch within 48–72 hours if there&rsquo;s a
              fit for {SITE.cohort}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-volt lbl px-8 py-4"
            >
              back to the site
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-10">
              <div className="lbl mb-3 flex justify-between text-chalk/45">
                <span>application · {SITE.cohort}</span>
                <span className="tnum">
                  {String(step + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              </div>
              <div className="h-0.5 w-full bg-line">
                <div
                  className="h-0.5 bg-volt transition-[width] duration-300"
                  style={{ width: `${((step + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            <div ref={cardRef} onKeyDown={onKeyDown}>
              <label
                htmlFor={`q-${q.id}`}
                className="block font-medium"
                style={{
                  fontSize: "clamp(24px,3.4vw,40px)",
                  lineHeight: 1.05,
                  letterSpacing: "-.02em",
                }}
              >
                {q.label}
              </label>
              {q.hint && (
                <p className="mt-4 max-w-[560px] text-[15px] leading-[1.5] text-chalk/55">
                  {q.hint}
                </p>
              )}

              {/* Honeypot — hidden from humans, catches bots */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div className="mt-8">
                {q.type === "textarea" ? (
                  <textarea
                    id={`q-${q.id}`}
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={q.placeholder}
                    rows={5}
                    className="w-full resize-none border-b border-line bg-transparent pb-3 text-[19px] text-chalk placeholder:text-chalk/30 focus:border-volt focus:outline-none"
                  />
                ) : q.type === "mcq" ? (
                  <div className="flex flex-col gap-2">
                    {q.options?.map((opt) => {
                      const selected = value === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setValue(opt)}
                          className={`flex items-center gap-3 border px-5 py-4 text-left text-[16px] transition-colors ${
                            selected
                              ? "border-volt bg-volt/10 text-chalk"
                              : "border-line text-chalk/70 hover:border-chalk/40"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selected ? "border-volt bg-volt" : "border-chalk/40"
                            }`}
                          >
                            {selected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-chalk" />
                            )}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    id={`q-${q.id}`}
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    type={q.type}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full border-b border-line bg-transparent pb-3 text-[19px] text-chalk placeholder:text-chalk/30 focus:border-volt focus:outline-none"
                  />
                )}
              </div>

              {error && (
                <p className="mono mt-4 text-[13px] text-volt">{error}</p>
              )}

              <div className="mt-10 flex items-center gap-4">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    className="flex h-12 w-12 items-center justify-center border border-line text-chalk/70 transition-colors hover:border-chalk/40 hover:text-chalk"
                    aria-label="Previous question"
                  >
                    <ArrowLeft size={18} strokeWidth={1.6} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  disabled={submitting}
                  className="btn-volt lbl inline-flex items-center gap-2 px-8 py-4 disabled:opacity-60"
                >
                  {submitting
                    ? "sending…"
                    : isLast
                      ? "submit application"
                      : "continue"}
                  {!submitting && (
                    <ArrowRight size={14} strokeWidth={2} aria-hidden />
                  )}
                </button>
                {q.type !== "textarea" && q.type !== "mcq" && (
                  <span className="lbl hidden text-chalk/35 sm:block">
                    press enter ↵
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
