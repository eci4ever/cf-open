import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { GalleryVerticalEnd, MailCheckIcon, LoaderIcon, XCircleIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VerifyEmailPage() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as { token?: string };
    const token = search.token ?? "";
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        async function verify() {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch {
                setStatus("error");
            }
        }
        verify();
    }, [token]);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link
                    to="/"
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    TeamOS
                </Link>
                <Card>
                    <CardHeader className="text-center">
                        {status === "loading" && (
                            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
                                <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {status === "success" && (
                            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-green-500/10">
                                <MailCheckIcon className="size-6 text-green-600" />
                            </div>
                        )}
                        {status === "error" && (
                            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                                <XCircleIcon className="size-6 text-destructive" />
                            </div>
                        )}
                        <CardTitle className="text-xl">
                            {status === "loading" && "Verifying..."}
                            {status === "success" && "Email verified!"}
                            {status === "error" && "Verification failed"}
                        </CardTitle>
                        <CardDescription>
                            {status === "loading" && "Please wait while we verify your email."}
                            {status === "success" && "Your email has been verified successfully."}
                            {status === "error" && "The verification link is invalid or has expired."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status === "success" && (
                            <Button className="w-full" onClick={() => navigate({ to: "/dashboard" })}>
                                Go to dashboard
                            </Button>
                        )}
                        {status === "error" && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate({ to: "/login" })}
                            >
                                Back to login
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export const Route = createFileRoute("/verify-email")({
    component: VerifyEmailPage,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            token: typeof search.token === "string" ? search.token : undefined,
        };
    },
});