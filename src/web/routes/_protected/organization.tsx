import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { authClient } from "@/lib/auth-client";
import { PageLayout } from "@/components/shared/page-layout";
import { DataTable } from "@/components/shared/data-table";
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
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Building2Icon,
    PlusIcon,
    MoreHorizontalIcon,
    UserMinusIcon,
    ShieldIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    LoaderCircleIcon,
} from "lucide-react";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { EditOrganizationDialog } from "@/components/edit-organization-dialog";

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

function roleBadgeVariant(role: string) {
    if (role === "owner") return "default";
    if (role === "admin") return "secondary";
    return "outline";
}

/* ---------- types ---------- */

type Member = {
    id: string;
    userId: string;
    role: string;
    createdAt: string | Date;
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
};

type Invitation = {
    id: string;
    email: string;
    role: string | null;
    status: string;
    createdAt: string | Date;
    expiresAt: string | Date;
};

/* ---------- GeneralCard ---------- */

function GeneralCard({
    org,
    onEdit,
}: {
    org: { id: string; name: string; slug: string; logo?: string | null; createdAt: string | Date };
    onEdit: () => void;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>General</CardTitle>
                        <CardDescription>Organization details.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <PencilIcon className="size-4" />
                        Edit
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                        {org.logo ? (
                            <img
                                src={org.logo}
                                alt={org.name}
                                className="size-12 rounded-lg object-cover"
                            />
                        ) : (
                            <Building2Icon className="size-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{org.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{org.slug}</p>
                    </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="size-4" />
                        Created
                    </span>
                    <span className="font-medium">{formatDate(org.createdAt)}</span>
                </div>
            </CardContent>
        </Card>
    );
}

/* ---------- MembersCard ---------- */

function MembersCard({
    members,
    currentUserId,
    onRemove,
    onRoleChange,
    onInvite,
}: {
    members: Member[];
    currentUserId: string;
    onRemove: (member: Member) => void;
    onRoleChange: (member: Member, role: string) => void;
    onInvite: () => void;
}) {
    const columns = useMemo<ColumnDef<Member>[]>(
        () => [
            {
                accessorKey: "user",
                header: "Member",
                cell: ({ row }) => {
                    const m = row.original;
                    const isSelf = m.userId === currentUserId;
                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {m.user.name}
                                    {isSelf && (
                                        <span className="ml-1.5 text-xs text-muted-foreground">
                                            (You)
                                        </span>
                                    )}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {m.user.email}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }) => (
                    <Badge variant={roleBadgeVariant(row.original.role)} className="capitalize">
                        {row.original.role}
                    </Badge>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Joined",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(row.original.createdAt)}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => {
                    const m = row.original;
                    const isSelf = m.userId === currentUserId;
                    const isOwner = m.role === "owner";

                    if (isSelf || isOwner) return null;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="icon" aria-label="Actions" />
                                }
                            >
                                <MoreHorizontalIcon className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Change role</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onRoleChange(m, "admin")}>
                                    <ShieldIcon className="size-4" />
                                    Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRoleChange(m, "member")}>
                                    <ShieldIcon className="size-4" />
                                    Member
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => onRemove(m)}
                                >
                                    <UserMinusIcon className="size-4" />
                                    Remove member
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [currentUserId, onRemove, onRoleChange],
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Members</CardTitle>
                        <CardDescription>
                            {members.length} member{members.length !== 1 ? "s" : ""} in this organization.
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={onInvite}>
                        <PlusIcon className="size-4" />
                        Invite
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={members}
                    searchPlaceholder="Search members..."
                />
            </CardContent>
        </Card>
    );
}

/* ---------- InvitationsCard ---------- */

function InvitationsCard({
    invitations,
    onCancel,
}: {
    invitations: Invitation[];
    onCancel: (invitation: Invitation) => void;
}) {
    const columns = useMemo<ColumnDef<Invitation>[]>(
        () => [
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.email}</span>
                ),
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }) => (
                    <Badge variant="outline" className="capitalize">
                        {row.original.role ?? "member"}
                    </Badge>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <Badge
                        variant={row.original.status === "pending" ? "secondary" : "default"}
                        className="capitalize"
                    >
                        {row.original.status}
                    </Badge>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Sent",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(row.original.createdAt)}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => {
                    const inv = row.original;
                    if (inv.status !== "pending") return null;
                    return (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => onCancel(inv)}
                        >
                            Cancel
                        </Button>
                    );
                },
            },
        ],
        [onCancel],
    );

    return (
        <Card>
            <CardHeader>
                <div>
                    <CardTitle>Invitations</CardTitle>
                    <CardDescription>
                        {invitations.length > 0
                            ? `${invitations.length} pending invitation${invitations.length !== 1 ? "s" : ""}.`
                            : "No pending invitations."}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={invitations}
                    searchPlaceholder="Search invitations..."
                />
            </CardContent>
        </Card>
    );
}

/* ---------- DangerZoneCard ---------- */

