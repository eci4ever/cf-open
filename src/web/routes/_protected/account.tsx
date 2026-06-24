import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";

import { authClient } from "@/lib/auth-client";
import { PageLayout } from "@/components/shared/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KeyIcon, MonitorIcon, PlusIcon, SmartphoneIcon, TrashIcon, TriangleAlertIcon, MailCheckIcon, MailIcon } from "lucide-react";

function ProfileSection({ session }: { session: NonNullable<ReturnType<typeof authClient.useSession>["data"]> }) {
	const [name, setName] = useState(session.user.name ?? "");
	const email = session.user.email;

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.updateUser({ name, image: undefined });
			if (res.error) throw new Error(res.error.message ?? "Failed to update profile");
			return res;
		},
		onSuccess: () => {
			toast.success("Profile updated");
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>Update your name and email address.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="profile-name">Name</Label>
					<Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="profile-email">Email</Label>
					<Input id="profile-email" type="email" value={email} disabled />
					<p className="text-xs text-muted-foreground">Email change is not supported here.</p>
				</div>
				<Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
					{mutation.isPending ? "Saving..." : "Save"}
				</Button>
			</CardContent>
		</Card>
	);
}

function EmailVerificationSection({ session }: { session: NonNullable<ReturnType<typeof authClient.useSession>["data"]> }) {
	const isVerified = session.user.emailVerified;

	const sendMutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.sendVerificationEmail({
				email: session.user.email,
				callbackURL: "/verify-email",
			});
			if (res.error) throw new Error(res.error.message ?? "Failed to send verification email");
			return res;
		},
		onSuccess: () => {
			toast.success("Verification email sent");
		},
		onError: (err) => toast.error(err.message),
	});

	if (isVerified) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Email Verification</CardTitle>
							<CardDescription>Your email address has been verified.</CardDescription>
						</div>
						<Badge variant="default" className="gap-1">
							<MailCheckIcon className="size-3" />
							Verified
						</Badge>
					</div>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Email Verification</CardTitle>
						<CardDescription>Verify your email address to secure your account.</CardDescription>
					</div>
					<Badge variant="outline" className="gap-1">
						<MailIcon className="size-3" />
						Unverified
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Your email <span className="font-medium">{session.user.email}</span> is not verified yet. Click the button below to send a verification link.
				</p>
				<Button
					variant="outline"
					disabled={sendMutation.isPending}
					onClick={() => sendMutation.mutate()}
				>
					<MailCheckIcon className="size-4" />
					{sendMutation.isPending ? "Sending..." : "Send verification email"}
				</Button>
			</CardContent>
		</Card>
	);
}

