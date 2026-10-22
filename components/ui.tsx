"use client";
import { useState, type ReactNode } from "react";
import { Check, Copy, ArrowUpRight } from "lucide-react";
export function CopyButton({
  value,
  label = "Copy",
  compact = false,
}: {
  value: string;
  label?: string;
  compact?: boolean;
}) {
  const [result, setResult] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setResult("Copied");
    } catch {
      setResult("Copy unavailable");
    }
    setTimeout(() => setResult(""), 2500);
  }
  return (
    <button
      className={
        compact ? "icon-button copy-button" : "button subtle copy-button"
      }
      onClick={copy}
      aria-label={result || label}
      title={result || label}
    >
      {result === "Copied" ? <Check size={15} /> : <Copy size={15} />}
      {!compact && <span>{result || label}</span>}
      <span className="sr-only" role="status">
        {result}
      </span>
    </button>
  );
}
export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`badge ${tone}`}>
      <i />
      {children}
    </span>
  );
}
export function CodeBlock({
  code,
  label = "Solidity",
}: {
  code: string;
  label?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span>{label}</span>
        <CopyButton value={code} />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
