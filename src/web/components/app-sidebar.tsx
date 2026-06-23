import { NavUser } from "@/components/nav-user";
import { OrganizationsSwitcher } from "@/components/organizations-switcher";
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
import { LayoutDashboardIcon, UsersIcon, Building2Icon, CreditCardIcon, CalendarCheckIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AppSidebar({
	session,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	session: {
		user: { name: string; email: string; image?: string | null; role?: string | null };
	};
}) {
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
					}}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
