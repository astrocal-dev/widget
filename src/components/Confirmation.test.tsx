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
    minimum_notice_minutes: 0,
    conferencing_provider: null,
    location: null,
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
    meeting_url: null,
    location: null,
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

  // ─── Meeting link and location ────────────────────────────────────

  describe("meeting details", () => {
    it("renders a join link named after the provider when meeting_url is set", () => {
      render(
        <Confirmation
          {...defaultProps}
          eventType={{ ...mockEventType, conferencing_provider: "zoom" }}
          booking={{ ...mockBooking, meeting_url: "https://zoom.us/j/123" }}
        />,
      );

      const link = screen.getByRole("link", { name: "Join Zoom meeting" });
      expect(link).toHaveAttribute("href", "https://zoom.us/j/123");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("prefers the meeting link when both a link and a location exist", () => {
      render(
        <Confirmation
          {...defaultProps}
          eventType={{ ...mockEventType, conferencing_provider: "custom" }}
          booking={{ ...mockBooking, meeting_url: "https://meet.example/abc", location: "Room 4" }}
        />,
      );

      expect(screen.getByRole("link", { name: "Join video call" })).toBeInTheDocument();
      expect(screen.queryByText("Room 4")).not.toBeInTheDocument();
    });

    it("renders the address for in-person bookings", () => {
      render(
        <Confirmation
          {...defaultProps}
          eventType={{
            ...mockEventType,
            conferencing_provider: "in_person",
            location: "1 High St, London",
          }}
          booking={{ ...mockBooking, location: "1 High St, London" }}
        />,
      );

      expect(screen.getByText("1 High St, London")).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("tells the booker the link is coming by email when a video provider has no url yet", () => {
      render(
        <Confirmation
          {...defaultProps}
          eventType={{ ...mockEventType, conferencing_provider: "google_meet" }}
        />,
      );

      expect(
        screen.getByText("Your meeting link will be in your confirmation email."),
      ).toBeInTheDocument();
    });

    it("shows nothing about the meeting when no location is configured", () => {
      render(<Confirmation {...defaultProps} />);

      expect(screen.queryByText(/meeting link/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("skips the email fallback in demo mode", () => {
      render(
        <Confirmation
          {...defaultProps}
          demo
          eventType={{ ...mockEventType, conferencing_provider: "google_meet" }}
        />,
      );

      expect(screen.queryByText(/meeting link/i)).not.toBeInTheDocument();
    });
  });

  // ─── Rescheduled variant ──────────────────────────────────────────

  describe("rescheduled variant", () => {
    it("uses the rescheduled heading and email copy", () => {
      render(<Confirmation {...defaultProps} variant="rescheduled" />);

      expect(screen.getByRole("heading", { name: /booking rescheduled/i })).toBeInTheDocument();
      expect(
        screen.getByText("An updated confirmation email has been sent to john@example.com"),
      ).toBeInTheDocument();
    });

    it("uses the group email copy for group bookings", () => {
      render(<Confirmation {...defaultProps} booking={groupBooking} variant="rescheduled" />);

      expect(
        screen.getByText("Updated confirmation emails have been sent to all 3 attendees"),
      ).toBeInTheDocument();
    });
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

describe("Confirmation unsafe meeting url", () => {
  const eventType: EventType = {
    id: "evt-123",
    organization_id: "org-456",
    title: "30 Minute Meeting",
    slug: "30-min",
    description: null,
    duration_minutes: 30,
    duration_options: null,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    minimum_notice_minutes: 0,
    color: "#3b82f6",
    timezone: "UTC",
    active: true,
    is_test: false,
    price_amount: null,
    price_currency: "usd",
    max_attendees: 1,
    conferencing_provider: "custom",
    location: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
  const booking: BookingResult = {
    id: "bkg-1",
    event_type_id: "evt-123",
    status: "confirmed",
    start_time: "2024-01-15T14:00:00Z",
    end_time: "2024-01-15T14:30:00Z",
    invitee_name: "John Doe",
    invitee_email: "john@example.com",
    invitee_timezone: "UTC",
    notes: null,
    cancel_token: "tok",
    attendee_count: 1,
    meeting_url: "javascript:alert(1)",
    location: null,
    created_at: "2024-01-01T12:00:00Z",
  };

  it("never renders a javascript: url as a link", () => {
    render(<Confirmation eventType={eventType} booking={booking} timezone="UTC" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.getByText("Your meeting link will be in your confirmation email."),
    ).toBeInTheDocument();
  });
});
