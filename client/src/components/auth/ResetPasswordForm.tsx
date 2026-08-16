import { useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { resetPassword } from "../../auth/auth.api";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();

  const token =
    searchParams.get("token") ?? "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!token) {
      setError(
        "This password reset link is invalid."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await resetPassword({
        token,
        password,
      });

      setSuccess(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-form">
        <h2>Password reset</h2>

        <p>
          Your password has been updated.
        </p>

        <p className="auth-footer">
          <Link to="/login">
            Sign In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <h2>Reset password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(event) =>
          setPassword(event.target.value)
        }
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(event) =>
          setConfirmPassword(
            event.target.value
          )
        }
        required
      />

      {error && (
        <p className="auth-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Resetting..."
          : "Reset Password"}
      </button>

      <p className="auth-footer">
        <Link to="/login">
          Back to Sign In
        </Link>
      </p>
    </form>
  );
}