function PasswordSection() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const mutation = useMutation({
		mutationFn: async () => {
			if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
			const res = await authClient.changePassword({ currentPassword, newPassword });
			if (res.error) throw new Error(res.error.message ?? "Failed to change password");
			return res;
		},
		onSuccess: () => {
			toast.success("Password changed");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>Change your account password.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="current-password">Current password</Label>
					<Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="new-password">New password</Label>
					<Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="confirm-password">Confirm new password</Label>
					<Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
				</div>
				<Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
					{mutation.isPending ? "Changing..." : "Change password"}
				</Button>
			</CardContent>
		</Card>
	);
}

function TwoFactorSection({ session }: { session: NonNullable<ReturnType<typeof authClient.useSession>["data"]> }) {
	const [step, setStep] = useState<"idle" | "enable" | "show-qr" | "verify">("idle");
	const [password, setPassword] = useState("");
	const totpUriRef = useRef("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verifyCode, setVerifyCode] = useState("");
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const isEnabled = session.user.twoFactorEnabled;

	useEffect(() => {
		if (canvasRef.current && totpUriRef.current) {
			QRCode.toCanvas(canvasRef.current, totpUriRef.current, { width: 200, margin: 2 });
		}
	}, [step]);

	const enableMutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.twoFactor.enable({ password });
			if (res.error) throw new Error(res.error.message ?? "Failed to enable 2FA");
			return res.data;
		},
		onSuccess: (data) => {
			if (data) {
				totpUriRef.current = data.totpURI;
				setBackupCodes(data.backupCodes);
				setStep("show-qr");
			}
		},
		onError: (err) => toast.error(err.message),
	});

	const disableMutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.twoFactor.disable({ password });
			if (res.error) throw new Error(res.error.message ?? "Failed to disable 2FA");
			return res;
		},
		onSuccess: () => {
			toast.success("Two-factor authentication disabled");
			setStep("idle");
			setPassword("");
		},
		onError: (err) => toast.error(err.message),
	});

	const verifyMutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.twoFactor.verifyTotp({ code: verifyCode });
			if (res.error) throw new Error(res.error.message ?? "Verification failed");
			return res;
		},
		onSuccess: () => {
			toast.success("Two-factor authentication enabled");
			setStep("idle");
			setPassword("");
			setVerifyCode("");
			totpUriRef.current = "";
			setBackupCodes([]);
		},
		onError: (err) => toast.error(err.message),
	});

	if (isEnabled) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						Your account is protected with two-factor authentication.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-2">
						<Badge variant="default">Enabled</Badge>
					</div>
					{step === "verify" && (
						<div className="space-y-2">
							<Label htmlFor="disable-password">Enter your password to disable 2FA</Label>
							<Input id="disable-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
							<div className="flex gap-2">
								<Button variant="destructive" onClick={() => disableMutation.mutate()} disabled={disableMutation.isPending || !password}>
									{disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
								</Button>
								<Button variant="outline" onClick={() => { setStep("idle"); setPassword(""); }}>
									Cancel
								</Button>
							</div>
						</div>
					)}
					{step === "idle" && (
						<Button variant="outline" onClick={() => setStep("verify")}>
							Disable two-factor authentication
						</Button>
					)}
				</CardContent>
			</Card>
		);
	}

	if (step === "enable") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						Enter your password to set up two-factor authentication.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="enable-password">Password</Label>
						<Input id="enable-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>
					<div className="flex gap-2">
						<Button onClick={() => enableMutation.mutate()} disabled={enableMutation.isPending || !password}>
							{enableMutation.isPending ? "Setting up..." : "Set up two-factor authentication"}
						</Button>
						<Button variant="outline" onClick={() => { setStep("idle"); setPassword(""); }}>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (step === "show-qr") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex justify-center">
						<canvas ref={canvasRef} />
					</div>
					<div className="space-y-2">
						<Label>Backup codes</Label>
						<p className="text-xs text-muted-foreground">
							Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
						</p>
						<div className="grid grid-cols-2 gap-1 rounded-md border p-3 font-mono text-sm">
							{backupCodes.map((code, i) => (
								<div key={i}>{code}</div>
							))}
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="verify-code">Enter the 6-digit code from your authenticator app to verify</Label>
						<Input id="verify-code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} maxLength={6} placeholder="000000" />
					</div>
					<div className="flex gap-2">
						<Button onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending || verifyCode.length !== 6}>
							{verifyMutation.isPending ? "Verifying..." : "Verify and enable"}
						</Button>
						<Button variant="outline" onClick={() => { setStep("idle"); setPassword(""); totpUriRef.current = ""; setBackupCodes([]); }}>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Two-Factor Authentication</CardTitle>
				<CardDescription>
					Add an extra layer of security to your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onClick={() => setStep("enable")}>
					<PlusIcon /> Set up two-factor authentication
				</Button>
			</CardContent>
		</Card>
	);
}

