import { afterEach, describe, expect, it, vi } from "vitest";
import { buildWebUrl, sendEmail } from "./email.service";
import type { EmailEnv, EmailTemplate } from "./email.types";

const template: EmailTemplate = {
  subject: "Welcome",
  previewText: "Welcome",
  text: "Welcome to iTeams.",
  html: "<p>Welcome to iTeams.</p>",
};

const configuredEnv: EmailEnv = {
  RESEND_API_KEY: "resend-secret",
  EMAIL_FROM: "iTeams <noreply@example.com>",
  EMAIL_REPLY_TO: "support@example.com",
};

describe("buildWebUrl", () => {
  it("uses WEB_URL for frontend invitation links even when APP_BASE_URL is the API origin", () => {
    expect(
      buildWebUrl(
        {
          WEB_URL: "http://localhost:5173",
          APP_BASE_URL: "http://localhost:8787",
        },
        "/organization/accept-invitation?id=koRPrJPw0nArMEsQxN5aTcuMbut1mTit",
      ),
    ).toBe(
      "http://localhost:5173/organization/accept-invitation?id=koRPrJPw0nArMEsQxN5aTcuMbut1mTit",
    );
  });
});

describe("sendEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a configuration error without Resend settings", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      sendEmail({}, { to: "user@example.com", template }),
    ).resolves.toEqual({
      ok: false,
      error: "Email delivery is not configured.",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns the Resend provider id after a successful send", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
    );

    await expect(
      sendEmail(configuredEnv, { to: "user@example.com", template }),
    ).resolves.toEqual({
      ok: true,
      providerId: "email_123",
    });
  });

  it("handles malformed successful provider responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: 123 }), { status: 200 }),
    );

    await expect(
      sendEmail(configuredEnv, { to: "user@example.com", template }),
    ).resolves.toEqual({
      ok: true,
      providerId: null,
    });
  });

  it("returns a provider rejection without logging secrets", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("invalid api key resend-secret", { status: 401 }),
    );

    await expect(
      sendEmail(configuredEnv, { to: "user@example.com", template }),
    ).resolves.toEqual({
      ok: false,
      error: "Email provider rejected the message.",
    });
    expect(consoleError).toHaveBeenCalledWith("Resend rejected email with status 401.");
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("resend-secret");
  });
});
