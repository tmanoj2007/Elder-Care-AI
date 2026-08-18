import React, { useState, useEffect } from 'react';
import { CheckInItem } from '../types';
import {
  Bell,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  Pill,
  Droplets,
  Utensils,
  Brain,
  HeartPulse,
  X,
  VolumeX,
  Play,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

interface ProactiveNotificationBannerProps {
  seniorName?: string;
  checkInItems: CheckInItem[];
  onToggleCheckIn: (id: string) => void;
  onEscalateMissedTask?: (item: CheckInItem) => void;
  selectedLanguage?: string;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

export const ProactiveNotificationBanner: React.FC<ProactiveNotificationBannerProps> = ({
  seniorName = 'Eleanor',
  checkInItems,
  onToggleCheckIn,
  onEscalateMissedTask,
  selectedLanguage = 'en-US',
  isSpeaking = false,
  onStopSpeaking,
}) => {
  // Uncompleted items
  const pendingItems = checkInItems.filter((i) => !i.completed);
  
  // Active reminder state
  const [activeReminderIndex, setActiveReminderIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);
  const [snoozedIds, setSnoozedIds] = useState<string[]>([]);
  const [simulatedCategory, setSimulatedCategory] = useState<string | null>(null);
  const [escalatedItemIds, setEscalatedItemIds] = useState<string[]>([]);

  // Available visible reminders (excluding snoozed)
  const visiblePending = pendingItems.filter((item) => !snoozedIds.includes(item.id));
  const currentItem = visiblePending[activeReminderIndex] || pendingItems[0] || null;

  // Handle Missed Task Escalation
  const handleTriggerEscalation = (item: CheckInItem) => {
    stopSpeaking();
    if (!escalatedItemIds.includes(item.id)) {
      setEscalatedItemIds((prev) => [...prev, item.id]);
    }

    if (onEscalateMissedTask) {
      onEscalateMissedTask(item);
    } else {
      const alertMsg = `${seniorName}, your scheduled task "${item.title}" at ${item.scheduledTime} was unacknowledged. Automatically notifying your caregiver on their dashboard now.`;
      speakText(alertMsg, undefined, undefined, 0.9, 1.0, selectedLanguage);
    }
  };

  // Auto-speak voice prompt when new urgent pending reminder appears
  useEffect(() => {
    if (currentItem && currentItem.id !== lastSpokenId && !isMuted) {
      const promptToSpeak = currentItem.audioPrompt ||
        `Hello ${seniorName}! It's time for your ${currentItem.title}. Please take a moment to complete it.`;

      // Trigger warm voice prompt
      setLastSpokenId(currentItem.id);
      speakText(
        promptToSpeak,
        undefined,
        undefined,
        0.9,
        1.0,
        selectedLanguage
      );
    }
  }, [currentItem, lastSpokenId, isMuted, seniorName, selectedLanguage]);

  // Handle Snooze 10 minutes
  const handleSnooze = (id: string) => {
    setSnoozedIds((prev) => [...prev, id]);
    if (onStopSpeaking) onStopSpeaking();
    stopSpeaking();
  };

  // Handle manual trigger simulation
  const handleSimulatePrompt = (type: 'medicine' | 'hydration' | 'meal' | 'health_check' | 'memory') => {
    stopSpeaking();
    setSimulatedCategory(type);
    let title = '';
    let prompt = '';

    if (type === 'medicine') {
      title = 'Prescription Medication Reminder';
      prompt = `Hello ${seniorName}! This is a reminder to take your scheduled Lisinopril heart pill with a full glass of water.`;
    } else if (type === 'hydration') {
      title = 'Hydration & Water Reminder';
      prompt = `Dear ${seniorName}, time to drink a fresh glass of water! Staying hydrated keeps your energy steady and your mind clear.`;
    } else if (type === 'meal') {
      title = 'Nourishing Meal Reminder';
      prompt = `Good afternoon ${seniorName}! It's time for a healthy lunch. Enjoy your meal and rest comfortably afterward.`;
    } else if (type === 'health_check') {
      title = 'Daily Vital Sign Health Check';
      prompt = `Hello ${seniorName}! Let's take 2 minutes for your daily blood pressure and temperature check-in.`;
    } else if (type === 'memory') {
      title = 'Memory & Cognitive Exercise Prompt';
      prompt = `Time for a fun 3-minute Memory Puzzle game, ${seniorName}! Exercising your brain keeps your mind sharp and active.`;
    }

    if (!isMuted) {
      speakText(prompt, undefined, undefined, 0.92, 1.0, selectedLanguage);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication':
        return <Pill className="w-6 h-6 text-emerald-600 stroke-[2.2]" />;
      case 'hydration':
        return <Droplets className="w-6 h-6 text-sky-600 stroke-[2.2]" />;
      case 'meal':
        return <Utensils className="w-6 h-6 text-amber-600 stroke-[2.2]" />;
      case 'health_check':
        return <HeartPulse className="w-6 h-6 text-rose-600 stroke-[2.2]" />;
      case 'activity':
      default:
        return <Brain className="w-6 h-6 text-indigo-600 stroke-[2.2]" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'medication':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'hydration':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'meal':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'health_check':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'activity':
      default:
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-700/80 space-y-5">
      
      {/* HEADER STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 stroke-[2.2] animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Proactive Reminders & Spoken Voice Alerts
              </h3>
              <span className="bg-teal-500/20 text-teal-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-teal-500/30 uppercase tracking-wider hidden md:inline-block">
                Active System
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Scheduled voice prompts for medicines, hydration, meals & daily health exercises
            </p>
          </div>
        </div>

        {/* AUDIO MUTE TOGGLE & QUICK REPLAY */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title={isMuted ? 'Voice prompts muted' : 'Voice prompts enabled'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
            <span>{isMuted ? 'Muted' : 'Voice Alerts On'}</span>
          </button>

          {currentItem && (
            <button
              onClick={() => {
                stopSpeaking();
                const text = currentItem.audioPrompt || `Reminder for ${seniorName}: ${currentItem.title}`;
                speakText(text, undefined, undefined, 0.9, 1.0, selectedLanguage);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen Again</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE VISUAL ALERT CARD */}
      {currentItem ? (
        <div className="bg-slate-800/90 border-2 border-teal-500/60 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-3 rounded-2xl bg-white shadow-sm shrink-0">
                {getCategoryIcon(currentItem.category)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${getCategoryBadgeClass(currentItem.category)}`}>
                    {currentItem.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Scheduled for {currentItem.scheduledTime}</span>
                  </span>
                </div>
                <h4 className="text-xl font-black text-white leading-tight">
                  {currentItem.title}
                </h4>
                {currentItem.dosageOrDetails && (
                  <p className="text-xs text-slate-300 font-medium">
                    Details: <span className="text-teal-200 font-bold">{currentItem.dosageOrDetails}</span>
                  </p>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => onToggleCheckIn(currentItem.id)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Mark Done</span>
              </button>

              <button
                onClick={() => handleSnooze(currentItem.id)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Snooze 10m</span>
              </button>

              <button
                onClick={() => handleTriggerEscalation(currentItem)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                title="Simulate what happens when senior fails to acknowledge a task"
              >
                <AlertCircle className="w-4 h-4 text-rose-200" />
                <span>Simulate Missed Task Escalation</span>
              </button>
            </div>
          </div>

          {/* ESCALATION STATUS WARNING BANNER */}
          {escalatedItemIds.includes(currentItem.id) && (
            <div className="bg-rose-950/90 border-2 border-rose-500/80 p-3.5 rounded-xl text-xs text-rose-100 font-bold flex items-center gap-2.5 animate-pulse">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                🚨 <strong>Guardian Escalation Triggered:</strong> Caregiver has been automatically alerted on their dashboard for unacknowledged task "{currentItem.title}".
              </span>
            </div>
          )}

          {/* VOICE PROMPT QUOTE BOX */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 text-xs text-teal-200 font-medium flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Spoken Prompt: "{currentItem.audioPrompt || `Time for ${currentItem.title}`}"</span>
          </div>
        </div>
      ) : (
        /* ALL REMINDERS COMPLETED STATE */
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-5 rounded-2xl flex items-center justify-between gap-4 text-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 stroke-[2.2]" />
            <div>
              <h4 className="font-extrabold text-base text-white">All Scheduled Reminders Complete!</h4>
              <p className="text-xs text-emerald-300 font-medium">
                Great job today, {seniorName}! Medicines, water, and daily checks are up to date.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSnoozedIds([])}
            className="text-xs text-emerald-300 hover:text-white underline font-bold shrink-0"
          >
            Reset Reminders
          </button>
        </div>
      )}

      {/* QUICK SIMULATION & TEST TRIGGER PANEL */}
      <div className="pt-2 border-t border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Simulate & Test Proactive Voice Reminders:</span>
          </span>
          {simulatedCategory && (
            <span className="text-[10px] text-teal-300 font-bold">
              Playing Simulated {simulatedCategory.toUpperCase()} Prompt
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => handleSimulatePrompt('medicine')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-400" />
            <span>Medicine</span>
          </button>

          <button
            onClick={() => handleSimulatePrompt('hydration')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Water</span>
          </button>

          <button
            onClick={() => handleSimulatePrompt('meal')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Lunch Meal</span>
          </button>

          <button
            onClick={() => handleSimulatePrompt('health_check')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Health Check</span>
          </button>

          <button
            onClick={() => handleSimulatePrompt('memory')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 transition-all"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Memory Game</span>
          </button>
        </div>
      </div>

    </div>
  );
};
