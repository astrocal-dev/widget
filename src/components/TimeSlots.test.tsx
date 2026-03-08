import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { TimeSlots } from "./TimeSlots";
import type { TimeSlot } from "../types";

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
});
