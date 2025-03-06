import { motion } from "framer-motion";
import { AlertTriangle, Lock, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Forbidden = () => {
  const Navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-background to-secondary/50 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-warning/5 rounded-full blur-3xl -z-10" />
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-warning/5 rounded-full blur-3xl -z-10" />
      </div>

      {/* Main content container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Warning symbol */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-warning/20 rounded-full blur-xl animate-pulse-slow" />
            <div className="relative w-24 h-24 flex items-center justify-center bg-background rounded-full border border-warning shadow-lg">
              <AlertTriangle className="w-12 h-12 text-warning animate-rotate-warning" />
            </div>
          </div>
        </motion.div>

        {/* Glass card containing main message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Red warning strip at top */}
          <div className="bg-gradient-to-r from-warning to-warning-dark h-2" />

          <div className="p-8">
            {/* Badge */}
            <div className="inline-block bg-warning/10 text-warning font-medium rounded-full px-3 py-1 text-sm mb-4 border border-warning/20">
              403 Forbidden
            </div>

            {/* Main heading */}
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Access Denied
            </h1>

            {/* Description */}
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this resource. Please contact
              the administrator if you believe this is an error.
            </p>

            <Separator className="my-6 bg-border/50" />

            {/* Security information */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-background/80 rounded-full p-2">
                <Lock className="w-4 h-4 text-warning" />
              </div>
              <div className="text-sm text-muted-foreground">
                This area is protected for authorized personnel only
              </div>
            </div>

            {/* Return button */}
            <Button
              variant="outline"
              className="w-full group relative overflow-hidden border-gradient"
              onClick={() => {
                Navigate(-1);
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Return to Safety
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Footer message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 text-sm text-center text-muted-foreground flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" /> Secured by FreelancerHub.com
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Forbidden;
