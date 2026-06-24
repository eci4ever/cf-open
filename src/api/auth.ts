import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createDb } from "../db/client";
import * as schema from "../db/schema/index";

export function createAuth(d1: D1Database) {
	return betterAuth({
		appName: "TeamOS",
		database: drizzleAdapter(createDb(d1), {
			provider: "sqlite",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
		},
		user: {
			deleteUser: {
				enabled: true,
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
