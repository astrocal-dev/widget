import { useState, useCallback } from "preact/hooks";
import type { EventType, WidgetError } from "../types";
import { formatDate } from "../utils/dates";

interface WaitlistFormProps {
  eventType: EventType;
  date: string;
  timezone: string;
  submitting: boolean;
  error: WidgetError | null;
  onSubmit: (data: { name: string; email: string; notes: string }) => void;
  onBack: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm({
  eventType,
  date,
  submitting,
  error,
  onSubmit,
  onBack,
}: WaitlistFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) {
      errs.name = "Name is required";
    }
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      errs.email = "Please enter a valid email address";
    }
    return errs;
  }, [name, email]);

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length === 0) {
        onSubmit({ name: name.trim(), email: email.trim(), notes: notes.trim() });
      }
    },
    [name, email, notes, validate, onSubmit],
  );

  return (
    <form class="astrocal-form" onSubmit={handleSubmit} noValidate>
      <div class="astrocal-form-header">
        <button
          type="button"
          class="astrocal-slots-back"
          onClick={onBack}
          aria-label="Back to time slots"
        >
          &#8249;
        </button>
        <span style={{ fontWeight: 600, fontSize: "15px" }}>Join Waitlist</span>
      </div>

      <div class="astrocal-form-summary">
        {eventType.title}
        <br />
        {formatDate(date)}
      </div>

      {error && (
        <div class="astrocal-field-error" role="alert">
          {error.message}
        </div>
      )}

      <div class="astrocal-field">
        <label for="astrocal-waitlist-name">Name *</label>
        <input
          id="astrocal-waitlist-name"
          type="text"
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="Your name"
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "astrocal-waitlist-name-error" : undefined}
        />
        {errors.name && (
          <span id="astrocal-waitlist-name-error" class="astrocal-field-error">
            {errors.name}
          </span>
        )}
      </div>

      <div class="astrocal-field">
        <label for="astrocal-waitlist-email">Email *</label>
        <input
          id="astrocal-waitlist-email"
          type="email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          placeholder="you@example.com"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "astrocal-waitlist-email-error" : undefined}
        />
        {errors.email && (
          <span id="astrocal-waitlist-email-error" class="astrocal-field-error">
            {errors.email}
          </span>
        )}
      </div>

      <div class="astrocal-field">
        <label for="astrocal-waitlist-notes">Notes (optional)</label>
        <textarea
          id="astrocal-waitlist-notes"
          value={notes}
          onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
          placeholder="Anything you'd like to share?"
          maxLength={1000}
        />
      </div>

      <button type="submit" class="astrocal-submit-btn" disabled={submitting}>
        {submitting ? "Joining..." : "Join Waitlist"}
      </button>
    </form>
  );
}
