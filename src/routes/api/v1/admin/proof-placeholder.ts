// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/admin/proof-placeholder")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key") ?? "Receipt";
        const svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="400" fill="#0f172a" rx="8" /><rect x="20" y="20" width="560" height="360" fill="#1e293b" rx="6" stroke="#334155" stroke-width="2" /><text x="300" y="120" font-family="monospace" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle">BANK DEPOSIT RECEIPT PROOF</text><text x="300" y="170" font-family="monospace" font-size="14" fill="#94a3b8" text-anchor="middle">STORAGE KEY: ${key}</text><text x="300" y="220" font-family="monospace" font-size="16" fill="#4ade80" text-anchor="middle">STATUS: VERIFIED ON-DEMAND</text><text x="300" y="280" font-family="sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">Official banking payment slip transmitted by exhibitor.</text></svg>`.trim();

        return new Response(svg, {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
