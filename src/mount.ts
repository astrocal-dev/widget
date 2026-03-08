import { render } from "preact";
import type { VNode } from "preact";
import widgetCSS from "./styles/widget.css";

/** Detects whether the host page is in dark mode. */
function detectDarkMode(): boolean {
  // Check for .dark class on <html> (Tailwind / Fumadocs / Next.js convention)
  if (document.documentElement.classList.contains("dark")) return true;
  // Check for data-theme="dark" attribute
  if (document.documentElement.getAttribute("data-theme") === "dark") return true;
  // Default to light — follow the website's explicit theme, not the OS
  return false;
}

/** Sets the data-theme attribute on the host element. */
function applyColorScheme(host: HTMLElement, colorScheme: "light" | "dark" | "auto"): void {
  if (colorScheme === "auto") {
    host.setAttribute("data-theme", detectDarkMode() ? "dark" : "light");
  } else {
    host.setAttribute("data-theme", colorScheme);
  }
}

/** Observes theme changes on the host page and syncs to the widget host element. */
function observeThemeChanges(
  host: HTMLElement,
  colorScheme: "light" | "dark" | "auto",
): (() => void) | undefined {
  if (colorScheme !== "auto") return undefined;

  // Watch for class changes on <html> (Tailwind dark mode toggle)
  const observer = new MutationObserver(() => {
    applyColorScheme(host, "auto");
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  return () => {
    observer.disconnect();
  };
}

/** Mounts a Preact VNode into a Shadow DOM attached to the target element. */
export function mountWidget(
  target: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vnode: VNode<any>,
  colorScheme: "light" | "dark" | "auto" = "auto",
): ShadowRoot {
  const shadow = target.attachShadow({ mode: "open" });

  // Inject styles into Shadow DOM for isolation
  const style = document.createElement("style");
  style.textContent = widgetCSS;
  shadow.appendChild(style);

  // Apply color scheme and observe changes
  applyColorScheme(target, colorScheme);
  const cleanup = observeThemeChanges(target, colorScheme);

  // Store cleanup function for unmount
  (target as unknown as Record<string, unknown>).__astrocal_cleanup = cleanup;

  // Create a container for Preact to render into
  const container = document.createElement("div");
  shadow.appendChild(container);

  render(vnode, container);
  return shadow;
}

/** Unmounts the widget from a Shadow DOM host. */
export function unmountWidget(target: HTMLElement): void {
  // Clean up theme observer
  const cleanup = (target as unknown as Record<string, unknown>).__astrocal_cleanup as
    | (() => void)
    | undefined;
  cleanup?.();

  const shadow = target.shadowRoot;
  if (shadow) {
    // Find the Preact container and unmount
    const container = shadow.querySelector("div");
    if (container) {
      render(null, container);
    }
  }
}

/** Resolves a target to an HTMLElement. Accepts a CSS selector or element. */
export function resolveTarget(target: string | HTMLElement): HTMLElement | null {
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target);
  }
  return target;
}
