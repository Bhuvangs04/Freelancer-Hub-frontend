import React from "react";

interface CountryFlagIconProps {
  countryCode: string;
  className?: string;
}

const CountryFlagIcon: React.FC<CountryFlagIconProps> = ({
  countryCode,
  className,
}) => {
  // Convert country name to ISO 3166-1 alpha-2 country code if needed
  const getCountryCode = (country: string): string => {
    // This is a simplified mapping, you might need a more comprehensive one
    const countryMap: Record<string, string> = {
      "United States": "us",
      "United Kingdom": "gb",
      India: "in",
      Canada: "ca",
      Australia: "au",
      Germany: "de",
      France: "fr",
      China: "cn",
      Japan: "jp",
      Brazil: "br",
      // Add more mappings as needed
    };

    return countryMap[country] || country.toLowerCase().substring(0, 2);
  };

  const code = getCountryCode(countryCode);

  return (
    <img
      src={`https://flagcdn.com/24x18/${code}.png`}
      alt={`${countryCode} flag`}
      className={`inline-block ${className || "w-6 h-auto"}`}
    />
  );
};

export default CountryFlagIcon;
