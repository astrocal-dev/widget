import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "./api";
import type { EventType, AvailabilityResponse, BookingResult, WaitlistResult } from "../types";

describe("ApiClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("uses default API URL when not provided", () => {
      const client = new ApiClient();
      expect(client).toBeInstanceOf(ApiClient);
    });

    it("uses provided API URL", () => {
      const client = new ApiClient("https://custom.api.com");
      expect(client).toBeInstanceOf(ApiClient);
    });

    it("removes trailing slash from API URL", () => {
      const client = new ApiClient("https://custom.api.com/");
      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe("getEventType", () => {
    it("makes GET request to correct URL", async () => {
      const mockEventType: EventType = {
        id: "evt-123",
        organization_id: "org-456",
        title: "30 Minute Meeting",
        slug: "30-min",
        description: "A quick chat",
        duration_minutes: 30,
        duration_options: null,
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

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventType,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      const result = await client.getEventType("evt-123");

      expect(fetchMock).toHaveBeenCalledWith("https://api.astrocal.dev/v1/event-types/evt-123", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual(mockEventType);
    });

    it("returns 404 WidgetError with code not_found", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { code: "not_found", message: "Not found" } }),
      });

      const client = new ApiClient();

      await expect(client.getEventType("evt-nonexistent")).rejects.toEqual({
        code: "not_found",
        message: "Event type not found",
      });
    });
  });

  describe("getAvailability", () => {
    it("does not append duration param when not provided", async () => {
      const mockAvailability: AvailabilityResponse = {
        event_type_id: "evt-123",
        timezone: "America/New_York",
        start: "2024-01-01",
        end: "2024-01-31",
        slots: [],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailability,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      await client.getAvailability("evt-123", "2024-01-01", "2024-01-31", "America/New_York");

      const calledUrl = fetchMock.mock.calls[0]![0] as string;
      expect(calledUrl).not.toContain("duration=");
    });

    it("appends duration param when provided", async () => {
      const mockAvailability: AvailabilityResponse = {
        event_type_id: "evt-123",
        timezone: "America/New_York",
        start: "2024-01-01",
        end: "2024-01-31",
        slots: [],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailability,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      await client.getAvailability("evt-123", "2024-01-01", "2024-01-31", "America/New_York", 60);

      const calledUrl = fetchMock.mock.calls[0]![0] as string;
      expect(calledUrl).toContain("duration=60");
    });

    it("builds correct query params", async () => {
      const mockAvailability: AvailabilityResponse = {
        event_type_id: "evt-123",
        timezone: "America/New_York",
        start: "2024-01-01",
        end: "2024-01-31",
        slots: [{ start_time: "2024-01-15T14:00:00Z", end_time: "2024-01-15T14:30:00Z" }],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailability,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      const result = await client.getAvailability(
        "evt-123",
        "2024-01-01",
        "2024-01-31",
        "America/New_York",
      );

      const expectedUrl =
        "https://api.astrocal.dev/v1/availability?event_type_id=evt-123&start=2024-01-01&end=2024-01-31&timezone=America%2FNew_York";

      expect(fetchMock).toHaveBeenCalledWith(expectedUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual(mockAvailability);
    });
  });

  describe("createBooking", () => {
    it("sends POST with correct body", async () => {
      const mockBooking: BookingResult = {
        id: "bkg-123",
        event_type_id: "evt-123",
        status: "confirmed",
        start_time: "2024-01-15T14:00:00Z",
        end_time: "2024-01-15T14:30:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
        notes: "Looking forward to it",
        cancel_token: "tok-xyz",
        attendee_count: 1,
        created_at: "2024-01-01T12:00:00Z",
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooking,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      const input = {
        event_type_id: "evt-123",
        start_time: "2024-01-15T14:00:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
        notes: "Looking forward to it",
      };

      const result = await client.createBooking(input);

      expect(fetchMock).toHaveBeenCalledWith("https://api.astrocal.dev/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      expect(result).toEqual(mockBooking);
    });

    it("includes duration in POST body when provided", async () => {
      const mockBooking: BookingResult = {
        id: "bkg-123",
        event_type_id: "evt-123",
        status: "confirmed",
        start_time: "2024-01-15T14:00:00Z",
        end_time: "2024-01-15T15:00:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
        notes: null,
        cancel_token: "tok-xyz",
        attendee_count: 1,
        created_at: "2024-01-01T12:00:00Z",
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooking,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      const input = {
        event_type_id: "evt-123",
        start_time: "2024-01-15T14:00:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
        duration: 60,
      };

      await client.createBooking(input);

      const body = JSON.parse(fetchMock.mock.calls[0]![1].body as string);
      expect(body.duration).toBe(60);
    });

    it("omits duration from POST body when not provided", async () => {
      const mockBooking: BookingResult = {
        id: "bkg-123",
        event_type_id: "evt-123",
        status: "confirmed",
        start_time: "2024-01-15T14:00:00Z",
        end_time: "2024-01-15T14:30:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
        notes: null,
        cancel_token: "tok-xyz",
        attendee_count: 1,
        created_at: "2024-01-01T12:00:00Z",
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooking,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      const input = {
        event_type_id: "evt-123",
        start_time: "2024-01-15T14:00:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
      };

      await client.createBooking(input);

      const body = JSON.parse(fetchMock.mock.calls[0]![1].body as string);
      expect(body.duration).toBeUndefined();
    });

    it("returns 409 WidgetError with code slot_unavailable", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: { code: "conflict", message: "Slot taken" } }),
      });

      const client = new ApiClient();
      const input = {
        event_type_id: "evt-123",
        start_time: "2024-01-15T14:00:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
      };

      await expect(client.createBooking(input)).rejects.toEqual({
        code: "slot_unavailable",
        message: "This time slot is no longer available",
      });
    });

    it("returns 400 WidgetError with code validation_error", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: { code: "validation_error", message: "Invalid email format" },
        }),
      });

      const client = new ApiClient();
      const input = {
        event_type_id: "evt-123",
        start_time: "2024-01-15T14:00:00Z",
        invitee_name: "John Doe",
        invitee_email: "invalid-email",
        invitee_timezone: "America/New_York",
      };

      await expect(client.createBooking(input)).rejects.toEqual({
        code: "validation_error",
        message: "Invalid email format",
      });
    });

    it("returns 422 WidgetError with code validation_error", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          error: { code: "unprocessable", message: "Missing required field" },
        }),
      });

      const client = new ApiClient();
      const input = {
        event_type_id: "evt-123",
        start_time: "2024-01-15T14:00:00Z",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
      };

      await expect(client.createBooking(input)).rejects.toEqual({
        code: "validation_error",
        message: "Missing required field",
      });
    });
  });

  describe("createWaitlistEntry", () => {
    it("sends POST to /v1/waitlist with correct body", async () => {
      const mockEntry: WaitlistResult = {
        id: "wl-123",
        event_type_id: "evt-123",
        status: "waiting",
        position: 3,
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
        notes: null,
        cancel_token: "tok-xyz",
        expires_at: "2024-02-15T00:00:00Z",
        created_at: "2024-01-15T12:00:00Z",
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntry,
      });

      const client = new ApiClient("https://api.astrocal.dev");
      const input = {
        event_type_id: "evt-123",
        invitee_name: "John Doe",
        invitee_email: "john@example.com",
        invitee_timezone: "America/New_York",
      };

      const result = await client.createWaitlistEntry(input);

      expect(fetchMock).toHaveBeenCalledWith("https://api.astrocal.dev/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      expect(result).toEqual(mockEntry);
    });

    it("throws WidgetError with validation_error code on 400", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: { code: "validation_error", message: "Invalid email format" },
        }),
      });

      const client = new ApiClient();

      await expect(
        client.createWaitlistEntry({
          event_type_id: "evt-123",
          invitee_name: "John Doe",
          invitee_email: "invalid",
          invitee_timezone: "America/New_York",
        }),
      ).rejects.toEqual({
        code: "validation_error",
        message: "Invalid email format",
      });
    });

    it("throws WidgetError with slot_unavailable code on 409", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: { code: "conflict", message: "Waitlist full" },
        }),
      });

      const client = new ApiClient();

      await expect(
        client.createWaitlistEntry({
          event_type_id: "evt-123",
          invitee_name: "John Doe",
          invitee_email: "john@example.com",
          invitee_timezone: "America/New_York",
        }),
      ).rejects.toEqual({
        code: "slot_unavailable",
        message: "This time slot is no longer available",
      });
    });
  });

  describe("error handling", () => {
    it("handles network errors", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      const client = new ApiClient();

      await expect(client.getEventType("evt-123")).rejects.toThrow("Network error");
    });

    it("handles 500 errors with error response body", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: { code: "internal_error", message: "Database connection failed" },
        }),
      });

      const client = new ApiClient();

      await expect(client.getEventType("evt-123")).rejects.toEqual({
        code: "unknown",
        message: "Database connection failed",
      });
    });

    it("handles errors with no JSON body", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => {
          throw new Error("Not JSON");
        },
      });

      const client = new ApiClient();

      await expect(client.getEventType("evt-123")).rejects.toEqual({
        code: "unknown",
        message: "Request failed (503)",
      });
    });

    it("handles validation error without message", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { code: "bad_request" } }),
      });

      const client = new ApiClient();

      await expect(client.getEventType("evt-123")).rejects.toEqual({
        code: "validation_error",
        message: "Invalid request",
      });
    });
  });
});
