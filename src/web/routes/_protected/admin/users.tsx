import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

type User = {
	id: string;
	name: string;
	email: string;
	role: string | null;
	banned: boolean | null;
	createdAt: string;
};

function AdminUsersPage() {
	const { data: session } = authClient.useSession();

	const { data, isPending } = useQuery({
		queryKey: ["admin", "users"],
		queryFn: async () => {
			const res = await authClient.admin.listUsers();
			return res.data;
		},
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
		],
		[],
	);

	const users = useMemo(() => (data?.users ?? []) as User[], [data]);

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
		</SidebarProvider>
	);
}

export const Route = createFileRoute("/_protected/admin/users")({
	component: AdminUsersPage,
});
