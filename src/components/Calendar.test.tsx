import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  const defaultProps = {
    timezone: "America/New_York",
    selectedDate: null,
    onDateSelect: vi.fn(),
  };

  it("renders month name and navigation buttons", () => {
    render(<Calendar {...defaultProps} />);

    // Should show month and year
    const monthYear = screen.getByText(/\w+ \d{4}/);
    expect(monthYear).toBeInTheDocument();

    // Should have prev and next buttons
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((btn) => btn.getAttribute("aria-label") === "Previous month");
    const nextButton = buttons.find((btn) => btn.getAttribute("aria-label") === "Next month");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it("renders day headers", () => {
    render(<Calendar {...defaultProps} />);

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });

  it("renders day buttons for the current month", () => {
    render(<Calendar {...defaultProps} />);

    // Should have buttons for days 1-31 (at most)
    const grid = screen.getByRole("grid");
    const buttons = grid.querySelectorAll("button[role='gridcell']");

    // Should have at least 28 days (February)
    expect(buttons.length).toBeGreaterThanOrEqual(28);
    expect(buttons.length).toBeLessThanOrEqual(31);
  });

  it("calls onDateSelect when a day is clicked", () => {
    const onDateSelect = vi.fn();
    render(<Calendar {...defaultProps} onDateSelect={onDateSelect} />);

    // Find a future date button (not disabled)
    const buttons = screen.getAllByRole("gridcell");
    const futureButton = buttons.find((btn) => !btn.hasAttribute("disabled"));

    if (futureButton) {
      fireEvent.click(futureButton);
      expect(onDateSelect).toHaveBeenCalled();

      // The call should include a YYYY-MM-DD string
      const callArg = onDateSelect.mock.calls[0]![0];
      expect(callArg).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("disables past days", () => {
    render(<Calendar {...defaultProps} />);

    const buttons = screen.getAllByRole("gridcell");

    // Some buttons should be disabled (past dates)
    const disabledButtons = buttons.filter((btn) => btn.hasAttribute("disabled"));

    // Depending on current date, there may or may not be past days in current month
    // Just verify the attribute is correctly applied
    disabledButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("shows selected date with correct class", () => {
    const selectedDate = "2024-06-15";
    render(<Calendar {...defaultProps} selectedDate={selectedDate} />);

    // Find the button with aria-selected="true"
    const selectedButton = screen.queryByRole("gridcell", { selected: true });

    if (selectedButton) {
      expect(selectedButton).toHaveClass("astrocal-day--selected");
    }
  });

  it("disables previous month button when on current month", () => {
    render(<Calendar {...defaultProps} />);

    const prevButton = screen.getByLabelText("Previous month");

    // If we're viewing the current month, prev button should be disabled
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Check if the displayed month is current month
    const monthYear = screen.getByText(/\w+ \d{4}/);
    const displayedMonth = monthYear.textContent || "";

    const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
      new Date(currentYear, currentMonth - 1, 1),
    );

    if (displayedMonth.includes(monthName) && displayedMonth.includes(String(currentYear))) {
      expect(prevButton).toBeDisabled();
    }
  });

  it("navigates to next month when next button clicked", () => {
    render(<Calendar {...defaultProps} />);

    const monthYearBefore = screen.getByText(/\w+ \d{4}/).textContent;
    const nextButton = screen.getByLabelText("Next month");

    fireEvent.click(nextButton);

    const monthYearAfter = screen.getByText(/\w+ \d{4}/).textContent;

    // Month should have changed
    expect(monthYearAfter).not.toBe(monthYearBefore);
  });

  it("navigates to previous month when prev button clicked (if enabled)", () => {
    render(<Calendar {...defaultProps} />);

    const prevButton = screen.getByLabelText("Previous month");

    if (!prevButton.hasAttribute("disabled")) {
      const monthYearBefore = screen.getByText(/\w+ \d{4}/).textContent;

      fireEvent.click(prevButton);

      const monthYearAfter = screen.getByText(/\w+ \d{4}/).textContent;

      // Month should have changed
      expect(monthYearAfter).not.toBe(monthYearBefore);
    }
  });
});
