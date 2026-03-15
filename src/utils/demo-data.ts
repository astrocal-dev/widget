import type { EventType, TimeSlot, BookingResult } from "../types";

/** Mock event type used in demo mode. */
export const DEMO_EVENT_TYPE: EventType = {
  id: "demo-event-type",
  organization_id: "demo-org",
  title: "30-Minute Consultation",
  slug: "30-min-consultation",
  description: "A quick introductory call to discuss your needs.",
  duration_minutes: 30,
  duration_options: null,
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

/** Parses an "HH:MM" or "HH:MM:SS" time string into total minutes since midnight. */
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":");
  return parseInt(h!, 10) * 60 + parseInt(m!, 10);
}

/** Generates slots within a single time window [windowStart, windowEnd] in minutes. */
function generateSlotsInWindow(
  date: string,
  windowStart: number,
  windowEnd: number,
  durationMinutes: number,
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const step = durationMinutes + bufferBeforeMinutes + bufferAfterMinutes;

  for (let i = 0; windowStart + i * step + durationMinutes <= windowEnd; i++) {
    const startMin = windowStart + i * step;
    const endMin = startMin + durationMinutes;
    const startH = String(Math.floor(startMin / 60)).padStart(2, "0");
    const startM = String(startMin % 60).padStart(2, "0");
    const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
    const endM = String(endMin % 60).padStart(2, "0");

    slots.push({
      start_time: `${date}T${startH}:${startM}:00`,
      end_time: `${date}T${endH}:${endM}:00`,
    });
  }

  return slots;
}

/**
 * Generates demo time slots for a given date.
 * When `availabilityRules` are provided, slots are generated within the matching day's windows.
 * If no rules match the day, returns an empty array (day is unavailable).
 * Falls back to 9:00 AM – 5:00 PM when no rules are provided.
 */
export function generateDemoSlots(
  date: string,
  _timezone: string,
  durationMinutes = 30,
  bufferBeforeMinutes = 0,
  bufferAfterMinutes = 0,
  availabilityRules?: Array<{ day_of_week: number; start_time: string; end_time: string }>,
): TimeSlot[] {
  if (availabilityRules !== undefined) {
    const dayOfWeek = new Date(date + "T12:00:00").getDay();
    const matchingRules = availabilityRules.filter((r) => r.day_of_week === dayOfWeek);

    if (matchingRules.length === 0) {
      return [];
    }

    return matchingRules.flatMap((rule) =>
      generateSlotsInWindow(
        date,
        parseTimeToMinutes(rule.start_time),
        parseTimeToMinutes(rule.end_time),
        durationMinutes,
        bufferBeforeMinutes,
        bufferAfterMinutes,
      ),
    );
  }

  return generateSlotsInWindow(
    date,
    9 * 60,
    17 * 60,
    durationMinutes,
    bufferBeforeMinutes,
    bufferAfterMinutes,
  );
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
