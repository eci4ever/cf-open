export type EmailTemplateId =
  | "organization-invitation"
  | "email-verification"
  | "password-reset"
  | "organization-suspended"
  | "organization-reactivated"
  | "organization-archived"
  | "impersonation-started";

export type EmailTemplate = {
  subject: string;
  previewText: string;
  text: string;
  html: string;
};

export type EmailTemplateParams = {
  brandName: string;
  supportEmail?: string;
  recipientName?: string;
  organizationName?: string;
  actionUrl?: string;
  reason?: string;
  actorName?: string;
};

export type SendEmailInput = {
  to: string;
  template: EmailTemplate;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; providerId: string | null }
  | { ok: false; error: string };

export type EmailEnv = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  EMAIL_SUPPORT?: string;
  EMAIL_BRAND_NAME?: string;
  APP_BASE_URL?: string;
  WEB_URL?: string;
};
