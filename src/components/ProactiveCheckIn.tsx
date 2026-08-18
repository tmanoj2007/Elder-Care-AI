import React, { useState, useEffect } from 'react';
import { DailyCheckInLog, CheckInPeriod } from '../types';
import { Sun, Moon, Smile, Utensils, Bed, HeartPulse, Check, Sparkles, Volume2, Mic, FileText, Clock, RefreshCw } from 'lucide-react';
import { speakText } from '../utils/speech';

interface ProactiveCheckInProps {
  seniorName?: string;
  userRole?: 'senior' | 'caregiver';
  onCheckInCompleted?: () => void;
}

const DEFAULT_CHECKINS_FALLBACK: DailyCheckInLog[] = [
  {
    id: 'chk-log-1',
    period: 'morning',
    date: 'Today',
    timestamp: '08:15 AM',
    wellbeing: 'Feeling energetic and comfortable',
    meals: 'Ate full breakfast with tea',
    sleep: 'Slept deeply & rested (7.5 hrs)',
    mood: 'Cheerful & Calm',
    completedBy: 'senior',
  },
  {
    id: 'chk-log-2',
    period: 'evening',
    date: 'Yesterday',
    timestamp: '07:45 PM',
    wellbeing: 'Mild knee stiffness after evening walk',
    meals: 'Comforting soup and bread',
    sleep: 'Ready for relaxing night rest',
    mood: 'Peaceful',
    completedBy: 'senior',
  },
];

