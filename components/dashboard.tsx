"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Check,
  CircleHelp,
  Clock3,
  Database,
  ExternalLink as ExternalIcon,
  Fingerprint,
  GitBranch,
  HeartPulse,
  Radio,
  RefreshCw,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { useSignal } from "./provider";
import { Badge, CopyButton, ExternalLink } from "./ui";
import { duration } from "@/lib/status";
import { networks, shortAddress, sourceUrl } from "@/lib/networks";
import type { FeedEvent } from "@/lib/types";

const fmt = (value: number | undefined) =>
  value === undefined ? "—" : value.toLocaleString("en-US");
const eventLabels: Record<string, string> = {
  HealthyLeaseRenewed: "Heartbeat renewed",
  L1StatusApplied: "L1 status delivered",
  ConfigurationApplied: "Configuration applied",
  HealthyLeaseInvalidated: "Heartbeat invalidated",
};

function RefreshButton() {
  const { refresh, refreshing } = useSignal();
  return (
    <button
      className="button subtle"
      disabled={refreshing}
      onClick={() => void refresh()}
    >
      <RefreshCw size={14} className={refreshing ? "spin" : ""} />
      {refreshing ? "Refreshing" : "Refresh"}
    </button>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <RefreshButton />
    </div>
  );
}

function OrbitalSignal() {
  const { assessment, snapshot: s } = useSignal();
  return (
    <div className={`orbital ${assessment.tone}`} aria-hidden="true">
      <svg viewBox="0 0 450 290">
        <defs>
          <radialGradient id="orbital-glow">
            <stop offset="0" stopColor="currentColor" stopOpacity=".15" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="235"
          cy="145"
          rx="200"
          ry="140"
          fill="url(#orbital-glow)"
        />
        <g className="orbit-lines" fill="none" stroke="currentColor">
          <ellipse
            cx="235"
            cy="145"
            rx="173"
            ry="65"
            transform="rotate(-24 235 145)"
          />
          <ellipse
            cx="235"
            cy="145"
            rx="135"
            ry="96"
            transform="rotate(32 235 145)"
          />
          <ellipse
            cx="235"
            cy="145"
            rx="85"
            ry="112"
            transform="rotate(49 235 145)"
          />
          <circle cx="235" cy="145" r="44" strokeDasharray="2 6" />
        </g>
        <path
          d="M61 145H409M235 19V271"
          stroke="currentColor"
          opacity=".1"
          strokeDasharray="3 7"
        />
        <circle
          cx="235"
          cy="145"
          r="27"
          fill="#121b0f"
          stroke="currentColor"
          strokeOpacity=".5"
        />
        <path
          d="M219 145h9l4-10 6 21 5-11h9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="78" cy="202" r="5" fill="currentColor" />
        <circle cx="364" cy="81" r="4" fill="currentColor" />
        <circle cx="294" cy="241" r="3" fill="currentColor" opacity=".5" />
        <text x="71" y="226">
          L1 / ETHEREUM
        </text>
        <text x="322" y="62">
          L2 / ROBINHOOD
        </text>
      </svg>
      <div className="orbital-caption">
        <span className="tiny-cross">+</span>{" "}
        {s?.available
          ? `STATUS SEQUENCE ${s.l2Sequence}`
          : "TWO CHAINS. ONE SIGNAL."}{" "}
        <span className="tiny-cross">+</span>
      </div>
    </div>
  );
}

