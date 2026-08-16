import { prisma } from "../../config/prisma";

class UserRepository {
  /**
   * Return a user's public profile.
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        authProvider: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Return a user by email.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * Collision classification lookup only. This is not an authentication
   * lookup and intentionally returns no credential or profile fields.
   */
  async findIdByNormalizedEmail(
    normalizedEmail: string,
  ): Promise<{ id: string } | null> {
    return prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
  }

  /**
   * Return the authentication fields required for
   * authenticated account operations.
   */
  async findAuthUserById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        emailVerifiedAt: true,
      },
    });
  }

  /**
   * Create a new user.
   */
  async create(data: {
    email: string;
    passwordHash: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Update a user's password hash.
   */
  async updatePassword(
    userId: string,
    passwordHash: string,
  ) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash,
      },
    });
  }

  /**
   * Mark a user's email address as verified.
   */
  async markEmailVerified(
    userId: string,
  ) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });
  }
}

export const userRepository =
  new UserRepository();
