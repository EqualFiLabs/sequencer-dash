# Statics Oracle · Sequencer Observatory

A public, read-only dashboard and documentation site for EqualFi Labs’ Robinhood sequencer availability signal. Built with Next.js, React, TypeScript, and viem. Shares the dark surfaces, green accents, Inter / IBM Plex Mono typography, and logo assets of `EqualFiLabs/statics-app`.

## Run locally

Node 22.13+ is required.

```sh
npm ci
cp .env.example .env.local
# Populate only the server-side RPC variables in .env.local.
npm run dev
```

Open http://127.0.0.1:3200. Missing RPC configuration produces an explicit unavailable state; there is no mock-data fallback. On the maintainer workstation, load the canonical environment in the same shell instead of copying credentials:

```sh
set -a
. /home/hooftly/.openclaw/workspace/.rpc
set +a
npm run dev
```

Only `ETH_MAINNET` + `ROBINHOOD_MAINNET` are used. The site is mainnet-only. Never prefix these variables with `NEXT_PUBLIC_`. No deployment keys, operator credentials, or observer tokens are needed.

## Pages

- `/`: feed status, heartbeat countdown, configured quorum, block freshness, reporter reserve, signal path, and recent events.
- `/activity`: filterable onchain event window with explorer links.
- `/contracts`: addresses, expected runtime hashes, observed configuration, observer membership, and owner.
- `/docs`: architecture, consumer integration, ABI/state reference, trust model, and operational guidance.
- Pages always show mainnet. Legacy network query parameters cannot switch the feed or documentation addresses.
- `/api/status`: sanitized mainnet snapshot. The legacy `?network=mainnet` parameter is accepted; any other network returns 400.

## Data and trust boundaries

`lib/networks.ts` records public addresses and runtime hashes from the oracle repository's mainnet deployment manifest inspected 2026-10-22. Its `sourceCommit` records the manifest's deployment-source commit. These references are not a claim that a deployment is currently healthy.

The server verifies chain IDs, code hashes, reporter/feed bindings, and reporter child-chain ID. Each chain's reads are pinned to one latest block. L1 and L2 reads are separate observations, not atomic or finalized cross-chain proof. RPC errors are replaced with fixed public error codes and are never logged or serialized. The API reads only mainnet, never a user-supplied RPC URL or address.

Snapshots are cached and concurrent requests coalesced for 20 seconds per server process. The client refreshes every 30 seconds and updates the countdown every second. Snapshot age over 90 seconds, L1 block age over 180 seconds, L2 block age over 90 seconds, or timestamps over 30 seconds in the future prevent a healthy presentation. These are dashboard thresholds, not contract constants.

Events are the newest 40 matching logs within 10,000 L2 blocks, queried in bounded 2,000-block ranges. Failed log reads are distinct from a successfully empty result. The site does not reconstruct historical uptime or all retryable stages. Expiry can occur without an event. Observer membership is not online telemetry.

The reporter balance and approximate message reserve exclude the submitting relayer's transaction gas. The reserve uses the larger current status/configuration retryable quote. Consumer recovery grace remains protocol-specific.

## Validate

```sh
npm test
npm run typecheck
npm run build
```

Tests cover stale/future observations, fail-closed presentation, expiry, impairment, sequence/configuration lag, network-isolated caching, concurrent requests, and read recovery. A build does not establish live deployment health. Browser and live-read evidence is recorded separately in `docs/VALIDATION.md`.

## Production

`npm run build && npm start` serves the production build on loopback port 3200. Supply server-side RPC environment variables through the hosting environment. Put a TLS reverse proxy in front of the Node server, apply deployment-specific request limits, and keep operator services private. The cache is process-local; horizontally scaled instances have independent caches. This first delivery does not configure production hosting or alter oracle services.

## Source and brand

- Protocol source and operational authority: https://github.com/EqualFiLabs/statics-oracle
- Visual reference and bundled Statics logos: https://github.com/EqualFiLabs/statics-app
- Dashboard source: https://github.com/EqualFiLabs/sequencer-dash

Logo files were copied unchanged from the existing Statics application. Fonts are bundled through the Fontsource packages with their package-provided licenses; no remote font request is required at runtime.
