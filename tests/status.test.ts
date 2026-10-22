import { test } from "node:test";
import assert from "node:assert/strict";
import { assess, duration } from "../lib/status";
import type { Snapshot } from "../lib/types";

const now = 1_800_000_000;
const healthy: Snapshot = {
  network: "mainnet",
  fetchedAt: now,
  available: true,
  l1Timestamp: now - 12,
  l2Timestamp: now - 1,
  answer: 0,
  reason: 1,
  healthyUntil: now + 600,
  l1Healthy: true,
  l1Sequence: 4,
  l2Sequence: 4,
  heartbeatSequence: 4,
  l1Version: 2,
  l2Version: 2,
};
test("requires a fresh, healthy, synchronized observation", () =>
  assert.equal(assess(healthy, now).tone, "healthy"));
test("does not invent health when loading, unconfigured, or verification fails", () => {
  assert.equal(assess(null, now).fresh, false);
  for (const error of [
    "not-configured",
    "read-failed",
    "verification-failed",
  ] as const)
    assert.equal(
      assess({ ...healthy, available: false, error }, now).tone,
      "neutral",
    );
});
test("wall-clock expiry closes a feed even if a frozen chain still reports answer zero", () => {
  assert.equal(
    assess({ ...healthy, healthyUntil: now }, now).label,
    "Heartbeat expired",
  );
});
test("old L1, L2, or dashboard data cannot be displayed healthy", () => {
  for (const fields of [
    { fetchedAt: now - 91 },
    { l1Timestamp: now - 181 },
    { l2Timestamp: now - 91 },
  ]) {
    const result = assess({ ...healthy, ...fields }, now);
    assert.equal(result.label, "Observation is stale");
    assert.equal(result.fresh, false);
  }
});
test("rejects missing, future, and non-finite observation timestamps", () => {
  for (const value of [undefined, 0, NaN, Infinity, now + 31]) {
    assert.notEqual(
      assess({ ...healthy, l2Timestamp: value }, now).tone,
      "healthy",
    );
  }
});
test("distinguishes impairment, initialization, and lease expiry", () => {
  assert.equal(
    assess({ ...healthy, reason: 0 }, now).label,
    "Awaiting initialization",
  );
  assert.equal(
    assess({ ...healthy, reason: 2 }, now).label,
    "Impairment reported",
  );
  assert.equal(
    assess({ ...healthy, l1Healthy: false }, now).label,
    "Impairment reported",
  );
  assert.equal(
    assess({ ...healthy, reason: 3 }, now).label,
    "Heartbeat expired",
  );
});
test("configuration, status, and heartbeat lag are visible rather than healthy", () => {
  for (const fields of [
    { l1Sequence: 5 },
    { l1Version: 3 },
    { heartbeatSequence: 3 },
  ])
    assert.equal(
      assess({ ...healthy, ...fields }, now).label,
      "Signal synchronizing",
    );
});
test("missing sequence evidence and contradictory answers cannot be healthy", () => {
  assert.equal(
    assess(
      {
        ...healthy,
        l1Sequence: undefined,
        l2Sequence: undefined,
        heartbeatSequence: undefined,
      },
      now,
    ).label,
    "Signal incomplete",
  );
  assert.equal(
    assess({ ...healthy, healthyUntil: Infinity }, now).label,
    "Signal incomplete",
  );
  for (const fields of [{ answer: 1 }, { reason: 4 }, { l1Healthy: undefined }])
    assert.notEqual(assess({ ...healthy, ...fields }, now).tone, "healthy");
});
test("lease display clamps negative time and formats minutes", () => {
  assert.equal(duration(-40), "00:00");
  assert.equal(duration(600), "10:00");
  assert.equal(duration(65.9), "01:05");
});
