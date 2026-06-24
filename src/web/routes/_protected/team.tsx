import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { PageLayout } from "@/components/shared/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersRoundIcon } from "lucide-react";

function TeamPage() {
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();

    const { data: teams, isPending } = useQuery({
        queryKey: ["teams", activeOrg?.id],
        queryFn: async () => {
            const res = await authClient.organization.listTeams();
            if (res.error) throw new Error(res.error.message);
            return res.data ?? [];
        },
        enabled: !!activeOrg?.id,
    });

    return (
        <PageLayout session={session!} title="Team">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
                <p className="text-sm text-muted-foreground">
                    Manage teams in your organization.
                </p>
            </div>

            {!activeOrg ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Active Organization</CardTitle>
                        <CardDescription>
                            Select an organization to manage its teams.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : isPending ? (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="mt-1 h-4 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Teams</CardTitle>
                        <CardDescription>
                            {teams && teams.length > 0
                                ? `${teams.length} team${teams.length > 1 ? "s" : ""} in ${activeOrg.name}`
                                : `No teams in ${activeOrg.name} yet.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {teams && teams.length > 0 ? (
                            teams.map((team) => (
                                <div
                                    key={team.id}
                                    className="flex items-center gap-3 rounded-lg border p-3"
                                >
                                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                                        <UsersRoundIcon className="size-4 text-muted-foreground" />
                                    </div>
                                    <span className="flex-1 truncate text-sm font-medium">
                                        {team.name}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-6 text-center">
                                <UsersRoundIcon className="size-6 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    No teams have been created yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </PageLayout>
    );
}

export const Route = createFileRoute("/_protected/team")({
    component: TeamPage,
});