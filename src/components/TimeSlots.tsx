import type { TimeSlot } from "../types";
import { formatTime, formatDate } from "../utils/dates";

interface TimeSlotsProps {
  date: string;
  slots: TimeSlot[];
  timezone: string;
  loading: boolean;
  onSlotSelect: (slot: TimeSlot) => void;
  onBack: () => void;
}

export function TimeSlots({
  date,
  slots,
  timezone,
  loading,
  onSlotSelect,
  onBack,
}: TimeSlotsProps) {
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
          No available times for this date
        </div>
      ) : (
        <div class="astrocal-slots-list" role="list" aria-label="Available times">
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
