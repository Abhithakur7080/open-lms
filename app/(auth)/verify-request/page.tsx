"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function VerifyRequest() {
  const [otp, setOtp] = useState("");
  const [isOtpPending, startOtpTransition] = useTransition();
  const isOtpCompleted = otp.length === 6;
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") as string;

  function verifyOtp() {
    startOtpTransition(async () => {
      await authClient.signIn.emailOtp({
        email: email,
        otp: otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email Verified successfully");
            router.push("/");
            setOtp("");
          },
          onError: () => {
            toast.error("Error verifying Email/otp");
          },
        },
      });
    });
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription>
          we have sent a verification email code to your email address. Please
          open the email and paste the code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col justify-center">
        <div className="flex flex-col items-center gap-2">
          <InputOTP
            maxLength={6}
            className="gap-2"
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email address.
          </p>
        </div>
        <Button
          className="w-full"
          onClick={verifyOtp}
          disabled={isOtpPending || !isOtpCompleted}
        >
          {isOtpPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />{" "}
              <span>Loading...</span>
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
