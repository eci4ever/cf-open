import { createRootRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ImpersonationBanner } from "@/components/shared/impersonation-banner";

function RootLayout() {
	return (
		<TooltipProvider>
			<ImpersonationBanner />
			<Outlet />
			<Toaster />
		</TooltipProvider>
	);
}

export const Route = createRootRoute({
	component: RootLayout,
});
