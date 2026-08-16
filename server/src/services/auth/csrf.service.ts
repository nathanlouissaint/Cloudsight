import crypto from "crypto";

import type {
  CsrfTokenVersion,
  IssuedCsrfToken,
  ValidatedCsrfToken,
} from "../../types/auth/csrf.types";

const CSRF_TOKEN_VERSION: CsrfTokenVersion = "v1";
const CSRF_NONCE_BYTES = 32;
const CSRF_DIGEST_BYTES = 32;
const CSRF_TOKEN_TTL_MS = 15 * 60 * 1000;
const CSRF_TOKEN_PARTS = 5;
const PREAUTH_BINDING = "preauth";
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const INTEGER_PATTERN = /^[1-9][0-9]*$/;

export const MAX_CSRF_TOKEN_LENGTH = 512;

interface ParsedCsrfToken {
  version: CsrfTokenVersion;
  encodedPayload: string;
  binding: string;
  expiresAt: number;
  signature: Buffer;
}

export class CsrfValidationError extends Error {
  constructor() {
    super("Invalid CSRF token");
    this.name = "CsrfValidationError";
  }
}

export function resolveCsrfSecret(
  env: NodeJS.ProcessEnv = process.env,
): Buffer {
  const configuredSecret =
    env.CSRF_SECRET?.trim();

  if (configuredSecret) {
    const secret = Buffer.from(
      configuredSecret,
      "utf8",
    );

    if (secret.byteLength < 32) {
      throw new Error(
        "CSRF_SECRET must contain at least 32 bytes of secret material",
      );
    }

    return secret;
  }

  if (env.NODE_ENV === "development") {
    return crypto.randomBytes(32);
  }

  throw new Error(
    "CSRF_SECRET must be configured outside development",
  );
}

export class CsrfService {
  private readonly secret = resolveCsrfSecret();

  issuePreAuthToken(): IssuedCsrfToken {
    return this.issueToken(
      PREAUTH_BINDING,
    );
  }

  issueRefreshBoundToken(
    refreshToken: string,
  ): IssuedCsrfToken {
    if (!refreshToken) {
      throw new Error(
        "A refresh token is required to issue a bound CSRF token",
      );
    }

    return this.issueToken(
      this.createRefreshBinding(
        refreshToken,
      ),
    );
  }

  validatePreAuthToken(
    token: unknown,
  ): ValidatedCsrfToken {
    return this.validateToken(
      token,
      PREAUTH_BINDING,
    );
  }

  validateRefreshBoundToken(
    token: unknown,
    refreshToken: string,
  ): ValidatedCsrfToken {
    if (!refreshToken) {
      throw new CsrfValidationError();
    }

    return this.validateToken(
      token,
      this.createRefreshBinding(
        refreshToken,
      ),
    );
  }

  private issueToken(
    binding: string,
  ): IssuedCsrfToken {
    const nonce = crypto
      .randomBytes(CSRF_NONCE_BYTES)
      .toString("base64url");
    const expiresAt = new Date(
      Date.now() + CSRF_TOKEN_TTL_MS,
    );
    const encodedPayload = [
      CSRF_TOKEN_VERSION,
      nonce,
      expiresAt.getTime().toString(),
      binding,
    ].join(".");
    const signature = this.createHmac(
      `csrf-token:${encodedPayload}`,
    ).toString("base64url");

    return {
      token: `${encodedPayload}.${signature}`,
      expiresAt,
    };
  }

  private validateToken(
    token: unknown,
    expectedBinding: string,
  ): ValidatedCsrfToken {
    const parsed = this.parseToken(
      token,
    );
    const expectedSignature =
      this.createHmac(
        `csrf-token:${parsed.encodedPayload}`,
      );

    if (
      !crypto.timingSafeEqual(
        parsed.signature,
        expectedSignature,
      )
    ) {
      throw new CsrfValidationError();
    }

    if (parsed.expiresAt <= Date.now()) {
      throw new CsrfValidationError();
    }

    const actualBinding = Buffer.from(
      parsed.binding,
      "utf8",
    );
    const expectedBindingBuffer = Buffer.from(
      expectedBinding,
      "utf8",
    );

    if (
      actualBinding.byteLength !==
        expectedBindingBuffer.byteLength ||
      !crypto.timingSafeEqual(
        actualBinding,
        expectedBindingBuffer,
      )
    ) {
      throw new CsrfValidationError();
    }

    return {
      version: parsed.version,
      expiresAt: new Date(
        parsed.expiresAt,
      ),
    };
  }

  private parseToken(
    token: unknown,
  ): ParsedCsrfToken {
    if (
      typeof token !== "string" ||
      token.length === 0 ||
      token.length > MAX_CSRF_TOKEN_LENGTH
    ) {
      throw new CsrfValidationError();
    }

    const parts = token.split(".");

    if (parts.length !== CSRF_TOKEN_PARTS) {
      throw new CsrfValidationError();
    }

    const [
      version,
      nonce,
      encodedExpiration,
      binding,
      encodedSignature,
    ] = parts;

    if (
      version !== CSRF_TOKEN_VERSION ||
      !this.isEncodedBytes(
        nonce,
        CSRF_NONCE_BYTES,
      ) ||
      !INTEGER_PATTERN.test(
        encodedExpiration,
      ) ||
      !this.isValidBinding(binding) ||
      !this.isEncodedBytes(
        encodedSignature,
        CSRF_DIGEST_BYTES,
      )
    ) {
      throw new CsrfValidationError();
    }

    const expiresAt = Number(
      encodedExpiration,
    );

    if (
      !Number.isSafeInteger(expiresAt) ||
      Number.isNaN(
        new Date(expiresAt).getTime(),
      )
    ) {
      throw new CsrfValidationError();
    }

    return {
      version,
      encodedPayload: parts
        .slice(0, CSRF_TOKEN_PARTS - 1)
        .join("."),
      binding,
      expiresAt,
      signature: Buffer.from(
        encodedSignature,
        "base64url",
      ),
    };
  }

  private isValidBinding(
    binding: string,
  ): boolean {
    return (
      binding === PREAUTH_BINDING ||
      this.isEncodedBytes(
        binding,
        CSRF_DIGEST_BYTES,
      )
    );
  }

  private isEncodedBytes(
    value: string,
    expectedBytes: number,
  ): boolean {
    if (!BASE64URL_PATTERN.test(value)) {
      return false;
    }

    const decoded = Buffer.from(
      value,
      "base64url",
    );

    return (
      decoded.byteLength === expectedBytes &&
      decoded.toString("base64url") === value
    );
  }

  private createRefreshBinding(
    refreshToken: string,
  ): string {
    return this.createHmac(
      `refresh-binding:${refreshToken}`,
    ).toString("base64url");
  }

  private createHmac(
    value: string,
  ): Buffer {
    return crypto
      .createHmac("sha256", this.secret)
      .update(value, "utf8")
      .digest();
  }
}

export const csrfService =
  new CsrfService();
