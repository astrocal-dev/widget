# @astrocal/widget

**Add scheduling to any website in under 60 seconds.** The official embeddable booking widget from [Astrocal](https://astrocal.dev) — the API-first scheduling platform built for developers.

Drop in a script tag or install from npm. Your visitors book meetings directly on your site — no redirects, no iframes, no Calendly branding.

[Get started free](https://astrocal.dev/signup) | [Widget Documentation](https://astrocal.dev/docs/guides/widget) | [Live Demo](https://astrocal.dev)

## Why Astrocal's Widget?

- **Shadow DOM isolation** — Widget styles never leak into or clash with your site's CSS. Zero conflicts, guaranteed.
- **Fully themeable** — Match your brand with CSS custom properties. Override colors, fonts, border radius, and more.
- **Popup or inline** — Open as a modal overlay, or embed directly into any container on your page.
- **Whitelabel ready** — Remove Astrocal branding on [paid plans](https://astrocal.dev/pricing). It's your booking experience.
- **Mobile-first** — Responsive from 320px up. Looks great on every screen size.
- **SSR safe** — Works with Next.js, Nuxt, Astro, and any SSR framework. No hydration errors.
- **Light, dark, and auto** — Respects `prefers-color-scheme` or set it explicitly.

## Quick Start (Script Tag)

No build step required. Load from CDN and go:

```html
<script src="https://cdn.astrocal.dev/widget/latest/astrocal.js"></script>
<script>
  Astrocal.open({
    eventTypeId: "your-event-type-id",
    mode: "popup",
  });
</script>
```

Or use data attributes for zero-JavaScript setup:

```html
<script src="https://cdn.astrocal.dev/widget/latest/astrocal.js"></script>
<div data-astrocal-event-type-id="your-event-type-id" data-astrocal-mode="inline"></div>
```

## Quick Start (npm)

```bash
npm install @astrocal/widget
```

```typescript
import { open } from "@astrocal/widget";

open({
  eventTypeId: "your-event-type-id",
  mode: "popup",
});
```

## Inline Mode

Mount the widget into a specific DOM element:

```typescript
import { open, destroy } from "@astrocal/widget";

// Mount into a container
open({
  eventTypeId: "your-event-type-id",
  mode: "inline",
  target: "#booking-container",
});

// Clean up when done
destroy("#booking-container");
```

## API

### `open(config: WidgetConfig): void`

Opens the booking widget in inline or popup mode.

### `close(): void`

Closes the popup widget if open. No-op if no popup is active.

### `destroy(target: string | HTMLElement): void`

Destroys an inline widget mounted on a target element. Removes the Shadow DOM and cleans up all resources. No-op if no widget is mounted on the target.

### `autoInit(): void`

Scans the DOM for elements with `data-astrocal-*` attributes and mounts widgets automatically.

## Configuration

| Property           | Type                               | Default                      | Description                                |
| ------------------ | ---------------------------------- | ---------------------------- | ------------------------------------------ |
| `eventTypeId`      | `string`                           | required                     | Event type UUID to display                 |
| `apiUrl`           | `string`                           | `"https://api.astrocal.dev"` | API base URL                               |
| `mode`             | `"inline" \| "popup"`              | `"popup"`                    | Render mode                                |
| `target`           | `string \| HTMLElement`            | ---                          | DOM element or CSS selector (inline mode)  |
| `timezone`         | `string`                           | auto-detected                | IANA timezone override                     |
| `theme`            | `ThemeConfig`                      | ---                          | CSS custom property overrides              |
| `colorScheme`      | `"light" \| "dark" \| "auto"`      | `"auto"`                     | Color scheme                               |
| `demo`             | `boolean`                          | `false`                      | Enable demo mode (mock data, no API calls) |
| `onBookingCreated` | `(booking: BookingResult) => void` | ---                          | Booking success callback                   |
| `onError`          | `(error: WidgetError) => void`     | ---                          | Error callback                             |
| `onClose`          | `() => void`                       | ---                          | Popup close callback                       |

## Theming

Customize the widget to match your brand:

```typescript
open({
  eventTypeId: "your-event-type-id",
  theme: {
    primaryColor: "#6366f1",
    primaryHoverColor: "#4f46e5",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    borderRadius: "12px",
    fontFamily: "Inter, sans-serif",
  },
});
```

| Property            | CSS Custom Property        | Description          |
| ------------------- | -------------------------- | -------------------- |
| `primaryColor`      | `--astrocal-primary`       | Primary action color |
| `primaryHoverColor` | `--astrocal-primary-hover` | Primary hover color  |
| `headingColor`      | `--astrocal-heading`       | Heading text color   |
| `backgroundColor`   | `--astrocal-bg`            | Widget background    |
| `textColor`         | `--astrocal-text`          | Body text color      |
| `borderColor`       | `--astrocal-border`        | Border color         |
| `borderFocusColor`  | `--astrocal-border-focus`  | Focused border color |
| `borderRadius`      | `--astrocal-radius`        | Border radius        |
| `fontFamily`        | `--astrocal-font`          | Font family          |

## SSR / Server-Side Rendering

The package is safe to import in Node.js environments like Next.js, Nuxt, or Astro. The `autoInit()` function is guarded and won't run on the server. `open()` and `destroy()` require a browser and will throw a clear error if called without a DOM. `close()` is a silent no-op on the server.

```typescript
import { open } from "@astrocal/widget";

if (typeof window !== "undefined") {
  open({ eventTypeId: "..." });
}
```

## Part of the Astrocal Platform

This widget is one of several ways to integrate [Astrocal scheduling](https://astrocal.dev) into your product:

- **[React SDK](https://www.npmjs.com/package/@astrocal/react)** (`@astrocal/react`) — Typed hooks, provider, and widget wrapper for React apps
- **[MCP Server](https://www.npmjs.com/package/@astrocal/mcp-server)** (`@astrocal/mcp-server`) — Let AI agents book meetings via the Model Context Protocol
- **[REST API](https://astrocal.dev/docs/api-reference)** — Full scheduling API with OpenAPI 3.1 spec
- **[Webhooks](https://astrocal.dev/docs/guides/webhooks)** — Real-time notifications for booking lifecycle events
- **[Dashboard](https://astrocal.dev/dashboard)** — Manage event types, bookings, team members, and billing

[Create a free account](https://astrocal.dev/signup) to get your event type ID and start embedding.

## Links

- [Astrocal Website](https://astrocal.dev)
- [Widget Guide](https://astrocal.dev/docs/guides/widget)
- [Documentation](https://astrocal.dev/docs)
- [Dashboard](https://astrocal.dev/dashboard)
- [Pricing](https://astrocal.dev/pricing)
- [GitHub](https://github.com/astrocal-dev/widget)
- [Issues](https://github.com/astrocal-dev/widget/issues)

## License

MIT
