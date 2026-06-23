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
import { DataTable } from "@/components/shared/data-table";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

type Organization = {
	id: string;
	name: string;
	slug: string;
	createdAt: number;
	memberCount: number;
};

function AdminOrganizationsPage() {
	const { data: session } = authClient.useSession();

	const { data, isPending } = useQuery({
		queryKey: ["admin", "organizations"],
		queryFn: async () => {
			const res = await fetch("/api/admin/organizations", {
				credentials: "include",
			});
			const json = await res.json();
			return json as { data: Organization[]; total: number };
		},
	});

	const columns: ColumnDef<Organization>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: "Name",
			},
			{
				accessorKey: "slug",
				header: "Slug",
			},
			{
				accessorKey: "memberCount",
				header: "Members",
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				cell: ({ row }) => {
					const ts = row.getValue("createdAt") as number;
					return new Date(ts).toLocaleDateString();
				},
			},
		],
		[],
	);

	const orgs = useMemo(() => data?.data ?? [], [data]);

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
									<BreadcrumbPage>Organizations</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-6 p-6">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
						<p className="text-sm text-muted-foreground">Manage platform organizations.</p>
					</div>
					<DataTable
						columns={columns}
						data={orgs}
						isPending={isPending}
						searchKey="name"
						total={data?.total}
					/>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

export const Route = createFileRoute("/_protected/admin/organizations")({
	component: AdminOrganizationsPage,
});
