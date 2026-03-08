import type { EventType, TimeSlot, BookingResult } from "../types";

/** Mock event type used in demo mode. */
export const DEMO_EVENT_TYPE: EventType = {
  id: "demo-event-type",
  organization_id: "demo-org",
  title: "30-Minute Consultation",
  slug: "30-min-consultation",
  description: "A quick introductory call to discuss your needs.",
  duration_minutes: 30,
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  color: "#2563eb",
  timezone: "UTC",
  active: true,
  is_test: false,
  price_amount: null,
  price_currency: "usd",
  max_attendees: 1,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

/**
 * Generates demo time slots for a given date.
 * Returns 5 half-hour slots from 9:00 AM to 11:00 AM in the specified timezone.
 */
export function generateDemoSlots(date: string, _timezone: string): TimeSlot[] {
  const hours = [9, 9, 10, 10, 11];
  const minutes = [0, 30, 0, 30, 0];

  return hours.map((h, i) => {
    const startH = String(h).padStart(2, "0");
    const startM = String(minutes[i]).padStart(2, "0");
    const endMinTotal = h * 60 + minutes[i]! + 30;
    const endH = String(Math.floor(endMinTotal / 60)).padStart(2, "0");
    const endM = String(endMinTotal % 60).padStart(2, "0");

    return {
      start_time: `${date}T${startH}:${startM}:00`,
      end_time: `${date}T${endH}:${endM}:00`,
    };
  });
}

/**
 * Creates a fake booking result from form data (no network call).
 */
export function createDemoBooking(
  eventType: EventType,
  slot: TimeSlot,
  data: { name: string; email: string; notes: string },
  timezone: string,
): BookingResult {
  return {
    id: "demo-booking-" + Date.now(),
    event_type_id: eventType.id,
    status: "confirmed",
    start_time: slot.start_time,
    end_time: slot.end_time,
    invitee_name: data.name,
    invitee_email: data.email,
    invitee_timezone: timezone,
    notes: data.notes || null,
    cancel_token: "demo-token",
    attendee_count: 1,
    created_at: new Date().toISOString(),
  };
}
