import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

function AboutPage() {
	return (
		<div className="about-page">
			<h1>About</h1>
			<p>This is a Vite + React + Hono + Cloudflare Workers application.</p>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => rootRoute,
	path: "/about",
	component: AboutPage,
});
