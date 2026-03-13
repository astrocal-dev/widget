import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/preact";
import { TimeSlots } from "./TimeSlots";
import type { TimeSlot } from "../types";

/** Mock scroll geometry on a list element. */
function mockScrollGeometry(
  el: HTMLElement,
  {
    scrollTop,
    scrollHeight,
    clientHeight,
  }: { scrollTop: number; scrollHeight: number; clientHeight: number },
) {
  Object.defineProperty(el, "scrollTop", { value: scrollTop, writable: true, configurable: true });
  Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
  Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
}

describe("TimeSlots", () => {
  const mockSlots: TimeSlot[] = [
    { start_time: "2024-01-15T14:00:00Z", end_time: "2024-01-15T14:30:00Z" },
    { start_time: "2024-01-15T15:00:00Z", end_time: "2024-01-15T15:30:00Z" },
    { start_time: "2024-01-15T16:00:00Z", end_time: "2024-01-15T16:30:00Z" },
  ];

  const defaultProps = {
    date: "2024-01-15",
    slots: mockSlots,
    timezone: "America/New_York",
    loading: false,
    onSlotSelect: vi.fn(),
    onBack: vi.fn(),
  };

  it("shows loading spinner when loading is true", () => {
    render(<TimeSlots {...defaultProps} loading={true} />);

    const spinner = screen.getByRole("status", { name: "Loading time slots" });
    expect(spinner).toBeInTheDocument();
  });

  it("shows 'No available times' when slots is empty and not loading", () => {
    render(<TimeSlots {...defaultProps} slots={[]} loading={false} />);

    const emptyMessage = screen.getByRole("status");
    expect(emptyMessage).toHaveTextContent("No available times for this date");
  });

  it("renders slot buttons with formatted times", () => {
    render(<TimeSlots {...defaultProps} />);

    // Should have 3 slot buttons
    const slotButtons = screen.getAllByRole("listitem");
    expect(slotButtons).toHaveLength(3);

    // Each button should show a formatted time (like "9:00 AM")
    slotButtons.forEach((btn) => {
      expect(btn.textContent).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/i);
    });
  });

  it("calls onSlotSelect when slot is clicked", () => {
    const onSlotSelect = vi.fn();
    render(<TimeSlots {...defaultProps} onSlotSelect={onSlotSelect} />);

    const slotButtons = screen.getAllByRole("listitem");
    fireEvent.click(slotButtons[0]!);

    expect(onSlotSelect).toHaveBeenCalledWith(mockSlots[0]);
  });

  it("shows back button that calls onBack", () => {
    const onBack = vi.fn();
    render(<TimeSlots {...defaultProps} onBack={onBack} />);

    const backButton = screen.getByLabelText("Back to calendar");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("displays formatted date in header", () => {
    render(<TimeSlots {...defaultProps} date="2024-01-15" />);

    // Should show the formatted date (e.g., "Monday, January 15")
    const dateElement = screen.getByText(/January 15/i);
    expect(dateElement).toBeInTheDocument();
  });

  it("does not show loading spinner when loading is false", () => {
    render(<TimeSlots {...defaultProps} loading={false} />);

    const spinner = screen.queryByRole("status", { name: "Loading time slots" });
    expect(spinner).not.toBeInTheDocument();
  });

  it("does not show empty message when slots are available", () => {
    render(<TimeSlots {...defaultProps} />);

    const emptyMessage = screen.queryByText("No available times for this date");
    expect(emptyMessage).not.toBeInTheDocument();
  });

  it("renders correct number of slots", () => {
    const manySlots: TimeSlot[] = Array.from({ length: 10 }, (_, i) => ({
      start_time: `2024-01-15T${String(9 + i).padStart(2, "0")}:00:00Z`,
      end_time: `2024-01-15T${String(9 + i).padStart(2, "0")}:30:00Z`,
    }));

    render(<TimeSlots {...defaultProps} slots={manySlots} />);

    const slotButtons = screen.getAllByRole("listitem");
    expect(slotButtons).toHaveLength(10);
  });

  it("shows 'Join Waitlist' button when slots is empty and waitlistAvailable is true", () => {
    const onWaitlistSelect = vi.fn();
    render(
      <TimeSlots
        {...defaultProps}
        slots={[]}
        waitlistAvailable={true}
        onWaitlistSelect={onWaitlistSelect}
      />,
    );

    expect(screen.getByText("This date is fully booked.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join waitlist/i })).toBeInTheDocument();
    expect(screen.queryByText("No available times for this date")).not.toBeInTheDocument();
  });

  it("shows 'No available times' when slots is empty and waitlistAvailable is false", () => {
    render(<TimeSlots {...defaultProps} slots={[]} waitlistAvailable={false} />);

    expect(screen.getByText("No available times for this date")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /join waitlist/i })).not.toBeInTheDocument();
  });

  it("does not show 'Join Waitlist' button when slots is non-empty", () => {
    render(<TimeSlots {...defaultProps} waitlistAvailable={true} />);

    expect(screen.queryByRole("button", { name: /join waitlist/i })).not.toBeInTheDocument();
  });

  it("calls onWaitlistSelect when 'Join Waitlist' button is clicked", () => {
    const onWaitlistSelect = vi.fn();
    render(
      <TimeSlots
        {...defaultProps}
        slots={[]}
        waitlistAvailable={true}
        onWaitlistSelect={onWaitlistSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));
    expect(onWaitlistSelect).toHaveBeenCalledTimes(1);
  });

  it("does not render 'Join Waitlist' button when onWaitlistSelect is undefined", () => {
    render(<TimeSlots {...defaultProps} slots={[]} waitlistAvailable={true} />);

    expect(screen.queryByRole("button", { name: /join waitlist/i })).not.toBeInTheDocument();
    expect(screen.getByText("No available times for this date")).toBeInTheDocument();
  });

  describe("scroll gradient indicators", () => {
    const manySlots: TimeSlot[] = Array.from({ length: 15 }, (_, i) => ({
      start_time: `2024-01-15T${String(8 + i).padStart(2, "0")}:00:00Z`,
      end_time: `2024-01-15T${String(8 + i).padStart(2, "0")}:30:00Z`,
    }));

    function getListEl() {
      return screen.getByRole("list", { name: "Available times" });
    }

    it("shows no gradient classes when all slots fit without scrolling", () => {
      render(<TimeSlots {...defaultProps} />);
      const el = getListEl();
      // scrollHeight === clientHeight → no overflow
      mockScrollGeometry(el, { scrollTop: 0, scrollHeight: 200, clientHeight: 200 });
      act(() => {
        fireEvent.scroll(el);
      });

      expect(el.className).not.toContain("astrocal-slots-can-scroll-up");
      expect(el.className).not.toContain("astrocal-slots-can-scroll-down");
    });

    it("shows only bottom gradient on mount when content overflows", () => {
      render(<TimeSlots {...defaultProps} slots={manySlots} />);
      const el = getListEl();
      mockScrollGeometry(el, { scrollTop: 0, scrollHeight: 800, clientHeight: 300 });
      act(() => {
        fireEvent.scroll(el);
      });

      expect(el.className).not.toContain("astrocal-slots-can-scroll-up");
      expect(el.className).toContain("astrocal-slots-can-scroll-down");
    });

    it("shows both gradients when scrolled to middle", () => {
      render(<TimeSlots {...defaultProps} slots={manySlots} />);
      const el = getListEl();
      mockScrollGeometry(el, { scrollTop: 200, scrollHeight: 800, clientHeight: 300 });
      act(() => {
        fireEvent.scroll(el);
      });

      expect(el.className).toContain("astrocal-slots-can-scroll-up");
      expect(el.className).toContain("astrocal-slots-can-scroll-down");
    });

    it("shows only top gradient when scrolled to bottom", () => {
      render(<TimeSlots {...defaultProps} slots={manySlots} />);
      const el = getListEl();
      mockScrollGeometry(el, { scrollTop: 500, scrollHeight: 800, clientHeight: 300 });
      act(() => {
        fireEvent.scroll(el);
      });

      expect(el.className).toContain("astrocal-slots-can-scroll-up");
      expect(el.className).not.toContain("astrocal-slots-can-scroll-down");
    });

    it("treats scrollTop within threshold as top (no up gradient)", () => {
      render(<TimeSlots {...defaultProps} slots={manySlots} />);
      const el = getListEl();
      // scrollTop = 1 is within the 2px threshold
      mockScrollGeometry(el, { scrollTop: 1, scrollHeight: 800, clientHeight: 300 });
      act(() => {
        fireEvent.scroll(el);
      });

      expect(el.className).not.toContain("astrocal-slots-can-scroll-up");
    });

    it("treats scroll near bottom within threshold as bottom (no down gradient)", () => {
      render(<TimeSlots {...defaultProps} slots={manySlots} />);
      const el = getListEl();
      // 1px away from bottom is within 2px threshold
      mockScrollGeometry(el, { scrollTop: 499, scrollHeight: 800, clientHeight: 300 });
      act(() => {
        fireEvent.scroll(el);
      });

      expect(el.className).not.toContain("astrocal-slots-can-scroll-down");
    });

    it("has no gradient classes during loading state", () => {
      render(<TimeSlots {...defaultProps} slots={manySlots} loading={true} />);

      expect(screen.queryByRole("list", { name: "Available times" })).not.toBeInTheDocument();
    });

    it("has no gradient classes for empty slots", () => {
      render(<TimeSlots {...defaultProps} slots={[]} />);

      expect(screen.queryByRole("list", { name: "Available times" })).not.toBeInTheDocument();
    });

    it("re-evaluates gradients when slots prop changes", () => {
      const { rerender } = render(<TimeSlots {...defaultProps} slots={manySlots} />);
      const el = getListEl();
      mockScrollGeometry(el, { scrollTop: 0, scrollHeight: 800, clientHeight: 300 });
      act(() => {
        fireEvent.scroll(el);
      });
      expect(el.className).toContain("astrocal-slots-can-scroll-down");

      // Re-render with few slots that fit
      rerender(<TimeSlots {...defaultProps} slots={mockSlots} />);
      const el2 = getListEl();
      mockScrollGeometry(el2, { scrollTop: 0, scrollHeight: 200, clientHeight: 200 });
      act(() => {
        fireEvent.scroll(el2);
      });

      expect(el2.className).not.toContain("astrocal-slots-can-scroll-up");
      expect(el2.className).not.toContain("astrocal-slots-can-scroll-down");
    });
  });
});
