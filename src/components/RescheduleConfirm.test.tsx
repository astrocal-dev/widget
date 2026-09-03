import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { RescheduleConfirm } from "./RescheduleConfirm";
import type { EventType, TimeSlot } from "../types";

const eventType: EventType = {
  id: "evt-123",
  organization_id: "org-456",
  title: "30 Minute Meeting",
  slug: "30-min",
  description: null,
  duration_minutes: 30,
  duration_options: null,
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  minimum_notice_minutes: 0,
  color: "#3b82f6",
  timezone: "UTC",
  active: true,
  is_test: false,
  price_amount: null,
  price_currency: "usd",
  max_attendees: 1,
  conferencing_provider: "zoom",
  location: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const slot: TimeSlot = {
  start_time: "2026-03-20T15:00:00Z",
  end_time: "2026-03-20T15:30:00Z",
};

function renderConfirm(overrides: Partial<Parameters<typeof RescheduleConfirm>[0]> = {}) {
  const onConfirm = vi.fn();
  const onBack = vi.fn();
  render(
    <RescheduleConfirm
      eventType={eventType}
      slot={slot}
      currentStartTime="2026-03-18T10:00:00Z"
      timezone="UTC"
      submitting={false}
      error={null}
      onConfirm={onConfirm}
      onBack={onBack}
      {...overrides}
    />,
  );
  return { onConfirm, onBack };
}

describe("RescheduleConfirm", () => {
  it("shows the current and new times", () => {
    renderConfirm();

    expect(screen.getByText("Current time")).toBeInTheDocument();
    expect(screen.getByText(/March 18/)).toBeInTheDocument();
    expect(screen.getByText("New time")).toBeInTheDocument();
    expect(screen.getByText(/March 20/)).toBeInTheDocument();
  });

  it("omits the current time row when it is unknown", () => {
    renderConfirm({ currentStartTime: undefined });

    expect(screen.queryByText("Current time")).not.toBeInTheDocument();
    expect(screen.getByText("New time")).toBeInTheDocument();
  });

  it("submits the trimmed reason", () => {
    const { onConfirm } = renderConfirm();

    fireEvent.input(screen.getByLabelText("Reason (optional)"), {
      target: { value: "  Clash with another call  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm new time" }));

    expect(onConfirm).toHaveBeenCalledWith("Clash with another call");
  });

  it("submits an empty reason when none is given", () => {
    const { onConfirm } = renderConfirm();

    fireEvent.click(screen.getByRole("button", { name: "Confirm new time" }));

    expect(onConfirm).toHaveBeenCalledWith("");
  });

  it("disables confirmation when the new slot is the current time", () => {
    const { onConfirm } = renderConfirm({ currentStartTime: slot.start_time });

    const button = screen.getByRole("button", { name: "Confirm new time" });
    expect(button).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(/same time/i);

    fireEvent.submit(button.closest("form")!);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows the submitting label and disables the button", () => {
    renderConfirm({ submitting: true });

    expect(screen.getByRole("button", { name: "Rescheduling..." })).toBeDisabled();
  });

  it("renders the API error", () => {
    renderConfirm({
      error: { code: "slot_unavailable", message: "This time slot is no longer available" },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("no longer available");
  });

  it("calls onBack from the back button", () => {
    const { onBack } = renderConfirm();

    fireEvent.click(screen.getByLabelText("Back to time slots"));

    expect(onBack).toHaveBeenCalled();
  });

  it("caps the reason at 500 characters", () => {
    renderConfirm();

    expect(screen.getByLabelText("Reason (optional)")).toHaveAttribute("maxlength", "500");
  });
});

describe("RescheduleConfirm slot taken", () => {
  it("offers a way back to the slots when the slot was taken", () => {
    const { onBack } = renderConfirm({
      error: { code: "slot_unavailable", message: "This time slot is no longer available" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Pick another time" }));

    expect(onBack).toHaveBeenCalled();
  });

  it("does not offer the shortcut for other errors", () => {
    renderConfirm({ error: { code: "network_error", message: "Offline" } });

    expect(screen.queryByRole("button", { name: "Pick another time" })).not.toBeInTheDocument();
  });

  it("renders the local calendar day for the booker's timezone", () => {
    renderConfirm({
      currentStartTime: "2026-09-11T02:00:00Z",
      slot: { start_time: "2026-09-12T02:00:00Z", end_time: "2026-09-12T02:30:00Z" },
      timezone: "America/New_York",
    });

    expect(screen.getByText(/Thursday, September 10 at 10:00\s?PM/)).toBeInTheDocument();
    expect(screen.getByText(/Friday, September 11 at 10:00\s?PM/)).toBeInTheDocument();
  });
});
