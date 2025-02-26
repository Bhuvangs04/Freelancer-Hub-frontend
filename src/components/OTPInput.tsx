import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export const OTPInput = ({ length = 6, onComplete }: OTPInputProps) => {
  const [otp, setOTP] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (isNaN(Number(value))) return;

    const newOTP = [...otp];
    // Allow only last entered digit
    newOTP[index] = value.substring(value.length - 1);
    setOTP(newOTP);

    const otpString = newOTP.join("");
    if (otpString.length === length) {
      onComplete(otpString);
    }

    // Move to next input if available
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    const newOTP = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (isNaN(Number(pastedData[i]))) continue;
      newOTP[i] = pastedData[i];
    }

    setOTP(newOTP);
    if (newOTP.join("").length === length) {
      onComplete(newOTP.join(""));
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg"
          maxLength={1}
        />
      ))}
    </div>
  );
};
