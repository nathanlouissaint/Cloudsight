import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login as loginRequest } from "../../auth/auth.api";
import { useAuth } from "../../auth/useAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      login(response.token, response.user);

      navigate("/");
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
          ? "Signing In..."
          : "Sign In"}
      </button>

      <p className="auth-footer">
        Don't have an account?{" "}
        <Link to="/register">
          Create one
        </Link>
      </p>
    </form>
  );
}