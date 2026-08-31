import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  login as loginRequest,
  startGoogleLogin,
  startGitHubLogin,
  startMicrosoftLogin,
} from "../../auth/auth.api";
import { useAuth } from "../../auth/useAuth";
import {
  buildAuthPath,
  getSafeReturnTo,
} from "../../auth/utils/returnTo";

const microsoftAuthEnabled =
  import.meta.env.VITE_MICROSOFT_AUTH_ENABLED === "true";
const githubAuthEnabled =
  import.meta.env.VITE_GITHUB_AUTH_ENABLED === "true";

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();
  const { login } = useAuth();

  const returnTo =
    getSafeReturnTo(
      searchParams.get("returnTo"),
    );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const oauthError =
    searchParams.get("authError");
  const oauthMessage =
    oauthError === "account_link_required"
      ? "An account already exists for this email. Sign in using your existing method before connecting another provider."
      : oauthError === "email_required"
        ? "The provider did not provide a verified email that CloudSight can use."
        : oauthError === "cancelled"
          ? "Federated sign-in was cancelled."
          : oauthError === "oauth_failed"
            ? "Federated sign-in could not be completed."
            : "";

  const [showPassword, setShowPassword] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginRequest({
        email,
        password,
      });

      login(
        response.token,
        response.user
      );

      navigate(returnTo, {
        replace: true,
      });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        required
      />

      <div className="password-field">
        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() =>
            setShowPassword(
              (value) => !value
            )
          }
        >
          {showPassword
            ? "Hide"
            : "Show"}
        </button>
      </div>

      <p className="auth-footer">
        <Link to="/forgot-password">
          Forgot password?
        </Link>
      </p>

      {error && (
        <p className="auth-error">
          {error}
        </p>
      )}

      {oauthMessage && (
        <p className="auth-error" role="alert">
          {oauthMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Signing In..."
          : "Sign In"}
      </button>

      <div className="auth-divider" aria-hidden="true">
        or
      </div>

      <button
        type="button"
        className="google-login-button"
        disabled={loading}
        onClick={() => {
          startGoogleLogin(returnTo);
        }}
      >
        <svg
          className="google-login-icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path
            fill="#4285F4"
            d="M21.35 12.27c0-.74-.07-1.45-.21-2.13H12v4.03h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.29Z"
          />
          <path
            fill="#34A853"
            d="M12 21.6c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z"
          />
          <path
            fill="#FBBC05"
            d="M6.54 13.69A5.85 5.85 0 0 1 6.23 12c0-.59.11-1.17.31-1.69V7.78H3.3A9.6 9.6 0 0 0 2.4 12c0 1.52.36 2.96.9 4.22l3.24-2.53Z"
          />
          <path
            fill="#EA4335"
            d="M12 6.28c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8 9.46 6.28 12 6.28Z"
          />
        </svg>
        Continue with Google
      </button>

      {microsoftAuthEnabled && (
        <button
          type="button"
          className="google-login-button microsoft-login-button"
          disabled={loading}
          onClick={() => {
            startMicrosoftLogin(returnTo);
          }}
        >
          <svg
            className="provider-login-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path fill="#f25022" d="M2 2h9.5v9.5H2z" />
            <path fill="#7fba00" d="M12.5 2H22v9.5h-9.5z" />
            <path fill="#00a4ef" d="M2 12.5h9.5V22H2z" />
            <path fill="#ffb900" d="M12.5 12.5H22V22h-9.5z" />
          </svg>
          Continue with Microsoft
        </button>
      )}

      {githubAuthEnabled && (
        <button
          type="button"
          className="google-login-button github-login-button"
          disabled={loading}
          onClick={() => {
            startGitHubLogin(returnTo);
          }}
        >
          <svg
            className="provider-login-icon github-login-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.49.09.67-.21.67-.47v-1.67c-2.73.59-3.3-1.16-3.3-1.16-.45-1.15-1.1-1.46-1.1-1.46-.89-.61.07-.6.07-.6.98.07 1.5 1 1.5 1 .88 1.5 2.31 1.07 2.87.82.09-.64.34-1.07.62-1.32-2.18-.25-4.47-1.09-4.47-4.86 0-1.07.38-1.94 1-2.62-.1-.25-.43-1.24.1-2.58 0 0 .82-.26 2.69 1a9.35 9.35 0 0 1 4.9 0c1.87-1.26 2.69-1 2.69-1 .53 1.34.2 2.33.1 2.58.62.68 1 1.55 1 2.62 0 3.78-2.3 4.61-4.48 4.86.35.3.66.88.66 1.77v2.61c0 .26.18.56.68.46A9.8 9.8 0 0 0 12 2.2Z"
            />
          </svg>
          Continue with GitHub
        </button>
      )}

      <p className="auth-footer">
        Don't have an account?{" "}
        <Link
          to={buildAuthPath(
            "/register",
            returnTo,
          )}
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
