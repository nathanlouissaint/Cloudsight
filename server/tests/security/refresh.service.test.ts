import crypto from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionRepository } from "../../src/repositories/auth/session.repository";
import { refreshTokenService } from "../../src/services/auth/refresh-token.service";
import { sessionService } from "../../src/services/auth/session.service";

const findByHash = vi.spyOn(sessionRepository, "findByRefreshTokenHash");
const updateHash = vi.spyOn(sessionRepository, "updateRefreshTokenHash");
const compareAndSwap = vi.spyOn(sessionRepository, "compareAndSwapRefreshTokenHash");
const touch = vi.spyOn(sessionRepository, "touch");
const generate = vi.spyOn(refreshTokenService, "generate");

const baseSession = {
  id: "session-1",
  userId: "user-1",
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  user: { id: "user-1", email: "person@example.test" },
} as never;

beforeEach(() => {
  vi.clearAllMocks();
  findByHash.mockResolvedValue(baseSession);
  updateHash.mockResolvedValue(baseSession);
  compareAndSwap.mockResolvedValue(true);
  touch.mockResolvedValue(baseSession);
  generate.mockReturnValue("FRESH_REPLACEMENT_TOKEN");
});

describe("refresh-session security", () => {
  it("rotates a valid token and touches the existing session", async () => {
    const result = await sessionService.refreshSession("OLD_REFRESH_TOKEN");

    expect(findByHash).toHaveBeenCalledWith(
      crypto.createHash("sha256").update("OLD_REFRESH_TOKEN").digest("hex"),
    );
    expect(compareAndSwap).toHaveBeenCalledWith(
      "session-1",
      crypto.createHash("sha256").update("OLD_REFRESH_TOKEN").digest("hex"),
      crypto.createHash("sha256").update("FRESH_REPLACEMENT_TOKEN").digest("hex"),
    );
    expect(touch).toHaveBeenCalledWith("session-1");
    expect(result.refreshToken).toBe("FRESH_REPLACEMENT_TOKEN");
  });

  it.each([
    ["missing session", null],
    ["revoked session", { ...baseSession, revokedAt: new Date() }],
    ["expired session", { ...baseSession, expiresAt: new Date(Date.now() - 1) }],
  ])("rejects %s", async (_label, session) => {
    findByHash.mockResolvedValue(session as never);

    await expect(sessionService.refreshSession("OLD_REFRESH_TOKEN"))
      .rejects.toThrow("Refresh token is invalid.");
    expect(updateHash).not.toHaveBeenCalled();
    expect(compareAndSwap).not.toHaveBeenCalled();
    expect(touch).not.toHaveBeenCalled();
  });
});
