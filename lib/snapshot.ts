import "server-only";
import {
  createPublicClient,
  formatEther,
  http,
  keccak256,
  type Address,
} from "viem";
import { networks, type Network } from "./networks";
import { eventAbi, feedAbi, reporterAbi } from "./abi";
import { createCache } from "./cache";
import type { FeedEvent, Snapshot } from "./types";

class VerificationError extends Error {}

async function readSnapshot(network: Network): Promise<Snapshot> {
  const base = { network, fetchedAt: Math.floor(Date.now() / 1000) };
  const n = networks[network];
  const l1Url = process.env.ETH_MAINNET;
  const l2Url = process.env.ROBINHOOD_MAINNET;
  if (!l1Url || !l2Url)
    return { ...base, available: false, error: "not-configured" };
  try {
    const l1 = createPublicClient({
      transport: http(l1Url, { timeout: 8000, retryCount: 0, batch: true }),
    });
    const l2 = createPublicClient({
      transport: http(l2Url, { timeout: 8000, retryCount: 0, batch: true }),
    });
    const [l1Id, l2Id, b1, b2] = await Promise.all([
      l1.getChainId(),
      l2.getChainId(),
      l1.getBlock(),
      l2.getBlock(),
    ]);
    if (l1Id !== n.l1Id || l2Id !== n.l2Id) throw new VerificationError();
    const reporter = {
      address: n.reporter as Address,
      abi: reporterAbi,
      blockNumber: b1.number,
    } as const;
    const feed = {
      address: n.feed as Address,
      abi: feedAbi,
      blockNumber: b2.number,
    } as const;
    const [
      code1,
      code2,
      l2Feed,
      l1Reporter,
      childChainId,
      round,
      reason,
      healthyUntil,
      observedBlock,
      heartbeatSequence,
      l1Sequence,
      l2Sequence,
      l1Version,
      l2Version,
      l1Healthy,
      threshold,
      observers,
      balance,
      statusQuote,
      configQuote,
      owner,
    ] = await Promise.all([
      l1.getCode({ address: reporter.address, blockNumber: b1.number }),
      l2.getCode({ address: feed.address, blockNumber: b2.number }),
      l1.readContract({ ...reporter, functionName: "l2Feed" }),
      l2.readContract({ ...feed, functionName: "l1Reporter" }),
      l1.readContract({ ...reporter, functionName: "childChainId" }),
      l2.readContract({ ...feed, functionName: "latestRoundData" }),
      l2.readContract({ ...feed, functionName: "availabilityReason" }),
      l2.readContract({ ...feed, functionName: "healthyUntil" }),
      l2.readContract({ ...feed, functionName: "lastObservedBlockNumber" }),
      l2.readContract({ ...feed, functionName: "lastHeartbeatStatusSequence" }),
      l1.readContract({ ...reporter, functionName: "statusSequence" }),
      l2.readContract({ ...feed, functionName: "statusSequence" }),
      l1.readContract({ ...reporter, functionName: "observerSetVersion" }),
      l2.readContract({ ...feed, functionName: "observerSetVersion" }),
      l1.readContract({ ...reporter, functionName: "healthy" }),
      l2.readContract({ ...feed, functionName: "threshold" }),
      l2.readContract({ ...feed, functionName: "observers" }),
      l1.getBalance({ address: reporter.address, blockNumber: b1.number }),
      l1.readContract({ ...reporter, functionName: "quoteStatusRetryable" }),
      l1.readContract({
        ...reporter,
        functionName: "quoteConfigurationRetryable",
      }),
      l1.readContract({ ...reporter, functionName: "owner" }),
    ]);
    if (
      !code1 ||
      !code2 ||
      keccak256(code1) !== n.reporterHash ||
      keccak256(code2) !== n.feedHash ||
      l2Feed.toLowerCase() !== n.feed.toLowerCase() ||
      l1Reporter.toLowerCase() !== n.reporter.toLowerCase() ||
      childChainId !== BigInt(n.l2Id)
    )
      throw new VerificationError();
    const fromBlock = b2.number > 9999n ? b2.number - 9999n : 0n;
    let events: FeedEvent[] = [];
    let eventsAvailable = true;
    try {
      const ranges = [];
      for (let start = fromBlock; start <= b2.number; start += 2000n) {
        const end = start + 1999n < b2.number ? start + 1999n : b2.number;
        ranges.push(
          l2.getLogs({
            address: feed.address,
            events: eventAbi,
            fromBlock: start,
            toBlock: end,
            strict: true,
          }),
        );
      }
      const logs = (await Promise.all(ranges)).flat();
      events = logs
        .slice(-40)
        .reverse()
        .map((log) => ({
          name: log.eventName,
          block: Number(log.blockNumber),
          transaction: log.transactionHash,
          logIndex: log.logIndex,
          detail:
            log.eventName === "HealthyLeaseRenewed"
              ? `Observed block ${log.args.observedBlockNumber.toString()} · ${log.args.effectiveHealthy ? "effective healthy" : "not effective healthy"}`
              : log.eventName === "L1StatusApplied"
                ? `L1 ${log.args.healthy ? "healthy" : "impaired"} · sequence ${log.args.statusSequence.toString()}`
                : log.eventName === "ConfigurationApplied"
                  ? `Observer set ${log.args.observerSetVersion.toString()} · threshold ${log.args.threshold}`
                  : `Sequence ${log.args.statusSequence.toString()} · lease invalidated`,
        }));
    } catch {
      eventsAvailable = false;
    }
    const maxQuote = statusQuote > configQuote ? statusQuote : configQuote;
    return {
      ...base,
      available: true,
      l1Block: Number(b1.number),
      l2Block: Number(b2.number),
      l1Timestamp: Number(b1.timestamp),
      l2Timestamp: Number(b2.timestamp),
      answer: Number(round[1]),
      reason,
      startedAt: Number(round[2]),
      updatedAt: Number(round[3]),
      healthyUntil: Number(healthyUntil),
      observedBlock: Number(observedBlock),
      heartbeatSequence: Number(heartbeatSequence),
      l1Sequence: Number(l1Sequence),
      l2Sequence: Number(l2Sequence),
      l1Version: Number(l1Version),
      l2Version: Number(l2Version),
      l1Healthy,
      threshold,
      observers: [...observers],
      reporterBalance: formatEther(balance),
      reserveMessages:
        maxQuote > 0n
          ? Math.min(Number(balance / maxQuote), 999999)
          : undefined,
      owner,
      events,
      eventsAvailable,
      eventsFromBlock: Number(fromBlock),
    };
  } catch (error) {
    // Raw transport exceptions may contain credentials. Never log or serialize them.
    return {
      ...base,
      available: false,
      error:
        error instanceof VerificationError
          ? "verification-failed"
          : "read-failed",
    };
  }
}

export const getSnapshot = createCache<Network, Snapshot>(20_000, readSnapshot);
