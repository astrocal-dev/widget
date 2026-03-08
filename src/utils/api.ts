import type {
  EventType,
  AvailabilityResponse,
  CreateBookingInput,
  CreateGroupBookingInput,
  BookingResult,
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
    return this.get<EventType>(`/v1/event-types/${eventTypeId}`);
  }

  /** Fetches available time slots for a date range. */
  async getAvailability(
    eventTypeId: string,
    start: string,
    end: string,
    timezone: string,
  ): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({
      event_type_id: eventTypeId,
      start,
      end,
      timezone,
    });
    return this.get<AvailabilityResponse>(`/v1/availability?${params}`);
  }

  /** Creates a booking (single invitee or group). */
  async createBooking(input: CreateBookingInput | CreateGroupBookingInput): Promise<BookingResult> {
    return this.post<BookingResult>("/v1/bookings", input);
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

    if (res.status === 409) {
      return { code: "slot_unavailable", message: "This time slot is no longer available" };
    }

    try {
      const body = (await res.json()) as ApiErrorResponse;
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
      return { code: "unknown", message: `Request failed (${res.status})` };
    }
  }
}

/** Creates an ApiClient, wrapping network errors into WidgetError. */
export function createApiClient(apiUrl?: string): ApiClient {
  return new ApiClient(apiUrl);
}
