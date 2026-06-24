import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircleIcon } from "lucide-react";

export function CreateTeamDialog({
    open,
    onOpenChange,
    currentUserId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId?: string;
}) {
    const [name, setName] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await authClient.organization.createTeam({
                name: name.trim(),
            });
            if (res.error) {
                throw new Error(res.error.message ?? "Failed to create team");
            }
            // Add the creator as a team member so they can manage it
            if (currentUserId && res.data?.id) {
                await authClient.organization.addTeamMember({
                    teamId: res.data.id,
                    userId: currentUserId,
                });
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("Team created");
            setName("");
            onOpenChange(false);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        mutation.mutate();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create team</DialogTitle>
                    <DialogDescription>
                        Create a new team within your organization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="team-name">Team name</Label>
                        <Input
                            id="team-name"
                            placeholder="e.g. Engineering, Design, Marketing"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending || !name.trim()}
                        >
                            {mutation.isPending ? (
                                <>
                                    <LoaderCircleIcon className="size-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create team"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}