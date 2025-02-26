import { Check, X } from "lucide-react";

interface Requirement {
  text: string;
  validator: (password: string) => boolean;
}

interface Props {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: Props) => {
  const requirements: Requirement[] = [
    {
      text: "At least 8 characters",
      validator: (pass) => pass.length >= 8,
    },
    {
      text: "Contains uppercase letter",
      validator: (pass) => /[A-Z]/.test(pass),
    },
    {
      text: "Contains lowercase letter",
      validator: (pass) => /[a-z]/.test(pass),
    },
    {
      text: "Contains number",
      validator: (pass) => /[0-9]/.test(pass),
    },
    {
      text: "Contains special character",
      validator: (pass) => /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
  ];

  return (
    <div className="space-y-2 text-sm">
      {requirements.map((requirement, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 text-muted-foreground"
        >
          {requirement.validator(password) ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span>{requirement.text}</span>
        </div>
      ))}
    </div>
  );
};
