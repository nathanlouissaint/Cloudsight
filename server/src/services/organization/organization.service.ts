import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";

import {
  organizationRepository,
} from "../../repositories/organization.repository";


const MAX_ORGANIZATION_NAME_LENGTH = 120;
const MAX_SLUG_ATTEMPTS = 5;


export class OrganizationError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "OrganizationError";
  }
}


function normalizeOrganizationName(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new OrganizationError(
      400,
      "Organization name is required",
    );
  }

  const name = value.trim();

  if (!name) {
    throw new OrganizationError(
      400,
      "Organization name is required",
    );
  }

  if (
    name.length >
    MAX_ORGANIZATION_NAME_LENGTH
  ) {
    throw new OrganizationError(
      400,
      "Organization name must be 120 characters or fewer",
    );
  }

  return name;
}


function slugifyOrganizationName(
  name: string,
): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return base || "organization";
}


function createSlug(
  name: string,
): string {
  const base =
    slugifyOrganizationName(name);

  const suffix =
    randomBytes(4).toString("hex");

  return `${base}-${suffix}`;
}


function isUniqueConstraintError(
  error: unknown,
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}


export async function createOrganization(
  userId: string,
  rawName: unknown,
) {
  const name =
    normalizeOrganizationName(rawName);

  for (
    let attempt = 0;
    attempt < MAX_SLUG_ATTEMPTS;
    attempt += 1
  ) {
    const slug =
      createSlug(name);

    try {
      return await organizationRepository
        .createOrganizationWithOwner(
          userId,
          name,
          slug,
        );
    } catch (error) {
      if (
        isUniqueConstraintError(error) &&
        attempt <
          MAX_SLUG_ATTEMPTS - 1
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new OrganizationError(
    500,
    "Failed to create organization",
  );
}