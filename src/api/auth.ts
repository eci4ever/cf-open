import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createDb } from "../db/client";
import * as schema from "../db/schema";

export function createAuth(d1: D1Database) {
	return betterAuth({
		database: drizzleAdapter(createDb(d1), {
			provider: "sqlite",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
