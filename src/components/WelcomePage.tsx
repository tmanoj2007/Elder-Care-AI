import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShieldCheck, ArrowRight, Sparkles, Lock, HeartPulse, MessageSquareQuote } from 'lucide-react';

interface WelcomePageProps {
  onProceedToRoleSelection: () => void;
  onQuickLogin: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onProceedToRoleSelection,
  onQuickLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Ambient Glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-sky-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* BRANDING TOP BAR */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[16px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Heart className="w-6 h-6 fill-white/20 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              ElderCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Intelligent Senior Healthcare & Wellness Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HIPAA Compliant & Secure</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onQuickLogin}
            className="bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 transition-all hover:border-emerald-500/50 shadow-sm"
          >
            Sign In
          </motion.button>
        </div>
      </motion.header>

      {/* MINIMALIST CENTERED HERO SECTION */}
      <main className="max-w-4xl mx-auto w-full text-center space-y-8 my-auto py-12 sm:py-16 z-10 flex flex-col items-center justify-center">
        {/* Subtle Category Pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Next-Generation Healthcare Intelligence</span>
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-3xl"
        >
          Intelligent Elder Care & Proactive Health Monitoring
        </motion.h2>

        {/* Clean, Refined Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed text-balance"
        >
          Empowering seniors with compassionate voice companions, real-time vital sign tracking, and proactive caregiver intelligence for safer, independent living.
        </motion.p>

        {/* SINGLE CLEAN RESPONSIVE GET STARTED CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="pt-2 w-full flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onProceedToRoleSelection}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-extrabold px-9 py-4 rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition-all duration-300 cursor-pointer min-h-[52px]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium"
        >
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <span>24/7 Vital Monitoring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-sky-400" />
            <span>Spoken Voice Companion</span>
          </div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto w-full text-center py-6 border-t border-slate-900 text-xs text-slate-500 font-medium z-10">
        ElderCare AI Platform • End-to-End Encryption & Privacy-First Architecture
      </footer>
    </div>
  );
};

