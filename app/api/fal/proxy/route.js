import { route } from "@fal-ai/server-proxy/nextjs";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return route.GET(request);
}

export async function POST(request) {
  return route.POST(request);
}