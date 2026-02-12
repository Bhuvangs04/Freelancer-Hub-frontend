import { useSiteSettings } from "@/context/SiteSettingsContext";
import { AlertTriangle, Wrench } from "lucide-react";

const MaintenancePage = () => {
  const { siteName, maintenanceMessage } = useSiteSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/30">
            <Wrench className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Under Maintenance
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            {maintenanceMessage ||
              `${siteName} is currently undergoing scheduled maintenance. We'll be back shortly.`}
          </p>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          Please check back later
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
