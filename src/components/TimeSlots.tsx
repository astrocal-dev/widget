import { useRef, useEffect, useState } from "preact/hooks";
import type { TimeSlot } from "../types";
import { formatTime, formatDate } from "../utils/dates";

const SCROLL_THRESHOLD = 2;

interface TimeSlotsProps {
  date: string;
  slots: TimeSlot[];
  timezone: string;
  loading: boolean;
  onSlotSelect: (slot: TimeSlot) => void;
  onBack: () => void;
  waitlistAvailable?: boolean;
  onWaitlistSelect?: () => void;
}

export function TimeSlots({
  date,
  slots,
  timezone,
  loading,
  onSlotSelect,
  onBack,
  waitlistAvailable,
  onWaitlistSelect,
}: TimeSlotsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Manually handle wheel events and track scroll state for gradient indicators.
  // Shadow DOM + overflow:hidden ancestors prevent native scroll propagation.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const updateScrollState = () => {
      setCanScrollUp(el.scrollTop > SCROLL_THRESHOLD);
      setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - SCROLL_THRESHOLD);
    };

    updateScrollState();

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
      if (!atTop && !atBottom) {
        e.preventDefault();
        el.scrollTop += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [slots]);

  return (
    <div>
      <div class="astrocal-slots-header">
        <button
          type="button"
          class="astrocal-slots-back"
          onClick={onBack}
          aria-label="Back to calendar"
        >
          &#8249;
        </button>
        <span class="astrocal-slots-date">{formatDate(date)}</span>
      </div>

      {loading ? (
        <div class="astrocal-loading">
          <div class="astrocal-spinner" role="status" aria-label="Loading time slots" />
        </div>
      ) : slots.length === 0 ? (
        <div class="astrocal-slots-empty" role="status">
          {waitlistAvailable && onWaitlistSelect ? (
            <>
              <p>This date is fully booked.</p>
              <button
                type="button"
                class="astrocal-waitlist-btn"
                onClick={onWaitlistSelect}
                aria-label="Join waitlist for this date"
              >
                Join Waitlist
              </button>
            </>
          ) : (
            "No available times for this date"
          )}
        </div>
      ) : (
        <div
          ref={listRef}
          class={[
            "astrocal-slots-list",
            canScrollUp && "astrocal-slots-can-scroll-up",
            canScrollDown && "astrocal-slots-can-scroll-down",
          ]
            .filter(Boolean)
            .join(" ")}
          role="list"
          aria-label="Available times"
        >
          {slots.map((slot) => (
            <button
              key={slot.start_time}
              type="button"
              class="astrocal-slot"
              onClick={() => onSlotSelect(slot)}
              role="listitem"
            >
              {formatTime(slot.start_time, timezone)}
              {slot.spots_remaining != null && (
                <span class="astrocal-slot-spots">
                  {slot.spots_remaining} {slot.spots_remaining === 1 ? "spot" : "spots"} left
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
