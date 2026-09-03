import type { EventType, BookingResult } from "../types";
import { formatDateTime } from "../utils/dates";
import { joinLabel, isVideoProvider } from "../utils/location";
import { safeMeetingUrl } from "../utils/safe-url";

interface ConfirmationProps {
  eventType: EventType;
  booking: BookingResult;
  timezone: string;
  demo?: boolean;
  /** "created" (default) after a new booking, "rescheduled" after a reschedule. */
  variant?: "created" | "rescheduled";
  onReset?: () => void;
}

export function Confirmation({
  eventType,
  booking,
  timezone,
  demo,
  variant = "created",
  onReset,
}: ConfirmationProps) {
  const isGroupWithAttendees = booking.attendee_count > 1 && booking.attendees;
  const rescheduled = variant === "rescheduled";

  return (
    <div class="astrocal-confirmation" role="status">
      <div class="astrocal-confirmation-icon" aria-hidden="true">
        &#10003;
      </div>
      <h3 data-astrocal-focus tabIndex={-1}>
        {rescheduled ? "Booking Rescheduled" : "Booking Confirmed"}
      </h3>
      <p>
        <strong>{eventType.title}</strong>
      </p>
      <p>{formatDateTime(booking.start_time, timezone)}</p>
      <MeetingDetails
        eventType={eventType}
        booking={booking}
        demo={demo}
        rescheduled={rescheduled}
      />
      {isGroupWithAttendees ? (
        <ul class="astrocal-attendee-list">
          {booking.attendees!.map((a, i) => (
            <li key={a.id}>
              <span class="astrocal-attendee-list-label">Attendee {i + 1}</span>
              {a.name} ({a.email})
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {booking.invitee_name} ({booking.invitee_email})
        </p>
      )}
      {!demo && (
        <p style={{ marginTop: "12px", fontSize: "13px" }}>
          {emailNotice(booking, rescheduled, !!isGroupWithAttendees)}
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

/** Join link, address, or a note that the link follows by email. */
function MeetingDetails({
  eventType,
  booking,
  demo,
  rescheduled,
}: {
  eventType: EventType;
  booking: BookingResult;
  demo?: boolean;
  rescheduled: boolean;
}) {
  const meetingUrl = safeMeetingUrl(booking.meeting_url);
  if (meetingUrl) {
    return (
      <p>
        <a
          class="astrocal-meeting-link"
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {joinLabel(eventType.conferencing_provider)}
        </a>
      </p>
    );
  }
  if (booking.location) {
    return <p class="astrocal-location">{booking.location}</p>;
  }
  if (!demo && isVideoProvider(eventType.conferencing_provider)) {
    return (
      <p class="astrocal-meeting-pending">
        Your meeting link will be in your {rescheduled ? "updated " : ""}confirmation email.
      </p>
    );
  }
  return null;
}

function emailNotice(booking: BookingResult, rescheduled: boolean, group: boolean): string {
  if (group) {
    return rescheduled
      ? `Updated confirmation emails have been sent to all ${booking.attendee_count} attendees`
      : `Confirmation emails have been sent to all ${booking.attendee_count} attendees`;
  }
  return rescheduled
    ? `An updated confirmation email has been sent to ${booking.invitee_email}`
    : `A confirmation email has been sent to ${booking.invitee_email}`;
}
