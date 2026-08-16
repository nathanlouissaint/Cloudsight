import type {
  EmailMessage,
  EmailProvider,
} from "./email-provider";
import { captureTestEmail } from "./test-email-capture";
import { appendFileSync } from "node:fs";

export class DevelopmentEmailProvider
  implements EmailProvider {
  async send(
    message: EmailMessage,
  ): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      captureTestEmail(message);
      const captureFile = process.env.E2E_EMAIL_CAPTURE_FILE;
      if (captureFile) appendFileSync(captureFile, `${JSON.stringify(message)}\n`, { mode: 0o600 });
      return;
    }

    if (
      process.env.NODE_ENV !==
      "development"
    ) {
      return;
    }

    console.info(
      "Development email:",
      message,
    );
  }
}
