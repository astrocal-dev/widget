import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { Widget } from "../components/Widget";
import { TEST_IDS, type EventType, type AvailabilityResponse, type WidgetConfig } from "../types";
import { version } from "../index";
import pkg from "../../package.json";

/**
 * PRD-173 — `TEST_IDS` is public API. The booking flow e2e is the only thing
 * that proves the widget still works end to end, and it selects entirely on
 * these hooks, so removing one has to fail the widget's own suite rather than
 * surfacing later as an unexplained e2e failure.
 */

vi.mock("../mount", () => ({
  mountWidget: vi.fn(),
  unmountWidget: vi.fn(),
  resolveTarget: vi.fn((target: string | HTMLElement) => target),
}));

describe("widget test hooks", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const NOW = new Date("2026-06-10T12:00:00.000Z");
  const DATE = "2026-06-15";

  const mockEventType: EventType = {
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
    conferencing_provider: null,
    location: null,
    color: "#3b82f6",
    timezone: "America/New_York",
    active: true,
    is_test: false,
    price_amount: null,
    price_currency: "usd",
    max_attendees: 1,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  };

  const mockAvailability: AvailabilityResponse = {
    event_type_id: "evt-123",
    timezone: "America/New_York",
    start: "2026-06-01",
    end: "2026-06-30",
    slots: [{ start_time: `${DATE}T14:00:00Z`, end_time: `${DATE}T14:30:00Z` }],
  };

  const config: WidgetConfig = {
    eventTypeId: "evt-123",
    apiUrl: "https://api.astrocal.dev",
    timezone: "America/New_York",
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("marks the root, the calendar and every bookable day", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={config} />);

    // The root is there from the loading spinner onwards; the calendar arrives
    // once the event type has loaded.
    expect(screen.getByTestId(TEST_IDS.widget)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.calendar)).toBeInTheDocument());
    expect(screen.getAllByTestId(TEST_IDS.day).length).toBeGreaterThan(0);
  });

  it("does not mark past days, so the first hooked day is always clickable", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={config} />);
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.calendar)).toBeInTheDocument());

    for (const day of screen.getAllByTestId(TEST_IDS.day)) {
      expect(day).not.toBeDisabled();
    }
  });

  it("marks each slot, the form and the submit control", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={config} />);
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.calendar)).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAvailability });
    fireEvent.click(screen.getAllByTestId(TEST_IDS.day).find((d) => d.textContent === "15")!);

    await waitFor(() => expect(screen.getAllByTestId(TEST_IDS.slot)).toHaveLength(1));

    fireEvent.click(screen.getAllByTestId(TEST_IDS.slot)[0]!);

    await waitFor(() => expect(screen.getByTestId(TEST_IDS.bookingForm)).toBeInTheDocument());
    expect(screen.getByTestId(TEST_IDS.submit)).toBeInTheDocument();
  });

  it("marks the empty state when a date has no times", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={config} />);
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.calendar)).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockAvailability, slots: [] }),
    });
    fireEvent.click(screen.getAllByTestId(TEST_IDS.day)[0]!);

    await waitFor(() => expect(screen.getByTestId(TEST_IDS.slotsEmpty)).toBeInTheDocument());
    expect(screen.queryByTestId(TEST_IDS.error)).not.toBeInTheDocument();
  });

  it("marks the confirmation screen", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={config} />);
    await waitFor(() => expect(screen.getByTestId(TEST_IDS.calendar)).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAvailability });
    fireEvent.click(screen.getAllByTestId(TEST_IDS.day).find((d) => d.textContent === "15")!);
    await waitFor(() => expect(screen.getAllByTestId(TEST_IDS.slot)).toHaveLength(1));
    fireEvent.click(screen.getAllByTestId(TEST_IDS.slot)[0]!);

    await waitFor(() => expect(screen.getByTestId(TEST_IDS.bookingForm)).toBeInTheDocument());
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "bkg-1",
        event_type_id: "evt-123",
        status: "confirmed",
        start_time: `${DATE}T14:00:00Z`,
        end_time: `${DATE}T14:30:00Z`,
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
        notes: null,
        cancel_token: "tok",
        meeting_url: null,
        location: null,
        attendee_count: 1,
        created_at: "2026-06-10T12:00:00.000Z",
      }),
    });
    fireEvent.click(screen.getByTestId(TEST_IDS.submit));

    await waitFor(() => expect(screen.getByTestId(TEST_IDS.confirmation)).toBeInTheDocument());
  });

  it("marks the error screen", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { code: "not_found", message: "Event type not found" } }),
    });

    render(<Widget config={config} />);

    await waitFor(() => expect(screen.getByTestId(TEST_IDS.error)).toBeInTheDocument());
  });

  it("marks each duration option", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockEventType, duration_options: [15, 30, 60] }),
    });

    render(<Widget config={config} />);

    await waitFor(() => expect(screen.getAllByTestId(TEST_IDS.durationOption)).toHaveLength(3));
  });
});

describe("widget version", () => {
  it("reports the published package version", () => {
    expect(version).toBe(pkg.version);
  });
});
