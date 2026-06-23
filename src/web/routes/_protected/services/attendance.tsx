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
import { CalendarCheckIcon } from "lucide-react";

function ServicesAttendancePage() {
	const { data: session } = authClient.useSession();

	return (
		<SidebarProvider>
			<AppSidebar session={session!} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage>Attendance</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-6 p-6">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
						<p className="text-sm text-muted-foreground">Track and manage attendance records.</p>
					</div>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CalendarCheckIcon className="size-5" />
								Attendance Management
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Attendance tracking tools coming soon.</p>
						</CardContent>
					</Card>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

export const Route = createFileRoute("/_protected/services/attendance")({
	component: ServicesAttendancePage,
});
