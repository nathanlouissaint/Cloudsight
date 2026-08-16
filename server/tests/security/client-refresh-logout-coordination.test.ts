import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

describe("client refresh/logout coordination", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("orders a delayed refresh response before logout clears the session cookie", async () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) =>
          values.get(key) ?? null,
        setItem: (key: string, value: string) =>
          values.set(key, value),
        removeItem: (key: string) =>
          values.delete(key),
      },
    });

    let releaseRefresh!: (response: Response) => void;
    const delayedRefresh = new Promise<Response>(
      (resolve) => {
        releaseRefresh = resolve;
      },
    );
    let signalRefreshStarted!: () => void;
    const refreshStarted = new Promise<void>(
      (resolve) => {
        signalRefreshStarted = resolve;
      },
    );
    const cookieEvents: string[] = [];
    const expiresAt = new Date(
      Date.now() + 60_000,
    ).toISOString();

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = String(input);

        if (url.endsWith("/auth/csrf")) {
          return new Response(
            JSON.stringify({
              csrfToken: "bootstrap-csrf",
              expiresAt,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        if (url.endsWith("/auth/refresh")) {
          signalRefreshStarted();
          return delayedRefresh;
        }

        if (url.endsWith("/auth/logout")) {
          cookieEvents.push("logout-cleared-cookie");
          return new Response(null, {
            status: 204,
          });
        }

        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const { refreshAccessToken } = await import(
      "../../../client/src/auth/services/refresh.api"
    );
    const { logout } = await import(
      "../../../client/src/auth/auth.api"
    );

    const refresh = refreshAccessToken();
    await refreshStarted;
    const logoutRequest = logout();

    expect(cookieEvents).toEqual([]);

    cookieEvents.push("refresh-installed-cookie");
    releaseRefresh(
      new Response(
        JSON.stringify({
          accessToken: "cloudsight-access-token",
          csrfToken: "rotated-csrf",
          csrfExpiresAt: expiresAt,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(refresh).resolves.toBe(
      "cloudsight-access-token",
    );
    await expect(logoutRequest).resolves.toBeUndefined();
    expect(cookieEvents).toEqual([
      "refresh-installed-cookie",
      "logout-cleared-cookie",
    ]);
  });
});
