import type {
  Request,
  Response,
} from "express";
import {
  AuditEventType,
} from "@prisma/client";

import {
  AuthDomainError,
  isAuthDomainError,
} from "../../errors/auth.errors";
import {
  mapAuthDomainError,
} from "../../errors/auth-error-mapper";
import {
  authCookieService,
} from "../../services/auth/auth-cookie.service";
import {
  oauthTransactionService,
} from "../../services/auth/oauth-transaction.service";
import {
  getFederatedProvider,
} from "../../services/auth/federated-provider.registry";
import {
  federatedAuthService,
} from "../../services/auth/federated-auth.service";
import {
  sessionIssuanceService,
} from "../../services/auth/session-issuance.service";
import {
  auditService,
} from "../../services/auth/audit.service";
import {
  csrfService,
} from "../../services/auth/csrf.service";
import {
  userRepository,
} from "../../repositories/auth/user.repository";
import {
  httpSecurityConfig,
} from "../../config/http-security.config";
import type { FederatedProviderKind } from "../../types/auth/federated.types";

const PROVIDER_ALIASES: Readonly<Record<string, FederatedProviderKind>> = {
  google: "GOOGLE",
  microsoft: "MICROSOFT",
  github: "GITHUB",
};

function resolveProvider(value: unknown): FederatedProviderKind | null {
  return typeof value === "string" ? PROVIDER_ALIASES[value.toLowerCase()] ?? null : null;
}

function callbackPath(providerKind: FederatedProviderKind): string {
  const path = providerKind === "GOOGLE"
    ? "google"
    : providerKind === "MICROSOFT"
      ? "microsoft"
      : "github";
  return `/auth/oauth/${path}/callback`;
}

function getSingleQueryValue(
  value: unknown,
): string | null {
  return typeof value === "string" &&
    value.length > 0
    ? value
    : null;
}

function genericFailure(
  res: Response,
): Response {
  return redirectToFrontend(res, "oauth_failed");
}

function redirectToFrontend(
  res: Response,
  authError?:
    | "oauth_failed"
    | "cancelled"
    | "account_link_required"
    | "email_required",
): Response {
  const target = new URL(
    authError
      ? "/login"
      : "/auth/oauth/complete",
    httpSecurityConfig.trustedFrontendOrigin,
  );

  if (authError) {
    target.searchParams.set(
      "authError",
      authError,
    );
  }

  res.set("Cache-Control", "no-store");
  res
    .status(302)
    .set("Location", target.toString())
    .end();
  return res;
}

async function issueFederatedLogin(
  req: Request,
  res: Response,
  user: Parameters<
    typeof sessionIssuanceService.issue
  >[0],
): Promise<Response> {
  const issued =
    await sessionIssuanceService.issue(
      user,
      {
        userAgent: req.get("User-Agent"),
        ipAddress: req.ip,
      },
    );

  await auditService.recordEvent({
    userId: issued.user.id,
    eventType: AuditEventType.LOGIN,
    ipAddress: issued.ipAddress,
    userAgent: issued.userAgent,
  });

  authCookieService.setRefreshToken(
    res,
    issued.refreshToken,
    issued.sessionExpiresAt,
  );

  const csrfToken =
    csrfService.issueRefreshBoundToken(
      issued.refreshToken,
    );

  authCookieService.setCsrfCookie(
    res,
    csrfToken.token,
    csrfToken.expiresAt,
  );

  return redirectToFrontend(res);
}

