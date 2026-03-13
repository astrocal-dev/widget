import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/preact";
import { Confirmation } from "./Confirmation";
import type { EventType, BookingResult } from "../types";

describe("Confirmation", () => {
  const mockEventType: EventType = {
    id: "evt-123",
    organization_id: "org-456",
    title: "30 Minute Meeting",
    slug: "30-min",
    description: "A quick chat",
    duration_minutes: 30,
    duration_options: null,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    color: "#3b82f6",
    timezone: "America/New_York",
    active: true,
    is_test: false,
    price_amount: null,
    price_currency: "usd",
    max_attendees: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockBooking: BookingResult = {
    id: "bkg-123",
    event_type_id: "evt-123",
    status: "confirmed",
    start_time: "2024-01-15T14:00:00Z",
    end_time: "2024-01-15T14:30:00Z",
    invitee_name: "John Doe",
    invitee_email: "john@example.com",
    invitee_timezone: "America/New_York",
    notes: "Looking forward to it",
    cancel_token: "tok-xyz",
    attendee_count: 1,
    created_at: "2024-01-01T12:00:00Z",
  };

  const groupBooking: BookingResult = {
    ...mockBooking,
    attendee_count: 3,
    attendees: [
      { id: "att-1", name: "Alice", email: "alice@test.com", timezone: "America/New_York" },
      { id: "att-2", name: "Bob", email: "bob@test.com", timezone: "America/New_York" },
      { id: "att-3", name: "Charlie", email: "charlie@test.com", timezone: "America/New_York" },
    ],
  };

  const defaultProps = {
    eventType: mockEventType,
    booking: mockBooking,
    timezone: "America/New_York",
  };

  it("shows 'Booking Confirmed' heading", () => {
    render(<Confirmation {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /booking confirmed/i })).toBeInTheDocument();
  });

  it("shows event type title", () => {
    render(<Confirmation {...defaultProps} />);

    expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
  });

  it("shows booking time", () => {
    render(<Confirmation {...defaultProps} />);

    // Should show formatted time (like "9:00 AM")
    const timeRegex = /\d{1,2}:\d{2}\s*(AM|PM)/i;
    const timeElements = screen.getAllByText(timeRegex);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("shows booking date", () => {
    render(<Confirmation {...defaultProps} />);

    // Should show formatted date (like "Monday, January 15")
    expect(screen.getByText(/January 15/i)).toBeInTheDocument();
  });

  it("shows invitee name", () => {
    render(<Confirmation {...defaultProps} />);

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it("shows invitee email", () => {
    render(<Confirmation {...defaultProps} />);

    // Email appears twice: in parentheses and in confirmation message
    const emailElements = screen.getAllByText(/john@example\.com/i);
    expect(emailElements.length).toBeGreaterThan(0);
  });

  it("shows confirmation email message", () => {
    render(<Confirmation {...defaultProps} />);

    expect(screen.getByText(/confirmation email has been sent/i)).toBeInTheDocument();
  });

  it("has role status for accessibility", () => {
    render(<Confirmation {...defaultProps} />);

    const container = screen.getByRole("status");
    expect(container).toBeInTheDocument();
  });

  it("shows checkmark icon", () => {
    render(<Confirmation {...defaultProps} />);

    // The checkmark is &#10003; which renders as ✓
    const checkmark = screen.getByText("✓");
    expect(checkmark).toBeInTheDocument();
    expect(checkmark).toHaveAttribute("aria-hidden", "true");
  });

  // ─── Group Booking Confirmation ───────────────────────────────────

  describe("group booking confirmation", () => {
    it("renders single-line attendee display when booking.attendee_count === 1", () => {
      render(<Confirmation {...defaultProps} />);

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getAllByText(/john@example\.com/).length).toBeGreaterThan(0);
      expect(screen.queryByText("Attendee 1")).not.toBeInTheDocument();
    });

    it("renders attendee list when attendee_count > 1 and attendees is present", () => {
      render(<Confirmation {...defaultProps} booking={groupBooking} />);

      expect(screen.getByText("Attendee 1")).toBeInTheDocument();
      expect(screen.getByText("Attendee 2")).toBeInTheDocument();
      expect(screen.getByText("Attendee 3")).toBeInTheDocument();
    });

    it("attendee list shows correct name and email for each attendee", () => {
      render(<Confirmation {...defaultProps} booking={groupBooking} />);

      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/alice@test\.com/)).toBeInTheDocument();
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
      expect(screen.getByText(/bob@test\.com/)).toBeInTheDocument();
      expect(screen.getByText(/Charlie/)).toBeInTheDocument();
      expect(screen.getByText(/charlie@test\.com/)).toBeInTheDocument();
    });

    it("attendee list labels attendees 'Attendee 1', 'Attendee 2', etc.", () => {
      render(<Confirmation {...defaultProps} booking={groupBooking} />);

      expect(screen.getByText("Attendee 1")).toBeInTheDocument();
      expect(screen.getByText("Attendee 2")).toBeInTheDocument();
      expect(screen.getByText("Attendee 3")).toBeInTheDocument();
    });

    it("confirmation email notice reads 'Confirmation emails have been sent to all 3 attendees' when attendee_count = 3", () => {
      render(<Confirmation {...defaultProps} booking={groupBooking} />);

      expect(
        screen.getByText("Confirmation emails have been sent to all 3 attendees"),
      ).toBeInTheDocument();
    });

    it("confirmation email notice is not shown in demo mode", () => {
      render(<Confirmation {...defaultProps} booking={groupBooking} demo={true} />);

      expect(screen.queryByText(/confirmation email/i)).not.toBeInTheDocument();
    });

    it("falls back to single-line display when attendee_count > 1 but attendees is undefined", () => {
      const groupBookingNoAttendees: BookingResult = {
        ...mockBooking,
        attendee_count: 3,
      };

      render(<Confirmation {...defaultProps} booking={groupBookingNoAttendees} />);

      // Should fall back to primary attendee display
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.queryByText("Attendee 1")).not.toBeInTheDocument();
    });
  });
});
