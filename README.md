# @astrocal/widget

Embeddable booking widget for [Astrocal](https://astrocal.dev) — drop-in scheduling UI for any website or app.

## Installation

```bash
npm install @astrocal/widget
```

## Quick Start (ESM)

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

// Mount
open({
  eventTypeId: "your-event-type-id",
  mode: "inline",
  target: "#booking-container",
});

// Clean up when done
destroy("#booking-container");
```

## CDN Usage (Script Tag)

For non-npm users, load the widget via a script tag:

```html
<script src="https://cdn.astrocal.dev/widget/latest/astrocal.js"></script>
<script>
  Astrocal.open({
    eventTypeId: "your-event-type-id",
    mode: "popup",
  });
</script>
```

Or use auto-initialization with data attributes:

```html
<script src="https://cdn.astrocal.dev/widget/latest/astrocal.js"></script>
<div data-astrocal-event-type-id="your-event-type-id" data-astrocal-mode="inline"></div>
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

## WidgetConfig

| Property           | Type                               | Default                      | Description                                |
| ------------------ | ---------------------------------- | ---------------------------- | ------------------------------------------ |
| `eventTypeId`      | `string`                           | required                     | Event type UUID to display                 |
| `apiUrl`           | `string`                           | `"https://api.astrocal.dev"` | API base URL                               |
| `mode`             | `"inline" \| "popup"`              | `"popup"`                    | Render mode                                |
| `target`           | `string \| HTMLElement`            | —                            | DOM element or CSS selector (inline mode)  |
| `timezone`         | `string`                           | auto-detected                | IANA timezone override                     |
| `theme`            | `ThemeConfig`                      | —                            | CSS custom property overrides              |
| `colorScheme`      | `"light" \| "dark" \| "auto"`      | `"auto"`                     | Color scheme                               |
| `demo`             | `boolean`                          | `false`                      | Enable demo mode (mock data, no API calls) |
| `onBookingCreated` | `(booking: BookingResult) => void` | —                            | Booking success callback                   |
| `onError`          | `(error: WidgetError) => void`     | —                            | Error callback                             |
| `onClose`          | `() => void`                       | —                            | Popup close callback                       |

## ThemeConfig

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

The package is safe to import in Node.js (e.g., Next.js, Nuxt). The `autoInit()` function is guarded and will not run on the server. However, `open()` and `destroy()` require a browser environment and will throw a clear error if called without a DOM. `close()` is a silent no-op on the server.

```typescript
// Safe — no error on import
import { open } from "@astrocal/widget";

// Only call in browser context
if (typeof window !== "undefined") {
  open({ eventTypeId: "..." });
}
```

## Documentation

Full documentation at [docs.astrocal.dev](https://docs.astrocal.dev).

## License

MIT
