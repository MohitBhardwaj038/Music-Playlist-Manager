import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setError("Email and password are required");
          setLoading(false);
          return;
        }

        const response = await login(formData.email, formData.password);
        if (response.success) {
          navigate("/", { replace: true });
        } else {
          setError(response.message || "Login failed");
        }
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          setError("All fields are required");
          setLoading(false);
          return;
        }

        if (!formData.acceptTerms) {
          setError("You must accept the terms and conditions");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const response = await register(formData.name, formData.email, formData.password);
        if (response.success) {
          navigate("/", { replace: true });
        } else {
          setError(response.message || "Registration failed");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ name: "", email: "", password: "", acceptTerms: false });
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      <div className="login-card">
        <div className="login-logo">🎵</div>
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="login-input-group">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-input-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="login-input-group">
            <input
              type="password"
              name="password"
              placeholder={isLogin ? "Password" : "Create password (min 6 chars)"}
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {!isLogin && (
            <div className="login-terms">
              <input
                type="checkbox"
                id="terms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <label htmlFor="terms">I accept the terms & conditions</label>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="login-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleMode}>
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;