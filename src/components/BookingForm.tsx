import { useState, useCallback } from "preact/hooks";
import type { EventType, TimeSlot, WidgetError, AttendeeInput } from "../types";
import { formatTime, formatDate } from "../utils/dates";

interface BookingFormProps {
  eventType: EventType;
  slot: TimeSlot;
  timezone: string;
  submitting: boolean;
  error: WidgetError | null;
  onSubmit: (data: {
    name: string;
    email: string;
    notes: string;
    attendees?: AttendeeInput[];
  }) => void;
  onBack: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  attendees?: Record<number, { name?: string; email?: string }>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingForm({
  eventType,
  slot,
  timezone,
  submitting,
  error,
  onSubmit,
  onBack,
}: BookingFormProps) {
  const isGroup = eventType.max_attendees > 1;
  const maxAttendees = Math.min(
    eventType.max_attendees,
    slot.spots_remaining ?? eventType.max_attendees,
  );

  const [attendeeCount, setAttendeeCount] = useState(1);
  const [attendees, setAttendees] = useState<AttendeeInput[]>([{ name: "", email: "" }]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleCountChange(newCount: number) {
    const capped = Math.min(Math.max(1, newCount), maxAttendees);
    setAttendeeCount(capped);
    setAttendees((prev) => {
      if (capped > prev.length) {
        return [...prev, ...Array(capped - prev.length).fill({ name: "", email: "" })];
      }
      return prev.slice(0, capped);
    });
  }

  function updateAttendee(index: number, field: "name" | "email", value: string) {
    setAttendees((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    const primary = attendees[0]!;

    // Validate primary attendee (index 0) — maps to top-level name/email errors
    if (!primary.name.trim()) {
      errs.name = "Name is required";
    }
    if (!primary.email.trim()) {
      errs.email = "Email is required";
    } else if (!EMAIL_REGEX.test(primary.email)) {
      errs.email = "Please enter a valid email address";
    }

    // Validate additional attendees (index 1+)
    if (isGroup && attendeeCount > 1) {
      const attendeeErrors: Record<number, { name?: string; email?: string }> = {};
      for (let i = 1; i < attendeeCount; i++) {
        const attendee = attendees[i]!;
        const fieldErrors: { name?: string; email?: string } = {};
        if (!attendee.name.trim()) fieldErrors.name = "Name is required";
        if (!attendee.email.trim()) {
          fieldErrors.email = "Email is required";
        } else if (!EMAIL_REGEX.test(attendee.email)) {
          fieldErrors.email = "Please enter a valid email address";
        }
        if (Object.keys(fieldErrors).length > 0) attendeeErrors[i] = fieldErrors;
      }
      if (Object.keys(attendeeErrors).length > 0) errs.attendees = attendeeErrors;
    }

    // Duplicate email check (case-insensitive) across all attendees
    if (isGroup && attendeeCount > 1) {
      const emails = attendees
        .slice(0, attendeeCount)
        .map((a) => a.email.trim().toLowerCase())
        .filter(Boolean);
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      for (const email of emails) {
        if (seen.has(email)) duplicates.add(email);
        seen.add(email);
      }
      if (duplicates.size > 0) {
        for (let i = 0; i < attendeeCount; i++) {
          if (duplicates.has(attendees[i]!.email.trim().toLowerCase())) {
            errs.attendees ??= {};
            errs.attendees[i] ??= {};
            errs.attendees[i]!.email =
              "Duplicate email — each attendee must have a unique email address";
          }
        }
      }
    }

    return errs;
  }, [attendees, attendeeCount, isGroup]);

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length === 0) {
        const primary = attendees[0]!;
        if (isGroup) {
          const allAttendees: AttendeeInput[] = attendees.slice(0, attendeeCount).map((a) => ({
            name: a.name.trim(),
            email: a.email.trim(),
            timezone: a.timezone || timezone,
          }));
          onSubmit({
            name: primary.name.trim(),
            email: primary.email.trim(),
            notes: notes.trim(),
            attendees: allAttendees,
          });
        } else {
          onSubmit({ name: primary.name.trim(), email: primary.email.trim(), notes: notes.trim() });
        }
      }
    },
    [attendees, attendeeCount, notes, timezone, isGroup, validate, onSubmit],
  );

  const date = slot.start_time.slice(0, 10);

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
        <span style={{ fontWeight: 600, fontSize: "15px" }}>Your Details</span>
      </div>

