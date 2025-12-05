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

    // Validasi Bahasa Inggris
    if (Object.values(formData).some((val) => val.trim() === "")) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email address format.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSuccess(true);
  };

  // --- SUCCESS VIEW (English) ---
  if (isSuccess) {
    return (
      <CuteSection className='relative min-h-screen w-full bg-white dark:bg-neutral-950 transition-colors duration-300'>
        {/* FIXED BACKGROUND LAYER */}
        <div className='fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0'>
          <div className='absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accentblue/30 rounded-full blur-[100px]' />
          <div className='absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accentpink/30 rounded-full blur-[100px]' />
        </div>

        {/* SCROLLABLE CONTENT LAYER */}
        <div className='relative z-10 min-h-screen flex items-center justify-center p-4'>
          <CuteCard className='w-full max-w-md p-8 text-center' gradientBorder>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-accentblue/10 dark:bg-accentblue/20 text-4xl'>
                📩
              </div>
            </div>
            <h2 className='mb-2 text-2xl font-bold text-gray-800 dark:text-white font-yuruka'>
              Check Your Email
            </h2>
            <p className='mb-6 text-gray-600 dark:text-neutral-300'>
              We've sent a verification link to <br />
              <span className='font-bold text-accentblue dark:text-blue-400'>
                {formData.email}
              </span>
            </p>
            <div className='border-t border-gray-100 dark:border-neutral-800 pt-6'>
              <p className='text-sm text-gray-500 dark:text-neutral-500 mb-2'>
                Didn't receive the email?
              </p>
              <CuteButton
                onClick={() => alert("Verification email resent!")}
                variant='ghost'
                size='sm'
                className='text-accentblue dark:text-blue-400 hover:text-accentblue/80'
              >
                Resend Verification
              </CuteButton>
            </div>
            <div className='mt-4'>
              <Link
                to='/login'
                className='text-sm text-gray-400 hover:text-gray-300'
              >
                &larr; Back to Login
              </Link>
            </div>
          </CuteCard>
        </div>
      </CuteSection>
    );
  }

  // --- REGISTER FORM (English with Placeholders) ---
  return (
    <CuteSection className='relative min-h-screen w-full bg-white dark:bg-neutral-950 transition-colors duration-300'>
      {/* FIXED BACKGROUND LAYER */}
      <div className='fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0'>
        <div className='absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accentblue/30 rounded-full blur-[100px]' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accentpink/30 rounded-full blur-[100px]' />
      </div>

      {/* SCROLLABLE CONTENT LAYER */}
      <div className='relative z-10 min-h-screen flex items-center justify-center p-4 py-10'>
        <CuteCard className='w-full max-w-md p-8 z-10'>
          <div className='mb-6 text-center'>
            <h2 className='text-2xl font-bold text-gray-800 dark:text-white font-yuruka'>
              Create Account
            </h2>
            <p className='text-gray-500 dark:text-neutral-400 text-sm'>
              Join us today and get started
            </p>
          </div>

          {error && (
            <div className='mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm text-red-500 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <CuteInput
              label='Full Name'
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              placeholder='Enter your full name'
            />

            <CuteInput
              label='Username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              placeholder='Enter your username'
            />

            <CuteInput
              label='Email'
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter your email'
            />

            <CuteInput
              label='Password'
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Create a password'
            />

            <CuteInput
              label='Confirm Password'
              type='password'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='Confirm your password'
            />

            <div className='pt-4'>
              <CuteButton type='submit' fullWidth>
                Register
              </CuteButton>
            </div>
          </form>

          <p className='mt-4 text-center text-sm text-gray-500 dark:text-neutral-500'>
            Already have an account?{" "}
            <Link
              to='/login'
              className='font-bold text-accentblue hover:underline dark:text-blue-400'
            >
              Sign in here
            </Link>
          </p>
        </CuteCard>
      </div>
    </CuteSection>
  );
};

export default Register;
