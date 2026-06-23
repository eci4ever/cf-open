import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";

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

export default app;
