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
});