function SignalPath() {
  const { snapshot: s, assessment, href, network } = useSignal();
  const known = s?.available && assessment.fresh;
  const synced =
    known && s.l1Sequence === s.l2Sequence && s.l1Version === s.l2Version;
  return (
    <section className="panel signal-path">
      <div className="panel-heading">
        <div>
          <h2>The signal path</h2>
          <p>Independent observation. Ethereum ordering. Robinhood delivery.</p>
        </div>
        <Link href={href("/docs/architecture")} className="text-link">
          How it works <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="path-steps">
        <div className="path-step">
          <span className="step-index">01 / OBSERVE</span>
          <div className="path-title">
            <span className="path-icon">
              <Radio size={21} />
            </span>
            <h3>Observer quorum</h3>
          </div>
          <p>Independent observers attest to sequencer availability.</p>
          <span className="path-meta">
            {s?.available
              ? `${s.threshold} of ${s.observers?.length} signatures required`
              : "Strict-majority signatures"}
          </span>
        </div>
        <div className="path-connector">
          <span />
          <ArrowRight size={16} />
        </div>
        <div className="path-step">
          <span className="step-index">02 / ANCHOR</span>
          <div className="path-title">
            <span className="path-icon">
              <GitBranch size={21} />
            </span>
            <h3>{networks[network].l1Label} reporter</h3>
          </div>
          <p>Status transitions are recorded in canonical L1 order.</p>
          <span
            className={`path-meta ${known && s.l1Healthy ? "positive" : ""}`}
          >
            {known
              ? s.l1Healthy
                ? "Healthy attestation"
                : "Impairment recorded"
              : "Awaiting observation"}
          </span>
        </div>
        <div className="path-connector">
          <span />
          <ArrowRight size={16} />
        </div>
        <div className="path-step">
          <span className="step-index">03 / RENEW</span>
          <div className="path-title">
            <span className="path-icon">
              <Waves size={21} />
            </span>
            <h3>Robinhood feed</h3>
          </div>
          <p>A renewable heartbeat keeps the availability lease current.</p>
          <span className={`path-meta ${synced ? "positive" : ""}`}>
            {known
              ? synced
                ? "L1 and L2 synchronized"
                : "Synchronization pending"
              : "Awaiting observation"}
          </span>
        </div>
      </div>
      <div className="path-footnote">
        <ShieldCheck size={14} />
        <span>
          A healthy signal requires both a healthy L1 status and a valid L2
          heartbeat.
        </span>
      </div>
    </section>
  );
}

function EventsTable({
  events,
  limit,
}: {
  events: FeedEvent[];
  limit?: number;
}) {
  const { network } = useSignal();
  return (
    <div className="events-table">
      <div className="event-table-head">
        <span>EVENT</span>
        <span>BLOCK</span>
        <span>TRANSACTION</span>
      </div>
      {events.slice(0, limit).map((event) => (
        <div
          className="event-row"
          key={`${event.transaction}:${event.logIndex}`}
        >
          <div className="event-main">
            <span
              className={`event-icon ${event.name === "HealthyLeaseInvalidated" ? "amber" : ""}`}
            >
              {event.name === "HealthyLeaseRenewed" ? (
                <HeartPulse size={17} />
              ) : (
                <GitBranch size={17} />
              )}
            </span>
            <div>
              <strong>{eventLabels[event.name] ?? event.name}</strong>
              <p>{event.detail}</p>
            </div>
          </div>
          <span className="mono event-block">{fmt(event.block)}</span>
          <ExternalLink
            href={`${networks[network].l2Explorer}/tx/${event.transaction}`}
            className="event-tx mono"
          >
            {shortAddress(event.transaction)}
          </ExternalLink>
        </div>
      ))}
    </div>
  );
}
function ActivityEmpty() {
  const { snapshot: s } = useSignal();
  return (
    <div className="empty-state">
      <Activity size={25} />
      <h3>
        {s?.available && s.eventsAvailable
          ? "No events in this window"
          : "Waiting for event data"}
      </h3>
      <p>
        {s?.available && s.eventsAvailable
          ? "No matching feed events were found in the latest 10,000 blocks. This is not a historical uptime measurement."
          : "Verified onchain events will appear here when the event read succeeds."}
      </p>
    </div>
  );
}

