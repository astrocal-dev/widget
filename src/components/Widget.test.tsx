import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/preact";
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
