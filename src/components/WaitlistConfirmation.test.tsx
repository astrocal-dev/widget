import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/preact";
import { WaitlistConfirmation } from "./WaitlistConfirmation";
import type { EventType, WaitlistResult } from "../types";

describe("WaitlistConfirmation", () => {
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

  const mockEntry: WaitlistResult = {
    id: "wl-123",
    event_type_id: "evt-123",
    status: "waiting",
    position: 3,
    invitee_name: "John Doe",
    invitee_email: "john@example.com",
    invitee_timezone: "America/New_York",
    notes: null,
    cancel_token: "tok-xyz",
    expires_at: "2024-02-15T00:00:00Z",
    created_at: "2024-01-15T12:00:00Z",
  };

  const defaultProps = {
    eventType: mockEventType,
    entry: mockEntry,
    timezone: "America/New_York",
  };

  it("renders 'You're on the Waitlist' heading", () => {
    render(<WaitlistConfirmation {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /you're on the waitlist/i })).toBeInTheDocument();
  });

  it("shows position text when entry.position is 3", () => {
    render(<WaitlistConfirmation {...defaultProps} />);

    expect(screen.getByText("You're #3 on the waitlist")).toBeInTheDocument();
  });

  it("omits position text when entry.position is 0", () => {
    render(<WaitlistConfirmation {...defaultProps} entry={{ ...mockEntry, position: 0 }} />);

    expect(screen.queryByText(/You're #/)).not.toBeInTheDocument();
  });

  it("shows 'We'll notify you when a spot opens up.'", () => {
    render(<WaitlistConfirmation {...defaultProps} />);

    expect(screen.getByText("We'll notify you when a spot opens up.")).toBeInTheDocument();
  });

  it("shows confirmation email message with invitee email address", () => {
    render(<WaitlistConfirmation {...defaultProps} />);

    expect(
      screen.getByText(/A confirmation email has been sent to john@example.com/),
    ).toBeInTheDocument();
  });
});
