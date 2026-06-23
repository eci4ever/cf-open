import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOutIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

export function ImpersonationBanner() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const isImpersonating = !!session?.session?.impersonatedBy;

	const stopMutation = useMutation({
		mutationFn: () => authClient.admin.stopImpersonating(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["session"] });
			toast.success("Stopped impersonating");
			navigate({ to: "/admin/users" });
		},
		onError: () => toast.error("Failed to stop impersonation"),
	});

	if (!isImpersonating) return null;

	return (
		<div className="flex items-center justify-between gap-4 bg-amber-500/15 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
			<div className="flex items-center gap-2">
				<UserIcon className="size-4" />
				<span>
					Impersonating <strong>{session?.user?.name ?? session?.user?.email}</strong>
				</span>
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={() => stopMutation.mutate()}
				disabled={stopMutation.isPending}
			>
				<LogOutIcon className="size-4" />
				{stopMutation.isPending ? "Stopping..." : "Stop impersonation"}
			</Button>
		</div>
	);
}
