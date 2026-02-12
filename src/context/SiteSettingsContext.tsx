import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface SiteSettings {
  platformCommissionPercent: number;
  siteName: string;
  logoUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minimumProjectBudget: number;
  maximumProjectBudget: number;
}

const defaults: SiteSettings = {
  platformCommissionPercent: 10,
  siteName: "FreelancerHub",
  logoUrl: "",
  supportEmail: "support@freelancerhub.com",
  maintenanceMode: false,
  maintenanceMessage: "",
  minimumProjectBudget: 500,
  maximumProjectBudget: 50000,
};

const SiteSettingsContext = createContext<SiteSettings>(defaults);

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    axios
      .get(`${API_URL}/settings/public`)
      .then(({ data }) => setSettings({ ...defaults, ...data }))
      .catch(() => {
        /* keep defaults on failure */
      });
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
