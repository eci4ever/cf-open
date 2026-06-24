import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

function ProtectedLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Spinner className="min-h-screen" />;
	}

	if (!session) {
		throw redirect({ to: "/login" });
	}

	return <Outlet />;
}

export const Route = createFileRoute("/_protected")({
	component: ProtectedLayout,
});
