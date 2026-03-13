import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { BookingForm } from "./BookingForm";
import type { EventType, TimeSlot } from "../types";

describe("BookingForm", () => {
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

  const groupEventType: EventType = {
    ...mockEventType,
    title: "Workshop",
    max_attendees: 5,
  };

  const mockSlot: TimeSlot = {
    start_time: "2024-01-15T14:00:00Z",
    end_time: "2024-01-15T14:30:00Z",
  };

  const defaultProps = {
    eventType: mockEventType,
    slot: mockSlot,
    timezone: "America/New_York",
    submitting: false,
    error: null,
    onSubmit: vi.fn(),
    onBack: vi.fn(),
  };

  it("renders name, email, and notes fields", () => {
    render(<BookingForm {...defaultProps} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("shows validation error for empty name", async () => {
    render(<BookingForm {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    render(<BookingForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.input(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
  });

  it("shows validation error for empty email", async () => {
    render(<BookingForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.input(nameInput, { target: { value: "John Doe" } });

    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("calls onSubmit with trimmed data on valid submission", async () => {
    const onSubmit = vi.fn();
    render(<BookingForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const notesInput = screen.getByLabelText(/notes/i);

    fireEvent.input(nameInput, { target: { value: "  John Doe  " } });
    fireEvent.input(emailInput, { target: { value: "  john@example.com  " } });
    fireEvent.input(notesInput, { target: { value: "  Looking forward to it  " } });

    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        notes: "Looking forward to it",
      });
    });
  });

  it("shows 'Booking...' text when submitting is true", () => {
    render(<BookingForm {...defaultProps} submitting={true} />);

    const submitButton = screen.getByRole("button", { name: /booking/i });
    expect(submitButton).toHaveTextContent("Booking...");
  });

  it("disables submit button when submitting", () => {
    render(<BookingForm {...defaultProps} submitting={true} />);

    const submitButton = screen.getByRole("button", { name: /booking/i });
    expect(submitButton).toBeDisabled();
  });

  it("shows error message when error prop provided", () => {
    const error = {
      code: "slot_unavailable" as const,
      message: "This time slot is no longer available",
    };

    render(<BookingForm {...defaultProps} error={error} />);

    expect(screen.getByRole("alert")).toHaveTextContent("This time slot is no longer available");
  });

  it("back button calls onBack", () => {
    const onBack = vi.fn();
    render(<BookingForm {...defaultProps} onBack={onBack} />);

    const backButton = screen.getByLabelText("Back to time slots");
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("displays event type details in summary", () => {
    render(<BookingForm {...defaultProps} />);

    expect(screen.getByText(/30 Minute Meeting/i)).toBeInTheDocument();
    expect(screen.getByText(/30 min/i)).toBeInTheDocument();
  });

  it("displays booking date and time in summary", () => {
    render(<BookingForm {...defaultProps} />);

    // Should show formatted date and time
    expect(screen.getByText(/January 15/i)).toBeInTheDocument();
  });

  it("does not call onSubmit when validation fails", async () => {
    const onSubmit = vi.fn();
    render(<BookingForm {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("allows submission with empty notes", async () => {
    const onSubmit = vi.fn();
    render(<BookingForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.input(nameInput, { target: { value: "John Doe" } });
    fireEvent.input(emailInput, { target: { value: "john@example.com" } });

    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        notes: "",
      });
    });
  });

  it("enforces maxLength on notes field", () => {
    render(<BookingForm {...defaultProps} />);

    const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement;
    expect(notesInput.maxLength).toBe(1000);
  });

  // ─── Group Booking: Attendee Count Stepper ────────────────────────

  describe("group booking stepper", () => {
    const groupProps = { ...defaultProps, eventType: groupEventType };

    it("renders attendee count stepper when max_attendees > 1", () => {
      render(<BookingForm {...groupProps} />);

      expect(screen.getByText("How many attendees?")).toBeInTheDocument();
      expect(screen.getByLabelText("Decrease attendee count")).toBeInTheDocument();
      expect(screen.getByLabelText("Increase attendee count")).toBeInTheDocument();
    });

    it("does not render stepper when max_attendees = 1", () => {
      render(<BookingForm {...defaultProps} />);

      expect(screen.queryByText("How many attendees?")).not.toBeInTheDocument();
    });

    it("stepper defaults to count 1", () => {
      render(<BookingForm {...groupProps} />);

      expect(screen.getByLabelText("Decrease attendee count")).toBeDisabled();
      // The polite live region shows the count
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("increasing count from 1 to 3 renders 3 attendee field groups", () => {
      render(<BookingForm {...groupProps} />);

      const increment = screen.getByLabelText("Increase attendee count");
      fireEvent.click(increment);
      fireEvent.click(increment);

      expect(screen.getByText("You (Attendee 1)")).toBeInTheDocument();
      expect(screen.getByText("Attendee 2")).toBeInTheDocument();
      expect(screen.getByText("Attendee 3")).toBeInTheDocument();
    });

    it("decreasing count from 3 to 2 removes the third field group", () => {
      render(<BookingForm {...groupProps} />);

      const increment = screen.getByLabelText("Increase attendee count");
      fireEvent.click(increment);
      fireEvent.click(increment);

      expect(screen.getByText("Attendee 3")).toBeInTheDocument();

      const decrement = screen.getByLabelText("Decrease attendee count");
      fireEvent.click(decrement);

      expect(screen.queryByText("Attendee 3")).not.toBeInTheDocument();
      expect(screen.getByText("Attendee 2")).toBeInTheDocument();
    });

    it("increment button is disabled when attendeeCount === maxAttendees", () => {
      render(<BookingForm {...groupProps} />);

      const increment = screen.getByLabelText("Increase attendee count");
      // Click 4 times to reach max of 5
      for (let i = 0; i < 4; i++) fireEvent.click(increment);

      expect(increment).toBeDisabled();
    });

    it("decrement button is disabled when attendeeCount === 1", () => {
      render(<BookingForm {...groupProps} />);

      expect(screen.getByLabelText("Decrease attendee count")).toBeDisabled();
    });

    it("maxAttendees is capped to spots_remaining when spots_remaining < max_attendees", () => {
      const slotWithLimitedSpots: TimeSlot = {
        ...mockSlot,
        spots_remaining: 3,
      };

      render(<BookingForm {...groupProps} slot={slotWithLimitedSpots} />);

      const increment = screen.getByLabelText("Increase attendee count");
      // Click to reach spots_remaining (3)
      for (let i = 0; i < 2; i++) fireEvent.click(increment);

      expect(increment).toBeDisabled();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("form summary text shows 'Group booking · 2 attendees' when count = 2", () => {
      render(<BookingForm {...groupProps} />);

      const increment = screen.getByLabelText("Increase attendee count");
      fireEvent.click(increment);

      expect(screen.getByText(/Group booking/)).toHaveTextContent("2 attendees");
    });

    it("form summary text shows 'Group booking · 1 attendee' when count = 1", () => {
      render(<BookingForm {...groupProps} />);

      expect(screen.getByText(/Group booking/)).toHaveTextContent("1 attendee");
    });
  });

  // ─── Group Booking: Validation ────────────────────────────────────

  describe("group booking validation", () => {
    const groupProps = { ...defaultProps, eventType: groupEventType };

    it("submitting with any attendee name field empty shows 'Name is required'", async () => {
      render(<BookingForm {...groupProps} />);

      // Increase to 2 attendees
      fireEvent.click(screen.getByLabelText("Increase attendee count"));

      // Fill primary attendee but leave attendee 2 name empty
      fireEvent.input(screen.getByLabelText(/name \*/i), { target: { value: "Alice" } });
      fireEvent.input(screen.getByLabelText(/email \*/i), { target: { value: "alice@test.com" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 email"), {
        target: { value: "bob@test.com" },
      });

      fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
      });
    });

    it("submitting with any attendee email field empty shows 'Email is required'", async () => {
      render(<BookingForm {...groupProps} />);

      fireEvent.click(screen.getByLabelText("Increase attendee count"));

      fireEvent.input(screen.getByLabelText(/name \*/i), { target: { value: "Alice" } });
      fireEvent.input(screen.getByLabelText(/email \*/i), { target: { value: "alice@test.com" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 name"), { target: { value: "Bob" } });

      fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });

    it("submitting with an invalid email format shows 'Please enter a valid email address'", async () => {
      render(<BookingForm {...groupProps} />);

      fireEvent.click(screen.getByLabelText("Increase attendee count"));

      fireEvent.input(screen.getByLabelText(/name \*/i), { target: { value: "Alice" } });
      fireEvent.input(screen.getByLabelText(/email \*/i), { target: { value: "alice@test.com" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 name"), { target: { value: "Bob" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 email"), {
        target: { value: "not-an-email" },
      });

      fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("submitting with two attendees sharing the same email shows duplicate error on both fields", async () => {
      render(<BookingForm {...groupProps} />);

      fireEvent.click(screen.getByLabelText("Increase attendee count"));

      fireEvent.input(screen.getByLabelText(/name \*/i), { target: { value: "Alice" } });
      fireEvent.input(screen.getByLabelText(/email \*/i), { target: { value: "same@test.com" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 name"), { target: { value: "Bob" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 email"), {
        target: { value: "same@test.com" },
      });

      fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

      await waitFor(() => {
        const errors = screen.getAllByText(/Duplicate email/);
        expect(errors).toHaveLength(2);
      });
    });

    it("duplicate email check is case-insensitive", async () => {
      render(<BookingForm {...groupProps} />);

      fireEvent.click(screen.getByLabelText("Increase attendee count"));

      fireEvent.input(screen.getByLabelText(/name \*/i), { target: { value: "Alice" } });
      fireEvent.input(screen.getByLabelText(/email \*/i), { target: { value: "Alice@Test.com" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 name"), { target: { value: "Bob" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 email"), {
        target: { value: "alice@test.com" },
      });

      fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

      await waitFor(() => {
        const errors = screen.getAllByText(/Duplicate email/);
        expect(errors).toHaveLength(2);
      });
    });
  });

  // ─── Group Booking: Submission ────────────────────────────────────

  describe("group booking submission", () => {
    const groupProps = { ...defaultProps, eventType: groupEventType };

    it("submitting with count = 2 and valid data calls onSubmit with attendees array of length 2", async () => {
      const onSubmit = vi.fn();
      render(<BookingForm {...groupProps} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByLabelText("Increase attendee count"));

      fireEvent.input(screen.getByLabelText(/name \*/i), { target: { value: "Alice" } });
      fireEvent.input(screen.getByLabelText(/email \*/i), { target: { value: "alice@test.com" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 name"), { target: { value: "Bob" } });
      fireEvent.input(screen.getByLabelText("Attendee 2 email"), {
        target: { value: "bob@test.com" },
      });

      fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Alice",
            email: "alice@test.com",
            attendees: expect.arrayContaining([
              expect.objectContaining({ name: "Alice", email: "alice@test.com" }),
              expect.objectContaining({ name: "Bob", email: "bob@test.com" }),
            ]),
          }),
        );
        expect(onSubmit.mock.calls[0]![0].attendees).toHaveLength(2);
      });
    });

    it("submitting with count = 1 calls onSubmit with attendees array of length 1", async () => {
      const onSubmit = vi.fn();
      render(<BookingForm {...groupProps} onSubmit={onSubmit} />);

      fireEvent.input(screen.getByLabelText(/name \*/i), { target: { value: "Alice" } });
      fireEvent.input(screen.getByLabelText(/email \*/i), { target: { value: "alice@test.com" } });

      fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Alice",
            email: "alice@test.com",
            attendees: expect.arrayContaining([
              expect.objectContaining({ name: "Alice", email: "alice@test.com" }),
            ]),
          }),
        );
        expect(onSubmit.mock.calls[0]![0].attendees).toHaveLength(1);
      });
    });
  });
});
