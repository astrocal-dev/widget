import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { Widget } from "../components/Widget";
import type { EventType, AvailabilityResponse, BookingResult, WidgetConfig } from "../types";

describe("booking flow integration", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

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

  // Helper to get current month's date range and a testable future date
  const getTestDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    // Use a date later in the month to avoid past dates
    const day = Math.min(today.getDate() + 5, 28); // Stay within bounds
    return {
      dateStr: `${year}-${month}-${String(day).padStart(2, "0")}`,
      monthStart: `${year}-${month}-01`,
      monthEnd: `${year}-${month}-28`,
      day,
    };
  };

  const testDateInfo = getTestDate();
  const mockAvailability: AvailabilityResponse = {
    event_type_id: "evt-123",
    timezone: "America/New_York",
    start: testDateInfo.monthStart,
    end: testDateInfo.monthEnd,
    slots: [
      {
        start_time: `${testDateInfo.dateStr}T14:00:00Z`,
        end_time: `${testDateInfo.dateStr}T14:30:00Z`,
      },
      {
        start_time: `${testDateInfo.dateStr}T15:00:00Z`,
        end_time: `${testDateInfo.dateStr}T15:30:00Z`,
      },
      {
        start_time: `${testDateInfo.dateStr}T16:00:00Z`,
        end_time: `${testDateInfo.dateStr}T16:30:00Z`,
      },
    ],
  };

  const mockBooking: BookingResult = {
    id: "bkg-123",
    event_type_id: "evt-123",
    status: "confirmed",
    start_time: `${testDateInfo.dateStr}T14:00:00Z`,
    end_time: `${testDateInfo.dateStr}T14:30:00Z`,
    invitee_name: "John Doe",
    invitee_email: "john@example.com",
    invitee_timezone: "America/New_York",
    notes: "Looking forward to it",
    cancel_token: "tok-xyz",
    attendee_count: 1,
    created_at: new Date().toISOString(),
  };

  const defaultConfig: WidgetConfig = {
    eventTypeId: "evt-123",
    apiUrl: "https://api.astrocal.dev",
    timezone: "America/New_York",
  };

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading spinner initially", () => {
    fetchMock.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolve to keep loading state
        }),
    );

    render(<Widget config={defaultConfig} />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("shows calendar after event type loads", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    // Should show calendar
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
  });

  it("shows time slots when date is clicked", async () => {
    // Mock event type fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    // Mock availability fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAvailability,
    });

    // Click on any non-disabled day button
    const dayButtons = screen.getAllByRole("gridcell");
    const enabledDay = dayButtons.find((btn) => !btn.hasAttribute("disabled"));

    if (enabledDay) {
      fireEvent.click(enabledDay);

      await waitFor(() => {
        // Should show time slots or empty state (depending on date match)
        const backButton = screen.getByLabelText("Back to calendar");
        expect(backButton).toBeInTheDocument();
      });
    }
  });

  it("shows booking form when time slot is clicked", async () => {
    // Mock event type fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    // Mock availability fetch - will be called when we click the date
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAvailability,
    });

    // Find and click the button for the specific test day
    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        const slots = screen.queryAllByRole("listitem");
        expect(slots.length).toBeGreaterThan(0);
        // Click first slot
        fireEvent.click(slots[0]!);
      });

      await waitFor(() => {
        // Should show booking form
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });
    }
  });

  it("completes full booking flow and shows confirmation", async () => {
    const onBookingCreated = vi.fn();
    const config: WidgetConfig = {
      ...defaultConfig,
      onBookingCreated,
    };

    // Mock event type fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={config} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    // Mock availability fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAvailability,
    });

    // Click on the test day
    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        const slots = screen.getAllByRole("listitem");
        expect(slots.length).toBeGreaterThan(0);
        // Click first slot
        fireEvent.click(slots[0]!);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Fill in form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const notesInput = screen.getByLabelText(/notes/i);

      fireEvent.input(nameInput, { target: { value: "John Doe" } });
      fireEvent.input(emailInput, { target: { value: "john@example.com" } });
      fireEvent.input(notesInput, { target: { value: "Looking forward to it" } });

      // Mock booking creation
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooking,
      });

      // Submit form
      const submitButton = screen.getByRole("button", { name: /confirm booking/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should show confirmation
        expect(screen.getByRole("heading", { name: /booking confirmed/i })).toBeInTheDocument();
        // Text is split across elements, use flexible matcher
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });

      expect(onBookingCreated).toHaveBeenCalledWith(mockBooking);
    }
  });

  it("shows error screen on 404", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { code: "not_found", message: "Event type not found" } }),
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /not found/i })).toBeInTheDocument();
      expect(screen.getByText("Event type not found")).toBeInTheDocument();
    });

    // Should not show retry button for 404
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });

  it("shows error on booking form when 409 conflict occurs", async () => {
    const onError = vi.fn();
    const config: WidgetConfig = {
      ...defaultConfig,
      onError,
    };

    // Mock event type fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={config} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    // Mock availability fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAvailability,
    });

    // Navigate to form
    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        const slots = screen.getAllByRole("listitem");
        expect(slots.length).toBeGreaterThan(0);
        fireEvent.click(slots[0]!);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Fill in form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.input(nameInput, { target: { value: "John Doe" } });
      fireEvent.input(emailInput, { target: { value: "john@example.com" } });

      // Mock booking creation with 409 conflict
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: { code: "conflict", message: "This time slot is no longer available" },
        }),
      });

      // Submit form
      const submitButton = screen.getByRole("button", { name: /confirm booking/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should show error on the form (not navigate to error screen)
        expect(screen.getByRole("alert")).toHaveTextContent(
          "This time slot is no longer available",
        );
      });

      // Should still show the form
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

      expect(onError).toHaveBeenCalledWith({
        code: "slot_unavailable",
        message: "This time slot is no longer available",
      });
    }
  });

  it("can retry after error", async () => {
    // Initial fetch fails
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: { code: "internal_error", message: "Server error" } }),
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    // Mock successful retry
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });
  });

  it("calls onError callback when error occurs", async () => {
    const onError = vi.fn();
    const config: WidgetConfig = {
      ...defaultConfig,
      onError,
    };

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { code: "not_found", message: "Event type not found" } }),
    });

    render(<Widget config={config} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({
        code: "not_found",
        message: "Event type not found",
      });
    });
  });

  it("can navigate back from time slots to calendar", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        const slots = screen.queryAllByRole("listitem");
        expect(slots.length).toBeGreaterThan(0);
      });

      const backButton = screen.getByLabelText("Back to calendar");
      fireEvent.click(backButton);

      await waitFor(() => {
        // Should show calendar again
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });
    }
  });

  it("can navigate back from form to time slots", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    // First availability fetch when clicking the date
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        const slots = screen.getAllByRole("listitem");
        expect(slots.length).toBeGreaterThan(0);
        fireEvent.click(slots[0]!);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Mock second availability fetch when navigating back (re-fetching slots)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailability,
      });

      const backButton = screen.getByLabelText("Back to time slots");
      fireEvent.click(backButton);

      await waitFor(() => {
        // Should transition back to time slots view
        // The back button label changes from "Back to time slots" to "Back to calendar"
        const calendarBackButton = screen.queryByLabelText("Back to calendar");
        expect(calendarBackButton).toBeInTheDocument();
      });
    }
  });
});
