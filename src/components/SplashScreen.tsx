import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, ShieldCheck, ArrowRight, Activity, Volume2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Radial Glowing Ripples */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* TOP HEADER BRAND BAR */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>ElderCare AI Platform v3.2</span>
        </div>

        <button
          type="button"
          onClick={onFinishSplash}
          className="text-xs font-black text-teal-400 hover:text-teal-300 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-all"
        >
          <span>Skip Animation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CENTER LOGO & ANIMATION */}
      <div className="max-w-2xl mx-auto text-center space-y-8 z-10 my-auto py-12">
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-teal-500/30 mx-auto animate-bounce">
            <Heart className="w-12 h-12 sm:w-14 sm:h-14 fill-slate-950 stroke-[2.2]" />
          </div>
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-2xl shadow-lg animate-pulse">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 border border-teal-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Intelligent Voice Companion & Senior Wellness Network</span>
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            ElderCare <span className="text-teal-400">AI</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto font-medium leading-relaxed">
            Empowering Seniors with Gentle Voice Assistance, Real-Time Medication Compliance & Proactive Caregiver Notifications.
          </p>
        </div>

        {/* INITIALIZATION PROGRESS BAR */}
        <div className="max-w-xs mx-auto space-y-2">
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-bold">
            <span>Loading Speech & Safety Engine...</span>
            <span className="text-teal-400">{progress}%</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onFinishSplash}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-base shadow-xl shadow-teal-500/20 inline-flex items-center gap-3 transition-all active:scale-95"
        >
          <span>Launch Platform</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* FOOTER */}
      <div className="max-w-5xl mx-auto w-full text-center py-4 border-t border-slate-800 text-xs text-slate-500 font-medium z-10">
        HIPAA-Compliant Encrypted Infrastructure • Dual Senior & Caregiver Network
      </div>
    </div>
  );
};
