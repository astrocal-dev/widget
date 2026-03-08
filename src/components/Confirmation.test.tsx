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
});
