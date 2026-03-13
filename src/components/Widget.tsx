import { useState, useEffect, useCallback } from "preact/hooks";
import type {
  WidgetConfig,
  WidgetState,
  EventType,
  TimeSlot,
  WidgetError,
  AttendeeInput,
} from "../types";
import { ApiClient } from "../utils/api";
import { DEMO_EVENT_TYPE, generateDemoSlots, createDemoBooking } from "../utils/demo-data";
import { detectTimezone } from "../utils/timezone";
import { firstDayOfMonthStr, lastDayOfMonthStr, parseDateString } from "../utils/dates";
import { Calendar } from "./Calendar";
import { TimeSlots } from "./TimeSlots";
import { BookingForm } from "./BookingForm";
import { Confirmation } from "./Confirmation";
import { WaitlistForm } from "./WaitlistForm";
import { WaitlistConfirmation } from "./WaitlistConfirmation";
import { ErrorScreen } from "./ErrorScreen";
import { TimezoneSelect } from "./TimezoneSelect";
import { DurationSelector } from "./DurationSelector";

interface WidgetProps {
  config: WidgetConfig;
}

/** Resolves the initial state after loading an event type. */
function resolveLoadedState(eventType: EventType): WidgetState {
  const options = eventType.duration_options;
  if (options && options.length >= 2) {
    return { step: "duration", eventType };
  }
  const selectedDuration =
    options && options.length === 1 ? options[0]! : eventType.duration_minutes;
  return { step: "calendar", eventType, selectedDuration };
}

