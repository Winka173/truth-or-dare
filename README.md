# Truth or Dare — Party Game

Fully offline-first mobile Truth or Dare game for iOS and Android. No account, no internet, no backend — everything runs entirely on device.

**Status:** Pre-implementation. Requirements, data schema, and implementation plan are in place. Scaffolding has not started yet.

## Core facts

- **1,943 questions** across **32 categories**, bundled at install time
- **5 age groups** (kids → 18+) with automatic question inheritance filtering
- **4 moods** — Party, Intimate, Chill, Icebreaker
- **11 languages** with English fallback
- **Offline 100%** — zero network calls at runtime
- **Premium packs** via one-time IAP (no subscriptions)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (managed) |
| Navigation | Expo Router v3 |
| State | Redux Toolkit v2 |
| Storage | MMKV v2 (synchronous) |
| Animation | React Native Reanimated v3 |
| Fonts | Playfair Display, DM Sans, DM Mono |
| IAP | `expo-in-app-purchases` |

Design tokens (colors, spacing, radii, shadows) are sourced from a **Stitch with Google** design system — not hand-coded.

## Documentation

Read in this order to understand the project before touching code:

1. [`requirements/TruthDare_PRD.md`](requirements/TruthDare_PRD.md) — Product requirements (what we're building, features, scope, user stories, success criteria)
2. [`requirements/TruthDare_Plan.md`](requirements/TruthDare_Plan.md) — Implementation plan (7 phases, file-by-file)
3. [`data/TruthDare_DataSchema.md`](data/TruthDare_DataSchema.md) — Full schema reference for `data/truth_dare_data.json` (read this instead of opening the 2.7 MB JSON directly)

The question data file [`data/truth_dare_data.json`](data/truth_dare_data.json) is the single source of truth at runtime, bundled at install time, and read-only.

## License

TBD — not yet licensed for redistribution. All rights reserved until a license is added.
