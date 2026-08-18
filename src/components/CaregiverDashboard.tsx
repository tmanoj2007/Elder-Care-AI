import React, { useState } from 'react';
import { SeniorProfile, CheckInItem, VoiceConversationMessage, CaregiverInsight, EmergencyAlert, CaregiverNotification, NotificationEventType } from '../types';
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, Sparkles, ShieldAlert, Heart, ArrowRight, 
  UserCheck, BellRing, Stethoscope, Thermometer, PhoneCall, Siren, AlertOctagon, CheckSquare,
  Pill, Droplets, User, Phone, Shield, Smile, TrendingUp, XCircle, AlertCircle, Calendar, 
  MapPin, Send, MessageSquare, HeartPulse, RefreshCw, Bell
} from 'lucide-react';
import { MedicationModule } from './MedicationModule';
import { ProactiveCheckIn } from './ProactiveCheckIn';
import { SpeechMonitoringModule } from './SpeechMonitoringModule';
import { MemoryExercisesModule } from './MemoryExercisesModule';
import { AdminAnalyticsModule } from './AdminAnalyticsModule';
import { CaregiverReportsModule } from './CaregiverReportsModule';
import { CaregiverNotificationsModule } from './CaregiverNotificationsModule';
import { HealthMetricsDashboard } from './HealthMetricsDashboard';

