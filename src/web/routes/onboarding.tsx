import { createFileRoute, Link } from "@tanstack/react-router";
import { GalleryVerticalEnd, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";

function OnboardingPage() {
	const [sending, setSending] = useState(false);

	async function handleResendVerification() {
		setSending(true);
		try {
			const { error } = await authClient.sendVerificationEmail({
				email: "",
				callbackURL: "/verify-email",
			});
			if (error) {
				toast.error(error.message ?? "Failed to send verification email");
			} else {
				toast.success("Verification email sent");
			}
		} catch {
			toast.error("Failed to send verification email");
		}
		setSending(false);
	}

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
						<CardTitle className="text-xl">Welcome to TeamOS!</CardTitle>
						<CardDescription>
							Your account has been created successfully. Check your email to verify your account.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<Button
							variant="outline"
							className="w-full"
							disabled={sending}
							onClick={handleResendVerification}
						>
							<MailCheck className="mr-2 size-4" />
							{sending ? "Sending..." : "Resend verification email"}
						</Button>
						<Button variant="default" className="w-full" render={<Link to="/login" />}>
							Go to login
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
});
