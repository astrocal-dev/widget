import type {
  EventType,
  AvailabilityResponse,
  CreateBookingInput,
  CreateGroupBookingInput,
  BookingResult,
  CreateWaitlistInput,
  WaitlistResult,
  RescheduleBookingInput,
  ApiErrorResponse,
  WidgetError,
} from "../types";

const DEFAULT_API_URL = "https://api.astrocal.dev";

/** API client for the Astrocal REST API. */
export class ApiClient {
  private readonly baseUrl: string;

  constructor(apiUrl?: string) {
    this.baseUrl = (apiUrl || DEFAULT_API_URL).replace(/\/$/, "");
  }

  /** Fetches a public event type by ID. */
  async getEventType(eventTypeId: string): Promise<EventType> {
    return this.get<EventType>(`/v1/public/event-types/${eventTypeId}`);
  }

  /** Fetches available time slots for a date range. */
  async getAvailability(
    eventTypeId: string,
    start: string,
    end: string,
    timezone: string,
    duration?: number,
  ): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({
      event_type_id: eventTypeId,
      start,
      end,
      timezone,
    });
    if (duration != null) {
      params.set("duration", String(duration));
    }
    return this.get<AvailabilityResponse>(`/v1/availability?${params}`);
  }

  /** Creates a booking (single invitee or group). */
  async createBooking(input: CreateBookingInput | CreateGroupBookingInput): Promise<BookingResult> {
    return this.post<BookingResult>("/v1/bookings", input);
  }

  /** Creates a waitlist entry. */
  async createWaitlistEntry(input: CreateWaitlistInput): Promise<WaitlistResult> {
    return this.post<WaitlistResult>("/v1/waitlist", input);
  }

  /** Reschedules an existing booking using its cancel token. */
  async rescheduleBooking(
    bookingId: string,
    token: string,
    input: RescheduleBookingInput,
  ): Promise<BookingResult> {
    const path = `/v1/bookings/${encodeURIComponent(bookingId)}/reschedule?token=${encodeURIComponent(token)}`;
    return this.post<BookingResult>(path, input);
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw await this.toWidgetError(res);
    }

    return res.json() as Promise<T>;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw await this.toWidgetError(res);
    }

    return res.json() as Promise<T>;
  }

  private async toWidgetError(res: Response): Promise<WidgetError> {
    if (res.status === 404) {
      return { code: "not_found", message: "Event type not found" };
    }

    try {
      const body = (await res.json()) as ApiErrorResponse;
      if (res.status === 409) {
        // Keep the API's reason: a cancelled booking or a taken slot need different copy.
        return {
          code: "slot_unavailable",
          message: body.error?.message || "This time slot is no longer available",
        };
      }
      if (res.status === 400 || res.status === 422) {
        return {
          code: "validation_error",
          message: body.error?.message || "Invalid request",
        };
      }
      return {
        code: "unknown",
        message: body.error?.message || `Request failed (${res.status})`,
      };
    } catch {
      if (res.status === 409) {
        return { code: "slot_unavailable", message: "This time slot is no longer available" };
      }
      return { code: "unknown", message: `Request failed (${res.status})` };
    }
  }
}

/** Creates an ApiClient, wrapping network errors into WidgetError. */
export function createApiClient(apiUrl?: string): ApiClient {
  return new ApiClient(apiUrl);
}
