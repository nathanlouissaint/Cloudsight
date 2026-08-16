import type { EmailMessage } from "./email-provider";

let captured: EmailMessage[] = [];

export function captureTestEmail(message: EmailMessage): void {
  captured.push({ ...message });
}

export function getCapturedTestEmails(): EmailMessage[] {
  return captured.map((message) => ({ ...message }));
}

export function clearCapturedTestEmails(): void {
  captured = [];
}
