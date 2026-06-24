import { type ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ImpersonationBanner } from "@/components/shared/impersonation-banner";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
	CommandPalette,
	useCommandPalette,
} from "@/components/command-palette";

export function PageLayout({
	session,
	title,
	children,
}: {
	session: any;
	title: string;
	children: ReactNode;
}) {
	const { open, setOpen } = useCommandPalette();

	return (
		<SidebarProvider>
			<AppSidebar session={session} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage>{title}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="ml-auto flex items-center gap-2 px-4">
						<Button
							variant="outline"
							size="sm"
							className="gap-2 text-muted-foreground"
							onClick={() => setOpen(true)}
						>
							<span className="text-sm">Search</span>
							<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
								<span className="text-xs">⌘</span>K
							</kbd>
						</Button>
						<ThemeToggle />
					</div>
				</header>
				<ImpersonationBanner />
				<div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
			</SidebarInset>
			<CommandPalette open={open} onOpenChange={setOpen} role={session?.user?.role} />
		</SidebarProvider>
	);
}
