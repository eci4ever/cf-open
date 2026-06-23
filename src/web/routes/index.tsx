import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

function LandingPage() {
	return (
		<div className="landing">
			<section className="hero">
				<h1>TeamOS</h1>
				<p className="tagline">
					Team management, simplified.
				</p>
				<p className="description">
					Built with <strong>OpenCode</strong> and <strong>DeepSeek V4 Flash Free</strong>.
				</p>
			</section>

			<section className="features">
				<div className="feature">
					<h3>Members</h3>
					<p>Invite, organize, and manage your team in one place.</p>
				</div>
				<div className="feature">
					<h3>Projects</h3>
					<p>Track work across projects with clarity.</p>
				</div>
				<div className="feature">
					<h3>Roles</h3>
					<p>Set permissions and keep everything secure.</p>
				</div>
			</section>

			<footer>
				<p>Powered by OpenCode &middot; DeepSeek V4 Flash Free</p>
			</footer>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: LandingPage,
});
