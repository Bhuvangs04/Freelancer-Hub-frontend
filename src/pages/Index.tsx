import Navbar from "@/components/Navbar";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  MessageSquare,
  CreditCard,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Globe,
  Star,
} from "lucide-react";

/* ─── Animation Variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Animated Section Wrapper ───────────────────────────── */
const AnimatedSection = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── Data ───────────────────────────────────────────────── */
const features = [
  {
    icon: Users,
    title: "Smart Matching",
    desc: "AI-powered matching connects you with the perfect freelancer or project instantly.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Escrow-protected payments ensure both parties are covered. Pay only for approved work.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    desc: "Built-in messaging with file sharing keeps your projects moving forward seamlessly.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Post a project and receive bids within minutes. No more waiting around for responses.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: CreditCard,
    title: "Milestone Tracking",
    desc: "Break projects into milestones. Track progress and release payments as work completes.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    desc: "Full project dashboards with progress tracking, budget monitoring, and deadline alerts.",
    gradient: "from-indigo-500 to-violet-600",
  },
];

const stats = [
  { value: "5,000+", label: "Freelancers" },
  { value: "12,000+", label: "Projects Completed" },
  { value: "99.2%", label: "Satisfaction Rate" },
  { value: "$2M+", label: "Paid Out" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    content:
      "FreelanceHub transformed how we hire developers. The quality of talent and the seamless process saved us weeks of searching.",
    rating: 5,
    image: "https://i.pravatar.cc/100?img=1",
  },
  {
    name: "Michael Chen",
    role: "Full-Stack Developer",
    content:
      "As a freelancer, the milestone payment system gives me confidence. I always get paid for completed work, no exceptions.",
    rating: 5,
    image: "https://i.pravatar.cc/100?img=3",
  },
  {
    name: "Emily Rodriguez",
    role: "Startup Founder",
    content:
      "We built our entire MVP using talent from FreelanceHub. The agreement system and escrow payments made it risk-free.",
    rating: 5,
    image: "https://i.pravatar.cc/100?img=5",
  },
];

const steps = [
  {
    num: "01",
    title: "Post Your Project",
    desc: "Describe what you need, set your budget, and publish in minutes.",
  },
  {
    num: "02",
    title: "Review & Select",
    desc: "Compare bids, review portfolios, and pick the best freelancer.",
  },
  {
    num: "03",
    title: "Collaborate & Pay",
    desc: "Work together with milestones, chat, and secure escrow payments.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */

const Index = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar />

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 hero-gradient-mesh">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute top-40 right-1/3 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Future of Freelancing is Here</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Connect with Top Talent.{" "}
              <span className="text-gradient">Build Amazing Things.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              The premium freelance platform with secure payments, real-time
              collaboration, and smart matching — designed for professionals who
              value quality.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                asChild
                size="lg"
                className="btn-premium rounded-full px-8 h-12 text-base text-white border-0 group"
              >
                <Link to="/sign-up" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <Link to="/sign-in">I have an account</Link>
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex items-center justify-center gap-6 mt-12"
            >
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/40?img=${i + 10}`}
                    alt={`User ${i}`}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Trusted by <strong className="text-foreground">5,000+</strong>{" "}
                  professionals
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────── */}
      <AnimatedSection className="py-16 border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-extrabold text-gradient mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Features ───────────────────────────────────────── */}
      <AnimatedSection
        className="py-20 md:py-28"
      >
        <div className="container mx-auto px-4 md:px-6" id="features">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Everything You Need to{" "}
              <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete suite of tools to help you find, hire, collaborate,
              and pay — all in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="group relative"
              >
                <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-1">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg shadow-black/5`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── How It Works ───────────────────────────────────── */}
      <AnimatedSection className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6" id="how-it-works">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              How it works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Three Simple <span className="text-gradient">Steps</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Go from idea to delivered project in just three easy steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="relative text-center"
              >
                {/* Connector line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/20 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-extrabold text-xl mb-5">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Testimonials ───────────────────────────────────── */}
      <AnimatedSection className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6" id="testimonials">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Loved by <span className="text-gradient">Professionals</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              See what our community has to say about their experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i}>
                <TestimonialCard {...t} />
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA Banner ─────────────────────────────────────── */}
      <AnimatedSection className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl hero-gradient p-12 md:p-16 text-center text-white"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
                Ready to Start Your Next Project?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Join thousands of professionals already using FreelanceHub to
                build, grow, and succeed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 h-12 text-base bg-white text-primary hover:bg-white/90 font-semibold shadow-xl shadow-black/10"
                >
                  <Link to="/sign-up" className="flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-full px-8 h-12 text-base text-white/90 hover:bg-white/10 hover:text-white"
                >
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-white/70 pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg hero-gradient flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  FreelanceHub
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/50">
                The premium freelance platform for serious professionals.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/sign-up"
                    className="hover:text-white transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/freelancer-Hub/policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/freelancer-Hub/policy"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4">
                Connect
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} FreelanceHub. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-white/40">
              <span>Built with</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>by the FreelanceHub Team</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
