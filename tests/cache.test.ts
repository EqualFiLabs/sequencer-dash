import { test } from "node:test";
import assert from "node:assert/strict";
import { createCache } from "../lib/cache";
test("coalesces simultaneous reads, caches within TTL, and isolates networks", async () => {
  let now = 0;
  let calls = 0;
  const read = createCache(
    20_000,
    async (key: string) => `${key}:${++calls}`,
    () => now,
  );
  assert.deepEqual(await Promise.all([read("mainnet"), read("mainnet")]), [
    "mainnet:1",
    "mainnet:1",
  ]);
  now = 19_999;
  assert.equal(await read("mainnet"), "mainnet:1");
  assert.equal(await read("testnet"), "testnet:2");
  now = 20_000;
  assert.equal(await read("mainnet"), "mainnet:3");
});
test("failed reads do not poison subsequent requests", async () => {
  let calls = 0;
  const read = createCache(20_000, async () => {
    if (++calls === 1) throw new Error("Unavailable");
    return "recovered";
  });
  await assert.rejects(read("mainnet"));
  assert.equal(await read("mainnet"), "recovered");
});
