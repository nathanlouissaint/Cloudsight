import {
  DevelopmentEmailProvider,
} from "./development-email.provider";

import type {
  EmailProvider,
} from "./email-provider";

export interface SendTokenEmailInput {
  email: string;
  token: string;
}

export interface SendOrganizationInvitationEmailInput {
  email: string;
  token: string;
  organizationName: string;
}

export class EmailService {
  constructor(
    private readonly provider: EmailProvider,
  ) {}

  async sendVerificationEmail(
    input: SendTokenEmailInput,
  ): Promise<void> {
    await this.provider.send({
      to: input.email,
      subject: "Verify your CloudSight email",
      text:
        `Use this verification token: ${input.token}`,
    });
  }

  async sendPasswordResetEmail(
    input: SendTokenEmailInput,
  ): Promise<void> {
    await this.provider.send({
      to: input.email,
      subject: "Reset your CloudSight password",
      text:
        `Use this password reset token: ${input.token}`,
    });
  }

  async sendOrganizationInvitationEmail(
    input: SendOrganizationInvitationEmailInput,
  ): Promise<void> {
    await this.provider.send({
      to: input.email,
      subject:
        `You're invited to ${input.organizationName} on CloudSight`,
      text:
        `Use this organization invitation token: ${input.token}`,
    });
  }
}

export const emailService =
  new EmailService(
    new DevelopmentEmailProvider(),
  );
