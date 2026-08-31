import {
  getSafeReturnTo,
} from "./returnTo";

const OAUTH_RETURN_TO_KEY =
  "cloudsight.oauthReturnTo";

export function setOAuthReturnTo(
  returnTo: string,
): void {
  sessionStorage.setItem(
    OAUTH_RETURN_TO_KEY,
    getSafeReturnTo(returnTo),
  );
}

export function consumeOAuthReturnTo(): string {
  const value =
    sessionStorage.getItem(
      OAUTH_RETURN_TO_KEY,
    );

  sessionStorage.removeItem(
    OAUTH_RETURN_TO_KEY,
  );

  return getSafeReturnTo(value);
}

export function clearOAuthReturnTo(): void {
  sessionStorage.removeItem(
    OAUTH_RETURN_TO_KEY,
  );
}
