import { useState, useEffect, useCallback } from "preact/hooks";
import type { WidgetConfig, WidgetState, TimeSlot, WidgetError, AttendeeInput } from "../types";
import { ApiClient } from "../utils/api";
import { DEMO_EVENT_TYPE, generateDemoSlots, createDemoBooking } from "../utils/demo-data";
import { detectTimezone } from "../utils/timezone";
import { firstDayOfMonthStr, lastDayOfMonthStr, parseDateString } from "../utils/dates";
import { Calendar } from "./Calendar";
import { TimeSlots } from "./TimeSlots";
import { BookingForm } from "./BookingForm";
import { Confirmation } from "./Confirmation";
import { ErrorScreen } from "./ErrorScreen";
import { TimezoneSelect } from "./TimezoneSelect";

interface WidgetProps {
  config: WidgetConfig;
}

export function Widget({ config }: WidgetProps) {
  const [state, setState] = useState<WidgetState>({ step: "loading" });
  const [timezone, setTimezone] = useState(() => config.timezone || detectTimezone());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<WidgetError | null>(null);

  const api = new ApiClient(config.apiUrl);

  // Load event type on mount
  useEffect(() => {
    if (config.demo) {
      setState({ step: "calendar", eventType: DEMO_EVENT_TYPE });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const eventType = await api.getEventType(config.eventTypeId);
        if (!cancelled) {
          setState({ step: "calendar", eventType });
        }
      } catch (err) {
        if (!cancelled) {
          const error = err as WidgetError;
          setState({ step: "error", error });
          config.onError?.(error);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [config.eventTypeId, config.apiUrl]);

  // Fetch slots when date changes
  const fetchSlots = useCallback(
    async (date: string) => {
      if (state.step !== "calendar" && state.step !== "timeslots" && state.step !== "form") return;

      const eventType = state.eventType;

      if (config.demo) {
        const demoSlots = generateDemoSlots(date, timezone);
        setState({ step: "timeslots", eventType, date, slots: demoSlots });
        return;
      }

      const { year, month } = parseDateString(date);
      const start = firstDayOfMonthStr(year, month);
      const end = lastDayOfMonthStr(year, month);

      setSlotsLoading(true);
      try {
        const availability = await api.getAvailability(eventType.id, start, end, timezone);
        // Filter slots for the selected date
        const dateSlots = availability.slots.filter((s) => s.start_time.startsWith(date));
        setState({ step: "timeslots", eventType, date, slots: dateSlots });
      } catch (err) {
        const error = err as WidgetError;
        setState({ step: "error", error });
        config.onError?.(error);
      } finally {
        setSlotsLoading(false);
      }
    },

    [state, timezone, config.apiUrl],
  );

  const handleDateSelect = useCallback(
    (date: string) => {
      setSelectedDate(date);
      fetchSlots(date);
    },
    [fetchSlots],
  );

  const handleSlotSelect = useCallback(
    (slot: TimeSlot) => {
      if (state.step === "timeslots") {
        setSubmitError(null);
        setState({ step: "form", eventType: state.eventType, slot });
      }
    },
    [state],
  );

  const handleFormSubmit = useCallback(
    async (data: { name: string; email: string; notes: string; attendees?: AttendeeInput[] }) => {
      if (state.step !== "form") return;

      if (config.demo) {
        const booking = createDemoBooking(state.eventType, state.slot, data, timezone);
        setState({ step: "confirmation", eventType: state.eventType, booking });
        return;
      }

      setSubmitting(true);
      setSubmitError(null);

      try {
        // Use multi-attendee format for group bookings
        const booking =
          data.attendees && data.attendees.length > 1
            ? await api.createBooking({
                event_type_id: state.eventType.id,
                start_time: state.slot.start_time,
                attendees: data.attendees,
                notes: data.notes || undefined,
              })
            : await api.createBooking({
                event_type_id: state.eventType.id,
                start_time: state.slot.start_time,
                invitee_name: data.name,
                invitee_email: data.email,
                invitee_timezone: timezone,
                notes: data.notes || undefined,
              });
        setState({ step: "confirmation", eventType: state.eventType, booking });
        config.onBookingCreated?.(booking);
      } catch (err) {
        const error = err as WidgetError;
        setSubmitError(error);
        config.onError?.(error);
      } finally {
        setSubmitting(false);
      }
    },

    [state, timezone],
  );

  const handleReset = useCallback(() => {
    setState({ step: "calendar", eventType: DEMO_EVENT_TYPE });
    setSelectedDate(null);
  }, []);

  const handleBackToCalendar = useCallback(() => {
    if (state.step === "timeslots" || state.step === "form") {
      setState({ step: "calendar", eventType: state.eventType });
      setSelectedDate(null);
    }
  }, [state]);

  const handleBackToSlots = useCallback(() => {
    if (state.step === "form" && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [state, selectedDate, fetchSlots]);

  const handleRetry = useCallback(() => {
    setState({ step: "loading" });
    // Re-trigger loading effect by resetting
    (async () => {
      try {
        const eventType = await api.getEventType(config.eventTypeId);
        setState({ step: "calendar", eventType });
      } catch (err) {
        const error = err as WidgetError;
        setState({ step: "error", error });
      }
    })();
  }, [config.eventTypeId, config.apiUrl]);

  const handleTimezoneChange = useCallback(
    (tz: string) => {
      setTimezone(tz);
      // Re-fetch slots if we're viewing slots
      if (selectedDate && (state.step === "timeslots" || state.step === "form")) {
        setSelectedDate(selectedDate);
        // Will re-fetch in next render cycle
      }
    },
    [selectedDate, state],
  );

  // Re-fetch slots when timezone changes
  useEffect(() => {
    if (selectedDate && state.step === "timeslots") {
      fetchSlots(selectedDate);
    }
  }, [timezone]);

  return (
    <div class="astrocal-widget">
      {/* Header - shown for calendar, timeslots, and form states */}
      {(state.step === "calendar" || state.step === "timeslots" || state.step === "form") && (
        <div class="astrocal-widget-header">
          <h2>{state.eventType.title}</h2>
          {state.eventType.description && <p>{state.eventType.description}</p>}
          <div class="astrocal-duration">{state.eventType.duration_minutes} min</div>
        </div>
      )}

      <div class="astrocal-widget-body">
        {state.step === "loading" && (
          <div class="astrocal-loading">
            <div class="astrocal-spinner" role="status" aria-label="Loading" />
          </div>
        )}

        {state.step === "error" && <ErrorScreen error={state.error} onRetry={handleRetry} />}

        {state.step === "calendar" && (
          <>
            <Calendar
              timezone={timezone}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
            <TimezoneSelect value={timezone} onChange={handleTimezoneChange} />
          </>
        )}

        {state.step === "timeslots" && (
          <>
            <TimeSlots
              date={state.date}
              slots={state.slots}
              timezone={timezone}
              loading={slotsLoading}
              onSlotSelect={handleSlotSelect}
              onBack={handleBackToCalendar}
            />
            <TimezoneSelect value={timezone} onChange={handleTimezoneChange} />
          </>
        )}

        {state.step === "form" && (
          <BookingForm
            eventType={state.eventType}
            slot={state.slot}
            timezone={timezone}
            submitting={submitting}
            error={submitError}
            onSubmit={handleFormSubmit}
            onBack={handleBackToSlots}
          />
        )}

        {state.step === "confirmation" && (
          <Confirmation
            eventType={state.eventType}
            booking={state.booking}
            timezone={timezone}
            demo={config.demo}
            onReset={handleReset}
          />
        )}
      </div>

      <div class="astrocal-powered">
        Powered by{" "}
        <a href="https://astrocal.dev" target="_blank" rel="noopener">
          Astrocal
        </a>
      </div>
    </div>
  );
}
