import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { Widget } from "../components/Widget";
import type { EventType, AvailabilityResponse, BookingResult, WidgetConfig } from "../types";

describe("reschedule flow integration", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const eventType: EventType = {
    id: "evt-123",
    organization_id: "org-456",
    title: "30 Minute Meeting",
    slug: "30-min",
    description: "A quick chat",
    duration_minutes: 30,
    duration_options: [30, 60],
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
    conferencing_provider: "in_person",
    location: "1 High St",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(Math.min(today.getDate() + 5, 28)).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const availability: AvailabilityResponse = {
    event_type_id: "evt-123",
    timezone: "UTC",
    start: `${year}-${month}-01`,
    end: `${year}-${month}-28`,
    slots: [{ start_time: `${dateStr}T14:00:00Z`, end_time: `${dateStr}T14:30:00Z` }],
  };

  const rescheduled: BookingResult = {
    id: "bkg-123",
    event_type_id: "evt-123",
    status: "confirmed",
    start_time: `${dateStr}T14:00:00Z`,
    end_time: `${dateStr}T14:30:00Z`,
    invitee_name: "John Doe",
    invitee_email: "john@example.com",
    invitee_timezone: "UTC",
    notes: null,
    cancel_token: "tok-xyz",
    attendee_count: 1,
    meeting_url: null,
    location: "1 High St",
    created_at: new Date().toISOString(),
  };

  const config: WidgetConfig = {
    eventTypeId: "evt-123",
    apiUrl: "https://api.astrocal.dev",
    timezone: "UTC",
    reschedule: {
      bookingId: "bkg-123",
      token: "tok-xyz",
      currentStartTime: `${dateStr}T09:00:00Z`,
    },
  };

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function loadAndPickSlot() {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => eventType });
    render(<Widget config={config} />);
    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => availability });
    const dayCell = screen
      .getAllByRole("gridcell")
      .find((btn) => !btn.hasAttribute("disabled") && btn.textContent === String(Number(day)));
    fireEvent.click(dayCell!);

    const slotButton = (await screen.findAllByRole("listitem"))[0]!;
    fireEvent.click(slotButton);
    await screen.findByText("New time");
  }

  it("skips the duration selector and shows the location in the header", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => eventType });
    render(<Widget config={config} />);

    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());

    expect(screen.queryByText("Choose a duration")).not.toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(document.querySelector(".astrocal-location")).toHaveTextContent("In person · 1 High St");
  });

  it("reschedules through the token endpoint and shows the rescheduled confirmation", async () => {
    const onBookingRescheduled = vi.fn();
    const onBookingCreated = vi.fn();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => eventType });
    render(<Widget config={{ ...config, onBookingRescheduled, onBookingCreated }} />);
    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => availability });
    const dayCell = screen
      .getAllByRole("gridcell")
      .find((btn) => !btn.hasAttribute("disabled") && btn.textContent === String(Number(day)));
    fireEvent.click(dayCell!);
    fireEvent.click((await screen.findAllByRole("listitem"))[0]!);
    await screen.findByText("New time");

    expect(screen.getByText("Current time")).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => rescheduled });
    fireEvent.input(screen.getByLabelText("Reason (optional)"), {
      target: { value: "Running late" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm new time" }));

    await screen.findByRole("heading", { name: /booking rescheduled/i });

    const [url, init] = fetchMock.mock.calls[2]!;
    expect(url).toBe("https://api.astrocal.dev/v1/bookings/bkg-123/reschedule?token=tok-xyz");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      new_start_time: `${dateStr}T14:00:00Z`,
      reason: "Running late",
    });
    expect(screen.getByText("1 High St")).toBeInTheDocument();
    expect(onBookingRescheduled).toHaveBeenCalledWith(rescheduled);
    expect(onBookingCreated).not.toHaveBeenCalled();
  });

  it("shows the slot-taken error on the confirm step and keeps the booker there", async () => {
    await loadAndPickSlot();

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: { code: "slot_unavailable", message: "taken" } }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm new time" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("taken"));
    expect(screen.getByText("New time")).toBeInTheDocument();
  });

  it("goes back to the time slots from the confirm step", async () => {
    await loadAndPickSlot();

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => availability });
    fireEvent.click(screen.getByLabelText("Back to time slots"));

    await screen.findAllByRole("listitem");
    expect(screen.queryByText("New time")).not.toBeInTheDocument();
  });
});

describe("reschedule flow never offers the waitlist", () => {
  it("shows no waitlist call to action when every slot is capped", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(Math.min(today.getDate() + 5, 28)).padStart(2, "0");
    const eventType: EventType = {
      id: "evt-123",
      organization_id: "org-456",
      title: "Group class",
      slug: "group",
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
      max_attendees: 5,
      conferencing_provider: null,
      location: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => eventType });
    render(
      <Widget
        config={{
          eventTypeId: "evt-123",
          timezone: "UTC",
          reschedule: { bookingId: "bkg-1", token: "tok" },
        }}
      />,
    );
    await waitFor(() => expect(screen.getByText("Group class")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        event_type_id: "evt-123",
        timezone: "UTC",
        start: `${y}-${m}-01`,
        end: `${y}-${m}-28`,
        slots: [
          {
            start_time: `${y}-${m}-${d}T14:00:00Z`,
            end_time: `${y}-${m}-${d}T14:30:00Z`,
            capped: true,
            waitlist_available: true,
          },
        ],
      }),
    });
    const dayCell = screen
      .getAllByRole("gridcell")
      .find((btn) => !btn.hasAttribute("disabled") && btn.textContent === String(Number(d)));
    fireEvent.click(dayCell!);

    await screen.findByLabelText("Back to calendar");
    expect(screen.queryByLabelText("Join waitlist for this date")).not.toBeInTheDocument();
  });
});
