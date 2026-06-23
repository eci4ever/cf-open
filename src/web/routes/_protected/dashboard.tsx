import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/shared/page-layout";
import { UsersIcon, ActivityIcon, CreditCardIcon, FolderOpenIcon } from "lucide-react";

const stats = [
	{ title: "Total Users", value: "2,345", icon: UsersIcon, change: "+12%" },
	{ title: "Active Now", value: "128", icon: ActivityIcon, change: "+5%" },
	{ title: "Revenue", value: "$45,678", icon: CreditCardIcon, change: "+8%" },
	{ title: "Projects", value: "24", icon: FolderOpenIcon, change: "+2" },
];

function DashboardPage() {
	const { data: session } = authClient.useSession();

	return (
		<PageLayout session={session!} title="Dashboard">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Welcome back, {session?.user?.name ?? "User"}
				</h1>
				<p className="text-sm text-muted-foreground">
					Here's an overview of your organization.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								{stat.title}
							</CardTitle>
							<stat.icon className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-muted-foreground">
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</PageLayout>
	);
}

export const Route = createFileRoute("/_protected/dashboard")({
	component: DashboardPage,
});
