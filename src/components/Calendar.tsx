import { useState, useCallback, useRef, useEffect } from "preact/hooks";
import {
  daysInMonth,
  firstDayOfMonth,
  formatMonthYear,
  toDateString,
  todayInTimezone,
} from "../utils/dates";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarProps {
  timezone: string;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function Calendar({ timezone, selectedDate, onDateSelect }: CalendarProps) {
  const today = todayInTimezone(timezone);
  const [year, setYear] = useState(() => parseInt(today.slice(0, 4), 10));
  const [month, setMonth] = useState(() => parseInt(today.slice(5, 7), 10));
  const gridRef = useRef<HTMLDivElement>(null);

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = useCallback(() => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const todayYear = parseInt(today.slice(0, 4), 10);
  const todayMonth = parseInt(today.slice(5, 7), 10);
  const canGoPrev = year > todayYear || (year === todayYear && month > todayMonth);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedDate) return;

      const current = new Date(selectedDate + "T00:00:00");
      let next: Date | null = null;

      switch (e.key) {
        case "ArrowLeft":
          next = new Date(current);
          next.setDate(current.getDate() - 1);
          break;
        case "ArrowRight":
          next = new Date(current);
          next.setDate(current.getDate() + 1);
          break;
        case "ArrowUp":
          next = new Date(current);
          next.setDate(current.getDate() - 7);
          break;
        case "ArrowDown":
          next = new Date(current);
          next.setDate(current.getDate() + 7);
          break;
        default:
          return;
      }

      e.preventDefault();
      const nextStr = toDateString(next);
      if (nextStr >= today) {
        onDateSelect(nextStr);
        // Update month/year if navigating to different month
        const nextMonth = next.getMonth() + 1;
        const nextYear = next.getFullYear();
        if (nextMonth !== month || nextYear !== year) {
          setMonth(nextMonth);
          setYear(nextYear);
        }
      }
    },
    [selectedDate, today, month, year, onDateSelect],
  );

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.addEventListener("keydown", handleKeyDown);
    return () => grid.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const days: Array<{ day: number; dateStr: string; isToday: boolean; isPast: boolean }> = [];
  for (let d = 1; d <= totalDays; d++) {
    const m = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${year}-${m}-${dd}`;
    days.push({
      day: d,
      dateStr,
      isToday: dateStr === today,
      isPast: dateStr < today,
    });
  }

  return (
    <div>
      <div class="astrocal-calendar-nav">
        <button
          type="button"
          class="astrocal-nav-btn"
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          &#8249;
        </button>
        <span>{formatMonthYear(year, month)}</span>
        <button type="button" class="astrocal-nav-btn" onClick={nextMonth} aria-label="Next month">
          &#8250;
        </button>
      </div>
      <div ref={gridRef} class="astrocal-calendar-grid" role="grid" aria-label="Calendar">
        {DAY_NAMES.map((name) => (
          <div key={name} class="astrocal-day-header" role="columnheader">
            {name}
          </div>
        ))}
        {Array.from({ length: startDay }, (_, i) => (
          <div key={`empty-${i}`} class="astrocal-day astrocal-day--empty" />
        ))}
        {days.map(({ day, dateStr, isToday, isPast }) => {
          const isSelected = dateStr === selectedDate;
          const classes = [
            "astrocal-day",
            isToday && "astrocal-day--today",
            isSelected && "astrocal-day--selected",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={dateStr}
              type="button"
              class={classes}
              disabled={isPast}
              onClick={() => onDateSelect(dateStr)}
              aria-label={`${dateStr}${isToday ? ", today" : ""}${isSelected ? ", selected" : ""}`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              role="gridcell"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
