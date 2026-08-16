import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionMetadataService } from "../../src/services/auth/session-metadata.service";
import { refreshTokenService } from "../../src/services/auth/refresh-token.service";
import { sessionService } from "../../src/services/auth/session.service";
import { generateAccessToken } from "../../src/services/auth/token.service";
import { SessionIssuanceService } from "../../src/services/auth/session-issuance.service";

vi.mock("../../src/services/auth/token.service", () => ({
  generateAccessToken: vi.fn(() => "CLOUDSIGHT_ACCESS_TOKEN"),
}));

const sessionCreate = vi.spyOn(sessionService, "createSession");
const metadataBuild = vi.spyOn(sessionMetadataService, "build");
const tokenGenerate = vi.spyOn(refreshTokenService, "generate");
const expirationDate = vi.spyOn(refreshTokenService, "getExpirationDate");

describe("SessionIssuanceService security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenGenerate.mockReturnValue("FRESH_REFRESH_TOKEN");
    expirationDate.mockReturnValue(new Date("2026-02-01T00:00:00.000Z"));
    metadataBuild.mockReturnValue({ userAgent: "Chrome", ipAddress: "192.0.2.10" });
    sessionCreate.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      refreshTokenHash: "HASHED_ONLY",
      expiresAt: new Date("2026-02-01T00:00:00.000Z"),
    } as never);
  });

  it("creates a fresh session and never passes plaintext token to persistence", async () => {
    const result = await new SessionIssuanceService().issue(
      { id: "user-1", email: "person@example.test", name: null, avatarUrl: null, authProvider: "GOOGLE" },
      { userAgent: "Chrome", ipAddress: "192.0.2.10" },
    );

    expect(tokenGenerate).toHaveBeenCalledOnce();
    expect(sessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", ipAddress: "192.0.2.10" }),
      "FRESH_REFRESH_TOKEN",
    );
    expect(sessionCreate.mock.calls[0]?.[1]).not.toBe("HASHED_ONLY");
    expect(result.refreshToken).toBe("FRESH_REFRESH_TOKEN");
    expect(result.accessToken).toBe("CLOUDSIGHT_ACCESS_TOKEN");
    expect(generateAccessToken).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", sessionId: "session-1" }));
  });
});
