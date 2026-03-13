import type { EventType, WaitlistResult } from "../types";

interface WaitlistConfirmationProps {
  eventType: EventType;
  entry: WaitlistResult;
  timezone: string;
}

export function WaitlistConfirmation({ entry }: WaitlistConfirmationProps) {
  return (
    <div class="astrocal-confirmation" role="status">
      <div class="astrocal-confirmation-icon" aria-hidden="true">
        &#10003;
      </div>
      <h3>You're on the Waitlist</h3>
      {entry.position > 0 && <p>You're #{entry.position} on the waitlist</p>}
      <p>We'll notify you when a spot opens up.</p>
      <p style={{ marginTop: "12px", fontSize: "13px" }}>
        A confirmation email has been sent to {entry.invitee_email}
      </p>
    </div>
  );
}
