import type { Metadata } from "next";
import { ActivityPage } from "@/components/dashboard";
export const metadata: Metadata = { title: "Signal activity" };
export default function Page() {
  return <ActivityPage />;
}
