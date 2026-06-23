import { createRootRoute } from "@tanstack/react-router";
import { Link, Outlet } from "@tanstack/react-router";

function RootLayout() {
	return (
		<>
			<nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
				<Link to="/">Home</Link>
				<Link to="/about">About</Link>
			</nav>
			<Outlet />
		</>
	);
}

export const rootRoute = createRootRoute({
	component: RootLayout,
});
