import { isNetwork } from "@/lib/networks";
import { getSnapshot } from "@/lib/snapshot";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const network = new URL(request.url).searchParams.get("network") ?? "mainnet";
  if (!isNetwork(network))
    return Response.json({ error: "Unsupported network" }, { status: 400 });
  return Response.json(await getSnapshot(network), {
    headers: { "Cache-Control": "no-store" },
  });
}
