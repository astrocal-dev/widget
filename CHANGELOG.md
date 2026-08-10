# Changelog

## 0.2.1 (2026-08-08)

### Breaking Changes

- refactor(api)!: move public event type detail to /v1/public/event-types/{id} (878c84c)

### Features

- paid bookings flow, plan-based platform fees, and PostHog revenue tracking (b7320e7)
- add hideBranding prop to widget and hide on hosted booking page (277c3ca)
- unified event type editor with live widget preview (PRD-100) (9dcc919)
- wire duration_options to widget preview with step transitions (da9bc6a)
- add dynamic scroll gradient indicators to widget time slots (PRD-099) (9668e39)
- improve group booking UX in widget (PRD-098) (886609f)
- add waitlist support to booking widget (PRD-097) (2127930)
- add duration selector step to booking widget (PRD-096) (7b19ef7)
- add bottom fade gradient to widget slots list (78d6417)
- inline widget preview in event type dialog with real-time updates (ff0bb25)
- add widget preview with demoEventType config support (bb09bd2)

### Bug Fixes

- widget container width, shimmer branding, and tsdav ESM import (d4f0b1e)
- account for buffer times in availability slot spacing (c04defa)
- enable touchpad/wheel scrolling on widget time slots list (7035312)
- cap widget availability query to 30 days for 31-day months (9b13b23)

### Documentation

- rewrite package READMEs for marketing focus and SEO backlinks (109e94b)

### Other

- release 0.2.0 and stop the CDN clobbering pinned versions (#126) (187110f)
- upgrade major dependencies (groups 1-3) (4554435)
- update all minor and patch dependencies (8ec61e0)

## 0.1.1 (2026-03-09)

### Features

- add public repo sync workflow and update repo URLs (0692957)
- add ESM build and npm publishing for @astrocal/widget (d79c07a)
- add demo site package and widget autoInit demo support (PRD-078) (173fef4)
- add group/multi-attendee bookings (PRD-075) (a95bfee)
- add widget CDN distribution infrastructure (PRD-080) (ddbf3e7)
- fix widget dark/light theme detection and add popup demo (446f599)
- add embeddable booking widget with public event type endpoint (PRD-013) (36f36a4)
- scaffold monorepo and implement PRD-001 API contract (7a510c8)

### Bug Fixes

- make widget mobile-friendly with responsive padding and iOS zoom prevention (be9d36f)

### Other

- add unified release workflow and changelogs (aeda57c)
- update demo widget build and format widget package files (68197ee)
- rename AstroCal to Astrocal across entire codebase (88d9358)
- Updates (7ba8173)
- Updates (f9d977b)
