import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import CuteCard from "../../components/ui/CuteCard";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import CuteInput from "../../components/ui/CuteInput";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError("Username/Email and Password are required!");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { login } = await import("../../services/authService");
        await login(formData.identifier, formData.password);
        navigate("/home");
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message || "Login failed");
        } else {
          setError(String(err) || "Login failed");
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <CuteSection className="relative min-h-screen w-full bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* 1. FIXED BACKGROUND LAYER */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accentblue/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accentpink/30 rounded-full blur-[100px]" />
      </div>

      {/* 2. SCROLLABLE CONTENT LAYER */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-10">
        <CuteCard className="w-full max-w-md p-8 z-10" gradientBorder>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white font-yuruka">
              Welcome Back!
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mt-2">
              Please sign in to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm text-red-500 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <CuteInput
              label="Username / Email"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your username or email"
            />

            <CuteInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <CuteButton type="submit" fullWidth size="md" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </CuteButton>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-neutral-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-accentblue hover:underline dark:text-blue-400"
            >
              Sign up here
            </Link>
          </p>
        </CuteCard>
      </div>
    </CuteSection>
  );
};

export default Login;
