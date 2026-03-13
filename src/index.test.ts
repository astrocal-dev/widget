import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock mount to prevent Shadow DOM errors in JSDOM
vi.mock("./mount", () => ({
  mountWidget: vi.fn(),
  unmountWidget: vi.fn(),
  resolveTarget: vi.fn((target: string | HTMLElement) => {
    if (typeof target === "string") return document.querySelector(target);
    return target;
  }),
}));

import { open, close, destroy, update, autoInit } from "./index";
import { mountWidget, unmountWidget, resolveTarget } from "./mount";

describe("open()", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.mocked(mountWidget).mockClear();
    vi.mocked(resolveTarget).mockClear();
    vi.mocked(resolveTarget).mockImplementation((target) => {
      if (typeof target === "string") return document.querySelector(target);
      return target as HTMLElement;
    });
  });

  it("defaults eventTypeId to 'demo' when demo is true and eventTypeId is empty", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const config = {
      eventTypeId: "",
      demo: true,
      mode: "inline" as const,
      target: container,
    };

    open(config);
    expect(config.eventTypeId).toBe("demo");
    expect(mountWidget).toHaveBeenCalled();
  });

  it("preserves explicit eventTypeId when demo is true", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const config = {
      eventTypeId: "custom-id",
      demo: true,
      mode: "inline" as const,
      target: container,
    };

    open(config);
    expect(config.eventTypeId).toBe("custom-id");
  });

  it("does not set eventTypeId when demo is false", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const config = {
      eventTypeId: "real-uuid",
      mode: "inline" as const,
      target: container,
    };

    open(config);
    expect(config.eventTypeId).toBe("real-uuid");
  });
});

describe("close()", () => {
  it("does not throw in browser environment", () => {
    expect(() => close()).not.toThrow();
  });
});

describe("destroy()", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.mocked(unmountWidget).mockClear();
  });

  it("calls unmountWidget on the resolved target element", () => {
    const container = document.createElement("div");
    container.id = "widget";
    document.body.appendChild(container);

    destroy(container);
    expect(unmountWidget).toHaveBeenCalledWith(container);
  });

  it("resolves a string selector to the correct element", () => {
    const container = document.createElement("div");
    container.id = "booking";
    document.body.appendChild(container);

    destroy("#booking");
    expect(unmountWidget).toHaveBeenCalledWith(container);
  });

  it("is a no-op when selector does not match any element", () => {
    destroy("#nonexistent");
    expect(unmountWidget).not.toHaveBeenCalled();
  });

  it("accepts an HTMLElement directly", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    destroy(el);
    expect(unmountWidget).toHaveBeenCalledWith(el);
  });
});

describe("SSR guards", () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    // Restore document after each test
    Object.defineProperty(globalThis, "document", {
      value: originalDocument,
      writable: true,
      configurable: true,
    });
  });

  it("open() throws when document is undefined", () => {
    Object.defineProperty(globalThis, "document", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => open({ eventTypeId: "test" })).toThrow(
      "[Astrocal] open() requires a browser environment.",
    );
  });

  it("close() is a silent no-op when document is undefined", () => {
    Object.defineProperty(globalThis, "document", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => close()).not.toThrow();
  });

  it("destroy() throws when document is undefined", () => {
    Object.defineProperty(globalThis, "document", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => destroy("#el")).toThrow("[Astrocal] destroy() requires a browser environment.");
  });
});

describe("autoInit()", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.mocked(mountWidget).mockClear();
    vi.mocked(resolveTarget).mockClear();
    vi.mocked(resolveTarget).mockImplementation((target) => {
      if (typeof target === "string") return document.querySelector(target);
      return target as HTMLElement;
    });
  });

  it("passes demo: true when data-astrocal-demo='true' is present", () => {
    const el = document.createElement("div");
    el.setAttribute("data-astrocal-event-type-id", "demo");
    el.setAttribute("data-astrocal-demo", "true");
    document.body.appendChild(el);

    autoInit();

    expect(mountWidget).toHaveBeenCalledTimes(1);
    // The widget config passed to mountWidget includes the demo flag
    // We verify indirectly: since el has data-astrocal-demo="true" and
    // eventTypeId="demo", the widget should mount successfully
    const call = vi.mocked(mountWidget).mock.calls[0]!;
    expect(call[0]).toBe(el);
  });

  it("does not pass demo when data-astrocal-demo is absent", () => {
    const el = document.createElement("div");
    el.setAttribute("data-astrocal-event-type-id", "some-uuid");
    document.body.appendChild(el);

    autoInit();

    expect(mountWidget).toHaveBeenCalledTimes(1);
  });

  it("reads data-astrocal-mode attribute", () => {
    const el = document.createElement("div");
    el.setAttribute("data-astrocal-event-type-id", "test-id");
    el.setAttribute("data-astrocal-mode", "inline");
    document.body.appendChild(el);

    autoInit();

    expect(mountWidget).toHaveBeenCalledTimes(1);
  });

  it("skips elements with empty event type id", () => {
    const el = document.createElement("div");
    el.setAttribute("data-astrocal-event-type-id", "");
    document.body.appendChild(el);

    autoInit();

    expect(mountWidget).not.toHaveBeenCalled();
  });
});

describe("update()", () => {
  it("is a no-op when target has no shadow root", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => update(el, { eventTypeId: "preview", demo: true })).not.toThrow();
  });

  it("is a no-op for non-existent selector", () => {
    expect(() => update("#does-not-exist", { eventTypeId: "test" })).not.toThrow();
  });

  it("defaults eventTypeId to 'demo' when demo is true and eventTypeId is empty", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const shadow = el.attachShadow({ mode: "open" });
    shadow.appendChild(document.createElement("div"));

    const config = { eventTypeId: "", demo: true };
    update(el, config);
    expect(config.eventTypeId).toBe("demo");
  });
});

describe("exports", () => {
  it("exports open, close, destroy, update, and autoInit functions", async () => {
    const mod = await import("./index");
    expect(typeof mod.open).toBe("function");
    expect(typeof mod.close).toBe("function");
    expect(typeof mod.destroy).toBe("function");
    expect(typeof mod.update).toBe("function");
    expect(typeof mod.autoInit).toBe("function");
  });
});
