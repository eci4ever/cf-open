import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageLayout } from "@/components/shared/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

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
				cell: ({ row }) => (
					<span className="font-medium">{row.getValue("name")}</span>
				),
			},
			{
				accessorKey: "slug",
				header: "Slug",
				cell: ({ row }) => (
					<code className="rounded bg-muted px-1.5 py-0.5 text-xs">
						{row.getValue("slug")}
					</code>
				),
			},
			{
				accessorKey: "memberCount",
				header: "Members",
				cell: ({ row }) => (
					<Badge variant="secondary">{row.getValue("memberCount")}</Badge>
				),
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
		<PageLayout session={session!} title="Organizations">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
					<p className="text-sm text-muted-foreground">
						Manage platform organizations.
					</p>
				</div>
				<Button>
					<PlusIcon className="size-4" />
					New Organization
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={orgs}
				isPending={isPending}
				searchPlaceholder="Search organizations..."
				total={data?.total}
			/>
		</PageLayout>
	);
}

export const Route = createFileRoute("/_protected/admin/organizations")({
	component: AdminOrganizationsPage,
});
