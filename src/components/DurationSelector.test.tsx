import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { DurationSelector } from "./DurationSelector";
import type { EventType } from "../types";

describe("DurationSelector", () => {
  const baseEventType: EventType = {
    id: "evt-123",
    organization_id: "org-456",
    title: "Consultation",
    slug: "consultation",
    description: "Pick how long you need.",
    duration_minutes: 30,
    duration_options: [15, 30, 60],
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    color: "#3b82f6",
    timezone: "America/New_York",
    active: true,
    is_test: false,
    price_amount: null,
    price_currency: "usd",
    max_attendees: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  it("renders one button per duration option", () => {
    render(<DurationSelector eventType={baseEventType} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "15 min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "60 min" })).toBeInTheDocument();
  });

  it("renders 'Choose a duration' heading", () => {
    render(<DurationSelector eventType={baseEventType} onSelect={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Choose a duration" })).toBeInTheDocument();
  });

  it("calls onSelect with correct duration when button is clicked", () => {
    const onSelect = vi.fn();
    render(<DurationSelector eventType={baseEventType} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "60 min" }));

    expect(onSelect).toHaveBeenCalledWith(60);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when duration_options is null", () => {
    const eventType = { ...baseEventType, duration_options: null };
    const { container } = render(<DurationSelector eventType={eventType} onSelect={vi.fn()} />);

    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when duration_options is empty", () => {
    const eventType = { ...baseEventType, duration_options: [] as number[] };
    const { container } = render(<DurationSelector eventType={eventType} onSelect={vi.fn()} />);

    expect(container.innerHTML).toBe("");
  });

  it("renders two buttons for two duration options", () => {
    const eventType = { ...baseEventType, duration_options: [15, 30] };
    render(<DurationSelector eventType={eventType} onSelect={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("15 min");
    expect(buttons[1]).toHaveTextContent("30 min");
  });
});
