import { describe, it, expect } from "vitest";
import {
  providerLabel,
  locationLabel,
  locationParts,
  joinLabel,
  isVideoProvider,
} from "./location";

describe("providerLabel", () => {
  it("maps each provider to a short label", () => {
    expect(providerLabel("zoom")).toBe("Zoom");
    expect(providerLabel("google_meet")).toBe("Google Meet");
    expect(providerLabel("microsoft_teams")).toBe("Microsoft Teams");
    expect(providerLabel("custom")).toBe("Video call");
    expect(providerLabel("in_person")).toBe("In person");
  });

  it("returns null when no provider is set", () => {
    expect(providerLabel(null)).toBeNull();
    expect(providerLabel(undefined)).toBeNull();
  });
});

describe("locationLabel", () => {
  it("returns the provider label for video providers", () => {
    expect(locationLabel({ conferencing_provider: "zoom", location: null })).toBe("Zoom");
  });

  it("appends the address for in-person events", () => {
    expect(locationLabel({ conferencing_provider: "in_person", location: "1 High St" })).toBe(
      "In person · 1 High St",
    );
  });

  it("returns 'In person' alone when the address is missing", () => {
    expect(locationLabel({ conferencing_provider: "in_person", location: null })).toBe("In person");
  });

  it("ignores a stale address on a video provider", () => {
    expect(locationLabel({ conferencing_provider: "google_meet", location: "Old office" })).toBe(
      "Google Meet",
    );
  });

  it("returns null when no provider is set", () => {
    expect(locationLabel({ conferencing_provider: null, location: "Somewhere" })).toBeNull();
  });
});

describe("joinLabel", () => {
  it("names the provider in the call to action", () => {
    expect(joinLabel("zoom")).toBe("Join Zoom meeting");
    expect(joinLabel("google_meet")).toBe("Join Google Meet");
    expect(joinLabel("microsoft_teams")).toBe("Join Microsoft Teams meeting");
    expect(joinLabel("custom")).toBe("Join video call");
  });

  it("falls back to a generic label", () => {
    expect(joinLabel(null)).toBe("Join meeting");
  });
});

describe("isVideoProvider", () => {
  it("is true for every provider except in_person", () => {
    expect(isVideoProvider("zoom")).toBe(true);
    expect(isVideoProvider("custom")).toBe(true);
    expect(isVideoProvider("in_person")).toBe(false);
    expect(isVideoProvider(null)).toBe(false);
  });
});

describe("inherited keys", () => {
  it("does not resolve Object.prototype members as providers", () => {
    const bogus = "constructor" as unknown as Parameters<typeof providerLabel>[0];
    expect(providerLabel(bogus)).toBeNull();
    expect(joinLabel(bogus)).toBe("Join meeting");
  });
});

describe("locationParts", () => {
  it("splits an in-person label from its address", () => {
    expect(locationParts({ conferencing_provider: "in_person", location: "1 High St" })).toEqual({
      label: "In person",
      detail: "1 High St",
    });
  });

  it("has no detail for video providers or a missing address", () => {
    expect(locationParts({ conferencing_provider: "zoom", location: "x" })).toEqual({
      label: "Zoom",
      detail: null,
    });
    expect(locationParts({ conferencing_provider: "in_person", location: null })).toEqual({
      label: "In person",
      detail: null,
    });
    expect(locationParts({ conferencing_provider: null, location: null })).toBeNull();
  });
});
