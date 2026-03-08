import type { EventType, BookingResult } from "../types";
import { formatTime, formatDate } from "../utils/dates";

interface ConfirmationProps {
  eventType: EventType;
  booking: BookingResult;
  timezone: string;
  demo?: boolean;
  onReset?: () => void;
}

export function Confirmation({ eventType, booking, timezone, demo, onReset }: ConfirmationProps) {
  const date = booking.start_time.slice(0, 10);

  return (
    <div class="astrocal-confirmation" role="status">
      <div class="astrocal-confirmation-icon" aria-hidden="true">
        &#10003;
      </div>
      <h3>Booking Confirmed</h3>
      <p>
        <strong>{eventType.title}</strong>
      </p>
      <p>
        {formatDate(date)} at {formatTime(booking.start_time, timezone)}
      </p>
      <p>
        {booking.invitee_name} ({booking.invitee_email})
      </p>
      {!demo && (
        <p style={{ marginTop: "12px", fontSize: "13px" }}>
          A confirmation email has been sent to {booking.invitee_email}
        </p>
      )}
      {demo && onReset && (
        <>
          <button type="button" class="astrocal-book-another" onClick={onReset}>
            Book another
          </button>
          <p class="astrocal-demo-notice">This is a demo — no real booking was created.</p>
        </>
      )}
    </div>
  );
}
