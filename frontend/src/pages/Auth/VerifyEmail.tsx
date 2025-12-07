import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CuteCard from "../../components/ui/CuteCard";
import CuteSection from "../../components/ui/CuteSection";
import CuteButton from "../../components/ui/CuteButton";
import CuteInput from "../../components/ui/CuteInput";
import { CheckCircle, XCircle, Mail } from "lucide-react";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setStatus("loading");
      try {
        const { apiRequest } = await import("../../lib/apiClient");
        type VerifyEmailResponse = { message?: string };
        const res: VerifyEmailResponse = await apiRequest(
          `/auth/verif-email?token=${encodeURIComponent(token)}`,
          { method: "GET" }
        );
        setMessage(res?.message || "Your email has been verified.");
        setStatus("success");
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : String(err);
        setMessage(text || "Verification failed");
        setStatus("error");
      }
    })();
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail)
      return setMessage("Please enter your email to resend verification.");
    setResendLoading(true);
    try {
      const { resendVerification } = await import("../../services/authService");
      const res: { message?: string } = await resendVerification(resendEmail);
      setMessage(
        res?.message || "Verification email sent. Please check your inbox."
      );
      setStatus("success");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
      setStatus("error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <CuteSection className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
      <CuteCard className="w-full max-w-md p-8 text-center">
        <div className="mb-4">
          {status === "success" ? (
            <CheckCircle size={48} className="mx-auto text-green-500" />
          ) : status === "error" ? (
            <XCircle size={48} className="mx-auto text-red-500" />
          ) : (
            <Mail size={48} className="mx-auto text-accentblue" />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">Email Verification</h2>
        <p className="text-sm text-neutral-600 mb-4">
          {message || "Verifying your email..."}
        </p>

        {status === "success" && (
          <div className="flex gap-2">
            <CuteButton fullWidth onClick={() => navigate("/login")}>
              Go to Login
            </CuteButton>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4">
            <p className="text-sm text-neutral-500 mb-3">
              Didn't receive a verification email? Resend it here:
            </p>
            <div className="flex gap-2">
              <CuteInput
                placeholder="your@email.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
              <CuteButton onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? "Sending..." : "Resend"}
              </CuteButton>
            </div>
            <div className="mt-4">
              <CuteButton variant="ghost" onClick={() => navigate("/login")}>
                Back to Login
              </CuteButton>
            </div>
          </div>
        )}
      </CuteCard>
    </CuteSection>
  );
};

export default VerifyEmail;
