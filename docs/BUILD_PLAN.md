# Sequencer Observatory

Build a standalone, responsive Statics-branded public dashboard and technical docs site. Source reference: EqualFiLabs/statics-oracle main and statics-app master, inspected 2026-10-22.

## Scope

- Overview, activity, contract directory, and integrated documentation.
- Server-only reads of configured Ethereum and Robinhood RPCs; no signing, wallet connection, operator API access, or administrative actions.
- Pin each chain's reads to a block, verify chain IDs, runtime hashes and reporter/feed bindings, and display the two-chain observation boundary honestly.
- Display unavailable, stale, impaired, expired and uninitialized states explicitly. Never fill failures with simulated health or history.
- Use public deployment metadata from the oracle repository. Observer membership does not establish observer online status.
- Activity is a bounded RPC event window; no historical uptime claim. Lease expiry can occur without an event.

## Delivery

Work on feat/sequencer-observatory. The remote is empty; do not initialize or update its default branch. Keep a recoverable local feature commit. A PR requires a human-created base branch. Separate commits for implementation and confirmed review remediation.

## Validation

Typecheck, production build, focused status and cache-boundary tests, live read-only smoke checks, and browser review of desktop/mobile navigation, freshness, network switching, docs, and copy interactions. Review the committed candidate independently before handoff. Preserve any existing app services.

## Boundaries

No production hosting change is part of this first local delivery. Serve a loopback preview. Docs describe consumer-selected recovery grace rather than treating grace as a feed-global property. Raw RPC exceptions, endpoints, and credentials must never reach public responses or logs.
