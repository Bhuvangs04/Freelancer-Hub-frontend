import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, className }) => {
  // Define password requirements
  const requirements = useMemo(
    () => [
      {
        id: "length",
        label: "At least 8 characters",
        check: (p: string) => p.length >= 8,
      },
      {
        id: "uppercase",
        label: "Contains uppercase letter",
        check: (p: string) => /[A-Z]/.test(p),
      },
      {
        id: "lowercase",
        label: "Contains lowercase letter",
        check: (p: string) => /[a-z]/.test(p),
      },
      {
        id: "number",
        label: "Contains number",
        check: (p: string) => /[0-9]/.test(p),
      },
      {
        id: "special",
        label: "Contains special character",
        check: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
      },
    ],
    []
  );

  // Calculate strength percentage
  const strengthPercentage = useMemo(() => {
    if (!password) return 0;

    const fulfilledCount = requirements.filter((req) =>
      req.check(password)
    ).length;
    return (fulfilledCount / requirements.length) * 100;
  }, [password, requirements]);

  // Determine strength level and color
  const { strengthLabel, strengthColor } = useMemo(() => {
    if (strengthPercentage === 0)
      return { strengthLabel: "", strengthColor: "bg-muted" };
    if (strengthPercentage < 40)
      return { strengthLabel: "Weak", strengthColor: "bg-destructive" };
    if (strengthPercentage < 80)
      return { strengthLabel: "Fair", strengthColor: "bg-yellow-500" };
    if (strengthPercentage < 100)
      return { strengthLabel: "Good", strengthColor: "bg-green-500" };
    return { strengthLabel: "Strong", strengthColor: "bg-green-600" };
  }, [strengthPercentage]);

  // If no password, don't show requirements
  if (!password) return null;

  return (
    <div className={cn("space-y-2 text-sm", className)}>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              strengthColor
            )}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        {strengthLabel && (
          <span
            className={cn(
              "text-xs font-medium",
              strengthLabel === "Weak"
                ? "text-destructive"
                : strengthLabel === "Fair"
                ? "text-yellow-600"
                : "text-green-600"
            )}
          >
            {strengthLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 animate-fade-in">
        {requirements.map((req) => {
          const isFulfilled = req.check(password);
          return (
            <div key={req.id} className="flex items-center gap-1.5">
              {isFulfilled ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs",
                  isFulfilled ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
