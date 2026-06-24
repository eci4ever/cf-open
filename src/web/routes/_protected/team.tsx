import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { PageLayout } from "@/components/shared/page-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    UsersRoundIcon,
    PlusIcon,
    MoreHorizontalIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PencilIcon,
    TrashIcon,
    UserMinusIcon,
    UserPlusIcon,
    LoaderCircleIcon,
    CheckIcon,
} from "lucide-react";
import { CreateTeamDialog } from "@/components/create-team-dialog";

/* ---------- helpers ---------- */

function formatDate(date: Date | string | undefined | null): string {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/* ---------- types ---------- */

type Team = {
    id: string;
    name: string;
    organizationId: string;
    createdAt: string | Date;
    updatedAt?: string | Date | null;
};

type OrgMember = {
    id: string;
    userId: string;
    role: string;
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
};

type TeamMember = {
    id: string;
    teamId: string;
    userId: string;
    createdAt?: string | Date;
    user?: {
        name: string;
        email: string;
        image?: string | null;
    };
};

/* ---------- TeamCard ---------- */

function TeamCard({
    team,
    isActive,
    isOwner,
    orgMembers,
    onSetActive,
    onDelete,
    onRename,
    onAddMember,
    onRemoveMember,
}: {
    team: Team;
    isActive: boolean;
    isOwner: boolean;
    orgMembers: OrgMember[];
    onSetActive: () => void;
    onDelete: () => void;
    onRename: (name: string) => void;
    onAddMember: (userId: string) => void;
    onRemoveMember: (userId: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(team.name);

    const { data: teamMembers, isPending: membersPending } = useQuery({
        queryKey: ["team-members", team.id],
        queryFn: async () => {
            const res = await authClient.organization.listTeamMembers(
                { query: { teamId: team.id } },
            );
            if (res.error) throw new Error(res.error.message);
            return (res.data ?? []) as TeamMember[];
        },
        enabled: expanded,
    });

    const memberList = teamMembers ?? [];
    const memberUserIds = new Set(memberList.map((m) => m.userId));
    const availableMembers = orgMembers.filter(
        (m) => !memberUserIds.has(m.userId),
    );

    function handleRenameSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editName.trim()) return;
        onRename(editName.trim());
        setEditing(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => setExpanded((prev) => !prev)}
                        aria-label={expanded ? "Collapse" : "Expand"}
                    >
                        {expanded ? (
                            <ChevronDownIcon className="size-4" />
                        ) : (
                            <ChevronRightIcon className="size-4" />
                        )}
                    </Button>
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                        <UsersRoundIcon className="size-4 text-muted-foreground" />
                    </div>
                    {editing ? (
                        <form onSubmit={handleRenameSubmit} className="flex flex-1 items-center gap-2">
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-7"
                                autoFocus
                            />
                            <Button type="submit" size="icon" variant="ghost" className="size-7">
                                <CheckIcon className="size-4" />
                            </Button>
                        </form>
                    ) : (
                        <div className="flex-1">
                            <span className="font-medium">{team.name}</span>
                            {isActive && (
                                <Badge variant="default" className="ml-2 gap-1">
                                    <CheckIcon className="size-3" />
                                    Active
                                </Badge>
                            )}
                        </div>
                    )}
                    {isOwner && !editing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="icon" className="size-7" aria-label="Actions" />
                                }
                            >
                                <MoreHorizontalIcon className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditing(true)}>
                                    <PencilIcon className="size-4" />
                                    Rename
                                </DropdownMenuItem>
                                {!isActive && (
                                    <DropdownMenuItem onClick={onSetActive}>
                                        <CheckIcon className="size-4" />
                                        Set as active
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                                    <TrashIcon className="size-4" />
                                    Delete team
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            {expanded && (
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {membersPending
                                ? "Loading members..."
                                : `${memberList.length} member${memberList.length !== 1 ? "s" : ""}`}
                        </span>
                        <span className="text-muted-foreground">
                            Created {formatDate(team.createdAt)}
                        </span>
                    </div>

                    <Separator />

                    {/* Member list */}
                    {membersPending ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : memberList.length > 0 ? (
                        <div className="space-y-1">
                            {memberList.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center gap-2 rounded-lg border p-2"
                                >
                                    <div className="flex flex-1 flex-col">
                                        <span className="text-sm font-medium">
                                            {m.user?.name ?? "Unknown"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {m.user?.email}
                                        </span>
                                    </div>
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => onRemoveMember(m.userId)}
                                            aria-label="Remove member"
                                        >
                                            <UserMinusIcon className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-2 text-center text-sm text-muted-foreground">
                            No members in this team yet.
                        </p>
                    )}

                    {/* Add member */}
                    {isOwner && availableMembers.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="outline" size="sm" className="w-full" />
                                }
                            >
                                <UserPlusIcon className="size-4" />
                                Add member
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-full">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>Organization members</DropdownMenuLabel>
                                    {availableMembers.map((m) => (
                                        <DropdownMenuItem
                                            key={m.id}
                                            onClick={() => onAddMember(m.userId)}
                                        >
                                            <div className="flex flex-col">
                                                <span>{m.user.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {m.user.email}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

/* ---------- TeamPage ---------- */

function TeamPage() {
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const { data: activeMember } = authClient.useActiveMember();
    const queryClient = useQueryClient();

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

    const isOwner = activeMember?.role === "owner" || activeMember?.role === "admin";
    const activeTeamId = session?.session?.activeTeamId;

    const { data: teams, isPending } = useQuery({
        queryKey: ["teams", activeOrg?.id],
        queryFn: async () => {
            const res = await authClient.organization.listTeams();
            if (res.error) throw new Error(res.error.message);
            return (res.data ?? []) as Team[];
        },
        enabled: !!activeOrg?.id,
    });

    const orgMembers = useMemo(
        () => (activeOrg?.members ?? []) as unknown as OrgMember[],
        [activeOrg],
    );

    function invalidateTeams() {
        queryClient.invalidateQueries({ queryKey: ["teams", activeOrg?.id] });
    }

    const renameMutation = useMutation({
        mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
            const res = await authClient.organization.updateTeam({
                teamId,
                data: { name },
            });
            if (res.error) throw new Error(res.error.message ?? "Failed to rename team");
            return res.data;
        },
        onSuccess: () => {
            toast.success("Team renamed");
            invalidateTeams();
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (teamId: string) => {
            const res = await authClient.organization.removeTeam({ teamId });
            if (res.error) throw new Error(res.error.message ?? "Failed to delete team");
            return res.data;
        },
        onSuccess: () => {
            toast.success("Team deleted");
            setDeleteTeamId(null);
            invalidateTeams();
        },
        onError: (err) => toast.error(err.message),
    });

    const setActiveMutation = useMutation({
        mutationFn: async (teamId: string) => {
            const res = await authClient.organization.setActiveTeam({ teamId });
            if (res.error) throw new Error(res.error.message ?? "Failed to set active team");
            return res.data;
        },
        onSuccess: () => {
            toast.success("Active team updated");
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
        onError: (err) => toast.error(err.message),
    });

    const addMemberMutation = useMutation({
        mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
            const res = await authClient.organization.addTeamMember({ teamId, userId });
            if (res.error) throw new Error(res.error.message ?? "Failed to add member");
            return res.data;
        },
        onSuccess: () => {
            toast.success("Member added to team");
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
        onError: (err) => toast.error(err.message),
    });

    const removeMemberMutation = useMutation({
        mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
            const res = await authClient.organization.removeTeamMember({ teamId, userId });
            if (res.error) throw new Error(res.error.message ?? "Failed to remove member");
            return res.data;
        },
        onSuccess: () => {
            toast.success("Member removed from team");
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
        onError: (err) => toast.error(err.message),
    });

    const teamToDelete = teams?.find((t) => t.id === deleteTeamId);

    return (
        <PageLayout session={session!} title="Team">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage teams in your organization.
                    </p>
                </div>
                {activeOrg && isOwner && (
                    <Button onClick={() => setCreateOpen(true)}>
                        <PlusIcon className="size-4" />
                        Create Team
                    </Button>
                )}
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
                <div className="grid gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : teams && teams.length > 0 ? (
                <div className="grid gap-4">
                    {teams.map((team) => (
                        <TeamCard
                            key={team.id}
                            team={team}
                            isActive={team.id === activeTeamId}
                            isOwner={!!isOwner}
                            orgMembers={orgMembers}
                            onSetActive={() => setActiveMutation.mutate(team.id)}
                            onDelete={() => setDeleteTeamId(team.id)}
                            onRename={(name) =>
                                renameMutation.mutate({ teamId: team.id, name })
                            }
                            onAddMember={(userId) =>
                                addMemberMutation.mutate({ teamId: team.id, userId })
                            }
                            onRemoveMember={(userId) =>
                                removeMemberMutation.mutate({ teamId: team.id, userId })
                            }
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent>
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                                <UsersRoundIcon className="size-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">No teams yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Create a team to organize members into groups.
                                </p>
                            </div>
                            {isOwner && (
                                <Button onClick={() => setCreateOpen(true)}>
                                    <PlusIcon className="size-4" />
                                    Create Team
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Dialogs */}
            <CreateTeamDialog open={createOpen} onOpenChange={setCreateOpen} currentUserId={session?.user?.id} />
            <AlertDialog
                open={deleteTeamId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTeamId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete team?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the team
                            {teamToDelete ? ` "${teamToDelete.name}"` : ""} and remove all
                            its members. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                                if (deleteTeamId) deleteMutation.mutate(deleteTeamId);
                            }}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <LoaderCircleIcon className="size-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete team"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
}

export const Route = createFileRoute("/_protected/team")({
    component: TeamPage,
});