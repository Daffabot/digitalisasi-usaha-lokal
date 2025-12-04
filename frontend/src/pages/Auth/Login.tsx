import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CuteCard from "../../components/ui/CuteCard";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import CuteInput from "../../components/ui/CuteInput";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDASI: Cek Kosong
    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError("Username/Email dan Password wajib diisi!");
      return;
    }

    console.log("Login:", formData);
    // Navigasi ke home
    navigate("/home");
  };

  return (
    <CuteSection className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-neutral-950 p-4 transition-colors duration-300">
      <CuteCard className="w-full max-w-md p-8" gradientBorder>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white font-yuruka">Welcome Back!</h2>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-2">Silakan masuk untuk melanjutkan</p>
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm text-red-500 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <CuteInput label="Username / Email" name="identifier" placeholder="Masukan username anda..." value={formData.identifier} onChange={handleChange} />

          <CuteInput label="Password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />

          <div className="pt-2">
            <CuteButton type="submit" fullWidth size="md">
              Masuk Sekarang
            </CuteButton>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-neutral-500">
          Belum punya akun?{" "}
          <Link to="/register" className="font-bold text-accentblue hover:underline dark:text-blue-400">
            Daftar disini
          </Link>
        </p>
      </CuteCard>
    </CuteSection>
  );
};

export default Login;