function DangerZoneCard({
    isOwner,
    onLeave,
    onDelete,
}: {
    isOwner: boolean;
    onLeave: () => void;
    onDelete: () => void;
}) {
    return (
        <Card className="border-destructive/30">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {!isOwner && (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Leave organization</p>
                            <p className="text-xs text-muted-foreground">
                                You will lose access to this organization.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onLeave}>
                            Leave
                        </Button>
                    </div>
                )}
                {isOwner && (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Delete organization</p>
                            <p className="text-xs text-muted-foreground">
                                All members, invitations, and data will be permanently removed.
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={onDelete}>
                            <TrashIcon className="size-4" />
                            Delete
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ---------- OrganizationPage ---------- */

function OrganizationPage() {
    const { data: session } = authClient.useSession();
    const { data: activeOrg, isPending } = authClient.useActiveOrganization();
    const { data: activeMember } = authClient.useActiveMember();

    const [inviteOpen, setInviteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);

    const isOwner = activeMember?.role === "owner";
    const currentUserId = session?.user?.id;

    const removeMutation = useMutation({
        mutationFn: async (memberId: string) => {
            const res = await authClient.organization.removeMember({
                memberIdOrEmail: memberId,
            });
            if (res.error) throw new Error(res.error.message ?? "Failed to remove member");
            return res.data;
        },
        onSuccess: () => toast.success("Member removed"),
        onError: (err) => toast.error(err.message),
    });

    const roleMutation = useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
            const res = await authClient.organization.updateMemberRole({
                memberId,
                role,
            });
            if (res.error) throw new Error(res.error.message ?? "Failed to update role");
            return res.data;
        },
        onSuccess: () => toast.success("Role updated"),
        onError: (err) => toast.error(err.message),
    });

    const cancelInvitationMutation = useMutation({
        mutationFn: async (invitationId: string) => {
            const res = await authClient.organization.cancelInvitation({
                invitationId,
            });
            if (res.error) throw new Error(res.error.message ?? "Failed to cancel invitation");
            return res.data;
        },
        onSuccess: () => toast.success("Invitation cancelled"),
        onError: (err) => toast.error(err.message),
    });

    const leaveMutation = useMutation({
        mutationFn: async (orgId: string) => {
            const res = await authClient.organization.leave({
                organizationId: orgId,
            });
            if (res.error) throw new Error(res.error.message ?? "Failed to leave organization");
            return res.data;
        },
        onSuccess: () => {
            toast.success("Left organization");
            setLeaveOpen(false);
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (orgId: string) => {
            const res = await authClient.organization.delete({
                organizationId: orgId,
            });
            if (res.error) throw new Error(res.error.message ?? "Failed to delete organization");
            return res.data;
        },
        onSuccess: () => {
            toast.success("Organization deleted");
            setDeleteOpen(false);
        },
        onError: (err) => toast.error(err.message),
    });

    const members = (activeOrg?.members ?? []) as unknown as Member[];
    const invitations = (activeOrg?.invitations ?? []) as unknown as Invitation[];

    return (
        <PageLayout session={session!} title="Organization">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your organization settings, members, and invitations.
                </p>
            </div>

            {isPending ? (
                <div className="grid gap-4">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="mt-1 h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
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
                <div className="grid gap-4">
                    <GeneralCard
                        org={{
                            id: activeOrg.id,
                            name: activeOrg.name,
                            slug: activeOrg.slug,
                            logo: activeOrg.logo,
                            createdAt: activeOrg.createdAt,
                        }}
                        onEdit={() => setEditOpen(true)}
                    />

                    <MembersCard
                        members={members}
                        currentUserId={currentUserId ?? ""}
                        onRemove={(m) => removeMutation.mutate(m.id)}
                        onRoleChange={(m, role) =>
                            roleMutation.mutate({ memberId: m.id, role })
                        }
                        onInvite={() => setInviteOpen(true)}
                    />

                    <InvitationsCard
                        invitations={invitations}
                        onCancel={(inv) => cancelInvitationMutation.mutate(inv.id)}
                    />

                    <DangerZoneCard
                        isOwner={!!isOwner}
                        onLeave={() => setLeaveOpen(true)}
                        onDelete={() => setDeleteOpen(true)}
                    />
                </div>
            )}

            {/* Dialogs */}
            {activeOrg && (
                <>
                    <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
                    <EditOrganizationDialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        organizationId={activeOrg.id}
                        initialName={activeOrg.name}
                        initialSlug={activeOrg.slug}
                        initialLogo={activeOrg.logo}
                    />
                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete organization?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete <strong>{activeOrg.name}</strong> and
                                    remove all members, invitations, and associated data. This action
                                    cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(activeOrg.id)}
                                >
                                    {deleteMutation.isPending ? (
                                        <>
                                            <LoaderCircleIcon className="size-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete organization"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Leave organization?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will lose access to <strong>{activeOrg.name}</strong> and
                                    all its resources.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    disabled={leaveMutation.isPending}
                                    onClick={() => leaveMutation.mutate(activeOrg.id)}
                                >
                                    {leaveMutation.isPending ? (
                                        <>
                                            <LoaderCircleIcon className="size-4 animate-spin" />
                                            Leaving...
                                        </>
                                    ) : (
                                        "Leave organization"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </PageLayout>
    );
}

export const Route = createFileRoute("/_protected/organization")({
    component: OrganizationPage,
});