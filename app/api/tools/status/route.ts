import { NextResponse } from "next/server";
import { getProviders } from "@/lib/tools/providers";

export async function GET() {
  const providers = getProviders();

  return NextResponse.json({
    ok: true,
    defaultProvider: process.env.TOOL_ROUTER_DEFAULT_PROVIDER || "native",
    enabledProviders: (process.env.TOOL_ROUTER_ENABLED_PROVIDERS || "native,manual").split(","),
    providers: providers.map(provider => ({
      name: provider.name,
      configured: provider.isConfigured(),
      capabilities: provider.capabilities()
    }))
  });
}
