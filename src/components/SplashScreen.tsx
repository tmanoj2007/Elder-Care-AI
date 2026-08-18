import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

interface SplashScreenProps {
  onFinishSplash: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinishSplash }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 font-sans relative overflow-hidden">
      {/* Background Radial Glowing Gradient Orbs with motion float */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-sky-500/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* TOP HEADER BRAND BAR */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 z-10"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ElderCare AI Healthcare System v3.2</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onFinishSplash}
          className="text-xs font-black text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <span>Skip Animation</span>
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      </motion.div>

      {/* CENTER LOGO & ANIMATION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-2xl mx-auto text-center space-y-8 z-10 my-auto py-12"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-400 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 mx-auto"
          >
            <Heart className="w-12 h-12 sm:w-14 sm:h-14 fill-white/20 stroke-[2.2]" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 bg-rose-500 text-white p-2.5 rounded-2xl shadow-lg border border-rose-400/50"
          >
            <Activity className="w-5 h-5" />
          </motion.div>
        </div>

        <div className="space-y-3">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/15 to-sky-500/15 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Intelligent Voice Companion & Senior Wellness Network</span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight"
          >
            ElderCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto font-medium leading-relaxed"
          >
            Empowering Seniors with Gentle Voice Assistance, Real-Time Medication Compliance & Proactive Caregiver Notifications.
          </motion.p>
        </div>

        {/* INITIALIZATION PROGRESS BAR */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-xs mx-auto space-y-2"
        >
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-bold">
            <span>Loading Speech & Safety Engine...</span>
            <span className="text-emerald-400">{progress}%</span>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onFinishSplash}
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-extrabold px-8 py-4 rounded-[20px] text-base shadow-xl shadow-emerald-500/25 inline-flex items-center gap-3 transition-all duration-300"
        >
          <span>Launch Platform</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      </motion.div>

      {/* FOOTER */}
      <div className="max-w-5xl mx-auto w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500 font-medium z-10">
        HIPAA-Compliant Encrypted Infrastructure • Dual Senior & Caregiver Network
      </div>
    </div>
  );
};
