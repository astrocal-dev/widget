import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/preact";
import { PaymentRedirect } from "./PaymentRedirect";
import type { EventType, BookingResult } from "../types";

describe("PaymentRedirect", () => {
  const mockEventType: EventType = {
    id: "evt-123",
    organization_id: "org-456",
    title: "Strategy Session",
    slug: "strategy",
    description: "Let's plan together",
    duration_minutes: 60,
    duration_options: null,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    color: "#3b82f6",
    timezone: "America/New_York",
    active: true,
    is_test: false,
    price_amount: 5000,
    price_currency: "usd",
    max_attendees: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockBooking: BookingResult = {
    id: "bkg-123",
    event_type_id: "evt-123",
    status: "pending_payment",
    start_time: "2024-06-15T14:00:00Z",
    end_time: "2024-06-15T15:00:00Z",
    invitee_name: "Jane Smith",
    invitee_email: "jane@example.com",
    invitee_timezone: "America/New_York",
    notes: null,
    cancel_token: "tok-xyz",
    attendee_count: 1,
    payment: {
      amount: 5000,
      currency: "usd",
      client_secret: "pi_test_secret",
      stripe_payment_intent_id: "pi_test_123",
    },
    created_at: "2024-06-01T12:00:00Z",
  };

  const defaultProps = {
    eventType: mockEventType,
    booking: mockBooking,
    timezone: "America/New_York",
  };

  it("shows 'Payment Required' heading", () => {
    render(<PaymentRedirect {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /payment required/i })).toBeInTheDocument();
  });

  it("shows event type title", () => {
    render(<PaymentRedirect {...defaultProps} />);

    expect(screen.getByText("Strategy Session")).toBeInTheDocument();
  });

  it("shows booking date", () => {
    render(<PaymentRedirect {...defaultProps} />);

    expect(screen.getByText(/June 15/i)).toBeInTheDocument();
  });

  it("shows booking time", () => {
    render(<PaymentRedirect {...defaultProps} />);

    const timeRegex = /\d{1,2}:\d{2}\s*(AM|PM)/i;
    const timeElements = screen.getAllByText(timeRegex);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("formats and displays USD price correctly", () => {
    render(<PaymentRedirect {...defaultProps} />);

    // $50.00 (5000 cents)
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("formats GBP price correctly", () => {
    const gbpBooking: BookingResult = {
      ...mockBooking,
      payment: {
        amount: 2500,
        currency: "gbp",
        client_secret: "pi_test_secret",
        stripe_payment_intent_id: "pi_test_123",
      },
    };

    render(<PaymentRedirect {...defaultProps} booking={gbpBooking} />);

    // £25.00
    expect(screen.getByText(/£25\.00/)).toBeInTheDocument();
  });

  it("formats EUR price correctly", () => {
    const eurBooking: BookingResult = {
      ...mockBooking,
      payment: {
        amount: 9900,
        currency: "eur",
        client_secret: "pi_test_secret",
        stripe_payment_intent_id: "pi_test_123",
      },
    };

    render(<PaymentRedirect {...defaultProps} booking={eurBooking} />);

    // €99.00 — locale may use comma or period, so match flexibly
    expect(screen.getByText(/€99/)).toBeInTheDocument();
  });

  it("shows 'Redirecting to payment...' message", () => {
    render(<PaymentRedirect {...defaultProps} />);

    expect(screen.getByText("Redirecting to payment...")).toBeInTheDocument();
  });

  it("has role='status' for accessibility", () => {
    render(<PaymentRedirect {...defaultProps} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders spinner with aria-hidden", () => {
    const { container } = render(<PaymentRedirect {...defaultProps} />);

    const spinner = container.querySelector(".astrocal-spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
  });
});
