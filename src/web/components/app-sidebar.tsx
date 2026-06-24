import { NavUser } from "@/components/nav-user";
import { OrganizationsSwitcher } from "@/components/organizations-switcher";
import { authClient } from "@/lib/auth-client";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutDashboardIcon, UsersIcon, Building2Icon, CreditCardIcon, CalendarCheckIcon, SettingsIcon, UsersRoundIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AppSidebar({
	session,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	session: {
		user: { name: string; email: string; image?: string | null; role?: string | null };
	};
}) {
	const { data: activeMember } = authClient.useActiveMember();
	const isOrgOwner = activeMember?.role === "owner";

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<OrganizationsSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="mb-1">Main</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								tooltip="Dashboard"
								render={<Link to="/dashboard" />}
							>
								<LayoutDashboardIcon />
								<span>Dashboard</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				{isOrgOwner ? (
					<SidebarGroup>
						<SidebarGroupLabel className="mb-1">Platform</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip="Organization"
									render={<Link to="/organization" />}
								>
									<SettingsIcon />
									<span>Organization</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip="Team"
									render={<Link to="/team" />}
								>
									<UsersRoundIcon />
									<span>Team</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				) : null}
				{session.user.role === "admin" ? (
					<SidebarGroup>
						<SidebarGroupLabel className="mb-1">Platform Admin</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip="Users"
									render={<Link to="/admin/users" />}
								>
									<UsersIcon />
									<span>Users</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip="Organizations"
									render={<Link to="/admin/organizations" />}
								>
									<Building2Icon />
									<span>Organizations</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip="Subscriptions"
									render={<Link to="/admin/subscriptions" />}
								>
									<CreditCardIcon />
									<span>Subscriptions</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				) : null}
				<SidebarGroup>
					<SidebarGroupLabel className="mb-1">Services</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								tooltip="Attendance"
								render={<Link to="/services/attendance" />}
							>
								<CalendarCheckIcon />
								<span>Attendance</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: session.user.name,
						email: session.user.email,
						avatar: session.user.image ?? "",
						role: session.user.role,
					}}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
