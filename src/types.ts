/** Configuration for embedding the Astrocal widget. */
export interface WidgetConfig {
  /** The event type UUID to display. */
  eventTypeId: string;
  /** API base URL. Defaults to "https://api.astrocal.dev". */
  apiUrl?: string;
  /** Render mode: "inline" mounts directly, "popup" opens as a modal. */
  mode?: "inline" | "popup";
  /** DOM element or CSS selector to mount the widget into (inline mode). */
  target?: string | HTMLElement;
  /** IANA timezone override. Auto-detected if not provided. */
  timezone?: string;
  /** Theme overrides via CSS custom properties. */
  theme?: ThemeConfig;
  /** Color scheme: "light", "dark", or "auto" (detects from host page). Defaults to "auto". */
  colorScheme?: "light" | "dark" | "auto";
  /** Callback fired after a booking is successfully created. */
  onBookingCreated?: (booking: BookingResult) => void;
  /** Callback fired when the widget encounters an error. */
  onError?: (error: WidgetError) => void;
  /** Callback fired when the popup is closed. */
  onClose?: () => void;
  /** Enable demo mode — uses mock data, no API calls. */
  demo?: boolean;
  /** Override demo event type fields (title, description, duration, color). Only used when demo is true. */
  demoEventType?: Partial<
    Pick<
      EventType,
      | "title"
      | "description"
      | "duration_minutes"
      | "duration_options"
      | "buffer_before_minutes"
      | "buffer_after_minutes"
      | "color"
    >
  >;
}

/** Theme customization via CSS custom properties. */
export interface ThemeConfig {
  primaryColor?: string;
  primaryHoverColor?: string;
  headingColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderFocusColor?: string;
  borderRadius?: string;
  fontFamily?: string;
}

/** Event type data returned by the public API. */
export interface EventType {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  duration_options: number[] | null;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  color: string;
  timezone: string;
  active: boolean;
  is_test: boolean;
  price_amount: number | null;
  price_currency: string;
  max_attendees: number;
  created_at: string;
  updated_at: string;
}

/** A single available time slot. */
export interface TimeSlot {
  start_time: string;
  end_time: string;
  spots_remaining?: number;
  total_capacity?: number;
  capped?: boolean;
  waitlist_available?: boolean;
  waitlist_position?: number;
}

/** Availability response from the API. */
export interface AvailabilityResponse {
  event_type_id: string;
  timezone: string;
  start: string;
  end: string;
  slots: TimeSlot[];
}

/** A single attendee for group bookings. */
export interface AttendeeInput {
  name: string;
  email: string;
  timezone?: string;
}

/** Booking creation request body (single invitee). */
export interface CreateBookingInput {
  event_type_id: string;
  start_time: string;
  invitee_name: string;
  invitee_email: string;
  invitee_timezone: string;
  notes?: string;
  duration?: number;
}

/** Booking creation request body (multi-attendee). */
export interface CreateGroupBookingInput {
  event_type_id: string;
  start_time: string;
  attendees: AttendeeInput[];
  notes?: string;
  duration?: number;
}

/** Waitlist entry creation request body. */
export interface CreateWaitlistInput {
  event_type_id: string;
  invitee_name: string;
  invitee_email: string;
  invitee_timezone: string;
  notes?: string;
}

/** Waitlist entry result after successful creation. */
export interface WaitlistResult {
  id: string;
  event_type_id: string;
  status: string;
  position: number;
  invitee_name: string;
  invitee_email: string;
  invitee_timezone: string;
  notes: string | null;
  cancel_token: string;
  expires_at: string;
  created_at: string;
}

/** Individual attendee in a group booking result. */
export interface AttendeeResult {
  id: string;
  name: string;
  email: string;
  timezone: string;
}

/** Booking result after successful creation. */
export interface BookingResult {
  id: string;
  event_type_id: string;
  status: string;
  start_time: string;
  end_time: string;
  invitee_name: string;
  invitee_email: string;
  invitee_timezone: string;
  notes: string | null;
  cancel_token: string;
  attendee_count: number;
  attendees?: AttendeeResult[];
  created_at: string;
}

/** Structured error from the widget. */
export interface WidgetError {
  code: "not_found" | "network_error" | "slot_unavailable" | "validation_error" | "unknown";
  message: string;
}

/** API error response shape. */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Widget state machine states. */
export type WidgetState =
  | { step: "loading" }
  | { step: "error"; error: WidgetError }
  | { step: "duration"; eventType: EventType }
  | { step: "calendar"; eventType: EventType; selectedDuration: number }
  | {
      step: "timeslots";
      eventType: EventType;
      date: string;
      slots: TimeSlot[];
      selectedDuration: number;
    }
  | { step: "form"; eventType: EventType; slot: TimeSlot; selectedDuration: number }
  | { step: "confirmation"; eventType: EventType; booking: BookingResult }
  | { step: "waitlist-form"; eventType: EventType; date: string; selectedDuration: number }
  | { step: "waitlist-confirmation"; eventType: EventType; entry: WaitlistResult };
