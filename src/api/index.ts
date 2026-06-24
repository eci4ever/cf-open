import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./lib/auth";
import { createDb } from "./db/client";
import { organization, member } from "./db/schema/index";
import { count, eq } from "drizzle-orm";
import type { Auth } from "./lib/auth";

type Session = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

const app = new Hono<{
	Bindings: Env;
	Variables: {
		user: Session["user"] | null;
		session: Session["session"] | null;
	};
}>();

app.use(
	"/api/auth/*",
	cors({
		origin: ["http://localhost:5173", "https://cf-open.eci4ever.workers.dev", "https://itime.nimfi.dev"],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

// Session middleware — sets c.var.user and c.var.session for all routes
app.use("*", async (c, next) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		await next();
		return;
	}

	c.set("user", session.user);
	c.set("session", session.session);
	await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	const auth = createAuth(c.env);
	return auth.handler(c.req.raw);
});

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/admin/organizations", async (c) => {
	if (!c.var.user || c.var.user.role !== "admin") {
		return c.json({ error: "Unauthorized" }, 403);
	}

	const db = createDb(c.env.DB);
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
