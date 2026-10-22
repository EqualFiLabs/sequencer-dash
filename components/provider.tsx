"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Network } from "@/lib/networks";
import type { Snapshot } from "@/lib/types";
import { assess } from "@/lib/status";

function useSignalState() {
  const network: Network = "mainnet";
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [now, setNow] = useState(0);
  const [refreshing, setRefreshing] = useState(true);
  const [failed, setFailed] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setRefreshing(true);
    try {
      const response = await fetch("/api/status", {
        signal: abort.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Read failed");
      const data: Snapshot = await response.json();
      if (!abort.signal.aborted && data.network === network) {
        setSnapshot(data);
        setFailed(false);
      }
    } catch {
      if (!abort.signal.aborted) setFailed(true);
    } finally {
      if (!abort.signal.aborted) setRefreshing(false);
    }
  }, [network]);
  useEffect(() => {
    setSnapshot(null);
    setFailed(false);
    void refresh();
    const poll = setInterval(() => void refresh(), 30_000);
    return () => {
      clearInterval(poll);
      controller.current?.abort();
    };
  }, [refresh]);
  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(tick);
  }, []);
  const current = snapshot?.network === network ? snapshot : null;
  const assessment = failed
    ? {
        tone: "warning" as const,
        label: "Connection interrupted",
        description:
          "The dashboard could not refresh. Any displayed values are from its last observation.",
        fresh: false,
      }
    : assess(current, now);
  return {
    network,
    snapshot: current,
    now,
    refreshing,
    assessment,
    refresh,
    href: (path: string) => path,
  };
}
const Context = createContext<ReturnType<typeof useSignalState> | null>(null);
export function SignalProvider({ children }: { children: ReactNode }) {
  const value = useSignalState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSignal() {
  const value = useContext(Context);
  if (!value) throw new Error("SignalProvider missing");
  return value;
}