export function Overview() {
  const { snapshot: s, now, assessment: a, href, network } = useSignal();
  const remaining =
    s?.available && a.fresh ? Math.max(0, (s.healthyUntil ?? 0) - now) : null;
  return (
    <>
      <PageHeading
        eyebrow="SEQUENCER AVAILABILITY"
        title="A clear view of the signal."
        description="Observe the connection between Ethereum and Robinhood Chain."
      />
      <section className={`hero panel ${a.tone}`}>
        <div className="hero-content">
          <div className="hero-topline">
            <span className="eyebrow">ROBINHOOD SEQUENCER FEED</span>
            <Badge tone={a.tone}>
              {a.fresh ? "Onchain observation" : "Awaiting verification"}
            </Badge>
          </div>
          <div className="hero-status">
            <span className={`status-indicator ${a.tone}`}>
              {a.tone === "healthy" ? <Check size={23} /> : <Radio size={23} />}
            </span>
            <h2>{a.label}</h2>
          </div>
          <p className="hero-description">{a.description}</p>
          <div className="hero-bottom">
            <span className="mono">
              {s?.available
                ? `ANSWER ${s.answer} / ${a.fresh ? "OBSERVED" : "LAST KNOWN"}`
                : "ANSWER — / UNKNOWN"}
            </span>
            <span className="hero-divider" />
            <span>
              {s
                ? `${Math.max(0, now - s.fetchedAt)}s since snapshot`
                : "Reading both chains"}
            </span>
          </div>
        </div>
        <OrbitalSignal />
      </section>
      <div className="metrics-grid">
        <article className="metric">
          <div className="metric-label">
            <HeartPulse size={16} />
            Heartbeat lease
            <CircleHelp size={14}>
              <title>
                Time remaining on the accepted heartbeat, using wall-clock time.
              </title>
            </CircleHelp>
          </div>
          <div className="metric-value">
            {remaining === null ? "—" : duration(remaining)}
            <span>{remaining === null ? "awaiting data" : "remaining"}</span>
          </div>
          <div className="lease-track">
            <span
              style={{
                width: `${remaining === null ? 0 : Math.min(100, (remaining / 900) * 100)}%`,
              }}
            />
          </div>
          <p>15-minute maximum lease</p>
        </article>
        <article className="metric">
          <div className="metric-label">
            <Fingerprint size={16} />
            Required quorum
          </div>
          <div className="metric-value">
            {s?.available ? s.threshold : "—"}
            <span>of {s?.available ? s.observers?.length : "—"} observers</span>
          </div>
          <div className="quorum-dots">
            {Array.from({ length: s?.observers?.length ?? 5 }, (_, i) => (
              <span
                key={i}
                className={s?.available && i < s.threshold! ? "filled" : ""}
              />
            ))}
          </div>
          <p>Configured membership · not online status</p>
        </article>
        <article className="metric">
          <div className="metric-label">
            <Box size={16} />
            Latest L2 block
          </div>
          <div className="metric-value block-value">{fmt(s?.l2Block)}</div>
          <div className="metric-sub">
            <span className={a.fresh ? "positive" : ""}>
              {s?.l2Timestamp ? `${Math.max(0, now - s.l2Timestamp)}s` : "—"}
            </span>{" "}
            block age
          </div>
          <p>Chain ID {networks[network].l2Id}</p>
        </article>
        <article className="metric">
          <div className="metric-label">
            <Database size={16} />
            L1 relay reserve
          </div>
          <div className="metric-value">
            {s?.reporterBalance ? Number(s.reporterBalance).toFixed(4) : "—"}
            <span>ETH</span>
          </div>
          <div className="metric-sub">
            {s?.reserveMessages !== undefined
              ? `~${fmt(s.reserveMessages)} messages at current quote`
              : "Awaiting retryable fee quote"}
          </div>
          <p>Excludes submitting relayer gas</p>
        </article>
      </div>
      <SignalPath />
      <div className="lower-grid">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Latest signal activity</h2>
              <p>Evidence, directly from the feed.</p>
            </div>
            <Link href={href("/activity")} className="text-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {s?.events?.length ? (
            <EventsTable events={s.events} limit={4} />
          ) : (
            <ActivityEmpty />
          )}
          <div className="panel-bottom">
            <Clock3 size={13} /> Latest 10,000 L2 blocks · auto-refreshes every
            30s
          </div>
        </section>
        <section className="integration-card">
          <div className="eyebrow">BUILD WITH CONFIDENCE</div>
          <div className="integration-icon">
            <BookOpen size={25} />
            <span>↗</span>
          </div>
          <h2>
            A safer starting point
            <br />
            for your integration.
          </h2>
          <p>
            Understand the signal, check the feed, and handle recovery with
            care.
          </p>
          <Link href={href("/docs/integration")} className="button primary">
            Integration guide <ArrowUpRight size={17} />
          </Link>
          <Link href={href("/docs/architecture")} className="text-link">
            Explore the architecture <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      <div className="scope-note">
        <ShieldCheck size={17} />
        <p>
          An EqualFi Labs availability signal. Independently operated; not a
          Chainlink or Robinhood service. Observes production and agreement, not
          transaction inclusion.{" "}
          <Link href={href("/docs/trust-model")}>
            Understand the trust model <ArrowUpRight size={12} />
          </Link>
        </p>
      </div>
    </>
  );
}