interface CaregiverDashboardProps {
  profile: SeniorProfile;
  checkInItems: CheckInItem[];
  onAddCheckInItem: (newItem: Omit<CheckInItem, 'id' | 'completed'>) => void;
  conversationHistory: VoiceConversationMessage[];
  insights: CaregiverInsight[];
  onGenerateFreshInsight: () => Promise<void>;
  isGeneratingInsight: boolean;
  emergencyAlerts: EmergencyAlert[];
  onResolveAlert: (id: string) => void;
  notifications: CaregiverNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onSimulateNotification: (eventType: NotificationEventType) => void;
  onCallSenior: () => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  profile,
  checkInItems,
  conversationHistory,
  insights,
  onGenerateFreshInsight,
  isGeneratingInsight,
  emergencyAlerts,
  onResolveAlert,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onSimulateNotification,
  onCallSenior,
}) => {
  const [sentReminderMsg, setSentReminderMsg] = useState<string | null>(null);

  const latestInsight = insights[0];
  const completedCheckIns = checkInItems.filter((i) => i.completed).length;
  const totalCheckIns = checkInItems.length || 1;
  const adherenceRate = Math.round((completedCheckIns / totalCheckIns) * 100);

  // Categorize Medications
  const meds = checkInItems.filter((i) => i.category === 'medication');
  const medsTaken = meds.filter((m) => m.completed);
  const medsPending = meds.filter((m) => !m.completed && !m.isMissed);
  const medsMissed = meds.filter((m) => m.isMissed || (!m.completed && m.scheduledTime && m.scheduledTime < '12:00 PM'));

  // Filter messages that contain detected symptoms or sentiment
  const symptomMessages = conversationHistory.filter((m) => m.symptomDetected || m.suggestedSelfCare);

  // Determine Real-Time Activity Status
  const activeAlertsCount = emergencyAlerts.filter((a) => a.status === 'active').length;
  let currentActivityStatus = 'Active & Safe';
  let statusBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let statusDotColor = 'bg-emerald-400';

  if (activeAlertsCount > 0) {
    currentActivityStatus = '🚨 SOS / Urgent Alert Active';
    statusBadgeColor = 'bg-rose-500/30 text-rose-200 border-rose-500/60 animate-pulse';
    statusDotColor = 'bg-rose-400';
  } else if (medsMissed.length > 0) {
    currentActivityStatus = 'Attention Needed (Missed Pill)';
    statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    statusDotColor = 'bg-amber-400';
  } else {
    currentActivityStatus = 'Active - Voice AI Monitored';
  }

  // Determine Today's Mood from latest AI insights or conversation
  const lastConversationMsg = conversationHistory[conversationHistory.length - 1];
  const currentMood = lastConversationMsg?.detectedMood || latestInsight?.overallMood || 'Calm, Content & Friendly';

  const handleSendNudge = (medTitle: string) => {
    setSentReminderMsg(`Voice Nudge sent to ${profile.preferredName}: "Reminder to take ${medTitle}"`);
    setTimeout(() => setSentReminderMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* Top Caregiver Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white py-8 px-6 sm:px-12 border-b border-emerald-900/50 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
              <UserCheck className="w-4 h-4 stroke-[2.2]" />
              <span>Caregiver & Clinical Guardian Portal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
              {profile.name}'s Guardian Dashboard
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Elder ID: <strong className="text-emerald-300 font-mono">ELD-88219</strong></span>
              <span>•</span>
              <span>Age {profile.age} ({profile.gender || 'Senior'})</span>
              <span>•</span>
              <span>Blood Group: <strong className="text-rose-300">{profile.bloodGroup || 'O+'}</strong></span>
              <span>•</span>
              <span>Residence: {profile.location}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGenerateFreshInsight}
              disabled={isGeneratingInsight}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 disabled:opacity-50 text-white font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-xs sm:text-sm transition-all active:scale-95"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingInsight ? 'animate-spin' : ''}`} />
              <span>{isGeneratingInsight ? 'Analyzing with Gemini...' : 'Generate AI Clinical Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* QUICK NAVIGATION SECTION JUMP BAR */}
        <div className="bg-slate-950/90 text-white p-3 rounded-[20px] border border-slate-800 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sticky top-4 z-30">
          <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
            <a
              href="#caregiver-notifications-section"
              className="px-4 py-2.5 rounded-xl font-black bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Bell className="w-4 h-4 animate-pulse" />
              <span>🔔 Real-Time Notifications ({notifications.filter((n) => !n.read).length} Unread)</span>
            </a>
            <a
              href="#caregiver-reports-section"
              className="px-3.5 py-2 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>📊 Multi-Timeframe Reports</span>
            </a>
            <a
              href="#elder-profile-section"
              className="px-3.5 py-2 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>👵 Profile & Status</span>
            </a>
            <a
              href="#medication-module-section"
              className="px-3.5 py-2 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>💊 Medication Compliance</span>
            </a>
            <a
              href="#speech-cognitive-section"
              className="px-3.5 py-2 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>🗣️ Speech & Cognition</span>
            </a>
          </div>
        </div>

        {/* REAL-TIME CAREGIVER NOTIFICATIONS & PUSH ALERT LOG MODULE */}
        <CaregiverNotificationsModule
          notifications={notifications}
          profile={profile}
          onMarkAsRead={onMarkNotificationAsRead}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onDeleteNotification={onDeleteNotification}
          onSimulateNotification={onSimulateNotification}
          onCallSenior={onCallSenior}
        />

        {/* SENIOR HEALTH METRICS & VITALITY HUB */}
        <HealthMetricsDashboard
          seniorName={profile.preferredName}
          checkInItems={checkInItems}
          notifications={notifications}
        />

        {/* CAREGIVER REPORTS & MULTI-TIMEFRAME ANALYTICS MODULE */}
        <CaregiverReportsModule
          profile={profile}
          checkInItems={checkInItems}
          conversationHistory={conversationHistory}
          insights={insights}
          emergencyAlerts={emergencyAlerts}
        />

        {/* 1. 🚨 HIGH VISIBILITY EMERGENCY ALERTS MODULE */}
        {emergencyAlerts.length > 0 && (
          <div className="bg-rose-950 text-white border-2 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-300 flex items-center justify-center border border-rose-500/50 shrink-0">
                  <Siren className="w-7 h-7 text-rose-400 animate-bounce stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Active Emergency & Guardian Alerts ({emergencyAlerts.length})</span>
                    <span className="bg-rose-600 text-white text-xs font-black uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                      Action Required
                    </span>
                  </h3>
                  <p className="text-xs text-rose-200/90 font-medium">
                    Real-time automated alerts triggered by SOS distress phrases or uncompleted tasks
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white text-slate-900 p-5 rounded-2xl border-2 border-rose-400 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase border ${
                        alert.priority === 'critical'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : alert.priority === 'high'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : alert.priority === 'moderate'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        Priority: {alert.priority || 'HIGH'}
                      </span>
                      {alert.symptom && (
                        <span className="bg-teal-50 text-teal-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>{alert.symptom}</span>
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-semibold">{alert.timestamp}</span>
                    </div>

                    <p className="text-slate-900 font-extrabold text-base sm:text-lg">{alert.message}</p>

                    {alert.suggestedAction && (
                      <p className="text-xs font-bold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        💡 <strong>Recommended Guardian Action:</strong> {alert.suggestedAction}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
                    <a
                      href={`tel:${profile.emergencyContacts[0]?.phone || '(555) 234-5678'}`}
                      className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call {profile.preferredName} Immediately</span>
                    </a>

                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="flex-1 lg:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-3 rounded-xl text-xs uppercase transition-all active:scale-95 shadow-md flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge Alert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CORE MONITORING STRUCTURE: 3-COLUMN SUMMARY GRID */}
        <div id="elder-profile-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 2. 👵 ELDER PROFILE CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                <User className="w-4 h-4 text-indigo-600" />
                <span>👵 Linked Elder Profile</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                ID: ELD-88219
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={profile.emergencyContacts[0]?.photoUrl || "https://images.unsplash.com/photo-1581579438747-1dc8d1e292c9?auto=format&fit=crop&w=300&q=80"}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm shrink-0"
              />
              <div className="space-y-0.5">
                <h3 className="text-xl font-extrabold text-slate-900">{profile.name}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Call as: <strong className="text-indigo-600">"{profile.preferredName}"</strong>
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md">
                    Age {profile.age}
                  </span>
                  <span className="bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-md">
                    Blood Group: {profile.bloodGroup || 'O+'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium"><strong>Location:</strong> {profile.location}</span>
              </div>
              <div className="flex items-start gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium"><strong>Doctor:</strong> {profile.doctorName} ({profile.doctorPhone})</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium"><strong>Allergies:</strong> {profile.allergies.join(', ') || 'None'}</span>
              </div>
            </div>

            {/* Emergency Contacts Quick List */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Designated Emergency Contacts</div>
              <div className="space-y-1.5">
                {profile.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{contact.name} ({contact.relationship})</div>
                      <div className="text-slate-500 text-[11px]">{contact.phone}</div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-bold"
                      title="Call contact"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. ⚡ CURRENT STATUS & 😊 TODAY'S MOOD */}
          <div className="space-y-6 flex flex-col justify-between">
            
            {/* CURRENT REAL-TIME STATUS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-teal-600 stroke-[2.2]" />
                  <span>⚡ Real-time Activity Status</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                  Live Sensor Feed
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-900 text-white p-4.5 rounded-2xl">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400">Current Senior State</div>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusDotColor} animate-ping`}></span>
                    <span>{currentActivityStatus}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Last voice interaction: <strong className="text-teal-300">Today at 10:15 AM</strong>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Acoustic Tone</span>
                  <span className="text-slate-900 font-extrabold">Steady Pitch (92 Hz)</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Mobility / Rest</span>
                  <span className="text-slate-900 font-extrabold">Normal Room Activity</span>
                </div>
              </div>
            </div>

            {/* TODAY'S MOOD & SENTIMENT */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 uppercase tracking-wider">
                  <Smile className="w-4 h-4 text-amber-600 stroke-[2.2]" />
                  <span>😊 Today's Mood & Emotional Sentiment</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Voice Sentiment AI
                </span>
              </div>

              <div className="bg-amber-50/80 p-4.5 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Analyzed Emotional Tone</span>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Positive Trend
                  </span>
                </div>
                <div className="text-xl font-black text-amber-950">
                  "{currentMood}"
                </div>
                <p className="text-xs text-amber-900/80 font-medium">
                  Extracted from recent voice conversation transcripts. No depressive or cognitive distress acoustic markers identified.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1">
                  <span>😊 Calm (85%)</span>
                </span>
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <span>💬 Talkative (78%)</span>
                </span>
                <span className="bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                  <span>🧠 Alert (90%)</span>
                </span>
              </div>
            </div>

          </div>

          {/* 4. 💊 MEDICINE STATUS & COMPLIANCE TRACKER */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-teal-800 uppercase tracking-wider">
                  <Pill className="w-4 h-4 text-teal-600 stroke-[2.2]" />
                  <span>💊 Medicine Status & Compliance</span>
                </div>
                <span className="text-[11px] font-extrabold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {adherenceRate}% Adherence
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-extrabold text-slate-700">
                  <span>Daily Medication Schedule</span>
                  <span>{medsTaken.length} / {meds.length} Taken</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((medsTaken.length / (meds.length || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {sentReminderMsg && (
                <div className="bg-teal-50 border border-teal-300 text-teal-900 p-2.5 rounded-xl text-xs font-bold text-center animate-bounce">
                  {sentReminderMsg}
                </div>
              )}

              {/* Medication Item List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {meds.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      med.completed
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                        : med.isMissed
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 font-extrabold text-slate-900">
                        {med.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : med.isMissed ? (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span>{med.title}</span>
                      </span>
                      <span className="font-mono text-[11px] font-extrabold bg-white px-2 py-0.5 rounded border border-slate-200">
                        {med.scheduledTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium pl-5.5">
                      {med.dosageOrDetails}
                    </p>

                    <div className="flex items-center justify-between pt-1 pl-5.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        med.completed
                          ? 'bg-emerald-200 text-emerald-900'
                          : med.isMissed
                          ? 'bg-rose-200 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {med.completed ? `Taken at ${med.completedAt || '08:12 AM'}` : med.isMissed ? 'Overdue / Missed' : 'Pending Scheduled Time'}
                      </span>

                      {!med.completed && (
                        <button
                          onClick={() => handleSendNudge(med.title)}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>Voice Nudge</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Automatic refill reminders synced</span>
              <span className="text-teal-700 font-bold">Prescriptions Active</span>
            </div>
          </div>

        </div>

        {/* 5. 📊 HEALTH SUMMARY & AI CONVERSATIONAL INSIGHTS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  📊 Daily Health Summary & AI Conversational Digest
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Synthesized report of vital checks, symptoms discussed, and Gemini AI clinical observations
                </p>
              </div>
            </div>
            <button
              onClick={onGenerateFreshInsight}
              disabled={isGeneratingInsight}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingInsight ? 'animate-spin' : ''}`} />
              <span>Refresh Summary</span>
            </button>
          </div>

          {/* VITAL CHECKS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-slate-500 font-bold text-[10px] uppercase">Blood Pressure</div>
              <div className="text-lg font-black text-slate-900">124 / 82 <span className="text-xs text-emerald-600">mmHg</span></div>
              <div className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Optimal Zone
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-slate-500 font-bold text-[10px] uppercase">Heart Rate / Pulse</div>
              <div className="text-lg font-black text-slate-900">72 <span className="text-xs text-slate-500">bpm</span></div>
              <div className="text-[10px] text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                Normal Resting
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-slate-500 font-bold text-[10px] uppercase">Daily Hydration</div>
              <div className="text-lg font-black text-slate-900">4 / 5 <span className="text-xs text-slate-500">Glasses</span></div>
              <div className="text-[10px] text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                80% Goal
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-slate-500 font-bold text-[10px] uppercase">Routine Adherence</div>
              <div className="text-lg font-black text-emerald-600">{adherenceRate}%</div>
              <div className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                {completedCheckIns} Tasks Done
              </div>
            </div>
          </div>

          {/* AI DIGEST BOX */}
          {latestInsight && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Gemini AI Health Assessment • {latestInsight.date}</span>
                </span>
                <span className="bg-teal-500/20 text-teal-300 font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-teal-500/30 font-bold">
                  Clinical Confidence: 98%
                </span>
              </div>

              <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-200">
                "{latestInsight.aiAnalysisText}"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="bg-slate-800 p-3.5 rounded-xl space-y-1.5 border border-slate-700">
                  <span className="font-extrabold text-emerald-400 block uppercase text-[10px]">Highlights</span>
                  <ul className="space-y-1 text-slate-300 font-medium">
                    {latestInsight.keyHighlights.map((h, i) => (
                      <li key={i}>• {h}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl space-y-1.5 border border-slate-700">
                  <span className="font-extrabold text-amber-400 block uppercase text-[10px]">Flagged Concerns</span>
                  <ul className="space-y-1 text-slate-300 font-medium">
                    {latestInsight.flaggedConcerns.length > 0 ? (
                      latestInsight.flaggedConcerns.map((fc, i) => <li key={i}>• {fc}</li>)
                    ) : (
                      <li className="text-slate-400 italic">None flagged</li>
                    )}
                  </ul>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl space-y-1.5 border border-slate-700">
                  <span className="font-extrabold text-sky-400 block uppercase text-[10px]">Caregiver Next Steps</span>
                  <ul className="space-y-1 text-slate-300 font-medium">
                    {latestInsight.suggestedCaregiverActions.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* DISCUSSED SYMPTOMS LOG */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Voice Discussion & Symptom Log ({symptomMessages.length})</span>
            </h4>

            {symptomMessages.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                No acute physical symptoms mentioned in today's voice conversation.
              </p>
            ) : (
              <div className="space-y-2">
                {symptomMessages.map((msg) => (
                  <div key={msg.id} className="bg-amber-50/90 border border-amber-200/80 p-3.5 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-amber-900 font-bold">
                      <span className="bg-amber-200 px-2 py-0.5 rounded text-[10px] uppercase">{msg.symptomDetected}</span>
                      <span className="text-slate-500 text-[11px] font-normal">{msg.timestamp}</span>
                    </div>
                    <p className="font-bold text-slate-900">"{msg.text}"</p>
                    {msg.suggestedSelfCare && (
                      <p className="text-[11px] text-amber-950 font-medium bg-white p-2 rounded border border-amber-200">
                        💡 <strong>AI Guidance:</strong> {msg.suggestedSelfCare}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DETAILED CLINICAL ANALYTICS MODULE */}
        <div id="system-analytics-section">
          <AdminAnalyticsModule
            profile={profile}
            checkInItems={checkInItems}
            conversationHistory={conversationHistory}
            insights={insights}
            emergencyAlerts={emergencyAlerts}
          />
        </div>

        {/* PROACTIVE DAILY CHECK-IN REVIEW */}
        <ProactiveCheckIn seniorName={profile.preferredName || profile.name} userRole="caregiver" />

        {/* FULL MEDICATION MANAGEMENT MODULE */}
        <div id="medication-module-section">
          <MedicationModule userRole="caregiver" />
        </div>

        {/* SPEECH CADENCE & ACOUSTIC MONITORING MODULE */}
        <div id="speech-cognitive-section">
          <SpeechMonitoringModule seniorName={profile.preferredName || profile.name} userRole="caregiver" />
        </div>

        {/* MEMORY & COGNITIVE SCORES AUDIT MODULE */}
        <MemoryExercisesModule seniorName={profile.preferredName || profile.name} userRole="caregiver" />

        {/* VOICE & ACTIVITY AUDIT TRAIL */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-teal-600 stroke-[2.2]" />
            <span>Complete Voice Interaction Audit Log</span>
          </h3>

          <div className="space-y-3">
            {conversationHistory.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <span>{msg.sender === 'elder' ? `👵 ${profile.name}` : '🤖 ElderCare Voice AI'}</span>
                    <span>•</span>
                    <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-900 font-medium mt-1 text-sm">"{msg.text}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {msg.symptomDetected && (
                    <span className="bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full text-xs border border-amber-300">
                      {msg.symptomDetected}
                    </span>
                  )}
                  {msg.detectedMood && (
                    <span className="bg-teal-50 text-teal-800 font-bold px-3 py-1 rounded-full text-xs border border-teal-200">
                      Tone: {msg.detectedMood}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};


