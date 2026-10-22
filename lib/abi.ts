import { parseAbi } from "viem";
export const feedAbi = parseAbi([
  "function l1Reporter() view returns (address)",
  "function observerSetVersion() view returns (uint64)",
  "function statusSequence() view returns (uint64)",
  "function lastHeartbeatStatusSequence() view returns (uint64)",
  "function lastObservedBlockNumber() view returns (uint64)",
  "function healthyUntil() view returns (uint64)",
  "function availabilityReason() view returns (uint8)",
  "function threshold() view returns (uint8)",
  "function observers() view returns (address[])",
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
]);
export const reporterAbi = parseAbi([
  "function l2Feed() view returns (address)",
  "function childChainId() view returns (uint256)",
  "function owner() view returns (address)",
  "function healthy() view returns (bool)",
  "function observerSetVersion() view returns (uint64)",
  "function statusSequence() view returns (uint64)",
  "function quoteStatusRetryable() view returns (uint256)",
  "function quoteConfigurationRetryable() view returns (uint256)",
]);
export const eventAbi = parseAbi([
  "event ConfigurationApplied(uint64 indexed observerSetVersion, uint64 indexed statusSequence, uint8 threshold, bytes32 observerSetHash)",
  "event L1StatusApplied(uint64 indexed observerSetVersion, uint64 indexed statusSequence, bool healthy, uint64 observedAt, uint64 receivedAt)",
  "event HealthyLeaseRenewed(uint64 indexed statusSequence, uint64 indexed observedBlockNumber, bytes32 observedBlockHash, uint64 validUntil, bool effectiveHealthy)",
  "event HealthyLeaseInvalidated(uint64 previousHealthyUntil, uint64 invalidatedAt, uint64 indexed statusSequence)",
]);
