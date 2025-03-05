import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  disabled = false,
  className,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // Only accept numbers
    if (!/^\d*$/.test(value)) return;

    // Update the current input
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const updatedOtp = newOtp.join("");
    if (updatedOtp.length === length) {
      onComplete(updatedOtp);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Only proceed if pasted content is all digits and within length
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = Array(length).fill("");

    // Fill the OTP array with pasted digits
    for (let i = 0; i < Math.min(length, pastedData.length); i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus on the appropriate input after paste
    const focusIndex = Math.min(length - 1, pastedData.length);
    inputRefs.current[focusIndex]?.focus();

    // Check if OTP is complete
    const updatedOtp = newOtp.join("");
    if (updatedOtp.length === length) {
      onComplete(updatedOtp);
    }
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {Array(length)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className="relative animate-slide-up"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={disabled}
              className={cn(
                "w-10 h-12 text-center font-medium text-lg rounded-md border-2 focus:ring-2 focus:ring-offset-0 focus:outline-none transition-all",
                "hover:border-primary/50 focus:border-primary focus:ring-primary/20",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-text",
                otp[index]
                  ? "border-primary/70 bg-primary/5"
                  : "border-border bg-background"
              )}
            />
          </div>
        ))}
    </div>
  );
};
