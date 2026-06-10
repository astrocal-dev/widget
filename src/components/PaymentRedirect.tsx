import type { EventType, BookingResult } from "../types";
import { formatTime, formatDate } from "../utils/dates";
import { formatPrice } from "../utils/format-price";

interface PaymentRedirectProps {
  eventType: EventType;
  booking: BookingResult;
  timezone: string;
}

/**
 * Transitional screen shown when a booking requires payment.
 * Displays the event title, date/time, formatted price, and a "Redirecting..." spinner.
 */
export function PaymentRedirect({ eventType, booking, timezone }: PaymentRedirectProps) {
  const date = booking.start_time.slice(0, 10);
  const payment = booking.payment!;

  return (
    <div class="astrocal-payment-redirect" role="status">
      <div class="astrocal-payment-redirect-icon" aria-hidden="true">
        &#128179;
      </div>
      <h3>Payment Required</h3>
      <p>
        <strong>{eventType.title}</strong>
      </p>
      <p>
        {formatDate(date)} at {formatTime(booking.start_time, timezone)}
      </p>
      <div class="astrocal-payment-amount">{formatPrice(payment.amount, payment.currency)}</div>
      <div class="astrocal-payment-redirect-spinner">
        <div class="astrocal-spinner" aria-hidden="true" />
        <span>Redirecting to payment...</span>
      </div>
    </div>
  );
}
