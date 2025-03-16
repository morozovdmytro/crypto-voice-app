'use client';

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowRight, Loader2, Chrome } from "lucide-react";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";

// Define the login schema
const loginSchema = z.object({
  provider: z.enum(["google"])
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isConnected, status } = useWeb3Auth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      provider: "google",
    },
  });

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  async function onSubmit(data: LoginFormValues) {
    if (status === 'initializing') return;
    
    try {
      switch (data.provider) {
        case "google":
          await login();
          router.push("/dashboard");
          break;
        default:
          throw new Error("Invalid provider");
      }

      toast.success(`Successfully authenticated with ${data.provider}`);
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed. Please try again.");
    }
  }

  const handleProviderLogin = (provider: "google") => {
    form.setValue("provider", provider);
    onSubmit({ provider });
  };

  const isLoading = status === 'initializing';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account using your preferred method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-between"
              disabled={isLoading}
              onClick={() => handleProviderLogin("google")}
            >
              <div className="flex items-center">
                <Chrome className="mr-2 h-5 w-5 text-blue-500" />
                <span>Continue with Google</span>
              </div>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </CardFooter>
    </Card>
  );
}