function PasskeysSection() {
	const { data: passkeysData, refetch: refetchPasskeys } = authClient.useListPasskeys();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const passkeys = passkeysData as { id: string; name: string | null; createdAt: Date }[] | undefined;

	const addMutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.passkey.addPasskey({ name: "My Passkey" });
			if (res.error) throw new Error(res.error.message ?? "Failed to add passkey");
			return res;
		},
		onSuccess: () => {
			toast.success("Passkey added");
			refetchPasskeys();
		},
		onError: (err) => toast.error(err.message),
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await authClient.passkey.deletePasskey({ id });
			if (res.error) throw new Error(res.error.message ?? "Failed to delete passkey");
			return res;
		},
		onSuccess: () => {
			toast.success("Passkey deleted");
			refetchPasskeys();
			setDeletingId(null);
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Passkeys</CardTitle>
						<CardDescription>Manage your passkeys for passwordless sign-in.</CardDescription>
					</div>
					<Button size="sm" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
						<PlusIcon /> Add passkey
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{!passkeys || passkeys.length === 0 ? (
					<p className="text-sm text-muted-foreground">No passkeys registered.</p>
				) : (
					<div className="space-y-2">
						{passkeys.map((pk) => (
							<div key={pk.id} className="flex items-center justify-between rounded-md border p-3">
								<div className="flex items-center gap-2">
									<KeyIcon className="size-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium">{pk.name ?? "Unnamed passkey"}</p>
										<p className="text-xs text-muted-foreground">
											{pk.createdAt ? new Date(pk.createdAt).toLocaleDateString() : ""}
										</p>
									</div>
								</div>
								<Button variant="ghost" size="icon" onClick={() => setDeletingId(pk.id)}>
									<TrashIcon className="size-4" />
								</Button>
							</div>
						))}
					</div>
				)}
			</CardContent>

			<AlertDialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete passkey?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove this passkey from your account. You may not be able to sign in if you don't have another method.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => { if (deletingId) deleteMutation.mutate(deletingId); }}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}

function SessionsSection() {
	const queryClient = useQueryClient();
	const [revokeAllOpen, setRevokeAllOpen] = useState(false);

	const { data: sessions, isPending: sessionsIsPending } = useQuery({
		queryKey: ["account", "sessions"],
		queryFn: async () => {
			const res = await authClient.listSessions();
			const raw = res.data ?? [];
			return Array.isArray(raw) ? raw : [];
		},
	});

	const revokeMutation = useMutation({
		mutationFn: async (token: string) => {
			const res = await authClient.revokeSession({ token });
			if (res.error) throw new Error(res.error.message ?? "Failed to revoke session");
			return res;
		},
		onSuccess: () => {
			toast.success("Session revoked");
			queryClient.invalidateQueries({ queryKey: ["account", "sessions"] });
		},
		onError: (err) => toast.error(err.message),
	});

	const revokeAllMutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.revokeOtherSessions();
			if (res.error) throw new Error(res.error.message ?? "Failed to revoke sessions");
			return res;
		},
		onSuccess: () => {
			toast.success("Other sessions revoked");
			queryClient.invalidateQueries({ queryKey: ["account", "sessions"] });
			setRevokeAllOpen(false);
		},
		onError: (err) => toast.error(err.message),
	});

	const sessionList = sessions ?? [];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Sessions</CardTitle>
						<CardDescription>Manage your active sessions.</CardDescription>
					</div>
					{sessionList.length > 1 && (
						<Button variant="outline" size="sm" onClick={() => setRevokeAllOpen(true)}>
							Revoke all other sessions
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{sessionsIsPending ? (
					<p className="text-sm text-muted-foreground">Loading sessions...</p>
				) : sessionList.length === 0 ? (
					<p className="text-sm text-muted-foreground">No active sessions.</p>
				) : (
					<div className="space-y-2">
						{sessionList.map((session: { id: string; token: string; userAgent?: string | null; createdAt: Date; isCurrent?: boolean }) => (
							<div key={session.id} className="flex items-center justify-between rounded-md border p-3">
								<div className="flex items-center gap-2">
									{session.isCurrent ? <MonitorIcon className="size-4" /> : <SmartphoneIcon className="size-4 text-muted-foreground" />}
									<div>
										<p className="text-sm font-medium">
											{session.isCurrent ? "Current session" : session.userAgent ?? "Unknown device"}
										</p>
										<p className="text-xs text-muted-foreground">
											{session.createdAt ? new Date(session.createdAt).toLocaleString() : ""}
										</p>
									</div>
								</div>
								{!session.isCurrent && (
									<Button variant="ghost" size="sm" onClick={() => revokeMutation.mutate(session.token)} disabled={revokeMutation.isPending}>
										Revoke
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>

			<AlertDialog open={revokeAllOpen} onOpenChange={(open) => { if (!open) setRevokeAllOpen(false); }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
						<AlertDialogDescription>
							This will sign out all devices except your current one.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => revokeAllMutation.mutate()}>
							Revoke all
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}

function DangerSection() {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState("");

	const deleteMutation = useMutation({
		mutationFn: async () => {
			const res = await authClient.deleteUser();
			if (res.error) throw new Error(res.error.message ?? "Failed to delete account");
			return res;
		},
		onSuccess: () => {
			toast.success("Account deleted");
			window.location.href = "/";
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-destructive">Danger Zone</CardTitle>
				<CardDescription>
					Irreversible actions for your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="destructive" onClick={() => setDeleteOpen(true)}>
					Delete account
				</Button>
			</CardContent>

			<AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!open) { setDeleteOpen(false); setDeleteConfirm(""); } }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10 text-destructive">
							<TriangleAlertIcon className="size-6" />
						</AlertDialogMedia>
						<AlertDialogTitle>Delete your account?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete your account and all associated data. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid gap-2">
						<Label htmlFor="delete-confirm">
							Type <span className="font-semibold">DELETE</span> to confirm.
						</Label>
						<Input
							id="delete-confirm"
							value={deleteConfirm}
							onChange={(e) => setDeleteConfirm(e.target.value)}
							placeholder="DELETE"
						/>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deleteConfirm !== "DELETE" || deleteMutation.isPending}
							onClick={() => deleteMutation.mutate()}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete account"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}

function AccountPage() {
	const { data: session } = authClient.useSession();

	if (!session) {
		return null;
	}

	return (
		<PageLayout session={session} title="Account">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Account</h1>
				<p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
			</div>
			<div className="space-y-6">
				<ProfileSection session={session} />
				<EmailVerificationSection session={session} />
				<PasswordSection />
				<TwoFactorSection session={session} />
				<PasskeysSection />
				<SessionsSection />
				<DangerSection />
			</div>
		</PageLayout>
	);
}

export const Route = createFileRoute("/_protected/account")({
	component: AccountPage,
});
