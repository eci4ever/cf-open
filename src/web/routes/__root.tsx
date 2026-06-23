import { createRootRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";

function RootLayout() {
	return (
		<TooltipProvider>
			<Outlet />
		</TooltipProvider>
	);
}

export const Route = createRootRoute({
	component: RootLayout,
});
