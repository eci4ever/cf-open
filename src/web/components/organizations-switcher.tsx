import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, PlusIcon, Building2Icon, CheckIcon } from "lucide-react"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";

export function OrganizationsSwitcher() {
  const { isMobile } = useSidebar();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const activeId = activeOrg?.id;
  const orgs = organizations ?? [];

  async function handleSelectOrg(orgId: string) {
    const res = await authClient.organization.setActive({ organizationId: orgId });
    if (res.error) {
      toast.error(res.error.message ?? "Failed to switch organization");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {activeOrg?.logo ? (
                <img
                  src={activeOrg.logo}
                  alt={activeOrg.name}
                  className="size-8 rounded-lg object-cover"
                />
              ) : (
                <Building2Icon className="size-4" />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeOrg?.name ?? "No organization"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {isPending
                  ? "Loading..."
                  : activeOrg
                    ? activeOrg.slug
                    : "Select or create"}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {orgs.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No organizations yet.
                </p>
              ) : (
                orgs.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    className="gap-2 p-2"
                    onClick={() => handleSelectOrg(org.id)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="size-6 rounded-md object-cover"
                        />
                      ) : (
                        <Building2Icon className="size-3.5" />
                      )}
                    </div>
                    <span className="flex-1 truncate">{org.name}</span>
                    {org.id === activeId && (
                      <CheckIcon className="size-4 text-muted-foreground" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setCreateOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </SidebarMenu>
  );
}
