import type {
  AuthIdentity,
  AuthProvider,
  FederatedProviderKind,
  User,
} from "@prisma/client";

import { prisma } from "../../config/prisma";

export interface CreateFederatedAccountInput {
  email: string;
  providerKind: SupportedAccountProviderKind;
  issuer: string;
  providerSubject: string;
  providerEmail: string;
  providerEmailVerified: boolean;
}

export type SupportedAccountProviderKind =
  Extract<
    FederatedProviderKind,
    "GOOGLE" | "MICROSOFT" | "GITHUB"
  >;

export interface CreatedFederatedAccount {
  user: User;
  identity: AuthIdentity;
}

const AUTH_PROVIDER_BY_KIND = {
  GOOGLE: "GOOGLE",
  MICROSOFT: "MICROSOFT",
  GITHUB: "GITHUB",
} as const satisfies Record<
  SupportedAccountProviderKind,
  AuthProvider
>;

export class FederatedAccountRepository {
  async createUserWithIdentity(
    input: CreateFederatedAccountInput,
  ): Promise<CreatedFederatedAccount> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash: null,
          authProvider:
            AUTH_PROVIDER_BY_KIND[
              input.providerKind
            ],
          emailVerifiedAt: new Date(),
        },
      });

      const identity =
        await tx.authIdentity.create({
          data: {
            userId: user.id,
            providerKind: input.providerKind,
            issuer: input.issuer,
            providerSubject:
              input.providerSubject,
            providerEmail:
              input.providerEmail,
            providerEmailVerified:
              input.providerEmailVerified,
          },
        });

      return { user, identity };
    });
  }
}

export const federatedAccountRepository =
  new FederatedAccountRepository();
