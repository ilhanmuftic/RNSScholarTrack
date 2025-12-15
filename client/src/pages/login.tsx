import React, { useState } from "react";
import { useLocation } from "wouter";

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
    const [location, setLocation] = useLocation();

    const validate = () => {
        if (!form.password) return "Password is required.";
        return null;
    };

    const handleChange =
        (key: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((s) => ({ ...s, [key]: key === "showPassword" ? e.target.checked : e.target.value }));
                setError(null);
            };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const clientError = validate();
        if (clientError) {
            setError(clientError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Replace endpoint with your real auth endpoint
            const res = await fetch("/api/users/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: form.username, password: form.password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Login failed");
            }

            const data = await res.json();
            // Assume server returns { token: string, user?: {...} }
            if (data.access) {
                localStorage.setItem("authToken", data.access);
                setLocation("/");
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
        <div style={{ maxWidth: 420, margin: "6rem auto", padding: 24, border: "1px solid #e6e6e6", borderRadius: 8 }}>
            <h2 style={{ marginBottom: 8 }}>Sign in</h2>
            <p style={{ marginTop: 0, color: "#666", marginBottom: 16 }}>Enter your credentials to continue.</p>

            <form onSubmit={handleSubmit} noValidate>
                <label style={{ display: "block", marginBottom: 8 }}>
                    <span style={{ display: "block", fontSize: 13, marginBottom: 6 }}>username</span>
                    <input
                        type="text"
                        value={form.username}
                        onChange={handleChange("username")}
                        placeholder="Username"
                        required
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: "1px solid #ccc" }}
                        disabled={loading}
                    />
                </label>

                <label style={{ display: "block", marginBottom: 8 }}>
                    <span style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Password</span>
                    <input
                        type={form.showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange("password")}
                        placeholder="••••••••"
                        required
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: "1px solid #ccc" }}
                        disabled={loading}
                    />
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <input type="checkbox" checked={form.showPassword} onChange={handleChange("showPassword")} disabled={loading} />
                    <span style={{ fontSize: 13, color: "#444" }}>Show password</span>
                </label>

                {error && (
                    <div style={{ marginBottom: 12, color: "#b00020", fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "10px 14px",
                            background: "#0366d6",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setLocation("/register")}
                        disabled={loading}
                        style={{
                            padding: "10px 14px",
                            background: "#f3f4f6",
                            color: "#111",
                            border: "1px solid #ddd",
                            borderRadius: 4,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        Create account
                    </button>
                </div>
            </form>
        </div>
    );
}