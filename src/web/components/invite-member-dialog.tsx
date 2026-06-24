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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LoaderCircleIcon } from "lucide-react";

export function InviteMemberDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await authClient.organization.inviteMember({
                email: email.trim(),
                role,
            });
            if (res.error) {
                throw new Error(res.error.message ?? "Failed to send invitation");
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("Invitation sent");
            setEmail("");
            setRole("member");
            onOpenChange(false);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        mutation.mutate();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join your organization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                            id="invite-email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as string)}>
                            <SelectTrigger id="invite-role" className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
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
                            disabled={mutation.isPending || !email.trim()}
                        >
                            {mutation.isPending ? (
                                <>
                                    <LoaderCircleIcon className="size-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send invitation"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}