export function Widget({ config }: WidgetProps) {
  const [state, setState] = useState<WidgetState>({ step: "loading" });
  const [timezone, setTimezone] = useState(() => config.timezone || detectTimezone());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<WidgetError | null>(null);
  const [waitlistAvailableForDate, setWaitlistAvailableForDate] = useState(false);

  const api = new ApiClient(config.apiUrl);

  const demoEventType = config.demoEventType
    ? { ...DEMO_EVENT_TYPE, ...config.demoEventType }
    : DEMO_EVENT_TYPE;

  // Load event type on mount
  useEffect(() => {
    if (config.demo) {
      setState(resolveLoadedState(demoEventType));
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const eventType = await api.getEventType(config.eventTypeId);
        if (!cancelled) {
          setState(resolveLoadedState(eventType));
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

  // Update event type in-place when demo config changes (preserves current step)
  // When duration changes and we're viewing timeslots, regenerate them too.
  useEffect(() => {
    if (!config.demo) return;
    setState((prev) => {
      if (prev.step === "loading" || prev.step === "error") return prev;
      if (prev.step === "timeslots") {
        const duration = prev.selectedDuration;
        const slots = generateDemoSlots(
          prev.date,
          timezone,
          duration,
          demoEventType.buffer_before_minutes,
          demoEventType.buffer_after_minutes,
        );
        return { ...prev, eventType: demoEventType, slots };
      }
      return { ...prev, eventType: demoEventType };
    });
  }, [
    config.demoEventType?.title,
    config.demoEventType?.description,
    config.demoEventType?.duration_minutes,
    config.demoEventType?.duration_options,
    config.demoEventType?.buffer_before_minutes,
    config.demoEventType?.buffer_after_minutes,
    config.demoEventType?.color,
  ]);

  // Fetch slots when date changes
  const fetchSlots = useCallback(
    async (date: string) => {
      if (
        state.step !== "calendar" &&
        state.step !== "timeslots" &&
        state.step !== "form" &&
        state.step !== "waitlist-form"
      )
        return;

      const eventType = state.eventType;
      const selectedDuration = state.selectedDuration;

      if (config.demo) {
        const demoSlots = generateDemoSlots(
          date,
          timezone,
          selectedDuration,
          eventType.buffer_before_minutes,
          eventType.buffer_after_minutes,
        );
        setWaitlistAvailableForDate(false);
        setState({ step: "timeslots", eventType, date, slots: demoSlots, selectedDuration });
        return;
      }

      const { year, month } = parseDateString(date);
      const start = firstDayOfMonthStr(year, month);
      // Cap at 30 days from start (API limit) — months with 31 days would exceed it
      const lastDay = lastDayOfMonthStr(year, month);
      const day30 = `${year}-${String(month).padStart(2, "0")}-30`;
      const end = lastDay > day30 ? day30 : lastDay;

      setSlotsLoading(true);
      try {
        const duration =
          selectedDuration !== eventType.duration_minutes ? selectedDuration : undefined;
        const availability = await api.getAvailability(
          eventType.id,
          start,
          end,
          timezone,
          duration,
        );
        // Filter slots for the selected date
        const dateSlots = availability.slots.filter((s) => s.start_time.startsWith(date));
        // Compute waitlist availability: all slots capped, at least one waitlist-available
        const hasWaitlist =
          dateSlots.length > 0 &&
          dateSlots.every((s) => s.capped) &&
          dateSlots.some((s) => s.waitlist_available);
        setWaitlistAvailableForDate(hasWaitlist);
        // Show available (non-capped) slots; if all are capped, show empty with waitlist option
        const availableSlots = dateSlots.filter((s) => !s.capped);
        setState({ step: "timeslots", eventType, date, slots: availableSlots, selectedDuration });
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

  const handleDurationSelect = useCallback(
    (duration: number) => {
      if (state.step === "duration") {
        setState({ step: "calendar", eventType: state.eventType, selectedDuration: duration });
      }
    },
    [state],
  );

  const handleSlotSelect = useCallback(
    (slot: TimeSlot) => {
      if (state.step === "timeslots") {
        setSubmitError(null);
        setState({
          step: "form",
          eventType: state.eventType,
          slot,
          selectedDuration: state.selectedDuration,
        });
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

      const duration =
        state.selectedDuration !== state.eventType.duration_minutes
          ? state.selectedDuration
          : undefined;

      try {
        // Use multi-attendee format for group bookings
        const booking =
          data.attendees && data.attendees.length > 1
            ? await api.createBooking({
                event_type_id: state.eventType.id,
                start_time: state.slot.start_time,
                attendees: data.attendees,
                notes: data.notes || undefined,
                duration,
              })
            : await api.createBooking({
                event_type_id: state.eventType.id,
                start_time: state.slot.start_time,
                invitee_name: data.name,
                invitee_email: data.email,
                invitee_timezone: timezone,
                notes: data.notes || undefined,
                duration,
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
    setState(resolveLoadedState(demoEventType));
    setSelectedDate(null);
  }, []);

  const handleBackToCalendar = useCallback(() => {
    if (state.step === "timeslots" || state.step === "form") {
      const options = state.eventType.duration_options;
      if (options && options.length >= 2) {
        setState({ step: "duration", eventType: state.eventType });
      } else {
        setState({
          step: "calendar",
          eventType: state.eventType,
          selectedDuration: state.selectedDuration,
        });
      }
      setSelectedDate(null);
    }
  }, [state]);

  const handleBackToSlots = useCallback(() => {
    if (state.step === "form" && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [state, selectedDate, fetchSlots]);

  const handleWaitlistSelect = useCallback(() => {
    if (state.step === "timeslots") {
      setSubmitError(null);
      setState({
        step: "waitlist-form",
        eventType: state.eventType,
        date: state.date,
        selectedDuration: state.selectedDuration,
      });
    }
  }, [state]);

  const handleWaitlistSubmit = useCallback(
    async (data: { name: string; email: string; notes: string }) => {
      if (state.step !== "waitlist-form") return;

      setSubmitting(true);
      setSubmitError(null);
      try {
        const entry = await api.createWaitlistEntry({
          event_type_id: state.eventType.id,
          invitee_name: data.name,
          invitee_email: data.email,
          invitee_timezone: timezone,
          notes: data.notes || undefined,
        });
        setState({ step: "waitlist-confirmation", eventType: state.eventType, entry });
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

  const handleBackFromWaitlistForm = useCallback(() => {
    if (state.step === "waitlist-form" && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [state, selectedDate, fetchSlots]);

  const handleRetry = useCallback(() => {
    setState({ step: "loading" });
    // Re-trigger loading effect by resetting
    (async () => {
      try {
        const eventType = await api.getEventType(config.eventTypeId);
        setState(resolveLoadedState(eventType));
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
      {/* Header - shown for duration, calendar, timeslots, form, and waitlist states */}
      {(state.step === "duration" ||
        state.step === "calendar" ||
        state.step === "timeslots" ||
        state.step === "form" ||
        state.step === "waitlist-form" ||
        state.step === "waitlist-confirmation") && (
        <div class="astrocal-widget-header">
          <h2>{state.eventType.title}</h2>
          {state.eventType.description && <p>{state.eventType.description}</p>}
          {state.step !== "duration" &&
            state.step !== "waitlist-form" &&
            state.step !== "waitlist-confirmation" && (
              <div class="astrocal-duration">{state.selectedDuration} min</div>
            )}
        </div>
      )}

      <div class="astrocal-widget-body">
        {state.step === "loading" && (
          <div class="astrocal-loading">
            <div class="astrocal-spinner" role="status" aria-label="Loading" />
          </div>
        )}

        {state.step === "error" && <ErrorScreen error={state.error} onRetry={handleRetry} />}

        {state.step === "duration" && (
          <DurationSelector eventType={state.eventType} onSelect={handleDurationSelect} />
        )}

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
              waitlistAvailable={waitlistAvailableForDate}
              onWaitlistSelect={handleWaitlistSelect}
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

        {state.step === "waitlist-form" && (
          <WaitlistForm
            eventType={state.eventType}
            date={state.date}
            timezone={timezone}
            submitting={submitting}
            error={submitError}
            onSubmit={handleWaitlistSubmit}
            onBack={handleBackFromWaitlistForm}
          />
        )}

        {state.step === "waitlist-confirmation" && (
          <WaitlistConfirmation
            eventType={state.eventType}
            entry={state.entry}
            timezone={timezone}
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
