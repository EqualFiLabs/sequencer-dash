import type { Metadata } from "next";
import { DocsIndex } from "@/components/docs";
export const metadata: Metadata = { title: "Documentation" };
export default function Page() {
  return <DocsIndex />;
}
