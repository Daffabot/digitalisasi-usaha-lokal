import React, { useState } from "react";
import { Link } from "react-router-dom";
import CuteCard from "../../components/ui/CuteCard";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import CuteInput from "../../components/ui/CuteInput";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Kolom Kosong
    if (Object.values(formData).some((val) => val.trim() === "")) {
      setError("Mohon lengkapi semua kolom pendaftaran.");
      return;
    }

    // 2. Validasi Format Email (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format email tidak valid! (contoh: user@mail.com)");
      return;
    }

    // 3. Validasi Panjang Password
    if (formData.password.length < 6) {
      setError("Password minimal harus 6 karakter!");
      return;
    }

    // 4. Validasi Kesamaan Password
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    // Jika Lolos Semua Validasi
    setIsSuccess(true);
  };

  // --- TAMPILAN SUKSES (VERIFIKASI EMAIL) ---
  if (isSuccess) {
    return (
      <CuteSection className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-neutral-950 p-4 transition-colors duration-300">
        <CuteCard className="w-full max-w-md p-8 text-center" gradientBorder>
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accentblue/10 dark:bg-accentblue/20 text-4xl">📩</div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white font-yuruka">Cek Email Anda</h2>
          <p className="mb-6 text-gray-600 dark:text-neutral-300">
            Link verifikasi telah dikirim ke <br />
            <span className="font-bold text-accentblue dark:text-blue-400">{formData.email}</span>
          </p>
          <div className="border-t border-gray-100 dark:border-neutral-800 pt-6">
            <p className="text-sm text-gray-500 dark:text-neutral-500 mb-2">Not receive verification email?</p>
            <CuteButton onClick={() => alert("Email verifikasi dikirim ulang!")} variant="ghost" size="sm" className="text-accentblue dark:text-blue-400 hover:text-accentblue/80">
              Resend Email Verification
            </CuteButton>
          </div>
          <div className="mt-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-300">
              &larr; Kembali ke Login
            </Link>
          </div>
        </CuteCard>
      </CuteSection>
    );
  }

  // --- TAMPILAN FORM REGISTER ---
  return (
    <CuteSection className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-neutral-950 p-4 transition-colors duration-300">
      <CuteCard className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-yuruka">Buat Akun Baru</h2>
          <p className="text-gray-500 dark:text-neutral-400 text-sm">Bergabunglah dengan kami</p>
        </div>

        {error && <div className="mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm text-red-500 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CuteInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <CuteInput label="Username" name="username" value={formData.username} onChange={handleChange} />
            <CuteInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>

          <CuteInput label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />

          <CuteInput label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />

          <div className="pt-4">
            <CuteButton type="submit" fullWidth>
              Register
            </CuteButton>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-neutral-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-accentblue hover:underline dark:text-blue-400">
            Login disini
          </Link>
        </p>
      </CuteCard>
    </CuteSection>
  );
};

export default Register;
