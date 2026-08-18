import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Pill,
  Droplets,
  Moon,
  Activity,
  ShieldAlert,
  Footprints,
  BarChart3,
  BellRing,
  CheckCircle2,
  Smile,
  Frown,
  Meh,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Calendar,
  Clock,
  TrendingUp,
  X,
  Volume2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { speakText } from '../utils/speech';
import { CheckInItem, CaregiverNotification } from '../types';

interface HealthMetricsDashboardProps {
  seniorName?: string;
  checkInItems?: CheckInItem[];
  notifications?: CaregiverNotification[];
  onTriggerSOS?: () => void;
  selectedLanguage?: string;
  onNavigateToCaregiver?: () => void;
}

export const HealthMetricsDashboard: React.FC<HealthMetricsDashboardProps> = ({
  seniorName = 'Senior',
  checkInItems = [],
  notifications = [],
  onTriggerSOS,
  selectedLanguage = 'en-US',
  onNavigateToCaregiver,
}) => {
  // Interactive State
  const [waterGlasses, setWaterGlasses] = useState<number>(5);
  const [selectedMood, setSelectedMood] = useState<string>('Happy');
  const [activeChartTab, setActiveChartTab] = useState<'adherence' | 'sleep' | 'steps'>('adherence');
  const [showNotificationsFeed, setShowNotificationsFeed] = useState<boolean>(false);
  const [heartBpm, setHeartBpm] = useState<number>(72);
  const [isSimulatingPulse, setIsSimulatingPulse] = useState<boolean>(false);

  // Calculated Medicine progress
  const medItems = checkInItems.filter((item) => item.category === 'medication');
  const completedMeds = medItems.filter((item) => item.completed).length;
  const totalMeds = medItems.length || 4;
  const medProgressPercent = Math.round((completedMeds / totalMeds) * 100);

  // Unread Caregiver Notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mock weekly historical data for Recharts
  const weeklyAdherenceData = [
    { day: 'Mon', adherence: 100, sleep: 7.2, steps: 3200 },
    { day: 'Tue', adherence: 85, sleep: 6.8, steps: 2800 },
    { day: 'Wed', adherence: 100, sleep: 7.5, steps: 4100 },
    { day: 'Thu', adherence: 90, sleep: 7.0, steps: 3600 },
    { day: 'Fri', adherence: 100, sleep: 8.0, steps: 4500 },
    { day: 'Sat', adherence: 95, sleep: 7.8, steps: 3900 },
    { day: 'Sun', adherence: 100, sleep: 7.5, steps: 3420 },
  ];

  // Mood Options
  const moodOptions = [
    { id: 'Happy', label: 'Happy', emoji: '😃' },
    { id: 'Calm', label: 'Calm', emoji: '😊' },
    { id: 'Neutral', label: 'Okay', emoji: '😐' },
    { id: 'Tired', label: 'Tired', emoji: '🥱' },
    { id: 'Anxious', label: 'Anxious', emoji: '😟' },
  ];

  const handleMoodSelect = (moodId: string, moodLabel: string) => {
    setSelectedMood(moodId);
    const spokenMsg = selectedLanguage.startsWith('te')
      ? `మీ మూడ్ "${moodLabel}"గా అప్‌డేట్ చేయబడింది!`
      : `Mood logged as ${moodLabel}. Thank you for letting your guardian know!`;
    speakText(spokenMsg, undefined, undefined, 0.9, 1.0, selectedLanguage);
  };

  const handleWaterAdd = () => {
    if (waterGlasses < 12) {
      const nextVal = waterGlasses + 1;
      setWaterGlasses(nextVal);
      if (nextVal === 8) {
        speakText('Great job! You reached your daily target of 8 glasses of water!', undefined, undefined, 0.9, 1.0, selectedLanguage);
      }
    }
  };

  const handleWaterRemove = () => {
    if (waterGlasses > 0) {
      setWaterGlasses(waterGlasses - 1);
    }
  };

  const handlePulseSensorCheck = () => {
    setIsSimulatingPulse(true);
    speakText('Checking live heart rate sensor...', undefined, undefined, 0.9, 1.0, selectedLanguage);
    setTimeout(() => {
      const newBpm = Math.floor(68 + Math.random() * 8); // 68 to 75
      setHeartBpm(newBpm);
      setIsSimulatingPulse(false);
      speakText(`Heart rate measured at ${newBpm} beats per minute. Normal resting rhythm.`, undefined, undefined, 0.9, 1.0, selectedLanguage);
    }, 1500);
  };

  const handleReadHealthSummary = () => {
    const summaryMsg = selectedLanguage.startsWith('te')
      ? `మీ ఆరోగ్య నివేదిక: ఓవరాల్ హెల్త్ స్కోరు తొమ్మిది పదుల రెండు శాతం. మందులు ${completedMeds} కి ${totalMeds} పూర్తయ్యాయి. మూడ్: ${selectedMood}. నీటి వినియోగం: ${waterGlasses} గ్లాసులు. హృదయ స్పందన ನಿమిషానికి ${heartBpm} సార్లు.`
      : `Health Summary for ${seniorName}: Overall wellness score is 92%. Medication adherence is ${completedMeds} of ${totalMeds} taken. Current mood is ${selectedMood}. Hydration is at ${waterGlasses} out of 8 glasses. Heart rate is resting at ${heartBpm} beats per minute.`;
    speakText(summaryMsg, undefined, undefined, 0.9, 1.0, selectedLanguage);
  };

  return (
    <section className="bg-slate-50 rounded-[28px] p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-7">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 text-white flex items-center justify-center shadow-lg border-2 border-emerald-300 shrink-0">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Senior Vitality & Health Hub
              </h3>
              <span className="bg-emerald-200 text-emerald-950 text-xs font-black px-3 py-1 rounded-full border border-emerald-400">
                Live Metrics
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700">
              Real-time health scores, medicine tracking, hydration, and caregiver synchronization
            </p>
          </div>
        </div>

        {/* Action Buttons: Voice Readout & Caregiver Notification Feed */}
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReadHealthSummary}
            className="bg-teal-700 hover:bg-teal-800 text-white font-black px-4 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-md border-2 border-teal-500 transition-all shrink-0 min-h-[48px]"
          >
            <Volume2 className="w-5 h-5 text-teal-200 stroke-[2.5]" />
            <span>Read Health Summary</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotificationsFeed(!showNotificationsFeed)}
            className="relative bg-slate-950 hover:bg-slate-900 text-white font-black px-4 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-md border-2 border-slate-700 transition-all shrink-0 min-h-[48px]"
          >
            <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Caregiver Notes</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full animate-bounce">
                {unreadCount} New
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* CAREGIVER NOTIFICATIONS POPUP / FEED */}
      {showNotificationsFeed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 text-white p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-4 relative"
        >
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-6 h-6 text-amber-400" />
              <h4 className="text-base font-black text-white uppercase tracking-wider">
                Recent Caregiver Alerts & Notes ({notifications.length})
              </h4>
            </div>
            <button
              onClick={() => setShowNotificationsFeed(false)}
              className="text-slate-300 hover:text-white p-1.5 rounded-xl border border-slate-700 bg-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-3 pr-1 text-sm">
            {notifications.length === 0 ? (
              <p className="text-slate-300 py-3 italic text-center font-bold">
                No unread caregiver notifications right now.
              </p>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border-2 flex items-start justify-between gap-3 ${
                    notif.read ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-900 border-amber-400 text-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-300 text-base">{notif.title}</span>
                      <span className="text-xs text-slate-400 font-bold">{notif.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {onNavigateToCaregiver && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onNavigateToCaregiver}
                className="text-sm font-black text-emerald-300 hover:underline flex items-center gap-1.5 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/50"
              >
                <span>View Caregiver Portal</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* TOP METRIC CARDS GRID (8 CORE TILES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. OVERALL HEALTH SCORE CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-slate-950 text-white p-6 rounded-3xl border-2 border-emerald-400 shadow-lg space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>Overall Health Score</span>
            </span>
            <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400 text-xs font-black px-2.5 py-1 rounded-lg">
              Optimal
            </span>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="relative w-20 h-20 rounded-full bg-slate-900 border-4 border-emerald-400 flex items-center justify-center text-white font-black text-2xl shadow-inner shrink-0">
              92<span className="text-xs text-emerald-300 font-bold">%</span>
            </div>
            <div>
              <div className="text-lg font-black text-white">Excellent Wellness</div>
              <p className="text-xs text-slate-300 font-semibold leading-snug">
                Vitals, sleep & medications are well synchronized today.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-extrabold">
            <span>Routine: {medProgressPercent}%</span>
            <span>Sleep: 88%</span>
            <span>Vitals: 100%</span>
          </div>
        </motion.div>

        {/* 2. TODAY'S MEDICINE PROGRESS CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-sky-100 text-sky-950 p-6 rounded-3xl border-2 border-sky-400 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-sky-950 flex items-center gap-2">
              <Pill className="w-5 h-5 text-sky-700" />
              <span>Today's Medicine</span>
            </span>
            <span className="bg-sky-200 text-sky-950 font-black text-xs px-2.5 py-1 rounded-lg border border-sky-400">
              {completedMeds}/{totalMeds} Taken
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-black text-sky-950">
              <span>Schedule Progress</span>
              <span>{medProgressPercent}%</span>
            </div>
            <div className="w-full bg-sky-200 h-4 rounded-full overflow-hidden p-0.5 border border-sky-300">
              <div
                className="bg-gradient-to-r from-sky-600 to-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${medProgressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border-2 border-sky-300 text-xs sm:text-sm font-black text-sky-950 flex items-center justify-between">
            <span className="truncate">Next: Evening Calcium (8 PM)</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>
        </motion.div>

        {/* 3. MOOD INDICATOR CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-emerald-100 text-emerald-950 p-6 rounded-3xl border-2 border-emerald-400 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-emerald-950 flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-700" />
              <span>Senior Mood</span>
            </span>
            <span className="text-xs font-black text-emerald-900 bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300">
              Tap to Update
            </span>
          </div>

          {/* Mood Selector Buttons */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {moodOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMoodSelect(m.id, m.label)}
                className={`p-2 rounded-2xl text-center border-2 transition-all flex flex-col items-center justify-center min-h-[52px] ${
                  selectedMood === m.id
                    ? 'bg-emerald-700 text-white font-black border-emerald-900 scale-105 shadow-md'
                    : 'bg-white hover:bg-emerald-200 text-slate-900 border-slate-300'
                }`}
                title={`Mark mood as ${m.label}`}
              >
                <span className="text-2xl leading-none">{m.emoji}</span>
                <span className="text-[10px] font-black mt-1">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-black text-emerald-950 text-center bg-white py-2 rounded-xl border-2 border-emerald-300">
            Current Status: <strong>{selectedMood} & Peaceful</strong>
          </div>
        </motion.div>

        {/* 4. WATER INTAKE CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-cyan-100 text-cyan-950 p-6 rounded-3xl border-2 border-cyan-400 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-cyan-950 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-700" />
              <span>Water Intake</span>
            </span>
            <span className="bg-cyan-200 text-cyan-950 font-black text-xs px-2.5 py-1 rounded-lg border border-cyan-400">
              {waterGlasses} / 8 Glasses
            </span>
          </div>

          {/* Glasses Visual */}
          <div className="flex items-center justify-between gap-1 py-1">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-8 flex-1 rounded-lg border-2 flex items-center justify-center transition-all ${
                  idx < waterGlasses
                    ? 'bg-cyan-600 border-cyan-800 text-white shadow-sm'
                    : 'bg-white border-cyan-300 text-slate-300'
                }`}
              >
                <Droplets className="w-4 h-4 fill-current" />
              </div>
            ))}
          </div>

          {/* High-Visibility Touch Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={handleWaterRemove}
              className="bg-white hover:bg-cyan-200 text-cyan-950 font-black border-2 border-cyan-400 p-2.5 rounded-2xl flex-1 flex items-center justify-center gap-1 text-sm active:scale-95 transition-all min-h-[48px]"
            >
              <Minus className="w-5 h-5 stroke-[2.5]" />
              <span>Less</span>
            </button>
            <button
              onClick={handleWaterAdd}
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-black border-2 border-cyan-900 p-2.5 rounded-2xl flex-1 flex items-center justify-center gap-1 text-sm active:scale-95 transition-all shadow-md min-h-[48px]"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>+ Glass</span>
            </button>
          </div>
        </motion.div>

        {/* 5. SLEEP SCORE CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-purple-100 text-purple-950 p-6 rounded-3xl border-2 border-purple-400 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-purple-950 flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-700" />
              <span>Sleep Score</span>
            </span>
            <span className="bg-purple-200 text-purple-950 font-black text-xs px-2.5 py-1 rounded-lg border border-purple-300">
              7.5 Hours
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-3xl font-black text-purple-950">
              88<span className="text-sm text-purple-800 font-black">% Restful</span>
            </div>
            <div className="w-full bg-purple-200 h-3 rounded-full overflow-hidden flex border border-purple-300">
              <div className="bg-purple-700 h-full w-[35%]" title="Deep Sleep 2.5h"></div>
              <div className="bg-purple-500 h-full w-[50%]" title="Light Sleep 4.2h"></div>
              <div className="bg-purple-400 h-full w-[15%]" title="REM Sleep 0.8h"></div>
            </div>
          </div>

          <div className="text-xs font-extrabold text-purple-950 bg-white p-2.5 rounded-2xl border-2 border-purple-300 flex justify-between">
            <span>Deep: 2.5h</span>
            <span>Light: 4.2h</span>
            <span>REM: 0.8h</span>
          </div>
        </motion.div>

        {/* 6. HEART RATE PULSE SENSOR CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-rose-100 text-rose-950 p-6 rounded-3xl border-2 border-rose-400 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-rose-950 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-700 animate-pulse stroke-[2.5]" />
              <span>Heart Rate Pulse</span>
            </span>
            <span className="bg-rose-200 text-rose-950 font-black text-xs px-2.5 py-1 rounded-lg border border-rose-300">
              98% SpO2
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-4xl font-black text-rose-950 flex items-baseline gap-1">
                {heartBpm} <span className="text-sm text-rose-800 font-extrabold uppercase">BPM</span>
              </div>
              <div className="text-xs font-black text-rose-800">Resting Rhythm • Normal</div>
            </div>

            <button
              onClick={handlePulseSensorCheck}
              disabled={isSimulatingPulse}
              className="bg-rose-700 hover:bg-rose-800 text-white font-black px-4 py-3 rounded-2xl text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 border-2 border-rose-900 min-h-[48px]"
            >
              <Activity className={`w-4 h-4 ${isSimulatingPulse ? 'animate-spin' : ''}`} />
              <span>{isSimulatingPulse ? 'Reading...' : 'Scan'}</span>
            </button>
          </div>

          {/* Animated Heartbeat Line Visual */}
          <div className="bg-slate-950 p-2 rounded-2xl border-2 border-rose-400 flex items-center justify-center overflow-hidden h-9">
            <svg className="w-full h-full text-rose-400 stroke-current fill-none stroke-[2.5]" viewBox="0 0 100 20">
              <path d="M0 10 L20 10 L25 2 L30 18 L35 5 L40 12 L45 10 L100 10" />
            </svg>
          </div>
        </motion.div>

        {/* 7. EMERGENCY STATUS CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-slate-950 text-white p-6 rounded-3xl border-2 border-rose-500 shadow-xl space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse stroke-[2.5]" />
              <span>Emergency SOS</span>
            </span>
            <span className="bg-rose-500/30 text-rose-200 border border-rose-400 text-xs font-black px-2.5 py-1 rounded-lg">
              ARMED 24/7
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-base font-black text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Guardian Connected</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              GPS location & voice distress response active 24/7.
            </p>
          </div>

          <button
            onClick={onTriggerSOS}
            className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black py-3 rounded-2xl text-sm shadow-xl border-2 border-rose-300 transition-all active:scale-95 min-h-[48px]"
          >
            🚨 Trigger SOS Emergency
          </button>
        </motion.div>

        {/* 8. DAILY ACTIVITY & STEPS CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-amber-100 text-amber-950 p-6 rounded-3xl border-2 border-amber-400 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-amber-700" />
              <span>Daily Activity</span>
            </span>
            <span className="bg-amber-200 text-amber-950 font-black text-xs px-2.5 py-1 rounded-lg border border-amber-400">
              68% Goal
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-amber-950">
              3,420 <span className="text-xs font-black text-amber-900">/ 5,000 steps</span>
            </div>
            <div className="w-full bg-amber-200 h-3 rounded-full overflow-hidden p-0.5 border border-amber-300">
              <div className="bg-amber-600 h-full rounded-full w-[68%]"></div>
            </div>
          </div>

          <div className="text-xs font-extrabold text-amber-950 bg-white p-2.5 rounded-2xl border-2 border-amber-300 flex justify-between">
            <span>35 Active Mins</span>
            <span>180 Kcal Burned</span>
          </div>
        </motion.div>

      </div>

      {/* 9. WEEKLY PROGRESS INTERACTIVE RECHARTS CHART SECTION */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h4 className="text-lg font-black text-white tracking-tight">
              Weekly Senior Health & Routine Trends
            </h4>
          </div>

          {/* Chart View Toggle Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-800 text-xs sm:text-sm font-black">
            <button
              onClick={() => setActiveChartTab('adherence')}
              className={`px-3.5 py-2 rounded-xl transition-all min-h-[44px] ${
                activeChartTab === 'adherence'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              💊 Medicine Adherence
            </button>
            <button
              onClick={() => setActiveChartTab('sleep')}
              className={`px-3.5 py-2 rounded-xl transition-all min-h-[44px] ${
                activeChartTab === 'sleep'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              💤 Sleep Quality
            </button>
            <button
              onClick={() => setActiveChartTab('steps')}
              className={`px-3.5 py-2 rounded-xl transition-all min-h-[44px] ${
                activeChartTab === 'steps'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🚶 Daily Steps
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'adherence' ? (
              <BarChart data={weeklyAdherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#cbd5e1" fontSize={13} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={13} fontWeight="bold" domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }}
                  formatter={(val: any) => [`${val}%`, 'Routine Compliance']}
                />
                <Bar dataKey="adherence" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : activeChartTab === 'sleep' ? (
              <AreaChart data={weeklyAdherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#cbd5e1" fontSize={13} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={13} fontWeight="bold" domain={[0, 10]} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }}
                  formatter={(val: any) => [`${val} Hours`, 'Nightly Sleep']}
                />
                <Area type="monotone" dataKey="sleep" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#sleepGrad)" />
              </AreaChart>
            ) : (
              <LineChart data={weeklyAdherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#cbd5e1" fontSize={13} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={13} fontWeight="bold" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }}
                  formatter={(val: any) => [`${val} steps`, 'Activity Level']}
                />
                <Line type="monotone" dataKey="steps" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6, fill: '#f59e0b' }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

