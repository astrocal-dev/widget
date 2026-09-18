import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { Widget } from "../components/Widget";
import type {
  EventType,
  AvailabilityResponse,
  BookingResult,
  WaitlistResult,
  WidgetConfig,
  WidgetStepEvent,
} from "../types";

/**
 * PRD-171 — `onStepChange` is the hosted booking page's only window into the
 * widget. It has to fire once per transition, carry enough to build the funnel,
 * and stay completely silent for demo mounts and embeds that pass no handler.
 */
describe("onStepChange", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let steps: WidgetStepEvent[];

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
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  /**
   * The clock is pinned so a bookable day always exists.
   *
   * The sibling specs derive one from the real date as `min(today + 5, 28)`,
   * which lands in the past from the 29th onwards — the calendar disables it and
   * there is nothing to click. Only `Date` is faked, so `waitFor` still polls.
   */
  const NOW = new Date("2026-06-10T12:00:00.000Z");
  const testDateInfo = {
    dateStr: "2026-06-15",
    monthStart: "2026-06-01",
    monthEnd: "2026-06-30",
    day: 15,
  };

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
    ],
  };

  const mockCappedAvailability: AvailabilityResponse = {
    ...mockAvailability,
    slots: [
      {
        start_time: `${testDateInfo.dateStr}T14:00:00Z`,
        end_time: `${testDateInfo.dateStr}T14:30:00Z`,
        capped: true,
        waitlist_available: true,
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
    notes: null,
    cancel_token: "tok-xyz",
    meeting_url: null,
    location: null,
    attendee_count: 1,
    created_at: "2026-06-01T00:00:00.000Z",
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
    cancel_token: "wl-tok",
    expires_at: "2030-01-01T00:00:00Z",
    created_at: "2026-06-01T00:00:00.000Z",
  };

  let defaultConfig: WidgetConfig;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    steps = [];
    defaultConfig = {
      eventTypeId: "evt-123",
      apiUrl: "https://api.astrocal.dev",
      timezone: "America/New_York",
      onStepChange: (event) => steps.push(event),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** The steps reported so far, in order. */
  const names = () => steps.map((s) => s.step);

  /**
   * Waits for the reported steps to match. Preact flushes effects after the DOM
   * commit, so a step is always reported a tick behind the screen it describes.
   */
  const expectSteps = (expected: string[]) => waitFor(() => expect(names()).toEqual(expected));

  /** Clicks the calendar day the mocked availability is built around. */
  async function pickTestDay() {
    const targetDay = screen
      .getAllByRole("gridcell")
      .find((btn) => btn.textContent === String(testDateInfo.day) && !btn.hasAttribute("disabled"));
    expect(targetDay).toBeDefined();
    fireEvent.click(targetDay!);
  }

  it("reports each step once, in order, through to confirmation", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={defaultConfig} />);

    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());
    await expectSteps(["loading", "calendar"]);

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAvailability });
    await pickTestDay();

    await waitFor(() => expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0));
    await expectSteps(["loading", "calendar", "timeslots"]);

    fireEvent.click(screen.getAllByRole("listitem")[0]!);
    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());
    await expectSteps(["loading", "calendar", "timeslots", "form"]);

    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockBooking });
    fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /booking confirmed/i })).toBeInTheDocument(),
    );
    await expectSteps(["loading", "calendar", "timeslots", "form", "submitting", "confirmation"]);
  });

  it("carries the org, duration, slot and booking id the funnel needs", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={defaultConfig} />);
    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAvailability });
    await pickTestDay();
    await waitFor(() => expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByRole("listitem")[0]!);
    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());

    await waitFor(() => expect(steps.some((s) => s.step === "form")).toBe(true));
    const form = steps.find((s) => s.step === "form")!;
    expect(form).toMatchObject({
      previousStep: "timeslots",
      eventTypeId: "evt-123",
      organizationId: "org-456",
      durationMinutes: 30,
      hasSelectedDate: true,
      slotStart: `${testDateInfo.dateStr}T14:00:00Z`,
      isPaid: false,
    });
    expect(form.bookingId).toBeUndefined();

    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockBooking });
    fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /booking confirmed/i })).toBeInTheDocument(),
    );

    // The submit attempt is reported while the invitee is still on the form,
    // so a drop-off at payment shows as a submit with no confirmation.
    expect(steps.find((s) => s.step === "submitting")!.bookingId).toBeUndefined();
    await waitFor(() =>
      expect(steps.find((s) => s.step === "confirmation")).toMatchObject({
        previousStep: "submitting",
        bookingId: "bkg-123",
      }),
    );
  });

  it("reports the error step with its code and the step it came from", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { code: "not_found", message: "Event type not found" } }),
    });

    render(<Widget config={defaultConfig} />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /not found/i })).toBeInTheDocument(),
    );

    await expectSteps(["loading", "error"]);
    expect(steps[1]).toMatchObject({ previousStep: "loading", errorCode: "not_found" });
  });

  it("marks the waitlist path so it can be excluded from booking conversion", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(<Widget config={defaultConfig} />);
    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockCappedAvailability });
    await pickTestDay();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockWaitlistEntry });
    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /you're on the waitlist/i })).toBeInTheDocument(),
    );

    await expectSteps([
      "loading",
      "calendar",
      "timeslots",
      "waitlist-form",
      "submitting",
      "waitlist-confirmation",
    ]);
    for (const step of ["waitlist-form", "submitting", "waitlist-confirmation"]) {
      expect(steps.find((s) => s.step === step)!.isWaitlist).toBe(true);
    }
  });

  it("reports the paid path as a submit then a payment step, never a confirmation", async () => {
    const paidEventType = { ...mockEventType, price_amount: 5000 };
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => paidEventType });

    render(<Widget config={defaultConfig} />);
    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAvailability });
    await pickTestDay();
    await waitFor(() => expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByRole("listitem")[0]!);
    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockBooking,
        status: "pending_payment",
        payment: {
          amount: 5000,
          currency: "usd",
          client_secret: "pi_secret",
          stripe_payment_intent_id: "pi_1",
        },
      }),
    });
    // A priced event type labels the submit with the amount, not "Confirm".
    fireEvent.click(screen.getByRole("button", { name: /pay \$50/i }));

    await expectSteps(["loading", "calendar", "timeslots", "form", "submitting", "payment"]);

    // The submit is what proves the invitee got as far as paying. It has to be
    // reported before the host page redirects to Stripe, and it is the only
    // record of them: no confirmation step ever arrives.
    expect(steps.find((s) => s.step === "submitting")).toMatchObject({ isPaid: true });
    expect(steps.find((s) => s.step === "payment")).toMatchObject({ bookingId: "bkg-123" });
    expect(steps.some((s) => s.step === "confirmation")).toBe(false);
  });

  it("completes the booking even when the host's handler throws", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    render(
      <Widget
        config={{
          ...defaultConfig,
          onStepChange: () => {
            throw new Error("analytics blew up");
          },
        }}
      />,
    );

    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAvailability });
    await pickTestDay();
    await waitFor(() => expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByRole("listitem")[0]!);
    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "john@example.com" } });

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockBooking });
    fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    // The report before the POST is the dangerous one: a throw there would
    // abort the submit and leave the button spinning forever.
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /booking confirmed/i })).toBeInTheDocument(),
    );
  });

  it("stays silent in demo mode", async () => {
    render(<Widget config={{ ...defaultConfig, demo: true }} />);

    fireEvent.click(screen.getAllByRole("gridcell").find((b) => !b.hasAttribute("disabled"))!);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(steps).toEqual([]);
  });

  it("does not re-report when a re-render leaves the step alone", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockEventType });

    const { rerender } = render(<Widget config={defaultConfig} />);
    await waitFor(() => expect(screen.getByText("30 Minute Meeting")).toBeInTheDocument());
    await expectSteps(["loading", "calendar"]);

    rerender(<Widget config={{ ...defaultConfig, hideBranding: true }} />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(names()).toEqual(["loading", "calendar"]);
  });
});
