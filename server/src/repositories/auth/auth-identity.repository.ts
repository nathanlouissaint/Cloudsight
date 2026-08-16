import type { AuthIdentity } from "@prisma/client";

import { prisma } from "../../config/prisma";
import type {
  CreateAuthIdentityInput,
} from "../../types/auth/federated.types";

export class AuthIdentityRepository {
  async findByIssuerAndSubject(
    issuer: string,
    providerSubject: string,
  ): Promise<AuthIdentity | null> {
    return prisma.authIdentity.findUnique({
      where: {
        issuer_providerSubject: {
          issuer,
          providerSubject,
        },
      },
    });
  }

  async findById(
    id: string,
  ): Promise<AuthIdentity | null> {
    return prisma.authIdentity.findUnique({
      where: { id },
    });
  }

  async findByUserId(
    userId: string,
  ): Promise<AuthIdentity[]> {
    return prisma.authIdentity.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(
    input: CreateAuthIdentityInput,
  ): Promise<AuthIdentity> {
    return prisma.authIdentity.create({
      data: {
        userId: input.userId,
        providerKind: input.providerKind,
        issuer: input.issuer,
        providerSubject: input.providerSubject,
        providerEmail: input.providerEmail,
        providerEmailVerified:
          input.providerEmailVerified,
      },
    });
  }
}

export const authIdentityRepository =
  new AuthIdentityRepository();
