import React from 'react';
import { Heart, Activity, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Phone, Volume2, UserCheck, Stethoscope } from 'lucide-react';

interface WelcomePageProps {
  onProceedToRoleSelection: () => void;
  onQuickLogin: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onProceedToRoleSelection,
  onQuickLogin,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col justify-between p-4 sm:p-8 font-sans">
      
      {/* BRANDING TOP BAR */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Heart className="w-7 h-7 fill-white/20 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              ElderCare <span className="text-teal-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Intelligent Voice Companion & Senior Wellness Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/80 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HIPAA Compliant & Secure</span>
          </div>

          <button
            type="button"
            onClick={onQuickLogin}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 transition-all"
          >
            Sign In / Login
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="max-w-4xl mx-auto text-center space-y-6 my-10">
        <span className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 border border-teal-500/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Aging-In-Place Voice & Caregiver Intelligence Platform</span>
        </span>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Gentle Senior Voice Companion & Proactive Caregiver Network
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Welcome! ElderCare AI bridges seniors and family caregivers with warm, natural voice check-ins, automated medicine compliance tracking, speech cadence analysis, and instant SOS alerts.
        </p>

        {/* PRIMARY CALL TO ACTION BUTTON */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onProceedToRoleSelection}
            className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-base shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Get Started • Select Entry Role</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* FEATURE CARDS STRIP */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        
        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Elderly Senior Voice Home</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Warm spoken companion with multilingual support, simple check-in questions, memory exercises, and large text display.
          </p>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Caregiver Real-Time Hub</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Real-time alert pushes for missed pills, unacknowledged SOS calls, speech cadence acoustic trends, and daily AI summaries.
          </p>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Instant Emergency SOS Dispatch</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            One-touch distress button & automatic speech trigger when keywords like "help", "fell", or "chest pain" are detected.
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="max-w-6xl mx-auto w-full text-center py-6 border-t border-slate-800 text-xs text-slate-500 font-medium">
        ElderCare AI Platform • End-to-End Encryption & Privacy First Architecture
      </div>
    </div>
  );
};