export const ProactiveCheckIn: React.FC<ProactiveCheckInProps> = ({
  seniorName = 'Eleanor',
  userRole = 'senior',
  onCheckInCompleted,
}) => {
  const currentHour = new Date().getHours();
  const defaultPeriod: CheckInPeriod = currentHour < 15 ? 'morning' : 'evening';

  const [activePeriod, setActivePeriod] = useState<CheckInPeriod>(defaultPeriod);
  const [wellbeing, setWellbeing] = useState('Feeling energetic and comfortable');
  const [meals, setMeals] = useState('Ate full breakfast');
  const [sleep, setSleep] = useState('Slept deeply & rested');
  const [mood, setMood] = useState('Cheerful & Calm');

  const [checkInLogs, setCheckInLogs] = useState<DailyCheckInLog[]>(() => {
    const cached = localStorage.getItem('eldercare_checkin_logs_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return DEFAULT_CHECKINS_FALLBACK;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);

  // Sync to cache
  useEffect(() => {
    try {
      localStorage.setItem('eldercare_checkin_logs_cache', JSON.stringify(checkInLogs));
    } catch (e) {}
  }, [checkInLogs]);

  // Fetch check-in history from backend
  const fetchCheckIns = async () => {
    try {
      const res = await fetch('/api/daily-checkins');
      if (res.ok) {
        const data = await res.json();
        if (data.checkIns) {
          setCheckInLogs(data.checkIns);
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, using cached check-in logs:', err);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const handleSpeakGreeting = () => {
    const greetingText = activePeriod === 'morning'
      ? `Good morning ${seniorName}! I hope you slept well. How are you feeling today? Have you enjoyed your breakfast?`
      : `Good evening ${seniorName}! How was your afternoon? How are you feeling tonight, and did you have a comforting dinner?`;

    setIsSpeakingPrompt(true);
    speakText(
      greetingText,
      () => setIsSpeakingPrompt(false),
      () => setIsSpeakingPrompt(false)
    );
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    const newLogItem: DailyCheckInLog = {
      id: `chk-log-${Date.now()}`,
      period: activePeriod,
      date: 'Today',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wellbeing,
      meals,
      sleep,
      mood,
      completedBy: userRole,
    };

    try {
      const res = await fetch('/api/daily-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: activePeriod,
          wellbeing,
          meals,
          sleep,
          mood,
          completedBy: userRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.checkIns) {
          setCheckInLogs(data.checkIns);
          setSuccessMessage(`${activePeriod === 'morning' ? 'Morning' : 'Evening'} check-in logged successfully!`);
          if (onCheckInCompleted) onCheckInCompleted();
          if (userRole === 'senior') {
            speakText(`Thank you ${seniorName}! Your ${activePeriod} check-in is saved. Stay comfortable and take care!`);
          }
          setTimeout(() => setSuccessMessage(null), 4000);
          return;
        }
      }
    } catch (err) {
      console.warn('Network offline, logging check-in locally:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Local fallback
    setCheckInLogs((prev) => [newLogItem, ...prev]);
    setSuccessMessage(`${activePeriod === 'morning' ? 'Morning' : 'Evening'} check-in logged successfully!`);
    if (onCheckInCompleted) onCheckInCompleted();
    if (userRole === 'senior') {
      speakText(`Thank you ${seniorName}! Your ${activePeriod} check-in is saved. Stay comfortable and take care!`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      {/* HEADER BAR & PERIOD SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            activePeriod === 'morning'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-indigo-50 text-indigo-600 border-indigo-200'
          }`}>
            {activePeriod === 'morning' ? <Sun className="w-6 h-6 stroke-[2.2]" /> : <Moon className="w-6 h-6 stroke-[2.2]" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Proactive Daily Wellbeing Check-In</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Gentle morning & evening prompts tracking sleep, nutrition, mood & physical status
            </p>
          </div>
        </div>

        {/* MORNING / EVENING TOGGLE */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActivePeriod('morning')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activePeriod === 'morning'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Morning Prompt</span>
          </button>
          <button
            onClick={() => setActivePeriod('evening')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activePeriod === 'evening'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-200" />
            <span>Evening Prompt</span>
          </button>
        </div>
      </div>

      {/* SPOKEN GREETING PROMPT BANNER */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        activePeriod === 'morning'
          ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border-amber-200/80 text-amber-950'
          : 'bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border-indigo-800 text-white'
      }`}>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{activePeriod === 'morning' ? 'Sunrise Wellbeing Check' : 'Nightfall Rest Check'}</span>
          </span>
          <p className="font-semibold text-base sm:text-lg">
            "{activePeriod === 'morning'
              ? `Good morning, ${seniorName}! How did you sleep, and how are you feeling today?`
              : `Good evening, ${seniorName}! How was your dinner and how is your mood tonight?`}"
          </p>
        </div>

        <button
          onClick={handleSpeakGreeting}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
            activePeriod === 'morning'
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isSpeakingPrompt ? 'animate-bounce' : ''}`} />
          <span>{isSpeakingPrompt ? 'Speaking...' : 'Listen to Prompt'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* CHECK-IN FORM CARDS */}
      <form onSubmit={handleSubmitCheckIn} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. WELLBEING & PHYSICAL COMFORT */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>1. Wellbeing & Physical Comfort</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                'Feeling energetic & good',
                'Comfortable & steady',
                'Mild tightness or stiffness',
                'A bit tired today',
              ].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setWellbeing(option)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    wellbeing === option
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 2. MEALS & NUTRITION */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Utensils className="w-4 h-4 text-amber-500" />
              <span>2. {activePeriod === 'morning' ? 'Morning Breakfast & Hydration' : 'Evening Dinner & Water'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                activePeriod === 'morning' ? 'Ate full breakfast' : 'Enjoyed full dinner',
                activePeriod === 'morning' ? 'Light snack & water' : 'Light dinner & warm tea',
                'Drank warm water / juice',
                'Low appetite today',
              ].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setMeals(option)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    meals === option
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 3. SLEEP QUALITY */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Bed className="w-4 h-4 text-indigo-500" />
              <span>3. Sleep & Restfulness</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                'Slept deeply (7+ hrs)',
                'Slept well & peaceful',
                'Woke up once or twice',
                'Restless sleep',
              ].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setSleep(option)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    sleep === option
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* 4. MOOD & EMOTIONAL STATUS */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Smile className="w-4 h-4 text-emerald-500" />
              <span>4. Mood & Mindset</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {[
                'Cheerful & Calm',
                'Content & Peaceful',
                'A bit lonely or quiet',
                'Slightly anxious or tired',
              ].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setMood(option)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    mood === option
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
            <span>Log {activePeriod === 'morning' ? 'Morning' : 'Evening'} Check-In</span>
          </button>
        </div>
      </form>

      {/* CHECK-IN HISTORY AUDIT TRAIL */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Recent Daily Check-In Records</span>
        </h4>

        {checkInLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No check-ins recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {checkInLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      log.period === 'morning' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'
                    }`}>
                      {log.period === 'morning' ? '☀️ Morning' : '🌙 Evening'}
                    </span>
                    <span className="font-bold text-slate-900">{log.date} @ {log.timestamp}</span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    Wellbeing: {log.wellbeing} • Meals: {log.meals} • Sleep: {log.sleep} • Mood: {log.mood}
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200 shrink-0">
                  Recorded by {log.completedBy}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
