import type { Metadata } from "next";
import { ContractsPage } from "@/components/dashboard";
export const metadata: Metadata = { title: "Contracts & network" };
export default function Page() {
  return <ContractsPage />;
}
