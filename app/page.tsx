"use client"

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending, error} = authClient.useSession();
  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          toast.success("Signed out successfully");
        },
        onError: (error) => {
          toast.error(error.error.message || "Internal Server Error");
        },
      },
    });
  }
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <ThemeToggle />
      {session ? <div>{session.user.name} <Button onClick={signOut}>Logout</Button></div> : <Button>Login</Button>}
    </div>
  );
}
