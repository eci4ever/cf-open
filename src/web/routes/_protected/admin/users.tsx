import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

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

type User = {
	id: string;
	name: string;
	email: string;
	role: string | null;
	banned: boolean | null;
	createdAt: string;
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
	const [editRole, setEditRole] = useState("user");

	const { data, isPending } = useQuery({
		queryKey: ["admin", "users"],
		queryFn: async () => {
			const res = await authClient.admin.listUsers();
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
		mutationFn: async ({ userId, name, email, role }: { userId: string; name: string; email: string; role: string }) => {
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
										setEditRole(user.role ?? "user");
									}}
								>
									Edit
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
								{!isCurrentUser && (
									<DropdownMenuItem
										variant="destructive"
										onClick={() => setConfirm({ user, action: "delete" })}
									>
										Delete
									</DropdownMenuItem>
								)}
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
	const actionLabel = confirm?.action === "delete" ? "Delete" : confirm?.action === "ban" ? "Ban" : "Unban";
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
									<BreadcrumbPage>Users</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-6 p-6">
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
				</div>
			</SidebarInset>

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
							<Select value={editRole} onValueChange={setEditRole}>
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
		</SidebarProvider>
	);
}

export const Route = createFileRoute("/_protected/admin/users")({
	component: AdminUsersPage,
});
