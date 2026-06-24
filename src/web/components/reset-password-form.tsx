import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as { token?: string };
    const token = search.token ?? "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const { error } = await authClient.resetPassword({
                newPassword: password,
                token,
            });

            if (error) {
                toast.error(error.message ?? "An error occurred");
                setLoading(false);
                return;
            }

            toast.success("Password reset successfully");
            navigate({ to: "/login" });
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "An unexpected error occurred",
            );
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Invalid link</CardTitle>
                    <CardDescription>
                        This password reset link is missing a token. Please request a new
                        one.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate({ to: "/forgot-password" })}
                    >
                        Request new link
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Reset password</CardTitle>
                <CardDescription>Enter your new password below.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="password">New password</FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirm-password">
                                Confirm password
                            </FieldLabel>
                            <Input
                                id="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                        </Field>
                        <Field>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Resetting..." : "Reset password"}
                            </Button>
                            <FieldDescription className="text-center">
                                Remember your password?{" "}
                                <Link to="/login">Back to login</Link>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}