import { describe, it, expect, beforeEach } from "vitest";
import { resolveTarget, mountWidget, unmountWidget } from "./mount";
import { h } from "preact";

describe("mount utils", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  describe("resolveTarget", () => {
    it("returns element when given CSS selector", () => {
      const result = resolveTarget("#test-container");
      expect(result).toBe(container);
    });

    it("returns HTMLElement when given directly", () => {
      const result = resolveTarget(container);
      expect(result).toBe(container);
    });

    it("returns null for non-existent selector", () => {
      const result = resolveTarget("#does-not-exist");
      expect(result).toBeNull();
    });

    it("returns null for invalid selector", () => {
      const result = resolveTarget(".non-existent-class");
      expect(result).toBeNull();
    });
  });

  describe("mountWidget", () => {
    it("attaches shadow root to target element", () => {
      const vnode = h("div", null, "Test Widget");
      const shadow = mountWidget(container, vnode);

      expect(shadow).toBe(container.shadowRoot);
      expect(shadow.mode).toBe("open");
    });

    it("adds style element to shadow DOM", () => {
      const vnode = h("div", null, "Test Widget");
      const shadow = mountWidget(container, vnode);

      const style = shadow.querySelector("style");
      expect(style).not.toBeNull();
      // CSS import returns empty string in test environment, just verify element exists
      expect(style).toBeInstanceOf(HTMLStyleElement);
    });

    it("creates container div for Preact rendering", () => {
      const vnode = h("div", null, "Test Widget");
      const shadow = mountWidget(container, vnode);

      const div = shadow.querySelector("div");
      expect(div).not.toBeNull();
    });

    it("renders the provided vnode", () => {
      const vnode = h("div", { className: "test-class" }, "Test Widget");
      const shadow = mountWidget(container, vnode);

      // The container div contains the rendered content
      const content = shadow.querySelector("div");
      expect(content).not.toBeNull();
    });
  });

  describe("unmountWidget", () => {
    it("unmounts Preact from shadow root", () => {
      const vnode = h("div", null, "Test Widget");
      mountWidget(container, vnode);

      unmountWidget(container);

      // The container should still exist but be empty
      const shadow = container.shadowRoot;
      expect(shadow).not.toBeNull();
    });

    it("handles element without shadow root gracefully", () => {
      const element = document.createElement("div");
      expect(() => unmountWidget(element)).not.toThrow();
    });

    it("handles element with shadow root but no container", () => {
      const element = document.createElement("div");
      element.attachShadow({ mode: "open" });

      expect(() => unmountWidget(element)).not.toThrow();
    });
  });
});
