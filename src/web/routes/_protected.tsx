import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

function ProtectedLayout() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div />;
	}

	if (!session) {
		navigate({ to: "/login" });
		return null;
	}

	return <Outlet />;
}

export const Route = createFileRoute("/_protected")({
	component: ProtectedLayout,
});
