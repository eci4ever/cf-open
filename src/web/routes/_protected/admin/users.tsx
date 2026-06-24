import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, TriangleAlertIcon, TrashIcon, MonitorIcon } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageLayout } from "@/components/shared/page-layout";

type User = {
	id: string;
	name: string;
	email: string;
	role: string | null;
	banned: boolean | null;
	createdAt: Date;
};

type ConfirmAction = {
	user: User;
	action: "ban" | "unban" | "delete";
};

function AdminUsersPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
	const [editUser, setEditUser] = useState<User | null>(null);
	const [editName, setEditName] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editRole, setEditRole] = useState<"user" | "admin">("user");
	const [sessionUser, setSessionUser] = useState<User | null>(null);

	const { data, isPending } = useQuery({
		queryKey: ["admin", "users"],
		queryFn: async () => {
			const res = await authClient.admin.listUsers({ query: {} });
			return res.data;
		},
	});

	const invalidate = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
	}, [queryClient]);

	const banMutation = useMutation({
		mutationFn: (userId: string) => authClient.admin.banUser({ userId }),
		onSuccess: () => {
			toast.success("User banned");
			invalidate();
		},
		onError: () => toast.error("Failed to ban user"),
	});

	const unbanMutation = useMutation({
		mutationFn: (userId: string) => authClient.admin.unbanUser({ userId }),
		onSuccess: () => {
			toast.success("User unbanned");
			invalidate();
		},
		onError: () => toast.error("Failed to unban user"),
	});

	const deleteMutation = useMutation({
		mutationFn: (userId: string) => {
			if (userId === session?.user?.id) {
				throw new Error("Cannot delete yourself");
			}
			return authClient.admin.removeUser({ userId });
		},
		onSuccess: () => {
			toast.success("User deleted");
			invalidate();
		},
		onError: () => toast.error("Failed to delete user"),
	});

	const impersonateMutation = useMutation({
		mutationFn: (userId: string) => authClient.admin.impersonateUser({ userId }),
		onSuccess: (res) => {
			if (res.data?.session) {
				queryClient.invalidateQueries({ queryKey: ["session"] });
				toast.success("Impersonating user");
			}
		},
		onError: () => toast.error("Failed to impersonate user"),
	});

	const updateUserMutation = useMutation({
		mutationFn: async ({ userId, name, email, role }: { userId: string; name: string; email: string; role: "user" | "admin" }) => {
			await authClient.admin.updateUser({ userId, data: { name, email } });
			await authClient.admin.setRole({ userId, role });
		},
		onSuccess: () => {
			toast.success("User updated");
			invalidate();
			setEditUser(null);
		},
		onError: () => toast.error("Failed to update user"),
	});

	const { data: adminSessions, refetch: refetchAdminSessions } = useQuery({
		queryKey: ["admin", "sessions", sessionUser?.id],
		queryFn: async () => {
			if (!sessionUser) return [];
			const res = await authClient.admin.listUserSessions({ userId: sessionUser.id });
			const raw = res.data ?? [];
			return Array.isArray(raw) ? raw : raw.sessions ?? [];
		},
		enabled: !!sessionUser,
	});

	const revokeSessionMutation = useMutation({
		mutationFn: (sessionToken: string) => authClient.admin.revokeUserSession({ sessionToken }),
		onSuccess: () => {
			toast.success("Session revoked");
			refetchAdminSessions();
		},
		onError: () => toast.error("Failed to revoke session"),
	});

	const revokeAllSessionsMutation = useMutation({
		mutationFn: (userId: string) => authClient.admin.revokeUserSessions({ userId }),
		onSuccess: () => {
			toast.success("All sessions revoked");
			refetchAdminSessions();
		},
		onError: () => toast.error("Failed to revoke all sessions"),
	});

	const columns: ColumnDef<User>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: "Name",
			},
			{
				accessorKey: "email",
				header: "Email",
			},
			{
				accessorKey: "role",
				header: "Role",
				cell: ({ row }) => {
					const role = row.getValue("role") as string | null;
					if (role === "admin") {
						return <Badge variant="default">Admin</Badge>;
					}
					return <Badge variant="secondary">{role ?? "user"}</Badge>;
				},
			},
			{
				accessorKey: "banned",
				header: "Status",
				cell: ({ row }) => {
					const banned = row.getValue("banned") as boolean | null;
					return banned ? (
						<Badge variant="destructive">Banned</Badge>
					) : (
						<Badge variant="outline">Active</Badge>
					);
				},
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				cell: ({ row }) => {
					const date = row.getValue("createdAt") as string;
					return new Date(date).toLocaleDateString();
				},
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const user = row.original;
					const isAdmin = user.role === "admin";
					const isBanned = user.banned;
					const isCurrentUser = user.id === session?.user?.id;

					return (
						<DropdownMenu>
							<DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
								<MoreHorizontalIcon className="size-4" />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => {
										setEditUser(user);
										setEditName(user.name ?? "");
										setEditEmail(user.email);
										setEditRole(user.role === "admin" ? "admin" : "user");
									}}
								>
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSessionUser(user)}>
									Sessions
								</DropdownMenuItem>
								{!isAdmin && !isCurrentUser && (
									<>
										<DropdownMenuItem
											onClick={() =>
												setConfirm({ user, action: isBanned ? "unban" : "ban" })
											}
										>
											{isBanned ? "Unban" : "Ban"}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => impersonateMutation.mutate(user.id)}
										>
											Impersonate
										</DropdownMenuItem>
									</>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									disabled={isCurrentUser}
									onClick={() => {
										if (!isCurrentUser) setConfirm({ user, action: "delete" });
									}}
								>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[session?.user?.id, impersonateMutation],
	);

	const users = useMemo(() => (data?.users ?? []) as User[], [data]);

	const selectedUser = confirm?.user;
	const actionVerb = confirm?.action === "delete" ? "Delete" : confirm?.action === "ban" ? "Ban" : "Unban";

	const handleConfirm = () => {
		if (!confirm) return;
		switch (confirm.action) {
			case "ban":
				banMutation.mutate(confirm.user.id);
				break;
			case "unban":
				unbanMutation.mutate(confirm.user.id);
				break;
			case "delete":
				deleteMutation.mutate(confirm.user.id);
				break;
		}
		setConfirm(null);
	};

	return (
		<>
			<PageLayout session={session!} title="Users">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Users</h1>
					<p className="text-sm text-muted-foreground">Manage platform users.</p>
				</div>
				<DataTable
					columns={columns}
					data={users}
					isPending={isPending}
					searchKey="name"
					total={data?.total}
				/>
			</PageLayout>

			<AlertDialog
				open={confirm !== null}
				onOpenChange={(open) => { if (!open) setConfirm(null); }}
			>
				<AlertDialogContent size={confirm?.action === "delete" ? "sm" : undefined}>
					<AlertDialogHeader>
						{confirm?.action === "delete" && (
							<AlertDialogMedia className="bg-destructive/10 text-destructive">
								<TriangleAlertIcon className="size-6" />
							</AlertDialogMedia>
						)}
						<AlertDialogTitle>
							{actionVerb} {selectedUser?.name}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							{confirm?.action === "delete"
								? "This will permanently remove the user and all associated data. This action cannot be undone."
								: confirm?.action === "ban"
									? "This will prevent the user from signing in. They can be unbanned later."
									: "This will restore the user's ability to sign in."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant={confirm?.action === "delete" ? "destructive" : "default"}
							onClick={handleConfirm}
						>
							{actionVerb}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog open={editUser !== null} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit user</DialogTitle>
						<DialogDescription>Update user details and role.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-name">Name</Label>
							<Input
								id="edit-name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-email">Email</Label>
							<Input
								id="edit-email"
								type="email"
								value={editEmail}
								onChange={(e) => setEditEmail(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-role">Role</Label>
							<Select value={editRole} onValueChange={(v) => setEditRole(v ?? "user")}>
								<SelectTrigger id="edit-role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditUser(null)}>
							Cancel
						</Button>
						<Button
							disabled={updateUserMutation.isPending}
							onClick={() => {
								if (!editUser) return;
								updateUserMutation.mutate({
									userId: editUser.id,
									name: editName,
									email: editEmail,
									role: editRole,
								});
							}}
						>
							{updateUserMutation.isPending ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={sessionUser !== null} onOpenChange={(open) => { if (!open) setSessionUser(null); }}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Sessions for {sessionUser?.name}</DialogTitle>
						<DialogDescription>
							{!adminSessions
								? "Loading sessions..."
								: `${adminSessions.length} active session(s)`}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3">
						{!adminSessions ? (
							<p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
						) : adminSessions.length === 0 ? (
							<p className="text-sm text-muted-foreground py-4 text-center">No active sessions.</p>
						) : (
							adminSessions.map((session: { id: string; token: string; createdAt: Date; userAgent?: string | null; ipAddress?: string | null }) => (
								<div
									key={session.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div className="flex size-8 items-center justify-center rounded-full bg-muted">
											<MonitorIcon className="size-4" />
										</div>
										<div>
											<p className="text-sm font-medium">{session.userAgent ?? "Unknown device"}</p>
											<p className="text-xs text-muted-foreground">
												{session.ipAddress ?? "Unknown IP"} &middot;{" "}
												{new Date(session.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => revokeSessionMutation.mutate(session.token)}
										disabled={revokeSessionMutation.isPending}
									>
										<TrashIcon className="size-4 text-destructive" />
									</Button>
								</div>
							))
						)}
					</div>
					<DialogFooter className="justify-between">
						<Button
							variant="destructive"
							size="sm"
							disabled={!adminSessions?.length || revokeAllSessionsMutation.isPending}
							onClick={() => {
								if (sessionUser) revokeAllSessionsMutation.mutate(sessionUser.id);
							}}
						>
							{revokeAllSessionsMutation.isPending ? "Revoking..." : "Revoke all"}
						</Button>
						<Button variant="outline" onClick={() => setSessionUser(null)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

export const Route = createFileRoute("/_protected/admin/users")({
	component: AdminUsersPage,
});
