import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";

// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "./db";
import { env } from "./env";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // implement send email otp
        const { data, error } = await resend.emails.send({
          from: "Open LMS <onboarding@resend.dev>",
          to: [email],
          subject: "Open LMS - Verify your email",
          html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Your OTP</title></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);"><tr><td style="background:#f47c43;padding:28px 40px;"><p style="margin:0;font-size:18px;font-weight:600;color:#fff;">Open LMS</p></td></tr><tr><td style="padding:40px;"><p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#18181b;">Verify your email</p><p style="margin:0 0 32px;font-size:14px;color:#71717a;line-height:1.6;">Use the code below to sign in. It expires in 10 minutes.</p><div style="background:#f4f4f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:32px;"><p style="margin:0;font-size:36px;font-weight:700;letter-spacing:12px;color:#18181b;font-family:monospace;">${otp}</p></div><p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">If you didn't request this code, you can safely ignore this email.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #f4f4f5;"><p style="margin:0;font-size:12px;color:#a1a1aa;">© ${new Date().getFullYear()} Open LMS. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
        });
      },
    }),
  ],
});
