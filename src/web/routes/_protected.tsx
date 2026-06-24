import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

function ProtectedLayout() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && !session) {
			navigate({ to: "/login" });
		}
	}, [isPending, session, navigate]);

	if (isPending || !session) {
		return <Spinner className="min-h-screen" />;
	}

	return <Outlet />;
}

export const Route = createFileRoute("/_protected")({
	component: ProtectedLayout,
});
