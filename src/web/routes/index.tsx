import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function LandingPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-16 p-8">
			<section className="flex flex-col items-center gap-4 text-center">
				<Badge variant="outline" className="mb-2">
					Built with OpenCode & DeepSeek V4 Flash Free
				</Badge>
				<h1 className="text-5xl font-bold tracking-tight">TeamOS</h1>
				<p className="text-xl text-muted-foreground">
					Team management, simplified.
				</p>
				<div className="mt-4 flex gap-3">
					<Link to="/login">
						<Button size="lg">Get started</Button>
					</Link>
					<Button variant="outline" size="lg">
						Learn more
					</Button>
				</div>
			</section>

			<section className="flex flex-wrap justify-center gap-6">
				<Card className="w-56 text-center">
					<CardHeader>
						<CardTitle>Members</CardTitle>
						<CardDescription>
							Invite, organize, and manage your team in one place.
						</CardDescription>
					</CardHeader>
				</Card>
				<Card className="w-56 text-center">
					<CardHeader>
						<CardTitle>Projects</CardTitle>
						<CardDescription>
							Track work across projects with clarity.
						</CardDescription>
					</CardHeader>
				</Card>
				<Card className="w-56 text-center">
					<CardHeader>
						<CardTitle>Roles</CardTitle>
						<CardDescription>
							Set permissions and keep everything secure.
						</CardDescription>
					</CardHeader>
				</Card>
			</section>

			<footer>
				<p className="text-xs text-muted-foreground">
					Powered by OpenCode &middot; DeepSeek V4 Flash Free
				</p>
			</footer>
		</div>
	);
}

export const Route = createFileRoute("/")({
	component: LandingPage,
});
