import type {
  EmailEnv,
  EmailTemplate,
  SendEmailInput,
  SendEmailResult,
} from "./email.types";
import { renderEmailTemplate } from "./email.templates";
import { z } from "zod";

const resendEmailResponseSchema = z.object({
  id: z.string().optional(),
});

export function getEmailBrandName(env: EmailEnv): string {
  return env.EMAIL_BRAND_NAME ?? "Platform";
}

export function getAppBaseUrl(env: EmailEnv): string {
  return env.APP_BASE_URL ?? env.WEB_URL ?? "http://localhost:5173";
}

export function buildAuthUrl(env: EmailEnv, path: string): string {
  const base = getAppBaseUrl(env).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildWebUrl(env: EmailEnv, path: string): string {
  const base = (env.WEB_URL ?? "http://localhost:5173").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function sendEmail(
  env: EmailEnv,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    return { ok: false, error: "Email delivery is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: input.to,
      reply_to: input.replyTo ?? env.EMAIL_REPLY_TO,
      subject: input.template.subject,
      text: input.template.text,
      html: input.template.html,
    }),
  });

  if (!response.ok) {
    console.error(`Resend rejected email with status ${response.status}.`);
    return { ok: false, error: "Email provider rejected the message." };
  }

  const json = await response.json().catch(() => null);
  const body = resendEmailResponseSchema.safeParse(json);

  return { ok: true, providerId: body.success ? body.data.id ?? null : null };
}

export function makeEmailTemplate(
  env: EmailEnv,
  template: Parameters<typeof renderEmailTemplate>[0],
  params: Omit<Parameters<typeof renderEmailTemplate>[1], "brandName">,
): EmailTemplate {
  return renderEmailTemplate(template, {
    brandName: getEmailBrandName(env),
    supportEmail: env.EMAIL_SUPPORT,
    ...params,
  });
}
