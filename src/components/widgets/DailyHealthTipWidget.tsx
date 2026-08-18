import React, { useState } from 'react';
import { Stethoscope, Lightbulb, RefreshCw, Volume2, ShieldCheck, HeartPulse } from 'lucide-react';
import { speakText } from '../../utils/speech';

interface DailyHealthTipWidgetProps {
  selectedLanguage?: string;
}

export const DailyHealthTipWidget: React.FC<DailyHealthTipWidgetProps> = ({ selectedLanguage = 'en-US' }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tips = [
    {
      title: "Morning Hydration Kickstart",
      category: "Hydration & Joints",
      advice: "Drink a warm glass of water right after waking up. It gently hydrates your organs, lubricates knee and hip joints, and improves morning alertness.",
      icon: "💧",
      badgeColor: "bg-sky-400 text-slate-950",
    },
    {
      title: "10-Minute Gentle Living Room Stretch",
      category: "Mobility & Balance",
      advice: "Do slow ankle circles and shoulder rolls while seated safely in a armchair. This reduces morning stiffness and improves walking balance.",
      icon: "🧘‍♂️",
      badgeColor: "bg-emerald-400 text-slate-950",
    },
    {
      title: "Bright Light & Morning Sun Exposure",
      category: "Circadian Health & Sleep",
      advice: "Sit near a sunny window or step onto the porch for 10–15 minutes in the morning. Natural daylight regulates melatonin for restful night sleep.",
      icon: "☀️",
      badgeColor: "bg-amber-400 text-slate-950",
    },
    {
      title: "Eye Comfort 20-20-20 Rule",
      category: "Vision Care",
      advice: "If watching television or reading, look at an object 20 feet away for 20 seconds every 20 minutes to prevent eye fatigue.",
      icon: "👁️",
      badgeColor: "bg-teal-400 text-slate-950",
    },
    {
      title: "Consistent Pill Schedule with Meals",
      category: "Medication Care",
      advice: "Take prescribed blood pressure or heart medications with a glass of water at the exact same time every day to keep steady blood levels.",
      icon: "💊",
      badgeColor: "bg-rose-400 text-slate-950",
    },
  ];

  const currentTip = tips[tipIndex];

  const handleNextTip = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
      setIsRefreshing(false);
    }, 250);
  };

  const handleSpeakTip = () => {
    speakText(`Health Tip: ${currentTip.title}. ${currentTip.advice}`, undefined, undefined, 0.88, 1.0, selectedLanguage);
  };

  return (
    <div className="bg-gradient-to-br from-teal-950/90 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 border-2 border-teal-400/50 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-teal-400/30 pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-teal-300 stroke-[2.5]" />
          <span className="font-black text-xs sm:text-sm text-teal-200 uppercase tracking-wider">
            Daily Senior Health Tip
          </span>
        </div>
        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${currentTip.badgeColor}`}>
          {currentTip.category}
        </span>
      </div>

      {/* Tip Content */}
      <div className="space-y-2 py-1">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl leading-none">{currentTip.icon}</span>
          <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
            {currentTip.title}
          </h4>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/10">
          {currentTip.advice}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-t border-teal-400/30 pt-3">
        <button
          onClick={handleSpeakTip}
          className="bg-teal-400/20 hover:bg-teal-400/30 text-teal-200 border border-teal-400/50 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all active:scale-95 min-h-[40px]"
          title="Listen to Health Tip Aloud"
        >
          <Volume2 className="w-4 h-4 text-teal-300 stroke-[2.5]" />
          <span>Read Tip Aloud</span>
        </button>

        <button
          onClick={handleNextTip}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 border-2 border-teal-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all active:scale-95 shadow-md min-h-[40px]"
          title="Get Next Daily Health Tip"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Next Tip</span>
        </button>
      </div>
    </div>
  );
};
