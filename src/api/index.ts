import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./lib/auth";
import { createDb } from "./db/client";
import { organization, member } from "./db/schema/index";
import { count, eq } from "drizzle-orm";

const app = new Hono<{ Bindings: Env }>();

app.use(
	"/api/auth/*",
	cors({
		origin: ["http://localhost:5173", "https://cf-open.eci4ever.workers.dev"],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	const auth = createAuth(c.env.cf_open_db);
	return auth.handler(c.req.raw);
});

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/admin/organizations", async (c) => {
	const auth = createAuth(c.env.cf_open_db);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session || session.user.role !== "admin") {
		return c.json({ error: "Unauthorized" }, 403);
	}

	const db = createDb(c.env.cf_open_db);
	const [orgs, [totalResult]] = await Promise.all([
		db
			.select({
				id: organization.id,
				name: organization.name,
				slug: organization.slug,
				createdAt: organization.createdAt,
				memberCount: count(member.id),
			})
			.from(organization)
			.leftJoin(member, eq(member.organizationId, organization.id))
			.groupBy(organization.id),
		db
			.select({ total: count() })
			.from(organization),
	]);

	return c.json({ data: orgs, total: totalResult?.total ?? 0 });
});

export default app;
