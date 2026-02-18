import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export const TestimonialCard = ({
  name,
  role,
  content,
  rating,
  image,
}: TestimonialCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group"
    >
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/5">
        {/* Quote icon */}
        <div className="mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Quote className="w-5 h-5 text-primary/60" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-100 text-gray-200"
                }`}
            />
          ))}
        </div>

        {/* Content */}
        <p className="text-foreground/70 text-sm leading-relaxed flex-1 mb-5">
          "{content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <div className="relative">
            <img
              src={image}
              alt={name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{name}</h4>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};