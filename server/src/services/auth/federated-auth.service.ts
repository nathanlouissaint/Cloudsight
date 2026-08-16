import { z } from "zod";
import { Prisma } from "@prisma/client";

import {
  authIdentityRepository,
} from "../../repositories/auth/auth-identity.repository";
import {
  userRepository,
} from "../../repositories/auth/user.repository";
import type {
  FederatedIdentityResolution,
  FederatedAccountPolicyResult,
  NormalizedFederatedIdentity,
} from "../../types/auth/federated.types";
import {
  federatedAccountRepository,
} from "../../repositories/auth/federated-account.repository";
import {
  AuthDomainError,
} from "../../errors/auth.errors";
import type {
  CreatedFederatedAccount,
  SupportedAccountProviderKind,
} from "../../repositories/auth/federated-account.repository";

const SUPPORTED_ACCOUNT_PROVIDERS = new Set<
  SupportedAccountProviderKind
>(["GOOGLE", "MICROSOFT", "GITHUB"]);

function isSupportedAccountProvider(
  providerKind: NormalizedFederatedIdentity["providerKind"],
): providerKind is SupportedAccountProviderKind {
  return SUPPORTED_ACCOUNT_PROVIDERS.has(
    providerKind as SupportedAccountProviderKind,
  );
}

export class FederatedAuthService {
  async createFederatedAccount(
    identity: NormalizedFederatedIdentity,
  ): Promise<CreatedFederatedAccount> {
    if (!isSupportedAccountProvider(identity.providerKind)) {
      throw new AuthDomainError(
        "FEDERATED_PROVIDER_UNAVAILABLE",
        "Federated provider account creation is unavailable.",
      );
    }

    if (
      typeof identity.email !== "string" ||
      identity.emailVerified !== true
    ) {
      throw new Error(
        "Federated account creation requires a verified email.",
      );
    }

    const email = identity.email
      .trim()
      .toLowerCase();

    if (!z.email().safeParse(email).success) {
      throw new Error(
        "Federated account email is invalid.",
      );
    }

    try {
      return await federatedAccountRepository.createUserWithIdentity({
        email,
        providerKind: identity.providerKind,
        issuer: identity.issuer,
        providerSubject: identity.subject,
        providerEmail: email,
        providerEmailVerified: true,
      });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AuthDomainError(
          "FEDERATED_ACCOUNT_CONFLICT",
          "Federated account linking is required.",
        );
      }

      throw error;
    }
  }

  /**
   * Apply ownership policy after provider identity verification. Email is
   * consulted only for collision classification, never for authentication.
   */
  async classifyIdentity(
    identity: NormalizedFederatedIdentity,
  ): Promise<FederatedAccountPolicyResult> {
    const authIdentity =
      await authIdentityRepository.findByIssuerAndSubject(
        identity.issuer,
        identity.subject,
      );

    if (authIdentity) {
      const user =
        await userRepository.findById(
          authIdentity.userId,
        );

      return user
        ? {
            kind: "EXISTING_IDENTITY",
            identityId: authIdentity.id,
            userId: user.id,
          }
        : { kind: "ACCOUNT_UNAVAILABLE" };
    }

    if (
      typeof identity.email !== "string" ||
      identity.emailVerified !== true
    ) {
      return { kind: "EMAIL_UNUSABLE" };
    }

    const normalizedEmail =
      identity.email.trim().toLowerCase();

    if (!z.email().safeParse(normalizedEmail).success) {
      return { kind: "EMAIL_UNUSABLE" };
    }

    const matchedUser =
      await userRepository.findIdByNormalizedEmail(
        normalizedEmail,
      );

    return matchedUser
      ? {
          kind: "EMAIL_COLLISION",
          matchedUserId: matchedUser.id,
        }
      : { kind: "NEW_FEDERATED_ACCOUNT" };
  }

  /**
   * Resolve only an identity that is already owned by CloudSight.
   *
   * Email is deliberately not consulted when the immutable provider identity
   * is absent. New-user and linking policy belong to a later milestone.
   */
  async resolveExistingIdentity(
    identity: Pick<
      NormalizedFederatedIdentity,
      "issuer" | "subject"
    >,
  ): Promise<FederatedIdentityResolution> {
    const authIdentity =
      await authIdentityRepository.findByIssuerAndSubject(
        identity.issuer,
        identity.subject,
      );

    if (!authIdentity) {
      return {
        kind: "UNRESOLVED_IDENTITY",
        issuer: identity.issuer,
        subject: identity.subject,
      };
    }

    const user =
      await userRepository.findById(
        authIdentity.userId,
      );

    if (!user) {
      return {
        kind: "UNRESOLVED_IDENTITY",
        issuer: identity.issuer,
        subject: identity.subject,
      };
    }

    return {
      kind: "EXISTING_IDENTITY",
      identityId: authIdentity.id,
      user,
    };
  }
}

export const federatedAuthService =
  new FederatedAuthService();
