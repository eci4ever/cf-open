import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { MailIcon } from "lucide-react";
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

export function ForgotPasswordForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            });

            if (error) {
                toast.error(error.message ?? "An error occurred");
                setLoading(false);
                return;
            }

            setSent(true);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "An unexpected error occurred",
            );
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
                        <MailIcon className="size-6 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl">Check your email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent a password reset link to {email}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate({ to: "/login" })}
                    >
                        Back to login
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Forgot password?</CardTitle>
                <CardDescription>
                    Enter your email and we&apos;ll send you a reset link.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Field>
                        <Field>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Sending..." : "Send reset link"}
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