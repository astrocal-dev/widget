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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [additionalAttendees, setAdditionalAttendees] = useState<AttendeeInput[]>([]);
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

    if (isGroup && additionalAttendees.length > 0) {
      const attendeeErrors: Record<number, { name?: string; email?: string }> = {};
      for (let i = 0; i < additionalAttendees.length; i++) {
        const attendee = additionalAttendees[i]!;
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

    return errs;
  }, [name, email, isGroup, additionalAttendees]);

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length === 0) {
        if (isGroup) {
          const allAttendees: AttendeeInput[] = [
            { name: name.trim(), email: email.trim(), timezone },
            ...additionalAttendees.map((a) => ({
              name: a.name.trim(),
              email: a.email.trim(),
              timezone: a.timezone || timezone,
            })),
          ];
          onSubmit({
            name: name.trim(),
            email: email.trim(),
            notes: notes.trim(),
            attendees: allAttendees,
          });
        } else {
          onSubmit({ name: name.trim(), email: email.trim(), notes: notes.trim() });
        }
      }
    },
    [name, email, notes, timezone, isGroup, additionalAttendees, validate, onSubmit],
  );

  function addAttendee() {
    if (1 + additionalAttendees.length < maxAttendees) {
      setAdditionalAttendees((prev) => [...prev, { name: "", email: "" }]);
    }
  }

  function removeAttendee(index: number) {
    setAdditionalAttendees((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAttendee(index: number, field: "name" | "email", value: string) {
    setAdditionalAttendees((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  }

  const date = slot.start_time.slice(0, 10);
  const canAddMore = 1 + additionalAttendees.length < maxAttendees;

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
              Group booking &middot; up to {maxAttendees} attendees
            </span>
          </>
        )}
      </div>

      {error && (
        <div class="astrocal-field-error" role="alert">
          {error.message}
        </div>
      )}

      <div class="astrocal-field">
        <label for="astrocal-name">Name *</label>
        <input
          id="astrocal-name"
          type="text"
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="Your name"
          required
          aria-invalid={!!errors.name}
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
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          placeholder="you@example.com"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "astrocal-email-error" : undefined}
        />
        {errors.email && (
          <span id="astrocal-email-error" class="astrocal-field-error">
            {errors.email}
          </span>
        )}
      </div>

      {/* Additional attendees for group bookings */}
      {isGroup &&
        additionalAttendees.map((attendee, index) => (
          <div key={index} class="astrocal-attendee-row">
            <div class="astrocal-attendee-header">
              <span class="astrocal-attendee-label">Attendee {index + 2}</span>
              <button
                type="button"
                class="astrocal-attendee-remove"
                onClick={() => removeAttendee(index)}
                aria-label={`Remove attendee ${index + 2}`}
              >
                &times;
              </button>
            </div>
            <div class="astrocal-field">
              <input
                type="text"
                value={attendee.name}
                onInput={(e) => updateAttendee(index, "name", (e.target as HTMLInputElement).value)}
                placeholder="Name"
                aria-label={`Attendee ${index + 2} name`}
                aria-invalid={!!errors.attendees?.[index]?.name}
              />
              {errors.attendees?.[index]?.name && (
                <span class="astrocal-field-error">{errors.attendees[index].name}</span>
              )}
            </div>
            <div class="astrocal-field">
              <input
                type="email"
                value={attendee.email}
                onInput={(e) =>
                  updateAttendee(index, "email", (e.target as HTMLInputElement).value)
                }
                placeholder="Email"
                aria-label={`Attendee ${index + 2} email`}
                aria-invalid={!!errors.attendees?.[index]?.email}
              />
              {errors.attendees?.[index]?.email && (
                <span class="astrocal-field-error">{errors.attendees[index].email}</span>
              )}
            </div>
          </div>
        ))}

      {isGroup && canAddMore && (
        <button type="button" class="astrocal-add-attendee-btn" onClick={addAttendee}>
          + Add attendee
        </button>
      )}

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
