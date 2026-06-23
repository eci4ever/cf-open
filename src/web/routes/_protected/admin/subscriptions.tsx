import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/shared/page-layout";
import { CreditCardIcon } from "lucide-react";

function AdminSubscriptionsPage() {
	const { data: session } = authClient.useSession();

	return (
		<PageLayout session={session!} title="Subscriptions">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
				<p className="text-sm text-muted-foreground">Manage platform subscriptions.</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCardIcon className="size-5" />
						Subscription Management
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Subscription list and management tools coming soon.</p>
				</CardContent>
			</Card>
		</PageLayout>
	);
}

export const Route = createFileRoute("/_protected/admin/subscriptions")({
	component: AdminSubscriptionsPage,
});
