import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { WaitlistForm } from "./WaitlistForm";
import type { EventType } from "../types";

describe("WaitlistForm", () => {
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

  const defaultProps = {
    eventType: mockEventType,
    date: "2024-01-15",
    timezone: "America/New_York",
    submitting: false,
    error: null,
    onSubmit: vi.fn(),
    onBack: vi.fn(),
  };

  it("renders name, email, and notes fields", () => {
    render(<WaitlistForm {...defaultProps} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("shows validation error when name is empty on submit", async () => {
    render(<WaitlistForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("shows validation error when email is empty on submit", async () => {
    render(<WaitlistForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.input(nameInput, { target: { value: "John Doe" } });

    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("shows validation error when email format is invalid", async () => {
    render(<WaitlistForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.input(nameInput, { target: { value: "John Doe" } });
    fireEvent.input(emailInput, { target: { value: "invalid-email" } });

    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
  });

  it("does not submit when validation fails", async () => {
    const onSubmit = vi.fn();
    render(<WaitlistForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with trimmed name, email, and notes when valid", async () => {
    const onSubmit = vi.fn();
    render(<WaitlistForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "  John Doe  " } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "  john@example.com  " } });
    fireEvent.input(screen.getByLabelText(/notes/i), { target: { value: "  Please notify me  " } });

    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        notes: "Please notify me",
      });
    });
  });

  it("shows API error message via role='alert' when error prop is set", () => {
    const error = {
      code: "unknown" as const,
      message: "Waitlist is full",
    };

    render(<WaitlistForm {...defaultProps} error={error} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Waitlist is full");
  });

  it("disables submit button and shows 'Joining...' when submitting is true", () => {
    render(<WaitlistForm {...defaultProps} submitting={true} />);

    const submitButton = screen.getByRole("button", { name: /joining/i });
    expect(submitButton).toHaveTextContent("Joining...");
    expect(submitButton).toBeDisabled();
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    render(<WaitlistForm {...defaultProps} onBack={onBack} />);

    fireEvent.click(screen.getByLabelText("Back to time slots"));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
