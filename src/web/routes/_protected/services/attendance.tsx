import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/shared/page-layout";
import { CalendarCheckIcon } from "lucide-react";

function ServicesAttendancePage() {
	const { data: session } = authClient.useSession();

	return (
		<PageLayout session={session!} title="Attendance">
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
		</PageLayout>
	);
}

export const Route = createFileRoute("/_protected/services/attendance")({
	component: ServicesAttendancePage,
});
