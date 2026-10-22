"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  GitBranch,
  Radio,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { useSignal } from "./provider";
import { CodeBlock, ExternalLink } from "./ui";
import { docs, sectionId, integrationCode, type DocSlug } from "@/lib/docs";
import { networks, sourceUrl } from "@/lib/networks";

const icons = [GitBranch, Braces, BookOpen, ShieldCheck, Wrench];
export function DocsIndex() {
  const { href } = useSignal();
  return (
    <>
      <section className="docs-intro">
        <div className="eyebrow">STATICS ORACLE / DOCUMENTATION</div>
        <h1>
          Understand the signal.
          <br />
          Build with confidence.
        </h1>
        <p>
          An Ethereum-anchored availability signal for Robinhood Chain. Learn
          what it observes, how it fails closed, and how to use it in your
          protocol.
        </p>
        <Link href={href("/docs/integration")} className="button primary">
          Start integrating <ArrowUpRight size={17} />
        </Link>
      </section>
      <div className="docs-cards">
        {docs.map((doc, i) => {
          const Icon = icons[i];
          return (
            <Link
              href={href(`/docs/${doc.slug}`)}
              className="doc-card"
              key={doc.slug}
            >
              <div className="doc-card-top">
                <Icon size={25} />
                <span>0{i + 1}</span>
              </div>
              <h2>{doc.title}</h2>
              <p>{doc.description}</p>
              <div className="doc-card-foot">
                <span>{doc.time} read</span>
                <ArrowUpRight size={17} />
              </div>
            </Link>
          );
        })}
        <a
          className="doc-card"
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="doc-card-top">
            <Radio size={25} />
            <span>SOURCE</span>
          </div>
          <h2>Inspect the implementation</h2>
          <p>
            Explore the contracts, observer services, tests, and deployment
            runbooks in the open-source repository.
          </p>
          <div className="doc-card-foot">
            <span>EqualFiLabs / statics-oracle</span>
            <ArrowUpRight size={17} />
          </div>
        </a>
      </div>
    </>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="doc-section" id={sectionId(title)}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="callout">
      <ShieldCheck size={20} />
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
function Architecture() {
  return (
    <>
      <Section title="Two conditions, one answer">
        <p>
          The feed reports <code>answer = 0</code> only when its authenticated
          L1 status is healthy and its L2 heartbeat lease is valid. Otherwise it
          reports <code>answer = 1</code>. It follows the Chainlink uptime-feed
          answer convention, but is an independently operated EqualFi Labs
          signal.
        </p>
        <Note title="Availability is renewable">
          Healthy is a lease, not a permanent state. If the observer or relay
          path stops renewing it, the feed becomes unavailable as time advances,
          without requiring a separate down-marking transaction.
        </Note>
      </Section>
      <Section title="Observe, anchor, renew">
        <ol>
          <li>
            <strong>Observe.</strong> Observers sample the direct sequencer
            WebSocket and an independent Robinhood RPC. A process starts
            unknown. Three consecutive successful samples establish health;
            three consecutive failures establish impairment. Recovery requires
            three new consecutive successes.
          </li>
          <li>
            <strong>Anchor.</strong> A strict majority signs a fresh status
            transition. The Ethereum reporter verifies the quorum,
            configuration, freshness, and sequence, then records the transition
            and creates a retryable ticket.
          </li>
          <li>
            <strong>Renew.</strong> The Robinhood feed accepts status from the
            aliased L1 reporter. Separately, a quorum signs heartbeats bound to
            the current observer set, status sequence, and recent canonical L2
            block. Each accepted lease lasts at most 15 minutes.
          </li>
        </ol>
        <p>
          The reference services poll every 30 seconds. Healthy observers target
          five-minute heartbeat renewal; the coordinator renews when ten minutes
          or less remain.
        </p>
      </Section>
      <Section title="What happens during a freeze">
        <p>
          A frozen Robinhood chain cannot advance its own timestamp or execute
          transactions. Its last RPC answer can therefore look healthy even
          while block production has stopped. Ethereum can still record
          impairment, and the dashboard separately checks block freshness
          against wall-clock time.
        </p>
        <p>
          Once L2 resumes, the queued impairment can be delivered and the old
          lease can expire. Consumers must still enforce their own recovery
          grace; the dashboard is an observation tool, not an onchain
          transaction gate.
        </p>
      </Section>
      <Section title="Recovery is a new boundary">
        <p>
          Heartbeats are bound to the status sequence. An old signature cannot
          restore health after a newer transition. Observer configuration
          changes invalidate the lease, and a healthy catch-up that skips
          transitions requires a fresh heartbeat.
        </p>
        <p>
          The feed’s <code>startedAt</code> marks the effective state boundary.
          Integrators use this value to measure their selected recovery grace
          period after the signal becomes healthy again.
        </p>
      </Section>
    </>
  );
}
function Integration() {
  const { network, href } = useSignal();
  const n = networks[network];
  return (
    <>
      <Section title="Choose the deployment">
        <p>
          Use this feed for consuming contracts on Robinhood Mainnet (chain
          4663). The Ethereum reporter is the status anchor; it is not the
          consumer feed.
        </p>
        <CodeBlock label={`${n.label} · chain ${n.l2Id}`} code={n.feed} />
        <p>
          Confirm the address, chain, runtime hash, and expected reporter
          binding against the{" "}
          <Link href={href("/contracts")}>contract directory</Link> and
          deployment manifest before use. A code-length check alone does not
          authenticate a feed.
        </p>
      </Section>
      <Section title="Guard a sensitive action">
        <p>
          The example below provides an immutable feed binding and a guard you
          can apply to actions that require sequencer availability. Choose the
          grace period based on your protocol’s recovery needs; it is not a
          global setting of this feed.
        </p>
        <CodeBlock code={integrationCode} />
        <p>
          Apply <code>whenSequencerReady</code> to the appropriate function in
          your consuming contract. Define separately which recovery or
          risk-reducing actions should remain available during impairment.
        </p>
        <Note title="A feed guard is only one check">
          This example does not validate asset prices, collateral, oracle
          freshness, or protocol-specific risk limits. Keep those controls
          alongside the sequencer check.
        </Note>
      </Section>
      <Section title="Handle failure explicitly">
        <p>
          Require <code>answer == 0</code>, a nonzero <code>startedAt</code> no
          later than the current timestamp, and elapsed time strictly greater
          than your grace period. Reverts, missing configuration, unexpected
          answers, and malformed data must not silently permit a protected
          action.
        </p>
        <p>
          Do not use the dashboard API as a transaction authorization source.
          Read the contract within the protected transaction. Offchain systems
          must also check freshness, since a frozen chain can keep serving an
          old block.
        </p>
      </Section>
      <Section title="Test your integration">
        <ul>
          <li>
            Healthy signal with grace still active, exactly at the boundary, and
            after the boundary.
          </li>
          <li>
            L1-reported impairment, expired heartbeat, uninitialized feed, and
            reverting feed reads.
          </li>
          <li>
            Zero or future state timestamps and unexpected nonzero answers.
          </li>
          <li>
            Recovery following configuration rotation or a skipped status
            transition.
          </li>
          <li>
            The exact deployed feed binding on the intended network,
            independently of unit-test mocks.
          </li>
        </ul>
      </Section>
    </>
  );
}
function Reference() {
  return (
    <>
      <Section title="Aggregator interface">
        <CodeBlock
          code={`function latestRoundData() external view returns (
    uint80 roundId,
    int256 answer,          // 0: healthy, 1: unavailable
    uint256 startedAt,     // effective state boundary
    uint256 updatedAt,
    uint80 answeredInRound
);`}
        />
        <p>
          A healthy-to-expired transition can be computed by the view function
          before any mutation records it. The expiry boundary is{" "}
          <code>healthyUntil</code>. Do not assume every answer change has a
          matching transaction or emitted event.
        </p>
      </Section>
      <Section title="Diagnostic states">
        <table className="doc-table">
          <thead>
            <tr>
              <th>VALUE</th>
              <th>REASON</th>
              <th>MEANING</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>UNINITIALIZED</td>
              <td>Initial observer configuration has not been applied.</td>
            </tr>
            <tr>
              <td>1</td>
              <td>HEALTHY</td>
              <td>
                Authenticated status and heartbeat permit a healthy answer.
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>L1_REPORTED_IMPAIRED</td>
              <td>The applied L1 state is impaired.</td>
            </tr>
            <tr>
              <td>3</td>
              <td>LEASE_EXPIRED</td>
              <td>The heartbeat lease no longer establishes health.</td>
            </tr>
          </tbody>
        </table>
        <p>
          These are <code>availabilityReason()</code> enum values, not the{" "}
          <code>latestRoundData()</code> answer values. Diagnostic reason{" "}
          <code>1</code> means healthy; aggregator answer <code>1</code> means
          unavailable.
        </p>
      </Section>
      <Section title="Configuration and heartbeat reads">
        <table className="doc-table">
          <thead>
            <tr>
              <th>READ</th>
              <th>PURPOSE</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["l1Reporter()", "Bound L1 reporter address."],
              [
                "observerSetVersion()",
                "Current observer configuration version.",
              ],
              [
                "observers() / threshold()",
                "Authorized signers and required signature count.",
              ],
              ["statusSequence()", "Latest applied status sequence."],
              [
                "lastHeartbeatStatusSequence()",
                "Status sequence bound to the accepted heartbeat.",
              ],
              ["healthyUntil()", "Heartbeat expiry timestamp, in seconds."],
              [
                "lastObservedBlockNumber()",
                "L2 block evidenced by the latest accepted heartbeat.",
              ],
            ].map(([name, purpose]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Feed events">
        <ul>
          <li>
            <code>ConfigurationApplied</code> — a newer observer configuration
            is accepted.
          </li>
          <li>
            <code>L1StatusApplied</code> — an authenticated L1 status is
            delivered.
          </li>
          <li>
            <code>HealthyLeaseRenewed</code> — a new heartbeat lease is
            accepted; inspect <code>effectiveHealthy</code> rather than assuming
            every renewal means health.
          </li>
          <li>
            <code>HealthyLeaseInvalidated</code> — a mutation invalidates a
            previous lease.
          </li>
        </ul>
        <p>
          The activity view includes only a recent bounded set of L2 events. It
          does not reconstruct retryable delivery lifecycle, all historical
          incidents, or observer polling history.
        </p>
      </Section>
    </>
  );
}
function TrustModel() {
  return (
    <>
      <Section title="What this signal establishes">
        <p>
          The system observes sequencer block production and agreement between
          data paths. A healthy answer represents the configured observers’
          attestation plus a live renewal path within the lease window.
        </p>
        <p>
          It does <strong>not</strong> prove inclusion fairness, censorship
          resistance, transaction settlement, price correctness, or the solvency
          of an integrating protocol. It is not operated by Chainlink or
          Robinhood.
        </p>
      </Section>
      <Section title="Observer and owner authority">
        <p>
          A strict-majority observer compromise can falsely report availability
          or renew a heartbeat. Independent operators need separate hosts,
          network paths, RPC providers, and signing keys. Multiple addresses
          alone do not establish that independence.
        </p>
        <p>
          The reporter owner controls observer membership and retryable
          configuration. Rotation fails closed until the new configuration,
          status, and heartbeat establish health. The L2 feed has no independent
          owner; it trusts authenticated messages from its bound L1 reporter.
          Inspect the actual owner onchain rather than assuming a particular
          custody setup.
        </p>
      </Section>
      <Section title="Cross-chain timing">
        <p>
          L1 and L2 update asynchronously. An L1 impairment can be recorded
          before its retryable reaches L2. Coordinators recheck state before
          submission, but L1 can still change after that check and before L2
          inclusion.
        </p>
        <p>
          The heartbeat lease bounds this race as L2 time advances; an earlier
          delivered impairment ends health sooner. A frozen L2 cannot advance
          time or execute a local marking transaction. Consumers should preserve
          their recovery controls.
        </p>
        <Note title="Two observations are not one atomic proof">
          This dashboard pins each chain’s reads to a block and compares
          configuration and status sequences. The observations are taken
          separately, and latest blocks may be reorganized.
        </Note>
      </Section>
      <Section title="Dashboard freshness">
        <p>
          The dashboard refreshes every 30 seconds and shares server snapshots
          for up to 20 seconds. It marks data stale when the snapshot exceeds 90
          seconds, the Ethereum head exceeds 180 seconds, or the Robinhood head
          exceeds 90 seconds. A timestamp more than 30 seconds ahead is also
          invalid.
        </p>
        <p>
          These are dashboard observation thresholds, not protocol constants. A
          browser clock error, provider outage, missing configuration, or failed
          runtime verification can make the display unknown. Public responses
          contain sanitized fields only; private RPC endpoints and raw transport
          errors are never exposed.
        </p>
      </Section>
    </>
  );
}
function Operations() {
  return (
    <>
      <Section title="Roles and responsibilities">
        <p>
          Observers check the sequencer path and sign matching proposals.
          Coordinators gather quorum, simulate submissions, and relay status or
          heartbeat updates. A delayed backup improves continuity. The reporter
          reserve funds retryable delivery; the relayer separately pays
          transaction gas.
        </p>
        <p>
          The dashboard only reads onchain state. It does not rotate observers,
          fund accounts, submit heartbeats, retry messages, or connect to
          private observer endpoints.
        </p>
      </Section>
      <Section title="What to monitor">
        <ul>
          <li>Observer disagreement, unknown states, or missing quorum.</li>
          <li>
            Heartbeat lease below ten minutes, urgently below five minutes.
          </li>
          <li>L1/L2 observer-set or status-sequence lag.</li>
          <li>
            Retryable creation, failed redemption, expiry, or manual requeue.
          </li>
          <li>Reporter reserve below four conservatively quoted messages.</li>
          <li>
            Owner, observer set, refund address, or gas configuration changes.
          </li>
          <li>
            Stale heads, future timestamps, or disagreement between the direct
            feed and RPC.
          </li>
        </ul>
        <p>
          Onchain dashboard membership is not a substitute for authenticated
          operator health monitoring.
        </p>
      </Section>
      <Section title="Incident response">
        <p>
          Confirm the failed stage before changing configuration. Review L1
          state, L2 delivery, funding, current sequence, and observer agreement.
          Do not lower the signature threshold merely to preserve apparent
          liveness.
        </p>
        <p>
          After rotation, confirm the new configuration is delivered, establish
          observer health, deliver the matching status, and accept a fresh
          sequence-bound heartbeat. Latest-state requeue methods are
          owner-authorized operations; follow the repository runbook for gas,
          funding, and recovery order.
        </p>
      </Section>
      <Section title="Private services stay private">
        <p>
          The observer signing service requires distinct bearer tokens and
          private, authenticated transport. Do not expose its signing or health
          endpoints directly to public visitors. Publish only deliberately
          sanitized telemetry.
        </p>
        <p>
          This site needs server-side RPC reads only. No observer tokens or
          signing keys belong in its environment or frontend bundle.
        </p>
        <p>
          <ExternalLink
            href={`${sourceUrl}/blob/main/docs/SEQUENCER_DEPLOYMENT.md`}
          >
            Read the deployment and operations runbook
          </ExternalLink>
        </p>
      </Section>
    </>
  );
}
export function DocPage({ slug }: { slug: DocSlug }) {
  const doc = docs.find((d) => d.slug === slug)!;
  const { href } = useSignal();
  const next = docs[(docs.indexOf(doc) + 1) % docs.length];
  return (
    <div className="docs-layout">
      <article className="doc-article">
        <Link href={href("/docs")} className="back-link">
          <ArrowLeft size={13} />
          All documentation
        </Link>
        <div className="eyebrow">{doc.category}</div>
        <h1>{doc.title}</h1>
        <p className="doc-description">{doc.description}</p>
        <div className="doc-meta">
          <span>{doc.time.toUpperCase()} READ</span>
          <span>STATICS ORACLE</span>
          <span>V1</span>
        </div>
        {slug === "architecture" ? (
          <Architecture />
        ) : slug === "integration" ? (
          <Integration />
        ) : slug === "reference" ? (
          <Reference />
        ) : slug === "trust-model" ? (
          <TrustModel />
        ) : (
          <Operations />
        )}
        <div className="doc-end">
          <div>
            <p>Continue exploring</p>
            <h3>{next.title}</h3>
          </div>
          <Link href={href(`/docs/${next.slug}`)}>
            Read next <ArrowRight size={16} />
          </Link>
        </div>
      </article>
      <aside className="doc-sidebar">
        <div className="eyebrow">ON THIS PAGE</div>
        <nav>
          {doc.sections.map((title) => (
            <a href={`#${sectionId(title)}`} key={title}>
              {title}
            </a>
          ))}
        </nav>
        <ExternalLink
          href={`${sourceUrl}/blob/main/docs/SEQUENCER_SIGNAL.md`}
          className="doc-source"
        >
          View source documentation
        </ExternalLink>
      </aside>
    </div>
  );
}