      <div class="astrocal-form-summary">
        {eventType.title} &middot; {eventType.duration_minutes} min
        <br />
        {formatDate(date)} at {formatTime(slot.start_time, timezone)}
        {isGroup && (
          <>
            <br />
            <span class="astrocal-group-info">
              Group booking &middot;{" "}
              {attendeeCount > 1 ? `${attendeeCount} attendees` : "1 attendee"}
            </span>
          </>
        )}
      </div>

      {error && (
        <div class="astrocal-field-error" role="alert">
          {error.message}
        </div>
      )}

      {/* Attendee count stepper for group event types */}
      {isGroup && (
        <div class="astrocal-attendee-count">
          <label>How many attendees?</label>
          <div class="astrocal-stepper">
            <button
              type="button"
              onClick={() => handleCountChange(attendeeCount - 1)}
              disabled={attendeeCount <= 1}
              aria-label="Decrease attendee count"
            >
              &minus;
            </button>
            <span aria-live="polite">{attendeeCount}</span>
            <button
              type="button"
              onClick={() => handleCountChange(attendeeCount + 1)}
              disabled={attendeeCount >= maxAttendees}
              aria-label="Increase attendee count"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Primary attendee (index 0) */}
      <div class="astrocal-attendee-row">
        {isGroup && attendeeCount > 1 && (
          <div class="astrocal-attendee-header">
            <span class="astrocal-attendee-label">You (Attendee 1)</span>
          </div>
        )}
        <div class="astrocal-field">
          <label for="astrocal-name">Name *</label>
          <input
            id="astrocal-name"
            type="text"
            value={attendees[0]?.name ?? ""}
            onInput={(e) => updateAttendee(0, "name", (e.target as HTMLInputElement).value)}
            placeholder="Your name"
            required
            aria-invalid={!!errors.name || !!errors.attendees?.[0]?.name}
            aria-describedby={errors.name ? "astrocal-name-error" : undefined}
          />
          {errors.name && (
            <span id="astrocal-name-error" class="astrocal-field-error">
              {errors.name}
            </span>
          )}
        </div>

        <div class="astrocal-field">
          <label for="astrocal-email">Email *</label>
          <input
            id="astrocal-email"
            type="email"
            value={attendees[0]?.email ?? ""}
            onInput={(e) => updateAttendee(0, "email", (e.target as HTMLInputElement).value)}
            placeholder="you@example.com"
            required
            aria-invalid={!!errors.email || !!errors.attendees?.[0]?.email}
            aria-describedby={errors.email ? "astrocal-email-error" : undefined}
          />
          {errors.email && (
            <span id="astrocal-email-error" class="astrocal-field-error">
              {errors.email}
            </span>
          )}
          {errors.attendees?.[0]?.email && !errors.email && (
            <span class="astrocal-field-error">{errors.attendees[0].email}</span>
          )}
        </div>
      </div>

      {/* Additional attendees (index 1+) */}
      {isGroup &&
        Array.from({ length: attendeeCount - 1 }, (_, i) => i + 1).map((index) => (
          <div key={index} class="astrocal-attendee-row">
            <div class="astrocal-attendee-header">
              <span class="astrocal-attendee-label">Attendee {index + 1}</span>
            </div>
            <div class="astrocal-field">
              <input
                type="text"
                value={attendees[index]?.name ?? ""}
                onInput={(e) => updateAttendee(index, "name", (e.target as HTMLInputElement).value)}
                placeholder="Name"
                aria-label={`Attendee ${index + 1} name`}
                aria-invalid={!!errors.attendees?.[index]?.name}
              />
              {errors.attendees?.[index]?.name && (
                <span class="astrocal-field-error">{errors.attendees[index].name}</span>
              )}
            </div>
            <div class="astrocal-field">
              <input
                type="email"
                value={attendees[index]?.email ?? ""}
                onInput={(e) =>
                  updateAttendee(index, "email", (e.target as HTMLInputElement).value)
                }
                placeholder="Email"
                aria-label={`Attendee ${index + 1} email`}
                aria-invalid={!!errors.attendees?.[index]?.email}
              />
              {errors.attendees?.[index]?.email && (
                <span class="astrocal-field-error">{errors.attendees[index].email}</span>
              )}
            </div>
          </div>
        ))}

      <div class="astrocal-field">
        <label for="astrocal-notes">Notes (optional)</label>
        <textarea
          id="astrocal-notes"
          value={notes}
          onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
          placeholder="Anything you'd like to share?"
          maxLength={1000}
        />
      </div>

      <button type="submit" class="astrocal-submit-btn" disabled={submitting}>
        {submitting ? "Booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}
