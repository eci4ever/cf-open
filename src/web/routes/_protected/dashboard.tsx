import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth-client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<SidebarProvider>
			<AppSidebar session={session!} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage>Dashboard</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-6 p-6">
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
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

export const Route = createFileRoute("/_protected/dashboard")({
	component: DashboardPage,
});
