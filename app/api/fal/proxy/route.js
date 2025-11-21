import { route } from "@fal-ai/server-proxy/nextjs";

// 1. FORCE DYNAMIC: Tells Vercel "Allow data to pass through here"
export const dynamic = 'force-dynamic';

// 2. EXPLICIT EXPORTS: Ensures Next.js sees both methods
export const GET = route.GET;
export const POST = route.POST;