export function startOAuth(
  req: Request,
  res: Response,
  providerKind: FederatedProviderKind,
): Response | void {
  const provider =
    getFederatedProvider(providerKind);

  if (!provider) {
    const response = mapAuthDomainError(
      new AuthDomainError(
        "FEDERATED_OAUTH_UNAVAILABLE",
        "Federated authentication is unavailable.",
      ),
    );

    return res
      .status(response.status)
      .json({ message: response.message });
  }

  try {
    const transaction =
      oauthTransactionService.create(
        providerKind,
      );
    const authorizationUrl =
      provider.getAuthorizationUrl({
        state: transaction.state,
        codeChallenge:
          transaction.codeChallenge,
        nonce: transaction.nonce,
        redirectUri: provider.redirectUri,
      });

    authCookieService.setOAuthTransactionBinding(
      res,
      transaction.browserBindingSecret,
      transaction.expiresAt.getTime() -
        Date.now(),
      callbackPath(providerKind),
    );
    res.set("Cache-Control", "no-store");
    return res.redirect(302, authorizationUrl);
  } catch (error) {
    if (isAuthDomainError(error)) {
      const response = mapAuthDomainError(error);
      return res
        .status(response.status)
        .json({ message: response.message });
    }

    return res.status(503).json({
      message:
        "Federated authentication is temporarily unavailable.",
    });
  }
}

export function startGoogleOAuth(req: Request, res: Response): Response | void {
  return startOAuth(req, res, "GOOGLE");
}

export function genericOAuthStart(req: Request, res: Response): Response | void {
  const providerKind = resolveProvider(req.params.provider);
  if (!providerKind) return genericFailure(res);
  return startOAuth(req, res, providerKind);
}

export async function oauthCallback(
  req: Request,
  res: Response,
  providerKind: FederatedProviderKind,
): Promise<Response> {
  res.set("Cache-Control", "no-store");

  const state = getSingleQueryValue(
    req.query.state,
  );
  const code = getSingleQueryValue(
    req.query.code,
  );
  const providerError = getSingleQueryValue(
    req.query.error,
  );

  // Prevent request logging from retaining OAuth code/state query material.
  req.url = req.path;

  const binding =
    authCookieService.getOAuthTransactionBinding(
      req,
    );
  authCookieService.clearOAuthTransactionBinding(
    res,
    callbackPath(providerKind),
  );

  if (!state || !binding) {
    return genericFailure(res);
  }

  let transaction;

  try {
    transaction =
      oauthTransactionService.consume(
        state,
        providerKind,
        binding,
      );
  } catch {
    return genericFailure(res);
  }

  if (providerError) {
    return redirectToFrontend(
      res,
      "cancelled",
    );
  }

  if (!code) {
    return genericFailure(res);
  }

  const provider =
    getFederatedProvider(providerKind);

  if (!provider) {
    return genericFailure(res);
  }

  try {
    const identity =
      await provider.exchangeAuthorizationCode(
        code,
        transaction.codeVerifier,
        transaction.nonce,
      );
    const resolution =
      await federatedAuthService.classifyIdentity(
        identity,
      );

    switch (resolution.kind) {
      case "EXISTING_IDENTITY":
        {
          const user =
            await userRepository.findById(
              resolution.userId,
            );

          if (!user) {
            return genericFailure(res);
          }

          return issueFederatedLogin(
            req,
            res,
            user,
          );
        }
      case "EMAIL_COLLISION":
        return redirectToFrontend(
          res,
          "account_link_required",
        );
      case "NEW_FEDERATED_ACCOUNT":
        {
          try {
            const created =
              await federatedAuthService.createFederatedAccount(
                identity,
              );

            return issueFederatedLogin(
              req,
              res,
              created.user,
            );
          } catch (error) {
            if (
              isAuthDomainError(error) &&
              error.code ===
                "FEDERATED_ACCOUNT_CONFLICT"
            ) {
              return redirectToFrontend(
                res,
                "account_link_required",
              );
            }

            return genericFailure(res);
          }
        }
      case "EMAIL_UNUSABLE":
        return redirectToFrontend(
          res,
          "email_required",
        );
      case "ACCOUNT_UNAVAILABLE":
        return genericFailure(res);
    }
  } catch {
    return genericFailure(res);
  }
}

export async function googleOAuthCallback(req: Request, res: Response): Promise<Response> {
  return oauthCallback(req, res, "GOOGLE");
}

export async function genericOAuthCallback(req: Request, res: Response): Promise<Response> {
  const providerKind = resolveProvider(req.params.provider);
  if (!providerKind) return genericFailure(res);
  return oauthCallback(req, res, providerKind);
}
