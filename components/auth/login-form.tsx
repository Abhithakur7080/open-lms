"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Github, Loader2, Mail } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed to send OTP");
      return;
    }
    toast.success("OTP sent to your email");
    setStep("otp");
  }

  async function verifyOtp() {
    if (otp.length < 6) return;
    setLoading(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Invalid OTP");
      setOtp("");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function signInWithGithub() {
    setLoading(true);
    await authClient.signIn.social({ provider: "github", callbackURL: "/" });
  }

  return (
    <div className="flex flex-col gap-6">
      {step === "email" ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-8"
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Continue with Email"
            )}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-medium">Check your inbox</p>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (val.length === 6) {
                setTimeout(() => verifyOtp(), 0);
              }
            }}
            disabled={loading}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button
            onClick={verifyOtp}
            disabled={loading || otp.length < 6}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Verify OTP"
            )}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        </div>
      )}

      <div className="relative text-center text-xs text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2">or</span>
      </div>

      <Button
        variant="outline"
        onClick={signInWithGithub}
        disabled={loading}
        className="w-full"
      >
        <Github className="size-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}