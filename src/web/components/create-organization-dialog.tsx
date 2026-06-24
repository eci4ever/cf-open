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

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function CreateOrganizationDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);

    function handleNameChange(value: string) {
        setName(value);
        if (!slugEdited) {
            setSlug(slugify(value));
        }
    }

    function handleSlugChange(value: string) {
        setSlugEdited(true);
        setSlug(slugify(value));
    }

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await authClient.organization.create({
                name: name.trim(),
                slug: slug.trim() || slugify(name),
            });
            if (res.error) {
                throw new Error(res.error.message ?? "Failed to create organization");
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("Organization created");
            setName("");
            setSlug("");
            setSlugEdited(false);
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
                    <DialogTitle>Create organization</DialogTitle>
                    <DialogDescription>
                        Enter a name and slug for your new organization. You'll be
                        switched to it automatically.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="org-name">Name</Label>
                        <Input
                            id="org-name"
                            placeholder="Acme Inc."
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="org-slug">Slug</Label>
                        <Input
                            id="org-slug"
                            placeholder="acme-inc"
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Used in URLs. Lowercase letters, numbers, and hyphens only.
                        </p>
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
                                "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}