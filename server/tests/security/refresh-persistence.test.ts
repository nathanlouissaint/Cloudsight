import crypto from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionRepository } from "../../src/repositories/auth/session.repository";
import { sessionService } from "../../src/services/auth/session.service";

const repositoryCreate = vi.spyOn(sessionRepository, "create");
const repositoryUpdateHash = vi.spyOn(sessionRepository, "updateRefreshTokenHash");

const session = {
  id: "session-1",
  userId: "user-1",
  refreshTokenHash: "stored-hash",
  expiresAt: new Date("2027-01-01T00:00:00.000Z"),
} as never;

beforeEach(() => {
  vi.clearAllMocks();
  repositoryCreate.mockResolvedValue(session);
  repositoryUpdateHash.mockResolvedValue(session);
});

describe("refresh-token persistence boundary", () => {
  it("persists only the hash, never plaintext refresh material", async () => {
    const plaintext = "SECRET_PLAINTEXT_REFRESH_TOKEN";

    await sessionService.createSession(
      { userId: "user-1", expiresAt: session.expiresAt },
      plaintext,
    );

    const persisted = JSON.stringify(repositoryCreate.mock.calls[0]?.[0]);
    expect(persisted).not.toContain(plaintext);
    expect(repositoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshTokenHash: crypto.createHash("sha256").update(plaintext).digest("hex"),
      }),
    );
  });

  it("persists only the replacement refresh-token hash during rotation", async () => {
    const replacement = "SECRET_REPLACEMENT_REFRESH_TOKEN";

    await sessionService.rotateRefreshToken("session-1", replacement);

    const persisted = JSON.stringify(repositoryUpdateHash.mock.calls[0]);
    expect(persisted).not.toContain(replacement);
    expect(repositoryUpdateHash).toHaveBeenCalledWith(
      "session-1",
      crypto.createHash("sha256").update(replacement).digest("hex"),
    );
  });
});
