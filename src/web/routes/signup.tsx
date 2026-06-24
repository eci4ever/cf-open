import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { SignupForm } from "@/components/signup-form";
import { authClient } from "@/lib/auth-client";

function SignupPage() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && session) {
			navigate({ to: "/dashboard" });
		}
	}, [isPending, session, navigate]);

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
				<SignupForm />
			</div>
		</div>
	);
}

export const Route = createFileRoute("/signup")({
	component: SignupPage,
});
