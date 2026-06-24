import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { PageLayout } from "@/components/shared/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2Icon } from "lucide-react";

function OrganizationPage() {
    const { data: session } = authClient.useSession();
    const { data: activeOrg, isPending } = authClient.useActiveOrganization();
    const { data: activeMember } = authClient.useActiveMember();

    return (
        <PageLayout session={session!} title="Organization">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your organization settings.
                </p>
            </div>

            {isPending ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                    </CardHeader>
                </Card>
            ) : !activeOrg ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Active Organization</CardTitle>
                        <CardDescription>
                            You don't have an active organization selected.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                {activeOrg.logo ? (
                                    <img
                                        src={activeOrg.logo}
                                        alt={activeOrg.name}
                                        className="size-10 rounded-lg object-cover"
                                    />
                                ) : (
                                    <Building2Icon className="size-5 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <CardTitle>{activeOrg.name}</CardTitle>
                                <CardDescription>{activeOrg.slug}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Your role</span>
                            <span className="font-medium capitalize">
                                {activeMember?.role ?? "member"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Members</span>
                            <span className="font-medium">
                                {activeOrg.members?.length ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Pending invitations</span>
                            <span className="font-medium">
                                {activeOrg.invitations?.length ?? 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </PageLayout>
    );
}

export const Route = createFileRoute("/_protected/organization")({
    component: OrganizationPage,
});