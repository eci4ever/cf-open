import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
	plugins: [
		adminClient(),
		organizationClient({ teams: { enabled: true } }),
		twoFactorClient(),
		passkeyClient(),
	],
});
