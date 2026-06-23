import { createFileRoute } from "@tanstack/react-router";

function AboutPage() {
	return (
		<div>
			<h1>About</h1>
		</div>
	);
}

export const Route = createFileRoute("/about")({
	component: AboutPage,
});
