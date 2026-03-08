import { describe, it, expect } from "vitest";
import { DEMO_EVENT_TYPE, generateDemoSlots, createDemoBooking } from "./demo-data";

describe("DEMO_EVENT_TYPE", () => {
  it("has required EventType fields", () => {
    expect(DEMO_EVENT_TYPE.id).toBe("demo-event-type");
    expect(DEMO_EVENT_TYPE.title).toBe("30-Minute Consultation");
    expect(DEMO_EVENT_TYPE.duration_minutes).toBe(30);
    expect(DEMO_EVENT_TYPE.price_amount).toBeNull();
    expect(DEMO_EVENT_TYPE.active).toBe(true);
  });
});

describe("generateDemoSlots", () => {
  it("returns 5 time slots", () => {
    const slots = generateDemoSlots("2026-03-15", "America/New_York");
    expect(slots).toHaveLength(5);
  });

  it("generates slots with correct date prefix", () => {
    const slots = generateDemoSlots("2026-03-15", "UTC");
    for (const slot of slots) {
      expect(slot.start_time).toMatch(/^2026-03-15T/);
      expect(slot.end_time).toMatch(/^2026-03-15T/);
    }
  });

  it("generates 30-minute slots from 9:00 to 11:30", () => {
    const slots = generateDemoSlots("2026-03-15", "UTC");
    expect(slots[0]!.start_time).toBe("2026-03-15T09:00:00");
    expect(slots[0]!.end_time).toBe("2026-03-15T09:30:00");
    expect(slots[4]!.start_time).toBe("2026-03-15T11:00:00");
    expect(slots[4]!.end_time).toBe("2026-03-15T11:30:00");
  });

  it("has start_time and end_time on every slot", () => {
    const slots = generateDemoSlots("2026-01-01", "UTC");
    for (const slot of slots) {
      expect(slot).toHaveProperty("start_time");
      expect(slot).toHaveProperty("end_time");
    }
  });
});

describe("createDemoBooking", () => {
  const slot = { start_time: "2026-03-15T09:00:00", end_time: "2026-03-15T09:30:00" };
  const data = { name: "Jane Doe", email: "jane@example.com", notes: "Looking forward to it" };

  it("returns a valid BookingResult shape", () => {
    const booking = createDemoBooking(DEMO_EVENT_TYPE, slot, data, "UTC");
    expect(booking.id).toMatch(/^demo-booking-/);
    expect(booking.event_type_id).toBe(DEMO_EVENT_TYPE.id);
    expect(booking.status).toBe("confirmed");
    expect(booking.start_time).toBe(slot.start_time);
    expect(booking.end_time).toBe(slot.end_time);
    expect(booking.invitee_name).toBe("Jane Doe");
    expect(booking.invitee_email).toBe("jane@example.com");
    expect(booking.invitee_timezone).toBe("UTC");
    expect(booking.notes).toBe("Looking forward to it");
    expect(booking.cancel_token).toBe("demo-token");
    expect(booking.created_at).toBeTruthy();
  });

  it("sets notes to null when empty", () => {
    const booking = createDemoBooking(
      DEMO_EVENT_TYPE,
      slot,
      { name: "A", email: "a@b.c", notes: "" },
      "UTC",
    );
    expect(booking.notes).toBeNull();
  });
});
