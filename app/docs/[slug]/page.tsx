import { notFound } from "next/navigation";
import { docs } from "@/lib/docs";
import { DocPage } from "@/components/docs";
export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = docs.find((d) => d.slug === slug);
  return { title: doc?.title ?? "Not found", description: doc?.description };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = docs.find((d) => d.slug === slug);
  if (!doc) notFound();
  return <DocPage slug={doc.slug} />;
}
