import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../auth/auth.api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await forgotPassword({ email });

      setSubmitted(true);
    } catch {
      setError(
        "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="auth-form">
        <h2>Check your email</h2>

        <p>
          If an account exists for that email,
          password reset instructions have been sent.
        </p>

        <p className="auth-footer">
          <Link to="/login">
            Back to Sign In
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
      <h2>Forgot password?</h2>

      <p>
        Enter your email address and we'll send
        password reset instructions if an account
        exists.
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
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
          ? "Sending..."
          : "Send Reset Link"}
      </button>

      <p className="auth-footer">
        <Link to="/login">
          Back to Sign In
        </Link>
      </p>
    </form>
  );
}
