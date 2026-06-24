import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme, type Theme } from "@/hooks/use-theme";

const ICONS: Record<Theme, typeof SunIcon> = {
    light: SunIcon,
    dark: MoonIcon,
    system: MonitorIcon,
};

const LABELS: Record<Theme, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
};

export function ThemeToggle() {
    const { theme, cycleTheme } = useTheme();
    const Icon = ICONS[theme];

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={cycleTheme}
                        aria-label={`Theme: ${LABELS[theme]}`}
                    />
                }
            >
                <Icon className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
                Theme: {LABELS[theme]}
            </TooltipContent>
        </Tooltip>
    );
}