export function ActivityPage() {
  const { snapshot: s, assessment: a } = useSignal();
  const [filter, setFilter] = useState("all");
  const events = (s?.events ?? []).filter(
    (e) =>
      filter === "all" ||
      (filter === "heartbeat"
        ? e.name.startsWith("HealthyLease")
        : !e.name.startsWith("HealthyLease")),
  );
  return (
    <>
      <PageHeading
        eyebrow="ONCHAIN EVIDENCE"
        title="Every signal leaves a trace."
        description="Explore the latest heartbeat renewals and status deliveries on Robinhood."
      />
      <div className="activity-summary">
        <Badge tone={a.tone}>{a.label}</Badge>
        <span className="mono">
          {s?.eventsFromBlock !== undefined
            ? `BLOCKS ${fmt(s.eventsFromBlock)} — ${fmt(s.l2Block)}`
            : "AWAITING BLOCK WINDOW"}
        </span>
        <span>{s?.events?.length ?? 0} events loaded</span>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>Feed event log</h2>
          <div className="segmented" aria-label="Filter events">
            {[
              ["all", "All events"],
              ["heartbeat", "Heartbeats"],
              ["status", "Status & config"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={filter === key ? "selected" : ""}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {events.length ? (
          <EventsTable events={events} />
        ) : s?.events?.length ? (
          <div className="empty-state">
            <Activity size={24} />
            <h3>No matching events</h3>
            <p>Try another event filter.</p>
            <button className="button subtle" onClick={() => setFilter("all")}>
              Show all events
            </button>
          </div>
        ) : (
          <ActivityEmpty />
        )}
      </section>
      <div className="callout">
        <CircleHelp size={20} />
        <div>
          <h3>A recent event window, not an uptime chart</h3>
          <p>
            This view reads up to 40 matching events from the latest 10,000 L2
            blocks. RPC failures, events outside that window, and lease expiries
            without a transaction are not reconstructed. The feed can expire
            even when no new event is emitted. Latest-block observations may
            change after a reorganization.
          </p>
        </div>
      </div>
    </>
  );
}

export function ContractsPage() {
  const { network, snapshot: s, assessment: a, href } = useSignal();
  const n = networks[network];
  return (
    <>
      <PageHeading
        eyebrow="VERIFY THE SOURCE"
        title="Two chains. Explicit trust."
        description="Inspect the contracts and configuration behind the availability signal."
      />
      <div className="contract-grid">
        {[
          {
            label: "L1 STATUS REPORTER",
            name: "Ethereum anchor",
            chain: n.l1Label,
            id: n.l1Id,
            address: n.reporter,
            hash: n.reporterHash,
            explorer: n.l1Explorer,
            description:
              "Orders quorum-attested status changes and funds their delivery to Robinhood.",
          },
          {
            label: "L2 AVAILABILITY FEED",
            name: "Robinhood signal",
            chain: "Robinhood",
            id: n.l2Id,
            address: n.feed,
            hash: n.feedHash,
            explorer: n.l2Explorer,
            description:
              "Combines authenticated L1 status with a renewable heartbeat lease.",
          },
        ].map((c, i) => (
          <article className="panel contract-card" key={c.address}>
            <div className="contract-top">
              <span className="eyebrow">{c.label}</span>
              <span className="contract-number">0{i + 1}</span>
            </div>
            <div className="contract-symbol">
              {i ? <Waves size={30} /> : <GitBranch size={30} />}
            </div>
            <h2>{c.name}</h2>
            <p>{c.description}</p>
            <div className="contract-network">
              <span>{c.chain}</span>
              <span className="mono">CHAIN {c.id}</span>
            </div>
            <label>CONTRACT ADDRESS</label>
            <div className="address-box">
              <code>{c.address}</code>
              <CopyButton
                compact
                value={c.address}
                label={`Copy ${c.chain} contract address`}
              />
            </div>
            <ExternalLink
              className="button subtle"
              href={`${c.explorer}/address/${c.address}`}
            >
              View on explorer
            </ExternalLink>
            <details className="hash-details">
              <summary>Expected runtime hash</summary>
              <code>{c.hash}</code>
            </details>
          </article>
        ))}
      </div>
      <section className="panel config-panel">
        <div className="panel-heading">
          <div>
            <h2>Observed configuration</h2>
            <p>Live values from the selected deployment.</p>
          </div>
          <Badge tone={s?.available && a.fresh ? "healthy" : "neutral"}>
            {s?.available
              ? a.fresh
                ? "Runtime verified"
                : "Last verified snapshot"
              : "Not yet verified"}
          </Badge>
        </div>
        <dl className="config-grid">
          <div>
            <dt>L1 status sequence</dt>
            <dd>{fmt(s?.l1Sequence)}</dd>
          </div>
          <div>
            <dt>L2 status sequence</dt>
            <dd>{fmt(s?.l2Sequence)}</dd>
          </div>
          <div>
            <dt>Observer set · L1 / L2</dt>
            <dd>{s?.available ? `${s.l1Version} / ${s.l2Version}` : "—"}</dd>
          </div>
          <div>
            <dt>Heartbeat sequence</dt>
            <dd>{fmt(s?.heartbeatSequence)}</dd>
          </div>
        </dl>
        <div className="observer-section">
          <h3>
            Authorized observers <span>{s?.observers?.length ?? "—"}</span>
          </h3>
          <p>
            Onchain membership does not establish operator independence or
            current online health.
          </p>
          {s?.observers?.length ? (
            <div className="observer-list">
              {s.observers.map((address, i) => (
                <div key={address}>
                  <span className="observer-avatar">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <code>{address}</code>
                  <CopyButton
                    compact
                    value={address}
                    label={`Copy observer ${i + 1} address`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">
              Observer membership will appear after a verified read.
            </p>
          )}
        </div>
        {s?.owner && (
          <div className="owner-row">
            <span>Reporter owner</span>
            <ExternalLink
              href={`${n.l1Explorer}/address/${s.owner}`}
              className="mono"
            >
              {shortAddress(s.owner)}
            </ExternalLink>
          </div>
        )}
      </section>
      <div className="callout">
        <Fingerprint size={20} />
        <div>
          <h3>Public provenance, explicit boundaries</h3>
          <p>
            Addresses and expected bytecode hashes come from the oracle
            repository’s deployment manifest. Successful reads verify both
            runtime hashes, chain IDs, and reporter/feed bindings at the
            displayed blocks. L1 and L2 are observed separately; this is not an
            atomic cross-chain proof.
          </p>
          <div className="inline-links">
            <ExternalLink
              href={`${sourceUrl}/blob/main/deployments/robinhood-${network}.json`}
            >
              Deployment manifest
            </ExternalLink>
            <Link href={href("/docs/trust-model")}>
              Trust model <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
