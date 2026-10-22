import type { Assessment, Snapshot } from "./types";
export const MAX_DATA_AGE = 90;
export const MAX_L1_AGE = 180;
export const MAX_L2_AGE = 90;
export function assess(s: Snapshot | null, now: number): Assessment {
  if (!s)
    return {
      tone: "neutral",
      label: "Reading the signal",
      description:
        "Connecting to Ethereum and Robinhood for a verified snapshot.",
      fresh: false,
    };
  if (!s.available)
    return {
      tone: "neutral",
      label: "Signal unavailable",
      description:
        s.error === "not-configured"
          ? "Live data is not connected for this network. Contract references and documentation remain available."
          : "The dashboard could not verify a complete chain snapshot. Feed health is unknown.",
      fresh: false,
    };
  const times = [s.fetchedAt, s.l1Timestamp, s.l2Timestamp];
  if (
    !Number.isFinite(now) ||
    times.some(
      (t) =>
        t === undefined || !Number.isSafeInteger(t) || t <= 0 || t > now + 30,
    ) ||
    now - s.fetchedAt > MAX_DATA_AGE ||
    now - s.l1Timestamp! > MAX_L1_AGE ||
    now - s.l2Timestamp! > MAX_L2_AGE
  )
    return {
      tone: "warning",
      label: "Observation is stale",
      description:
        "The latest observation is too old or its timestamp is invalid. Previously reported health is not a current availability guarantee.",
      fresh: false,
    };
  if (s.reason === 0)
    return {
      tone: "warning",
      label: "Awaiting initialization",
      description:
        "The L2 feed has not received its initial observer configuration.",
      fresh: true,
    };
  if (s.reason === 2 || s.l1Healthy === false)
    return {
      tone: "danger",
      label: "Impairment reported",
      description:
        "The authoritative L1 reporter or L2 feed reports impairment. Consumers should keep protected actions paused.",
      fresh: true,
    };
  if (s.reason === 3 || !s.healthyUntil || s.healthyUntil <= now)
    return {
      tone: "danger",
      label: "Heartbeat expired",
      description:
        "The heartbeat lease has expired. A fresh, valid heartbeat is required before the signal can recover.",
      fresh: true,
    };
  if (
    [
      s.l1Sequence,
      s.l2Sequence,
      s.heartbeatSequence,
      s.l1Version,
      s.l2Version,
      s.healthyUntil,
    ].some((v) => !Number.isSafeInteger(v) || v! < 0)
  )
    return {
      tone: "warning",
      label: "Signal incomplete",
      description:
        "The observation is missing valid sequence, configuration, or lease data. Availability is unknown.",
      fresh: true,
    };
  if (
    s.l1Sequence !== s.l2Sequence ||
    s.l1Version !== s.l2Version ||
    s.heartbeatSequence !== s.l2Sequence
  )
    return {
      tone: "warning",
      label: "Signal synchronizing",
      description:
        "The L1 reporter, L2 feed, and heartbeat are not yet on the same configuration and status sequence.",
      fresh: true,
    };
  if (s.reason !== 1 || s.answer !== 0 || s.l1Healthy !== true)
    return {
      tone: "warning",
      label: "Signal inconsistent",
      description:
        "The observed feed fields do not establish a healthy signal. Treat availability as unknown.",
      fresh: true,
    };
  return {
    tone: "healthy",
    label: "Signal healthy",
    description:
      "L1 reports healthy. The L2 heartbeat is current. Both chains agree on the status sequence.",
    fresh: true,
  };
}
export function duration(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
