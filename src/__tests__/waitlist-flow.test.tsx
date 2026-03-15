import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { Widget } from "../components/Widget";
import type { EventType, AvailabilityResponse, WaitlistResult, WidgetConfig } from "../types";

describe("waitlist flow integration", () => {
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

  const getTestDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = Math.min(today.getDate() + 5, 28);
    return {
      dateStr: `${year}-${month}-${String(day).padStart(2, "0")}`,
      monthStart: `${year}-${month}-01`,
      monthEnd: `${year}-${month}-28`,
      day,
    };
  };

  const testDateInfo = getTestDate();

  /** All slots capped with waitlist available */
  const mockCappedAvailability: AvailabilityResponse = {
    event_type_id: "evt-123",
    timezone: "America/New_York",
    start: testDateInfo.monthStart,
    end: testDateInfo.monthEnd,
    slots: [
      {
        start_time: `${testDateInfo.dateStr}T14:00:00Z`,
        end_time: `${testDateInfo.dateStr}T14:30:00Z`,
        capped: true,
        waitlist_available: true,
      },
      {
        start_time: `${testDateInfo.dateStr}T15:00:00Z`,
        end_time: `${testDateInfo.dateStr}T15:30:00Z`,
        capped: true,
        waitlist_available: true,
      },
    ],
  };

  /** Normal available slots */
  const mockAvailableSlots: AvailabilityResponse = {
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
    ],
  };

  const mockWaitlistEntry: WaitlistResult = {
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

  it("shows 'Join Waitlist' when date has capped slots with waitlist available", async () => {
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
      json: async () => mockCappedAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        expect(screen.getByText("This date is fully booked.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
      });
    }
  });

  it("completes full waitlist flow: join and see confirmation with position", async () => {
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
      json: async () => mockCappedAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
      });

      // Click "Join Waitlist"
      fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill in the form
      fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
      fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });

      // Mock waitlist entry creation
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaitlistEntry,
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /you're on the waitlist/i }),
        ).toBeInTheDocument();
        expect(screen.getByText("You're #3 on the waitlist")).toBeInTheDocument();
        expect(screen.getByText("We'll notify you when a spot opens up.")).toBeInTheDocument();
      });
    }
  });

  it("shows normal time slots when slots are available (not capped)", async () => {
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
      json: async () => mockAvailableSlots,
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
      });

      expect(screen.queryByRole("button", { name: /join waitlist/i })).not.toBeInTheDocument();
    }
  });

  it("navigates back from waitlist form to timeslots", async () => {
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
      json: async () => mockCappedAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Mock re-fetch of availability when going back
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCappedAvailability,
      });

      fireEvent.click(screen.getByLabelText("Back to time slots"));

      await waitFor(() => {
        expect(screen.getByText("This date is fully booked.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
      });
    }
  });

  it("shows inline error on waitlist form when API returns 409", async () => {
    const onError = vi.fn();
    const config: WidgetConfig = { ...defaultConfig, onError };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventType,
    });

    render(<Widget config={config} />);

    await waitFor(() => {
      expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument();
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCappedAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
      fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });

      // Mock 409 error
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: { code: "conflict", message: "Waitlist full" },
        }),
      });

      fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "This time slot is no longer available",
        );
      });

      // Form should still be visible
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

      expect(onError).toHaveBeenCalledWith({
        code: "slot_unavailable",
        message: "This time slot is no longer available",
      });
    }
  });

  it("shows waitlist when response-level capped is true and slots array is empty", async () => {
    const responseCapAvailability: AvailabilityResponse = {
      event_type_id: "evt-123",
      timezone: "America/New_York",
      start: testDateInfo.monthStart,
      end: testDateInfo.monthEnd,
      slots: [],
      capped: true,
      waitlist_available: true,
    };

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
      json: async () => responseCapAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
      });
    }
  });

  it("shows no slots without waitlist when response-level capped is true but waitlist_available is false", async () => {
    const cappedNoWaitlistAvailability: AvailabilityResponse = {
      event_type_id: "evt-123",
      timezone: "America/New_York",
      start: testDateInfo.monthStart,
      end: testDateInfo.monthEnd,
      slots: [],
      capped: true,
    };

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
      json: async () => cappedNoWaitlistAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        expect(screen.getByText("No available times for this date")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /join waitlist/i })).not.toBeInTheDocument();
    }
  });

  it("shows mixed slots normally when some are available and some are capped", async () => {
    const mixedAvailability: AvailabilityResponse = {
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
          capped: true,
          waitlist_available: true,
        },
      ],
    };

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
      json: async () => mixedAvailability,
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const targetDay = dayButtons.find(
      (btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"),
    );

    if (targetDay) {
      fireEvent.click(targetDay);

      await waitFor(() => {
        // Should show the available (non-capped) slot
        const slots = screen.getAllByRole("listitem");
        expect(slots).toHaveLength(1);
      });

      // Should not show "Join Waitlist" since there's a bookable slot
      expect(screen.queryByRole("button", { name: /join waitlist/i })).not.toBeInTheDocument();
    }
  });
});
