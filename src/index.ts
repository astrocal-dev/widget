import { h, render } from "preact";
import type { WidgetConfig, ThemeConfig, BookingResult, WidgetError } from "./types";
import { mountWidget, unmountWidget, resolveTarget } from "./mount";
import { Widget } from "./components/Widget";
import { PopupOverlay } from "./components/PopupOverlay";

export type { WidgetConfig, ThemeConfig, BookingResult, WidgetError };

/** Active popup host element (for close()). */
let popupHost: HTMLElement | null = null;

/** Applies theme CSS custom properties to an element. */
function applyTheme(el: HTMLElement, theme?: ThemeConfig): void {
  if (!theme) return;
  if (theme.primaryColor) el.style.setProperty("--astrocal-primary", theme.primaryColor);
  if (theme.primaryHoverColor)
    el.style.setProperty("--astrocal-primary-hover", theme.primaryHoverColor);
  if (theme.headingColor) el.style.setProperty("--astrocal-heading", theme.headingColor);
  if (theme.backgroundColor) el.style.setProperty("--astrocal-bg", theme.backgroundColor);
  if (theme.textColor) el.style.setProperty("--astrocal-text", theme.textColor);
  if (theme.borderColor) el.style.setProperty("--astrocal-border", theme.borderColor);
  if (theme.borderFocusColor)
    el.style.setProperty("--astrocal-border-focus", theme.borderFocusColor);
  if (theme.borderRadius) el.style.setProperty("--astrocal-radius", theme.borderRadius);
  if (theme.fontFamily) el.style.setProperty("--astrocal-font", theme.fontFamily);
}

/**
 * Opens the Astrocal booking widget.
 *
 * In "inline" mode, mounts into the specified target element.
 * In "popup" mode, renders a modal overlay.
 * In demo mode, defaults eventTypeId to "demo" if not provided.
 */
export function open(config: WidgetConfig): void {
  if (typeof document === "undefined") {
    throw new Error("[Astrocal] open() requires a browser environment.");
  }

  if (config.demo && !config.eventTypeId) {
    config.eventTypeId = "demo";
  }

  const mode = config.mode || "popup";

  if (mode === "inline") {
    const target = config.target ? resolveTarget(config.target) : null;
    if (!target) {
      console.error("[Astrocal] Target element not found for inline mode.");
      return;
    }

    applyTheme(target, config.theme);
    mountWidget(target, h(Widget, { config }), config.colorScheme || "auto");
  } else {
    // Popup mode
    closePopup();

    const host = document.createElement("div");
    host.setAttribute("data-astrocal-popup", "true");
    document.body.appendChild(host);
    popupHost = host;

    applyTheme(host, config.theme);

    const handleClose = () => {
      closePopup();
      config.onClose?.();
    };

    const widgetVNode = h(Widget, { config });
    const popupVNode = h(PopupOverlay, { onClose: handleClose, children: widgetVNode });
    mountWidget(host, popupVNode, config.colorScheme || "auto");
  }
}

/**
 * Updates an inline widget in-place with a new config.
 * Re-renders via Preact VDOM diffing into the existing shadow DOM —
 * preserves component state (selected date, step) while updating
 * props like title, description, and duration.
 * No-op if no widget is mounted on the target.
 */
export function update(target: string | HTMLElement, config: WidgetConfig): void {
  if (typeof document === "undefined") return;
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const shadow = el.shadowRoot;
  if (!shadow) return;
  const container = shadow.querySelector("div");
  if (!container) return;

  if (config.demo && !config.eventTypeId) {
    config.eventTypeId = "demo";
  }

  applyTheme(el, config.theme);
  render(h(Widget, { config }), container);
}

/** Closes the popup widget (if open). No-op in server environments. */
export function close(): void {
  if (typeof document === "undefined") return;
  closePopup();
}

/**
 * Destroys an inline widget mounted on a target element.
 * Removes the Shadow DOM host and cleans up Preact's VDOM.
 * No-op if no widget is mounted on the target.
 */
export function destroy(target: string | HTMLElement): void {
  if (typeof document === "undefined") {
    throw new Error("[Astrocal] destroy() requires a browser environment.");
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (el) {
    unmountWidget(el);
  }
}

function closePopup(): void {
  if (popupHost) {
    unmountWidget(popupHost);
    popupHost.remove();
    popupHost = null;
  }
}

/**
 * Auto-initializes widgets from `data-astrocal-*` attributes.
 *
 * Usage:
 * ```html
 * <div data-astrocal-event-type-id="uuid" data-astrocal-mode="inline"></div>
 * <div data-astrocal-event-type-id="demo" data-astrocal-demo="true"></div>
 * ```
 */
/** @internal Exported for testing only. */
export function autoInit(): void {
  const elements = document.querySelectorAll<HTMLElement>("[data-astrocal-event-type-id]");
  elements.forEach((el) => {
    const eventTypeId = el.getAttribute("data-astrocal-event-type-id");
    if (!eventTypeId) return;

    const mode = (el.getAttribute("data-astrocal-mode") as "inline" | "popup") || "inline";
    const apiUrl = el.getAttribute("data-astrocal-api-url") || undefined;
    const demo = el.getAttribute("data-astrocal-demo") === "true";

    // Parse theme overrides from data attributes
    const theme: ThemeConfig = {};
    const themeMap: Record<string, keyof ThemeConfig> = {
      "data-astrocal-primary-color": "primaryColor",
      "data-astrocal-primary-hover-color": "primaryHoverColor",
      "data-astrocal-heading-color": "headingColor",
      "data-astrocal-background-color": "backgroundColor",
      "data-astrocal-text-color": "textColor",
      "data-astrocal-border-color": "borderColor",
      "data-astrocal-border-focus-color": "borderFocusColor",
      "data-astrocal-border-radius": "borderRadius",
      "data-astrocal-font-family": "fontFamily",
    };
    for (const [attr, prop] of Object.entries(themeMap)) {
      const val = el.getAttribute(attr);
      if (val) theme[prop] = val;
    }
    const hasTheme = Object.keys(theme).length > 0;

    open({
      eventTypeId,
      apiUrl,
      mode,
      target: el,
      demo: demo || undefined,
      theme: hasTheme ? theme : undefined,
    });
  });
}

// Auto-init on DOMContentLoaded
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
}
