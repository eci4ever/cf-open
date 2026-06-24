import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
}

function applyTheme(theme: Theme): ResolvedTheme {
	const resolved = theme === "system" ? getSystemTheme() : theme;
	const root = document.documentElement;
	if (resolved === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}
	return resolved;
}

export function useTheme() {
	const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
		applyTheme(getStoredTheme()),
	);

	// Re-apply whenever theme changes
	useEffect(() => {
		const resolved = applyTheme(theme);
		setResolvedTheme(resolved);
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	// Listen for system preference changes when in "system" mode
	useEffect(() => {
		if (theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			const resolved = applyTheme("system");
			setResolvedTheme(resolved);
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme]);

	const setTheme = useCallback((t: Theme) => {
		setThemeState(t);
	}, []);

	const cycleTheme = useCallback(() => {
		setThemeState((prev) =>
			prev === "light" ? "dark" : prev === "dark" ? "system" : "light",
		);
	}, []);

	return { theme, resolvedTheme, setTheme, cycleTheme };
}