import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NotFound = () => {
  const location = useLocation();
  const Navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-background to-secondary/50 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      </div>

      {/* Main content container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* 404 symbol */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
            <div className="relative w-24 h-24 flex items-center justify-center bg-background rounded-full border border-primary/30 shadow-lg">
              <FileQuestion className="w-12 h-12 text-primary/80" />
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
          {/* Blue strip at top */}
          <div className="bg-gradient-to-r from-primary/80 to-primary h-2" />

          <div className="p-8">
            {/* Badge */}
            <div className="inline-block bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-sm mb-4 border border-primary/20">
              404 Not Found
            </div>

            {/* Main heading */}
            <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>

            {/* Description */}
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <Separator className="my-6 bg-border/50" />

            {/* Information */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-sm text-muted-foreground">
                You attempted to access:{" "}
                <span className="font-mono bg-secondary/50 px-2 py-1 rounded text-xs">
                  {location.pathname}
                </span>
              </div>
            </div>

            {/* Return button */}

            <Button
              className="w-full group relative overflow-hidden"
              onClick={() => {
                Navigate(-1);
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Return to Home
              </span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
