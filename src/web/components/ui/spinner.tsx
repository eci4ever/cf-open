import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export function Spinner({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex items-center justify-center", className)}
			{...props}
		>
			<LoaderCircle className="size-6 animate-spin text-muted-foreground" />
		</div>
	);
}
