import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { Widget } from "./Widget";
import { DEMO_EVENT_TYPE } from "../utils/demo-data";

// Mock child components to avoid deep rendering
vi.mock("./Calendar", () => ({
  Calendar: () => <div data-testid="calendar" />,
}));
vi.mock("./TimezoneSelect", () => ({
  TimezoneSelect: () => <div data-testid="timezone-select" />,
}));

describe("Widget demoEventType merge", () => {
  it("uses default demo title when demoEventType is not provided", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
        }}
      />,
    );

    expect(screen.getByText(DEMO_EVENT_TYPE.title)).toBeInTheDocument();
  });

  it("overrides title when demoEventType.title is provided", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: { title: "Custom Meeting" },
        }}
      />,
    );

    expect(screen.getByText("Custom Meeting")).toBeInTheDocument();
    expect(screen.queryByText(DEMO_EVENT_TYPE.title)).not.toBeInTheDocument();
  });

  it("overrides duration when demoEventType.duration_minutes is provided", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: { duration_minutes: 60 },
        }}
      />,
    );

    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.queryByText("30 min")).not.toBeInTheDocument();
  });

  it("preserves default fields when only partial override is given", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: { title: "Quick Chat" },
        }}
      />,
    );

    // Title overridden
    expect(screen.getByText("Quick Chat")).toBeInTheDocument();
    // Default duration preserved
    expect(screen.getByText(`${DEMO_EVENT_TYPE.duration_minutes} min`)).toBeInTheDocument();
    // Default description preserved
    expect(screen.getByText(DEMO_EVENT_TYPE.description!)).toBeInTheDocument();
  });

  it("overrides description when demoEventType.description is provided", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: { description: "A custom description" },
        }}
      />,
    );

    expect(screen.getByText("A custom description")).toBeInTheDocument();
    expect(screen.queryByText(DEMO_EVENT_TYPE.description!)).not.toBeInTheDocument();
  });
});

describe("Widget duration selector", () => {
  it("shows duration step when demo event type has 2+ duration_options", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: { duration_options: [15, 30, 60] },
        }}
      />,
    );

    expect(screen.getByText("Choose a duration")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "15 min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "60 min" })).toBeInTheDocument();
    // Calendar should NOT be visible yet
    expect(screen.queryByTestId("calendar")).not.toBeInTheDocument();
  });

  it("skips duration step when duration_options is null", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
        }}
      />,
    );

    expect(screen.queryByText("Choose a duration")).not.toBeInTheDocument();
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
  });

  it("skips duration step when duration_options has exactly 1 entry", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: { duration_options: [45] },
        }}
      />,
    );

    expect(screen.queryByText("Choose a duration")).not.toBeInTheDocument();
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
    // Header should show the single duration option
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("transitions from duration to calendar when option is selected", () => {
    render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: { duration_options: [15, 30, 60] },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "60 min" }));

    // Should now show calendar
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
    // Duration step should be gone
    expect(screen.queryByText("Choose a duration")).not.toBeInTheDocument();
    // Header should show selected duration
    expect(screen.getByText("60 min")).toBeInTheDocument();
  });

  it("shows event type header on duration step (title + description, no duration badge)", () => {
    const { container } = render(
      <Widget
        config={{
          eventTypeId: "demo",
          demo: true,
          demoEventType: {
            title: "Strategy Session",
            description: "Let's plan",
            duration_options: [30, 60],
          },
        }}
      />,
    );

    expect(screen.getByText("Strategy Session")).toBeInTheDocument();
    expect(screen.getByText("Let's plan")).toBeInTheDocument();
    // Duration badge in the header should NOT be shown on the duration step
    expect(container.querySelector(".astrocal-duration")).not.toBeInTheDocument();
  });
});
