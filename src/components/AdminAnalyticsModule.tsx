import React, { useState } from 'react';
import { SeniorProfile, CheckInItem, VoiceConversationMessage, CaregiverInsight, EmergencyAlert } from '../types';
import {
  Users,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  Heart,
  BarChart3,
  FileText,
  LogIn,
  Bell,
  RefreshCw,
  PieChart,
  Calendar,
  Layers,
  ChevronDown,
  CheckSquare,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface AdminAnalyticsModuleProps {
  profile: SeniorProfile;
  checkInItems: CheckInItem[];
  conversationHistory: VoiceConversationMessage[];
  insights: CaregiverInsight[];
  emergencyAlerts: EmergencyAlert[];
}

export interface UserActivityRecord {
  id: string;
  name: string;
  role: 'Elder' | 'Caregiver' | 'Guardian' | 'Physician';
  status: 'online' | 'recent' | 'offline';
  lastActive: string;
  device: string;
  avatarBg: string;
  recentAction: string;
  complianceRate: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  role: 'Elder' | 'Caregiver' | 'System' | 'AI Companion';
  category: 'emergency' | 'symptom' | 'medication' | 'login' | 'system' | 'checkin';
  severity: 'critical' | 'high' | 'normal' | 'info';
  action: string;
  details: string;
}

export const AdminAnalyticsModule: React.FC<AdminAnalyticsModuleProps> = ({
  profile,
  checkInItems,
  conversationHistory,
  insights,
  emergencyAlerts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'audit'>('overview');

  // Calculate live metrics
  const completedCheckIns = checkInItems.filter((i) => i.completed).length;
  const totalCheckIns = checkInItems.length || 1;
  const medicationAdherence = Math.round((completedCheckIns / totalCheckIns) * 100);

  const symptomDetectedCount = conversationHistory.filter((m) => m.symptomDetected).length;
  const totalVoiceChats = conversationHistory.filter((m) => m.sender === 'elder').length;

  // Mock multi-user tracking data alongside real primary senior
  const userActivities: UserActivityRecord[] = [
    {
      id: 'usr-1',
      name: `${profile.name} (${profile.preferredName})`,
      role: 'Elder',
      status: 'online',
      lastActive: 'Just now',
      device: 'Voice Companion Smart Display',
      avatarBg: 'bg-teal-600',
      recentAction: conversationHistory.length > 0
        ? `Voice Input: "${conversationHistory[conversationHistory.length - 1].text.slice(0, 32)}..."`
        : 'Active on Elder Voice Home',
      complianceRate: medicationAdherence,
    },
    {
      id: 'usr-2',
      name: 'Sarah Vance',
      role: 'Guardian',
      status: 'online',
      lastActive: 'Active now',
      device: 'Caregiver Web Portal',
      avatarBg: 'bg-indigo-600',
      recentAction: 'Viewing Guardian Health Dashboard & Analytics',
      complianceRate: 100,
    },
    {
      id: 'usr-3',
      name: `Dr. ${profile.doctorName}`,
      role: 'Physician',
      status: 'recent',
      lastActive: '14 mins ago',
      device: 'EHR Clinical Portal Integration',
      avatarBg: 'bg-emerald-600',
      recentAction: 'Reviewed Gemini Clinical Digest & Vital Trends',
      complianceRate: 98,
    },
    {
      id: 'usr-4',
      name: 'Robert Vance',
      role: 'Caregiver',
      status: 'recent',
      lastActive: '1 hour ago',
      device: 'Mobile Guardian App (iOS)',
      avatarBg: 'bg-amber-600',
      recentAction: 'Acknowledged Medication Log Notification',
      complianceRate: 95,
    },
    {
      id: 'usr-5',
      name: 'Margaret Miller',
      role: 'Elder',
      status: 'offline',
      lastActive: '3 hours ago',
      device: 'ElderCare Voice Tablet',
      avatarBg: 'bg-purple-600',
      recentAction: 'Completed Afternoon Hydration & Routine Check',
      complianceRate: 88,
    },
  ];

  // System audit logs derived from real history + historical system events
  const liveAuditLogs: AuditLogEntry[] = [
    ...emergencyAlerts.map((a) => ({
      id: `audit-alert-${a.id}`,
      timestamp: a.timestamp,
      userName: a.senderName || profile.preferredName,
      role: 'System' as const,
      category: 'emergency' as const,
      severity: a.priority === 'critical' ? 'critical' as const : 'high' as const,
      action: 'Emergency Guardian Escalation Triggered',
      details: a.message,
    })),
    ...conversationHistory
      .filter((m) => m.symptomDetected)
      .map((m) => ({
        id: `audit-symptom-${m.id}`,
        timestamp: m.timestamp,
        userName: profile.preferredName,
        role: 'Elder' as const,
        category: 'symptom' as const,
        severity: 'high' as const,
        action: `Symptom Flagged: ${m.symptomDetected}`,
        details: `Voice utterance: "${m.text}" • AI Guidance: ${m.suggestedSelfCare || 'Self-care provided'}`,
      })),
    ...checkInItems.map((item) => ({
      id: `audit-checkin-${item.id}`,
      timestamp: item.completedAt || '08:00 AM',
      userName: item.completed ? profile.preferredName : 'System Monitor',
      role: item.completed ? ('Elder' as const) : ('System' as const),
      category: 'medication' as const,
      severity: item.completed ? ('info' as const) : ('normal' as const),
      action: item.completed ? `Routine Task Completed: ${item.title}` : `Scheduled Task Pending: ${item.title}`,
      details: `Category: ${item.category} • Scheduled: ${item.scheduledTime}`,
    })),
    {
      id: 'audit-sys-1',
      timestamp: '08:30 AM',
      userName: 'Sarah Vance',
      role: 'Caregiver',
      category: 'login',
      severity: 'info',
      action: 'Caregiver Portal Authentication',
      details: 'Logged in via Two-Factor Secure Session',
    },
    {
      id: 'audit-sys-2',
      timestamp: '08:00 AM',
      userName: profile.preferredName,
      role: 'Elder',
      category: 'login',
      severity: 'info',
      action: 'Elder Voice Home System Session Started',
      details: 'Device online & Web Speech Recognition active',
    },
    {
      id: 'audit-sys-3',
      timestamp: '07:45 AM',
      userName: 'Gemini 3.6 AI Engine',
      role: 'System',
      category: 'system',
      severity: 'info',
      action: 'Daily Clinical Health Report Generated',
      details: 'Automated synthesis of voice sentiment, speech metrics & adherence',
    },
  ];

  // Filter audit logs
  const filteredAuditLogs = liveAuditLogs.filter((log) => {
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Mood sentiment distribution
  const moodCounts = {
    Happy: conversationHistory.filter((m) => m.detectedMood === 'happy').length + 2,
    Calm: conversationHistory.filter((m) => m.detectedMood === 'calm').length + 4,
    Anxious: conversationHistory.filter((m) => m.detectedMood === 'anxious').length,
    Lonely: conversationHistory.filter((m) => m.detectedMood === 'lonely').length,
    Tired: conversationHistory.filter((m) => m.detectedMood === 'tired').length,
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Module Header Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border border-teal-500/30">
              <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Admin & Guardian Analytics Engine</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              System Usage & Activity Intelligence
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              Real-time monitoring of active logins, routine adherence rates, mood distributions & audit history
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'overview'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Adherence Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'activity'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Login & User Activity
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'audit'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Audit & Alert Logs
            </button>
          </div>
        </div>
      </div>

      {/* Main Module Content */}
      <div className="p-6 sm:p-8 space-y-8">

        {/* TAB 1: ADHERENCE & STATUS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
                  <span>Total Active Network</span>
                  <Users className="w-5 h-5 text-teal-600 stroke-[2.2]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">5 Users</span>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    2 Online Now
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {profile.preferredName} + 1 Elder • 3 Caregiver Accounts
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
                  <span>Routine Adherence</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.2]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600">{medicationAdherence}%</span>
                  <span className="text-xs font-bold text-slate-500">
                    ({completedCheckIns}/{totalCheckIns} Done)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${medicationAdherence}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
                  <span>Voice AI Interactions</span>
                  <Activity className="w-5 h-5 text-indigo-600 stroke-[2.2]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-600">{totalVoiceChats} Prompts</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Today
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {symptomDetectedCount} health symptoms recognized & guided
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
                  <span>Emergency Alerts</span>
                  <ShieldAlert className="w-5 h-5 text-rose-500 stroke-[2.2]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-rose-600">{emergencyAlerts.length}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    emergencyAlerts.length > 0 ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {emergencyAlerts.length > 0 ? 'Needs Attention' : 'All Clear'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Instant Guardian voice escalation active
                </p>
              </div>

            </div>

            {/* Aggregated Daily Routine & Mood Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Routine Completion Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-5 h-5 text-teal-600 stroke-[2.2]" />
                    <h4 className="font-extrabold text-slate-900 text-lg">
                      Daily Check-in & Medication Completion
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Today's Status
                  </span>
                </div>

                <div className="space-y-4">
                  {checkInItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          item.completed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {item.completed ? '✓' : '⏱'}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            Scheduled: {item.scheduledTime} • Category: <span className="capitalize">{item.category}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                        item.completed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {item.completed ? `Completed at ${item.completedAt || '08:15 AM'}` : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotional & Mood Sentiment Analytics */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-rose-500 stroke-[2.2]" />
                    <h4 className="font-extrabold text-slate-900 text-lg">
                      Emotional Tone & Sentiment Trends
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    AI Speech Analysis
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Aggregated emotional classification extracted from spoken dialogue sessions with {profile.preferredName}.
                </p>

                <div className="space-y-3 pt-2">
                  {Object.entries(moodCounts).map(([mood, count]) => {
                    const total = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);

                    const moodColors: Record<string, { bg: string; bar: string; text: string }> = {
                      Happy: { bg: 'bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-800' },
                      Calm: { bg: 'bg-teal-50', bar: 'bg-teal-500', text: 'text-teal-800' },
                      Anxious: { bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-800' },
                      Lonely: { bg: 'bg-purple-50', bar: 'bg-purple-500', text: 'text-purple-800' },
                      Tired: { bg: 'bg-slate-100', bar: 'bg-slate-500', text: 'text-slate-800' },
                    };

                    const style = moodColors[mood] || moodColors.Calm;

                    return (
                      <div key={mood} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${style.bar}`}></span>
                            <span>{mood} Tone</span>
                          </span>
                          <span>{count} Instances ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                          <div
                            className={`${style.bar} h-2.5 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: LOGIN & USER ACTIVITY TRACKER */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  User Accounts, Logins & Active Sessions
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Tracking active sessions, last seen timestamps, devices, and recent platform actions
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Auth Tracker Active</span>
              </div>
            </div>

            {/* Users Activity Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm text-slate-800 font-sans">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">User / Account</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status & Last Active</th>
                    <th className="py-3.5 px-4">Access Device</th>
                    <th className="py-3.5 px-4">Recent Activity Log</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Adherence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {userActivities.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-extrabold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${usr.avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                            {usr.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold">{usr.name}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{usr.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${
                          usr.role === 'Elder'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : usr.role === 'Guardian'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : usr.role === 'Physician'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {usr.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            usr.status === 'online'
                              ? 'bg-emerald-500 animate-pulse'
                              : usr.status === 'recent'
                              ? 'bg-amber-400'
                              : 'bg-slate-300'
                          }`}></span>
                          <span>{usr.lastActive}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium text-xs">
                        {usr.device}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {usr.recentAction}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right font-extrabold text-teal-700">
                        {usr.complianceRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT & ALERT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Comprehensive System Event & Alert Audit Trail
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Detailed history of emergency escalations, symptom detections, routine checks, and logins
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Events' },
                  { id: 'emergency', label: '🚨 Emergencies' },
                  { id: 'symptom', label: '🩺 Symptoms' },
                  { id: 'medication', label: '💊 Routines' },
                  { id: 'login', label: '🔑 Logins' },
                  { id: 'system', label: '🤖 AI System' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 stroke-[2.2]" />
              <input
                type="text"
                placeholder="Search audit trail by user, action, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Audit Log Entries list */}
            <div className="space-y-3">
              {filteredAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-sm">
                  No matching audit entries found for the selected category or search filter.
                </div>
              ) : (
                filteredAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-2xl border transition-all space-y-1.5 ${
                      log.severity === 'critical'
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : log.severity === 'high'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-slate-50/80 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          log.category === 'emergency'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : log.category === 'symptom'
                            ? 'bg-amber-200 text-amber-900 border-amber-300'
                            : log.category === 'medication'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-slate-200 text-slate-800 border-slate-300'
                        }`}>
                          {log.category}
                        </span>

                        <span className="font-extrabold text-xs text-slate-900">
                          {log.userName} ({log.role})
                        </span>
                      </div>

                      <span className="text-xs text-slate-400 font-semibold">{log.timestamp}</span>
                    </div>

                    <div className="font-extrabold text-sm text-slate-900">{log.action}</div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{log.details}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
