"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/server/actions/auth";

const loginSchema = z.object({
  username: z.string().min(1, "שם משתמש חובה"),
  password: z.string().min(1, "סיסמה חובה"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "admin", password: "admin" },
  });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    const formData = new FormData();
    formData.set("username", data.username);
    formData.set("password", data.password);
    const result = await login(formData);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">כניסה למנהל</CardTitle>
          <CardDescription>התחבר כדי לנהל אירועים ומתנות</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3" role="alert">
                {serverError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">משתמש</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                {...register("username")}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="admin"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "מתחבר..." : "התחבר"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/" className="underline hover:text-foreground">
              חזרה לדף הבית
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
