import type { EventType } from "../types";

interface DurationSelectorProps {
  eventType: EventType;
  onSelect: (duration: number) => void;
}

/** Renders pill-style buttons for each duration option. */
export function DurationSelector({ eventType, onSelect }: DurationSelectorProps) {
  if (!eventType.duration_options || eventType.duration_options.length === 0) {
    return null;
  }

  return (
    <div class="astrocal-duration-selector">
      <h3>Choose a duration</h3>
      <div class="astrocal-duration-options">
        {eventType.duration_options.map((duration) => (
          <button
            key={duration}
            type="button"
            class="astrocal-duration-option"
            onClick={() => onSelect(duration)}
          >
            {duration} min
          </button>
        ))}
      </div>
    </div>
  );
}
