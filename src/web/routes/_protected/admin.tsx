import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

function AdminLayout() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Spinner className="min-h-screen" />;
	}

	if (!session || session.user.role !== "admin") {
		navigate({ to: "/dashboard" });
		return null;
	}

	return <Outlet />;
}

export const Route = createFileRoute("/_protected/admin")({
	component: AdminLayout,
});
