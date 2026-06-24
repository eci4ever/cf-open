import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
} from "@/components/ui/command";
import {
    LayoutDashboardIcon,
    UsersIcon,
    Building2Icon,
    CreditCardIcon,
    CalendarCheckIcon,
    BadgeCheckIcon,
    SunIcon,
    MoonIcon,
    MonitorIcon,
} from "lucide-react";
import { useTheme, type Theme } from "@/hooks/use-theme";

type NavItem = {
    label: string;
    to: string;
    icon: typeof LayoutDashboardIcon;
    group: string;
    adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboardIcon, group: "Navigation" },
    { label: "Account Settings", to: "/account", icon: BadgeCheckIcon, group: "Navigation" },
    { label: "Attendance", to: "/services/attendance", icon: CalendarCheckIcon, group: "Services" },
    { label: "Users", to: "/admin/users", icon: UsersIcon, group: "Admin", adminOnly: true },
    { label: "Organizations", to: "/admin/organizations", icon: Building2Icon, group: "Admin", adminOnly: true },
    { label: "Subscriptions", to: "/admin/subscriptions", icon: CreditCardIcon, group: "Admin", adminOnly: true },
];

const THEME_ICONS: Record<Theme, typeof SunIcon> = {
    light: SunIcon,
    dark: MoonIcon,
    system: MonitorIcon,
};

const THEME_LABELS: Record<Theme, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
};

export function CommandPalette({
    open,
    onOpenChange,
    role,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: string | null;
}) {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const isAdmin = role === "admin";

    // Filter items by role, then group
    const groups = NAV_ITEMS
        .filter((item) => !item.adminOnly || isAdmin)
        .reduce<Record<string, NavItem[]>>((acc, item) => {
            (acc[item.group] ??= []).push(item);
            return acc;
        }, {});

    function handleNavigate(to: string) {
        onOpenChange(false);
        navigate({ to });
    }

    function handleSetTheme(t: Theme) {
        setTheme(t);
        onOpenChange(false);
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {Object.entries(groups).map(([group, items]) => (
                        <CommandGroup key={group} heading={group}>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.to}
                                    value={`${item.label} ${item.group}`}
                                    onSelect={() => handleNavigate(item.to)}
                                >
                                    <item.icon className="size-4 text-muted-foreground" />
                                    <span>{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}

                    <CommandSeparator />

                    <CommandGroup heading="Theme">
                        {(["light", "dark", "system"] as Theme[]).map((t) => {
                            const Icon = THEME_ICONS[t];
                            return (
                                <CommandItem
                                    key={t}
                                    value={`theme ${THEME_LABELS[t]}`}
                                    onSelect={() => handleSetTheme(t)}
                                >
                                    <Icon className="size-4 text-muted-foreground" />
                                    <span>Theme: {THEME_LABELS[t]}</span>
                                    {theme === t && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            Active
                                        </span>
                                    )}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    );
}

export function useCommandPalette() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return { open, setOpen };
}