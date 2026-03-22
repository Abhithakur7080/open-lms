import ip from "@arcjet/ip";

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import {
    ArcjetDecision,
  BotOptions,
  detectBot,
  EmailOptions,
  protectSignup,
  ProtectSignupOptions,
  slidingWindow,
  SlidingWindowRateLimitOptions,
} from "@arcjet/next";
import { NextRequest } from "next/server";
import arcjet from "@/lib/arcjet";

/**
 * Configuration options for email validation using Arcjet.
 * Denies disposable, invalid, and emails from domains without MX records.
 */
const emailOptions = {
  mode: "LIVE",
  deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

/**
 * Configuration options for bot detection using Arcjet.
 * Blocks all automated clients (bots) in LIVE mode.
 */
const botOptions = {
  mode: "LIVE",
  allow: [],
} satisfies BotOptions;

/**
 * Configuration options for rate limiting using Arcjet.
 * Limits requests to 5 per 2 minutes.
 */
const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m",
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

/**
 * Combined configuration options for the protectSignup rule.
 */
const signupOptions = {
    email: emailOptions,
    bots: botOptions,
    rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>

/**
 * Evaluates an incoming request using Arcjet rules based on the request path and payload.
 * 
 * - For email sign-ups, it applies the full `protectSignup` rule (email validation, bot detection, rate limiting).
 * - For other sign-ups (e.g., OAuth), it applies bot detection and rate limiting.
 * - For all other auth routes, it applies bot detection.
 * 
 * @param req - The incoming Next.js request object.
 * @returns A promise that resolves to an `ArcjetDecision` object indicating if the request should be allowed or denied.
 */
async function protect(req: NextRequest): Promise<ArcjetDecision> {
    const session = await auth.api.getSession({
        headers: req.headers
    });

    let userId: string;
    if(session?.user){
        userId = session.user.id;
    } else {
        userId = ip(req) || "127.0.0.1";
    }

    if(req.nextUrl.pathname.endsWith("/sign-up")){
        const body = await req.clone().json();

        if(typeof body.email === "string") {
            // For email signups, use the full signup protection which includes email validation, bot detection, and rate limiting.
            return arcjet.withRule(protectSignup(signupOptions)).protect(req, { email: body.email, fingerprint: userId });
        } else {
            // For other signups (like social), just do bot and rate limit protection.
            return arcjet.withRule(detectBot(botOptions)).withRule(slidingWindow(rateLimitOptions)).protect(req, { fingerprint: userId });
        }
    } else {
        return arcjet.withRule(detectBot(botOptions)).protect(req, { fingerprint: userId })
    }
}

// Create the standard Next.js route handlers from Better Auth
const authHandlers = toNextJsHandler(auth)

/**
 * Standard GET handler for Better Auth routes.
 */
export const { GET } = authHandlers;

/**
 * Custom POST handler for Better Auth routes that wraps the standard handler with Arcjet protection.
 * 
 * Intercepts the request, evaluates it with Arcjet, and either returns an error response if denied,
 * or forwards the request to the standard Better Auth handler if allowed.
 * 
 * @param req - The incoming Next.js request object.
 * @returns A Response object.
 */
export const POST = async (req: NextRequest) => {
    const decision = await protect(req);
    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            return new Response("Too many requests", { status: 429 });
        } else if (decision.reason.isEmail()) {
            let message: string;
            if(decision.reason.emailTypes.includes("INVALID")){
                message = "Email address format is invalid. Is there a typo?";
            } else if(decision.reason.emailTypes.includes("DISPOSABLE")){
                message = "We do not allow disposable email address.";
            } else if(decision.reason.emailTypes.includes("NO_MX_RECORDS")){
                message = "Your domain does not have an MX record. Is there a typo?"
            } else {
                message = "Invalid Email address";
            }
            return new Response(message, { status: 400 });
        } else if (decision.reason.isBot()) {
            return new Response("Automated clients are not permitted", {
                status: 403,
            });
        } else {
            return new Response(null, { status: 403 });
        }
    } else {
        return authHandlers.POST(req);
    }
}
