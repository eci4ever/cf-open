import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { Route as IndexRoute } from "./routes/index";
import { Route as AboutRoute } from "./routes/about";
import { Route as LoginRoute } from "./routes/login";
import { Route as SignupRoute } from "./routes/signup";

const routeTree = rootRoute.addChildren([IndexRoute, AboutRoute, LoginRoute, SignupRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
