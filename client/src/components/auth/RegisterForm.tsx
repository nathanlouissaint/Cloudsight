import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    console.log({
      name,
      email,
      password,
      confirmPassword,
    });
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(
            e.target.value
          )
        }
      />

      <button type="submit">
        Create Account
      </button>

      <p className="auth-footer">
      Already have an account?{" "}
     <Link to="/login">
      Sign In
     </Link>
      </p>
    </form>
  );
}