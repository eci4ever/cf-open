import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PageLayout } from "@/components/shared/page-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import {
	MailCheckIcon,
	MailIcon,
	ShieldCheckIcon,
	ShieldIcon,
	KeyIcon,
	MonitorSmartphoneIcon,
	Building2Icon,
	UsersIcon,
	UserCogIcon,
	CalendarIcon,
	ChevronRightIcon,
	TriangleAlertIcon,
	PlusIcon,
	UsersRoundIcon,
} from "lucide-react";

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

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

/* ---------- UserProfileCard ---------- */

function UserProfileCard({
	session,
}: {
	session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}) {
	const navigate = useNavigate();
	const user = session.user;
	const isVerified = user.emailVerified;
	const is2FAEnabled = user.twoFactorEnabled;
	const isBanned = user.banned;
	const isPlatformAdmin = user.role === "admin";

	const { data: passkeys } = authClient.useListPasskeys();
	const passkeyCount = passkeys?.length ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Your Profile</CardTitle>
				<CardDescription>
					Personal information and account status.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Avatar + name + email */}
				<div className="flex items-center gap-4">
					<Avatar size="lg" className="size-12">
						<AvatarImage src={user.image ?? undefined} alt={user.name} />
						<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate font-medium">{user.name}</p>
						<p className="truncate text-sm text-muted-foreground">
							{user.email}
						</p>
					</div>
				</div>

				<Separator />

				{/* Status badges */}
				<div className="flex flex-wrap gap-2">
					{isVerified ? (
						<Badge variant="default" className="gap-1">
							<MailCheckIcon className="size-3" />
							Email Verified
						</Badge>
					) : (
						<Badge variant="destructive" className="gap-1">
							<MailIcon className="size-3" />
							Email Unverified
						</Badge>
					)}
					{is2FAEnabled ? (
						<Badge variant="default" className="gap-1">
							<ShieldCheckIcon className="size-3" />
							2FA Enabled
						</Badge>
					) : (
						<Badge variant="outline" className="gap-1">
							<ShieldIcon className="size-3" />
							2FA Disabled
						</Badge>
					)}
					{isPlatformAdmin && (
						<Badge variant="secondary" className="gap-1">
							<UserCogIcon className="size-3" />
							Platform Admin
						</Badge>
					)}
					{isBanned && (
						<Badge variant="destructive" className="gap-1">
							<TriangleAlertIcon className="size-3" />
							Banned
						</Badge>
					)}
				</div>

				<Separator />

				{/* Detail rows */}
				<div className="space-y-2.5 text-sm">
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-muted-foreground">
							<KeyIcon className="size-4" />
							Passkeys
						</span>
						<span className="font-medium">
							{passkeyCount > 0
								? `${passkeyCount} registered`
								: "None"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-muted-foreground">
							<CalendarIcon className="size-4" />
							Member since
						</span>
						<span className="font-medium">
							{formatDate(user.createdAt)}
						</span>
					</div>
				</div>

				{/* Quick action: verify email */}
				{!isVerified && (
					<Button
						size="sm"
						variant="outline"
						className="w-full"
						onClick={() => navigate({ to: "/verify-email" })}
					>
						<MailCheckIcon className="size-4" />
						Verify your email
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

/* ---------- OrganizationCard ---------- */

function OrganizationCard() {
	const {
		data: activeOrg,
		isPending: orgPending,
	} = authClient.useActiveOrganization();
	const { data: activeMember } = authClient.useActiveMember();
	const [createOpen, setCreateOpen] = useState(false);

	if (orgPending) {
		return (
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
		);
	}

	if (!activeOrg) {
		return (
			<>
				<Card>
					<CardHeader>
						<CardTitle>Your Organization</CardTitle>
						<CardDescription>
							You are not part of any organization yet.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center gap-3 py-4 text-center">
							<div className="flex size-12 items-center justify-center rounded-lg bg-muted">
								<Building2Icon className="size-6 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">
								Create or join an organization to get started.
							</p>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setCreateOpen(true)}
							>
								<PlusIcon className="size-4" />
								Create organization
							</Button>
						</div>
					</CardContent>
				</Card>
				<CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />
			</>
		);
	}

	const members = activeOrg.members ?? [];
	const invitations = activeOrg.invitations ?? [];
	const memberCount = members.length;
	const pendingInvites = invitations.length;
	const userMember = activeMember;
	const role = userMember?.role ?? "member";

	return (
		<Card>
			<CardHeader>
				<CardTitle>Your Organization</CardTitle>
				<CardDescription>
					Details about your active organization.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Org identity */}
				<div className="flex items-center gap-4">
					<div className="flex size-12 items-center justify-center rounded-lg bg-muted">
						{activeOrg.logo ? (
							<img
								src={activeOrg.logo}
								alt={activeOrg.name}
								className="size-12 rounded-lg object-cover"
							/>
						) : (
							<Building2Icon className="size-6 text-muted-foreground" />
						)}
					</div>
					<div className="min-w-0">
						<p className="truncate font-medium">{activeOrg.name}</p>
						<p className="truncate text-sm text-muted-foreground">
							{activeOrg.slug}
						</p>
					</div>
					<Badge variant="secondary" className="ml-auto capitalize">
						{role}
					</Badge>
				</div>

				<Separator />

				{/* Stats */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<UsersIcon className="size-4" />
							Members
						</div>
						<p className="text-lg font-semibold">{memberCount}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<MailIcon className="size-4" />
							Pending Invites
						</div>
						<p className="text-lg font-semibold">{pendingInvites}</p>
					</div>
				</div>

				<Separator />

				<div className="flex items-center justify-between text-sm">
					<span className="flex items-center gap-2 text-muted-foreground">
						<CalendarIcon className="size-4" />
						Created
					</span>
					<span className="font-medium">
						{formatDate(activeOrg.createdAt)}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

/* ---------- TeamsCard ---------- */

function TeamsCard({ activeOrgId }: { activeOrgId?: string | null }) {
	const {
		data: teams,
		isPending,
	} = useQuery({
		queryKey: ["teams", activeOrgId],
		queryFn: async () => {
			const res = await authClient.organization.listTeams();
			if (res.error) throw new Error(res.error.message);
			return res.data ?? [];
		},
		enabled: !!activeOrgId,
	});

	if (!activeOrgId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Teams</CardTitle>
					<CardDescription>Teams in your organization.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="py-4 text-center text-sm text-muted-foreground">
						No active organization selected.
					</p>
				</CardContent>
			</Card>
		);
	}

	if (isPending) {
		return (
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
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Teams</CardTitle>
				<CardDescription>Teams in your organization.</CardDescription>
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
					<div className="flex flex-col items-center gap-2 py-4 text-center">
						<UsersRoundIcon className="size-6 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							No teams in this organization yet.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/* ---------- SecuritySummaryCard ---------- */

function SecuritySummaryCard({
	session,
}: {
	session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}) {
	const navigate = useNavigate();
	const is2FAEnabled = session.user.twoFactorEnabled;
	const { data: passkeys } = authClient.useListPasskeys();
	const passkeyCount = passkeys?.length ?? 0;

	const { data: sessions } = useQuery({
		queryKey: ["sessions"],
		queryFn: async () => {
			const res = await authClient.listSessions();
			if (res.error) throw new Error(res.error.message);
			return res.data ?? [];
		},
	});

	const sessionCount = sessions?.length ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Security</CardTitle>
				<CardDescription>
					Overview of your account security.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm">
							<ShieldCheckIcon className="size-4 text-muted-foreground" />
							Two-Factor Auth
						</span>
						{is2FAEnabled ? (
							<Badge variant="default">Enabled</Badge>
						) : (
							<Badge variant="outline">Disabled</Badge>
						)}
					</div>
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm">
							<MonitorSmartphoneIcon className="size-4 text-muted-foreground" />
							Passkeys
						</span>
						<span className="text-sm font-medium">
							{passkeyCount > 0 ? `${passkeyCount}` : "None"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm">
							<KeyIcon className="size-4 text-muted-foreground" />
							Active Sessions
						</span>
						<span className="text-sm font-medium">{sessionCount}</span>
					</div>
				</div>

				<Separator />

				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={() => navigate({ to: "/account" })}
				>
					Manage security
					<ChevronRightIcon className="size-4" />
				</Button>
			</CardContent>
		</Card>
	);
}

/* ---------- BannedBanner ---------- */

function BannedBanner({
	session,
}: {
	session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}) {
	if (!session.user.banned) return null;

	return (
		<div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
			<TriangleAlertIcon className="size-5 shrink-0" />
			<div>
				<p className="font-medium">Your account has been banned</p>
				{session.user.banReason && (
					<p className="text-xs opacity-80">
						Reason: {session.user.banReason}
					</p>
				)}
			</div>
		</div>
	);
}

/* ---------- DashboardPage ---------- */

function DashboardPage() {
	const { data: session } = authClient.useSession();
	const { data: activeOrg } = authClient.useActiveOrganization();

	if (!session) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Skeleton className="h-8 w-48" />
			</div>
		);
	}

	return (
		<PageLayout session={session} title="Dashboard">
			{/* Welcome header */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Welcome back, {session.user.name ?? "User"}
				</h1>
				<p className="text-sm text-muted-foreground">
					{activeOrg
						? `Organization: ${activeOrg.name}`
						: "No organization selected"}
				</p>
			</div>

			{/* Banned banner */}
			<BannedBanner session={session} />

			{/* Cards grid */}
			<div className="grid gap-4 md:grid-cols-2">
				<UserProfileCard session={session} />
				<OrganizationCard />
				<TeamsCard activeOrgId={activeOrg?.id} />
				<SecuritySummaryCard session={session} />
			</div>

			{/* Quick actions */}
			<div className="flex flex-wrap gap-2">
				<Link to="/account" className={buttonVariants({ variant: "outline", size: "sm" })}>
					Account Settings
				</Link>
				{!session.user.emailVerified && (
					<Link to="/verify-email" className={buttonVariants({ variant: "outline", size: "sm" })}>
						<MailCheckIcon className="size-4" />
						Verify Email
					</Link>
				)}
				{!session.user.twoFactorEnabled && (
					<Link to="/account" className={buttonVariants({ variant: "outline", size: "sm" })}>
						<ShieldCheckIcon className="size-4" />
						Enable 2FA
					</Link>
				)}
			</div>
		</PageLayout>
	);
}

export const Route = createFileRoute("/_protected/dashboard")({
	component: DashboardPage,
});
