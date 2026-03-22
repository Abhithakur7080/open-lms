"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { GithubIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";


export function LoginForm() {
  const [isGithubPending, startGithubTransition] = useTransition();
  const [isEmailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("")
  const router = useRouter();

  async function signInWithGithub() {
    startGithubTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in with github, you will be redirected...");
          },
          onError: (error) => {
            toast.error(error.error.message || "Internal Server Error");
          },
        },
      });
    });
  }

  async function signInWithEmail() {
    startEmailTransition(async () => {
        await authClient.emailOtp.sendVerificationOtp({
            email,
            fetchOptions: {
                onSuccess: () => {
                    toast.success("OTP sent successfully");
                    router.push(`/verify-request?email=${email}`);
                    setEmail("");
                }
            },
            type: "sign-in"
        });
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Login with Your Github Email Account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant={"outline"}
          className="w-full"
          disabled={isGithubPending}
          onClick={signInWithGithub}
        >
          {isGithubPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> <span>Loading...</span>
            </>
          ) : (
            <>
              <GithubIcon className="size-4" /> Sign in with Github
            </>
          )}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground ">
            Or continue with
          </span>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="john.mclean@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button disabled={isEmailPending} onClick={signInWithEmail}>{isEmailPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> <span>Loading...</span>
            </>
          ) : (
            "Sign in with Email"
          )}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
