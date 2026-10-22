export const docs = [
  {
    slug: "architecture",
    title: "How the signal works",
    description:
      "Follow the path from independent observers to an Ethereum-anchored, renewable availability signal.",
    category: "THE FUNDAMENTALS",
    time: "4 min",
    sections: [
      "Two conditions, one answer",
      "Observe, anchor, renew",
      "What happens during a freeze",
      "Recovery is a new boundary",
    ],
  },
  {
    slug: "integration",
    title: "Integrate the feed",
    description:
      "Read the availability signal, fail closed, and enforce a recovery grace period appropriate to your protocol.",
    category: "BUILD WITH THE FEED",
    time: "5 min",
    sections: [
      "Choose the deployment",
      "Guard a sensitive action",
      "Handle failure explicitly",
      "Test your integration",
    ],
  },
  {
    slug: "reference",
    title: "Feed reference",
    description:
      "The public read interface, diagnostic states, and events exposed by the Robinhood availability feed.",
    category: "TECHNICAL REFERENCE",
    time: "4 min",
    sections: [
      "Aggregator interface",
      "Diagnostic states",
      "Configuration and heartbeat reads",
      "Feed events",
    ],
  },
  {
    slug: "trust-model",
    title: "Trust & failure model",
    description:
      "Understand observer authority, cross-chain delays, stale observations, and the limits of the signal.",
    category: "KNOW THE BOUNDARIES",
    time: "4 min",
    sections: [
      "What this signal establishes",
      "Observer and owner authority",
      "Cross-chain timing",
      "Dashboard freshness",
    ],
  },
  {
    slug: "operations",
    title: "Operating the signal",
    description:
      "A guide to quorum, heartbeat renewal, relay funding, monitoring, and recovery procedures.",
    category: "OPERATOR HANDBOOK",
    time: "4 min",
    sections: [
      "Roles and responsibilities",
      "What to monitor",
      "Incident response",
      "Private services stay private",
    ],
  },
] as const;
export type DocSlug = (typeof docs)[number]["slug"];
export function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
export const integrationCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAvailabilityFeed {
    function latestRoundData() external view returns (
        uint80 roundId, int256 answer, uint256 startedAt,
        uint256 updatedAt, uint80 answeredInRound
    );
}

abstract contract SequencerGuard {
    IAvailabilityFeed public immutable sequencerFeed;
    uint256 public immutable recoveryGrace;

    error InvalidFeed();
    error SequencerUnavailable();
    error RecoveryGraceActive();

    constructor(address verifiedFeed, uint256 graceSeconds) {
        if (verifiedFeed.code.length == 0) revert InvalidFeed();
        sequencerFeed = IAvailabilityFeed(verifiedFeed);
        recoveryGrace = graceSeconds;
    }

    modifier whenSequencerReady() {
        // Read failures propagate: the protected action stays closed.
        (, int256 answer, uint256 startedAt,,) =
            sequencerFeed.latestRoundData();

        if (answer != 0 || startedAt == 0 ||
            startedAt > block.timestamp) {
            revert SequencerUnavailable();
        }
        if (block.timestamp - startedAt <= recoveryGrace) {
            revert RecoveryGraceActive();
        }
        _;
    }
}`;
