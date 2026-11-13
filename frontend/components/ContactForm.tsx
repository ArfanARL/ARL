"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, CONTACT_EMAIL } from "../lib/config";

type Status = "idle" | "sending" | "sent" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "organisation" | "message", string>>;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  // The submit button stays disabled until hydration, so an early submit can never fall back to a
  // native GET that would put the visitor's details in the URL.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    // Honeypot: real visitors never see or fill this field.
    if (String(data.get("website") || "").trim() !== "") {
      setStatus("sent");
      return;
    }
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      organisation: String(data.get("organisation") || "").trim() || null,
      message: String(data.get("message") || "").trim(),
    };

    setStatus("sending");
    setErrors({});
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/contact-enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        form.reset();
        setStatus("sent");
        return;
      }
      if (response.status === 400) {
        const body = await response.json().catch(() => ({}));
        const next: FieldErrors = {};
        for (const [key, messages] of Object.entries<string[]>(body.errors ?? {})) {
          next[key as keyof FieldErrors] = messages[0];
        }
        setErrors(next);
        setNotice("Please check the highlighted fields.");
      } else if (response.status === 429) {
        setNotice("You have sent several enquiries recently. Please wait a few minutes and try again.");
      } else {
        setNotice("We could not send your enquiry just now.");
      }
      setStatus("error");
    } catch {
      setNotice("We could not reach our servers.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-success" role="status">
        <h3>Thank you — your enquiry has been received.</h3>
        <p>A member of our team will respond to you by email.</p>
        <button type="button" className="button button-light" onClick={() => setStatus("idle")}>Send another enquiry</button>
      </div>
    );
  }

  const mailto = `mailto:${CONTACT_EMAIL}?subject=Project%20Enquiry`;

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-busy={status === "sending"}>
      <div className="field-row">
        <Field id="cf-name" name="name" label="Full name" autoComplete="name" required maxLength={120} error={errors.name} />
        <Field id="cf-email" name="email" label="Email address" type="email" autoComplete="email" required maxLength={254} error={errors.email} />
      </div>
      <Field id="cf-org" name="organisation" label="Organisation (optional)" autoComplete="organization" maxLength={160} error={errors.organisation} />
      <Field id="cf-message" name="message" label="How can we help?" textarea required maxLength={5000} error={errors.message} />
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-footer">
        <button className="button button-light" type="submit" disabled={!ready || status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"} <span aria-hidden="true">↗</span>
        </button>
        <p className="form-note">
          Or email <a href={mailto}>{CONTACT_EMAIL}</a>
        </p>
      </div>
      {status === "error" && (
        <p className="form-error" role="alert">
          {notice} You can also write to us directly at <a href={mailto}>{CONTACT_EMAIL}</a>.
        </p>
      )}
    </form>
  );
}

function Field(props: {
  id: string;
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  error?: string;
}) {
  const { id, name, label, type = "text", textarea, required, maxLength, autoComplete, error } = props;
  const common = {
    id,
    name,
    required,
    maxLength,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
  } as const;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}{required && <span className="req" aria-hidden="true"> *</span>}</label>
      {textarea ? <textarea rows={5} {...common} /> : <input type={type} {...common} />}
      {error && <span className="field-error" id={`${id}-err`}>{error}</span>}
    </div>
  );
}
