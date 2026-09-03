import type { ConferencingProvider, EventType } from "../types";

const PROVIDER_LABELS: Record<ConferencingProvider, string> = {
  zoom: "Zoom",
  google_meet: "Google Meet",
  microsoft_teams: "Microsoft Teams",
  custom: "Video call",
  in_person: "In person",
};

const JOIN_LABELS: Record<ConferencingProvider, string> = {
  zoom: "Join Zoom meeting",
  google_meet: "Join Google Meet",
  microsoft_teams: "Join Microsoft Teams meeting",
  custom: "Join video call",
  in_person: "View location",
};

/**
 * Short label for a conferencing provider, e.g. "Zoom" or "In person".
 *
 * @param provider - The event type's conferencing provider.
 * @returns The label, or null when no location is configured.
 */
export function providerLabel(provider: ConferencingProvider | null | undefined): string | null {
  return provider && Object.hasOwn(PROVIDER_LABELS, provider) ? PROVIDER_LABELS[provider] : null;
}

/**
 * Label shown before booking, e.g. "Zoom" or "In person · 1 High St".
 *
 * @param eventType - Event type fields describing the location.
 * @returns The label, or null when no location is configured.
 */
export function locationLabel(
  eventType: Pick<EventType, "conferencing_provider" | "location">,
): string | null {
  const label = providerLabel(eventType.conferencing_provider);
  if (!label) return null;
  if (eventType.conferencing_provider === "in_person" && eventType.location) {
    return `${label} · ${eventType.location}`;
  }
  return label;
}

/**
 * Call-to-action text for a meeting link, e.g. "Join Zoom meeting".
 *
 * @param provider - The event type's conferencing provider.
 * @returns The link text; falls back to "Join meeting" for unknown providers.
 */
export function joinLabel(provider: ConferencingProvider | null | undefined): string {
  return provider && Object.hasOwn(JOIN_LABELS, provider) ? JOIN_LABELS[provider] : "Join meeting";
}

/**
 * Whether a provider produces a join link (as opposed to an address).
 *
 * @param provider - The event type's conferencing provider.
 * @returns True for video providers.
 */
export function isVideoProvider(provider: ConferencingProvider | null | undefined): boolean {
  return provider != null && provider !== "in_person";
}

/**
 * The location label split into a provider part and an optional detail part,
 * so renderers can mark the separator decorative for screen readers.
 *
 * @param eventType - Event type fields describing the location.
 * @returns The parts, or null when no location is configured.
 */
export function locationParts(
  eventType: Pick<EventType, "conferencing_provider" | "location">,
): { label: string; detail: string | null } | null {
  const label = providerLabel(eventType.conferencing_provider);
  if (!label) return null;
  const detail =
    eventType.conferencing_provider === "in_person" && eventType.location
      ? eventType.location
      : null;
  return { label, detail };
}
