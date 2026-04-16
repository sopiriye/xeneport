import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowLeft, Mail } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authApi } from "@/lib/api";
import {
  clearPendingVerificationEmail,
  getPendingVerificationEmail,
} from "@/lib/storage";
import { toast } from "sonner";

const OTP_DURATION = 120;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(OTP_DURATION);
  const [resending, setResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = getPendingVerificationEmail();

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => setTimer((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Signup email not found. Start the signup flow again.");
      return;
    }

    setResending(true);

    try {
      const response = await authApi.resendOtp({ email });
      toast.success(response.message);

      if (response.otpPreview) {
        toast.info(`Development OTP: ${response.otpPreview}`);
      }

      setTimer(OTP_DURATION);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!email) {
      toast.error("Signup email not found. Start the signup flow again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.verifyOtp({ email, otp });
      clearPendingVerificationEmail();
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Xeneport</span>
          </Link>

          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-accent-foreground" />
          </div>

          <h1 className="text-xl font-display font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a verification code to your email address.
            <br />
            Please enter it below.
            {email ? (
              <>
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-center mb-6">
          {timer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Code expires in <span className="font-semibold text-foreground">{formatTime(timer)}</span>
            </p>
          ) : (
            <p className="text-sm text-destructive font-medium">Code expired</p>
          )}
        </div>

        <Button className="w-full" disabled={otp.length < 6 || isSubmitting} onClick={handleVerify}>
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={resending || timer > 0}
            className="text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
        </div>

        <p className="text-center mt-6">
          <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
