"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Box,
  ChevronRight,
  Code2,
  LayoutDashboard,
  Menu,
  Radio,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useSignal } from "./provider";
import { networks, sourceUrl } from "@/lib/networks";
import { ExternalLink } from "./ui";
const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/activity", label: "Signal activity", icon: Activity },
  { href: "/contracts", label: "Contracts & network", icon: Box },
  { href: "/docs", label: "Documentation", icon: BookOpen },
];
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { network, href, assessment } = useSignal();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setMobile(media.matches);
      if (!media.matches) setMenu(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    if (!menu || !mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      );
    focusable()[0]?.focus();
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = previousOverflow;
      menuButton.current?.focus();
    };
  }, [menu, mobile]);
  const title =
    nav.find((n) =>
      n.href === "/" ? pathname === "/" : pathname.startsWith(n.href),
    )?.label ?? "Observatory";
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {menu && (
        <button
          aria-label="Close navigation"
          className="nav-scrim"
          tabIndex={-1}
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        ref={sidebar}
        id="main-navigation"
        inert={mobile && !menu}
        role={mobile && menu ? "dialog" : undefined}
        aria-modal={mobile && menu ? true : undefined}
        className={`sidebar ${menu ? "open" : ""}`}
        aria-label="Main navigation"
      >
        <button
          className="icon-button drawer-close"
          aria-label="Close navigation drawer"
          onClick={() => setMenu(false)}
        >
          <X size={20} />
        </button>
        <Link
          href={href("/")}
          className="brand"
          aria-label="Statics Oracle home"
        >
          <img
            src="/assets/statics-lockup.png"
            alt="STATICS"
            width="160"
            height="40"
          />
          <span>ORACLE OBSERVATORY</span>
        </Link>
        <div className="nav-label">
          WORKSPACE <span>01</span>
        </div>
        <nav>
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <span className="nav-active-dot" />}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <div className="mini-orbit">
            <Radio size={20} />
          </div>
          <p>
            Built for certainty.
            <br />
            <span>Designed to fail closed.</span>
          </p>
          <Link href={href("/docs/architecture")}>
            Understand the signal <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <ExternalLink href={sourceUrl}>
            <Code2 size={16} />
            Source code
          </ExternalLink>
          <ExternalLink href="https://staticsprotocol.com">
            Statics Protocol
          </ExternalLink>
          <div className="byline">
            <span className="equalfi-mark">=</span> by EqualFi Labs
          </div>
        </div>
      </aside>
      <div className="workspace" inert={mobile && menu}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuButton}
              className="icon-button mobile-menu"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              aria-expanded={menu}
              aria-controls="main-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>Observatory</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span
              className={`connection ${assessment.fresh ? "connected" : ""}`}
            >
              <i />
              {assessment.fresh ? "Connected" : "Awaiting data"}
            </span>
            <div
              className="network-badge"
              aria-label="Network: Robinhood Mainnet"
            >
              <span className="network-glyph" aria-hidden="true">
                ↗
              </span>
              <span className="network-name">Robinhood Mainnet</span>
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="footer">
          <span>
            <span className="footer-dot" /> Independently observed. Onchain
            verifiable.
          </span>
          <span>
            {networks[network].l1Label} <span className="footer-arrow">↔</span>{" "}
            Robinhood <span className="footer-divider">/</span>{" "}
            <ExternalLink href={sourceUrl}>View source</ExternalLink>
          </span>
        </footer>
      </div>
    </div>
  );
}
