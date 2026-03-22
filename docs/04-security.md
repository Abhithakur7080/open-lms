# Phase 4: Application Security

## 7. Secure with Arcjet
We use **Arcjet** (`@arcjet/next`) to protect our application from malicious bots, manage rate limiting, and secure sensitive entry points (like sign-up and login forms).

### Installation
```bash
pnpm add @arcjet/next @arcjet/ip
```

### Implementation Details
Arcjet rules are applied proactively to our authentication API routes (`app/api/auth/[...all]/route.ts`).

1. **Email Validation:**
   During the sign-up process, Arcjet verifies the provided email address to block:
   - Disposable emails
   - Invalid formats
   - Domains with no MX records

2. **Bot Protection:**
   Automated clients and scrapers are strictly blocked in `LIVE` mode.

3. **Rate Limiting:**
   We enforce a sliding window rate limit to prevent brute-force attacks (e.g., 5 requests per 2 minutes on sign-up operations).

### Intercepting Requests
We wrap our Next.js API route handlers with an Arcjet verification step:

```typescript
import arcjet, { protectSignup, detectBot, slidingWindow } from "@arcjet/next";

export const POST = async (req: NextRequest) => {
    const decision = await protect(req); // Custom protect function using Arcjet rules
    
    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) return new Response("Too many requests", { status: 429 });
        if (decision.reason.isBot()) return new Response("Bots not allowed", { status: 403 });
        // Handle email validation errors...
    }
    
    return authHandlers.POST(req);
}
```