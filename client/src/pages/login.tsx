import React, { useState } from "react";
import { useLocation } from "wouter";
import { Heart, LogIn } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme-toggle";

type FormState = {
    username: string;
    password: string;
    showPassword: boolean;
};

export default function LoginPage(): JSX.Element {
    const [form, setForm] = useState<FormState>({
        username: "",
        password: "",
        showPassword: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, setLocation] = useLocation();

    const handleChange =
        (key: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((s) => ({
                    ...s,
                    [key]: key === "showPassword" ? e.target.checked : e.target.value,
                }));
                setError(null);
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.password) {
            setError("Password is required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/users/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Login failed");
            }

            const data = await res.json();
            if (data.access) {
                localStorage.setItem("authToken", data.access);
                if (data.role === "admin") setLocation("/admin");
                else if (data.role === "scholar") setLocation("/scholar");
                else setLocation("/");
            } else {
                throw new Error("Invalid server response");
            }
        } catch (err: any) {
            setError(err?.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-primary" />
                        <div>
                            <h1 className="text-xl font-serif font-bold text-foreground">
                                Ruku na srce
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Volunteer Scholarship Program
                            </p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center px-6">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-serif flex items-center gap-2">
                            <LogIn className="w-5 h-5 text-primary" />
                            Sign in
                        </CardTitle>
                        <CardDescription>
                            Enter your credentials to continue.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="Your username"
                                    value={form.username}
                                    onChange={handleChange("username")}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type={form.showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange("password")}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="showPassword"
                                    checked={form.showPassword}
                                    onCheckedChange={(checked) =>
                                        setForm((s) => ({ ...s, showPassword: !!checked }))
                                    }
                                    disabled={loading}
                                />
                                <Label
                                    htmlFor="showPassword"
                                    className="text-sm text-muted-foreground"
                                >
                                    Show password
                                </Label>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading ? "Signing in..." : "Sign in"}
                                </Button>

                                {/* TODO Enable when implemented creating account */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setLocation("/register")}
                                    disabled={true}
                                >
                                    Create account
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <footer className="border-t border-border">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <p className="text-center text-sm text-muted-foreground">
                        Powered by STRINTECH
                    </p>
                </div>
            </footer>
        </div>
    );
}
