import { useState, useEffect } from "react";
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

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function EditOrganizationDialog({
    open,
    onOpenChange,
    organizationId,
    initialName,
    initialSlug,
    initialLogo,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    initialName: string;
    initialSlug: string;
    initialLogo?: string | null;
}) {
    const [name, setName] = useState(initialName);
    const [slug, setSlug] = useState(initialSlug);
    const [logo, setLogo] = useState(initialLogo ?? "");

    useEffect(() => {
        if (open) {
            setName(initialName);
            setSlug(initialSlug);
            setLogo(initialLogo ?? "");
        }
    }, [open, initialName, initialSlug, initialLogo]);

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await authClient.organization.update({
                organizationId,
                data: {
                    name: name.trim(),
                    slug: slug.trim() || slugify(name),
                    logo: logo.trim() || null,
                },
            });
            if (res.error) {
                throw new Error(res.error.message ?? "Failed to update organization");
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("Organization updated");
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
                    <DialogTitle>Edit organization</DialogTitle>
                    <DialogDescription>
                        Update your organization's name, slug, and logo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-org-name">Name</Label>
                        <Input
                            id="edit-org-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-org-slug">Slug</Label>
                        <Input
                            id="edit-org-slug"
                            value={slug}
                            onChange={(e) => setSlug(slugify(e.target.value))}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-org-logo">Logo URL</Label>
                        <Input
                            id="edit-org-logo"
                            placeholder="https://..."
                            value={logo}
                            onChange={(e) => setLogo(e.target.value)}
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
                                    Saving...
                                </>
                            ) : (
                                "Save changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}