import { test, expect } from "@playwright/test";

const MOCK_EVENT_TYPE = {
  id: "test-event-type-id",
  organization_id: "org-456",
  title: "30 Minute Meeting",
  slug: "30-min",
  description: "A quick chat about anything",
  duration_minutes: 30,
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  color: "#3b82f6",
  timezone: "America/New_York",
  active: true,
  is_test: false,
  price_amount: null,
  price_currency: "usd",
  reminder_intervals: [1440, 60],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// Generate mock slots for tomorrow at the time of running
function mockSlots() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);
  return {
    event_type_id: "test-event-type-id",
    timezone: "America/New_York",
    start: dateStr.slice(0, 8) + "01",
    end: dateStr.slice(0, 8) + "28",
    slots: [
      { start_time: `${dateStr}T14:00:00Z`, end_time: `${dateStr}T14:30:00Z` },
      { start_time: `${dateStr}T15:00:00Z`, end_time: `${dateStr}T15:30:00Z` },
      { start_time: `${dateStr}T16:00:00Z`, end_time: `${dateStr}T16:30:00Z` },
    ],
  };
}

const MOCK_BOOKING = {
  id: "booking-789",
  event_type_id: "test-event-type-id",
  status: "confirmed",
  start_time: "2024-03-15T14:00:00Z",
  end_time: "2024-03-15T14:30:00Z",
  invitee_name: "Test User",
  invitee_email: "test@example.com",
  invitee_timezone: "America/New_York",
  notes: null,
  cancel_token: "tok_abc123",
  created_at: "2024-03-14T10:00:00Z",
};

function setupMockRoutes(page: import("@playwright/test").Page) {
  // Mock event type endpoint
  page.route("**/v1/event-types/test-event-type-id", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_EVENT_TYPE),
    });
  });

  // Mock availability endpoint
  page.route("**/v1/availability*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockSlots()),
    });
  });

  // Mock booking creation endpoint
  page.route("**/v1/bookings", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(MOCK_BOOKING),
      });
    }
  });
}

test.describe("Inline Widget", () => {
  test("renders event type details after loading", async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto("/");

    // Widget loads inside Shadow DOM
    const widgetHost = page.locator("#inline-widget");
    await expect(widgetHost).toBeVisible();

    // Access Shadow DOM content
    const shadow = widgetHost.locator("div").first();
    // Wait for title to appear (after API call)
    await expect(shadow.locator("h2")).toContainText("30 Minute Meeting", { timeout: 5000 });
  });

  test("shows error for non-existent event type", async ({ page }) => {
    // Mock 404 response
    await page.route("**/v1/event-types/test-event-type-id", (route) => {
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "not_found", message: "Event type not found" } }),
      });
    });

    await page.goto("/");

    const widgetHost = page.locator("#inline-widget");
    const shadow = widgetHost.locator("div").first();
    await expect(shadow.locator("text=Not Found")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Popup Widget", () => {
  test("opens and closes popup on button click", async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto("/");

    // Click open popup button
    await page.click("#open-popup");

    // Popup should appear - look for the popup host element
    const popupHost = page.locator("[data-astrocal-popup]");
    await expect(popupHost).toBeVisible({ timeout: 5000 });
  });
});
