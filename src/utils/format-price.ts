/**
 * Formats a price amount (in smallest currency unit) with the correct currency symbol.
 *
 * @param amount - Price in smallest currency unit (e.g. cents).
 * @param currency - ISO 4217 currency code.
 * @returns Formatted price string (e.g. "$50.00").
 */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
