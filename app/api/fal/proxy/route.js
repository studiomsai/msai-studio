import { route } from "@fal-ai/server-proxy/nextjs";

export const POST = (req) => route.POST(req);
export const GET = (req) => route.GET(req);