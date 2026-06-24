import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createDb } from "../db/client";
import * as schema from "../db/schema/index";
import {
	sendEmail,
	makeEmailTemplate,
	buildWebUrl,
} from "../server/email/email.service";
import type { EmailEnv } from "../server/email/email.types";

export function createAuth(env: Env) {
	const emailEnv: EmailEnv = env;
	return betterAuth({
		appName: "TeamOS",
		database: drizzleAdapter(createDb(env.DB), {
			provider: "sqlite",
			schema,
		}),
		rateLimit: {
			enabled: true,
			window: 60,
			max: 100,
			customRules: {
				"/sign-in/email": {
					window: 60,
					max: 5,
				},
				"/sign-up/email": {
					window: 3600,
					max: 3,
				},
				"/forget-password": {
					window: 3600,
					max: 3,
				},
				"/reset-password": {
					window: 3600,
					max: 5,
				},
				"/verify-email": {
					window: 3600,
					max: 5,
				},
				"/two-factor/*": {
					window: 60,
					max: 3,
				},
			},
		},
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 8,
			maxPasswordLength: 128,
			requireEmailVerification: false,
			sendResetPassword: async ({ user, url }) => {
				// Extract token from the Better Auth URL and build a direct frontend link
				const token = new URL(url).pathname.split("/").pop();
				const resetUrl = token
					? buildWebUrl(emailEnv, `/reset-password?token=${token}`)
					: url;
				await sendEmail(emailEnv, {
					to: user.email,
					template: makeEmailTemplate(emailEnv, "password-reset", {
						recipientName: user.name,
						actionUrl: resetUrl,
					}),
				});
			},
		},
		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				// Extract token from the Better Auth URL and build a direct frontend link
				const token = new URL(url).searchParams.get("token");
				const verifyUrl = token
					? buildWebUrl(emailEnv, `/verify-email?token=${token}`)
					: url;
				await sendEmail(emailEnv, {
					to: user.email,
					template: makeEmailTemplate(emailEnv, "email-verification", {
						recipientName: user.name,
						actionUrl: verifyUrl,
					}),
				});
			},
			sendOnSignUp: true,
			autoSignInAfterVerification: true,
		},
		user: {
			deleteUser: {
				enabled: true,
			},
			changeEmail: {
				enabled: true,
				sendChangeEmailConfirmation: async ({ user, url }) => {
					// Extract token and build a direct frontend link
					const token = new URL(url).searchParams.get("token");
					const verifyUrl = token
						? buildWebUrl(emailEnv, `/verify-email?token=${token}`)
						: url;
					await sendEmail(emailEnv, {
						to: user.email,
						template: makeEmailTemplate(emailEnv, "email-verification", {
							recipientName: user.name,
							actionUrl: verifyUrl,
						}),
					});
				},
			},
		},
		plugins: [
			admin(),
			organization({
				teams: {
					enabled: true,
				},
			}),
			twoFactor(),
			passkey(),
		],
	});
}

export type Auth = ReturnType<typeof createAuth>;
