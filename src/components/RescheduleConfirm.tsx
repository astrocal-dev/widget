import { useState, useCallback } from "preact/hooks";
import type { EventType, TimeSlot, WidgetError } from "../types";
import { formatDateTime } from "../utils/dates";

interface RescheduleConfirmProps {
  eventType: EventType;
  slot: TimeSlot;
  /** ISO 8601 start of the booking being moved, when known. */
  currentStartTime?: string;
  timezone: string;
  submitting: boolean;
  error: WidgetError | null;
  onConfirm: (reason: string) => void;
  onBack: () => void;
}

const REASON_MAX_LENGTH = 500;

export function RescheduleConfirm({
  eventType,
  slot,
  currentStartTime,
  timezone,
  submitting,
  error,
  onConfirm,
  onBack,
}: RescheduleConfirmProps) {
  const [reason, setReason] = useState("");

  const sameTime =
    currentStartTime != null &&
    new Date(currentStartTime).getTime() === new Date(slot.start_time).getTime();

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault();
      if (sameTime) return;
      onConfirm(reason.trim());
    },
    [sameTime, reason, onConfirm],
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
        <h3
          class="astrocal-step-heading"
          data-astrocal-focus
          tabIndex={-1}
          style={{ fontWeight: 600, fontSize: "15px" }}
        >
          Confirm new time
        </h3>
      </div>

      <dl class="astrocal-reschedule-times">
        {currentStartTime && (
          <div class="astrocal-reschedule-row">
            <dt>Current time</dt>
            <dd>{formatDateTime(currentStartTime, timezone)}</dd>
          </div>
        )}
        <div class="astrocal-reschedule-row astrocal-reschedule-row-new">
          <dt>New time</dt>
          <dd>
            {formatDateTime(slot.start_time, timezone)} &middot; {eventType.duration_minutes} min
          </dd>
        </div>
      </dl>

      {error && (
        <>
          <div class="astrocal-field-error" role="alert">
            {error.message}
          </div>
          {error.code === "slot_unavailable" && (
            <button type="button" class="astrocal-error-action" onClick={onBack}>
              Pick another time
            </button>
          )}
        </>
      )}

      {sameTime && (
        <div class="astrocal-field-error" role="alert">
          This is the same time as your current booking. Pick a different slot.
        </div>
      )}

      <div class="astrocal-field">
        <label for="astrocal-reschedule-reason">Reason (optional)</label>
        <textarea
          id="astrocal-reschedule-reason"
          value={reason}
          onInput={(e) => setReason((e.target as HTMLTextAreaElement).value)}
          placeholder="Let the organiser know why you're moving it"
          maxLength={REASON_MAX_LENGTH}
        />
      </div>

      <button type="submit" class="astrocal-submit-btn" disabled={submitting || sameTime}>
        {submitting ? "Rescheduling..." : "Confirm new time"}
      </button>
    </form>
  );
}
