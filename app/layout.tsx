import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { SignalProvider } from "@/components/provider";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: {
    default: "Statics Oracle — Sequencer Observatory",
    template: "%s · Statics Oracle",
  },
  description:
    "A clear view of the Robinhood sequencer availability signal. Explore onchain status, heartbeat leases, and integration documentation by EqualFi Labs.",
  icons: { icon: "/assets/statics-icon.png" },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render the requested network in the initial HTML, including docs addresses.
  await connection();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Suspense
          fallback={
            <div className="boot">
              <img src="/assets/statics-lockup.png" alt="Statics" width="180" />
              <p>Opening the observatory…</p>
            </div>
          }
        >
          <SignalProvider>
            <Shell>{children}</Shell>
          </SignalProvider>
        </Suspense>
      </body>
    </html>
  );
}
