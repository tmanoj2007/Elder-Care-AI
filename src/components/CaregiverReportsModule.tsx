import React, { useState } from 'react';
import { SeniorProfile, CheckInItem, VoiceConversationMessage, CaregiverInsight, EmergencyAlert } from '../types';
import {
  FileText, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Heart, Activity, Stethoscope, Download, Printer, ShieldAlert, Sparkles, Filter,
  Smile, Frown, Meh, BarChart2, PieChart, ArrowUpRight, ArrowDownRight, RefreshCw, Send, CheckSquare
} from 'lucide-react';

interface CaregiverReportsModuleProps {
  profile: SeniorProfile;
  checkInItems: CheckInItem[];
  conversationHistory: VoiceConversationMessage[];
  insights: CaregiverInsight[];
  emergencyAlerts: EmergencyAlert[];
}

export const CaregiverReportsModule: React.FC<CaregiverReportsModuleProps> = ({
  profile,
  checkInItems,
  conversationHistory,
  insights,
  emergencyAlerts,
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Daily Calculations
  const completedToday = checkInItems.filter((i) => i.completed).length;
  const totalToday = checkInItems.length || 1;
  const dailyAdherence = Math.round((completedToday / totalToday) * 100);

  const symptomMsgs = conversationHistory.filter((m) => m.symptomDetected || m.suggestedSelfCare);
  const elderMsgs = conversationHistory.filter((m) => m.sender === 'elder');

  // Weekly Mocked Data derived from profile & real state
  const weeklyData = [
    { day: 'Mon', date: 'Aug 01', adherence: 100, completed: 5, missed: 0, mood: 'Calm', symptoms: 0 },
    { day: 'Tue', date: 'Aug 02', adherence: 80, completed: 4, missed: 1, mood: 'Happy', symptoms: 1 },
    { day: 'Wed', date: 'Aug 03', adherence: 100, completed: 5, missed: 0, mood: 'Calm', symptoms: 0 },
    { day: 'Thu', date: 'Aug 04', adherence: 60, completed: 3, missed: 2, mood: 'Anxious', symptoms: 2 },
    { day: 'Fri', date: 'Aug 05', adherence: 100, completed: 5, missed: 0, mood: 'Calm', symptoms: 0 },
    { day: 'Sat', date: 'Aug 06', adherence: 100, completed: 5, missed: 0, mood: 'Happy', symptoms: 0 },
    { day: 'Sun (Today)', date: 'Aug 07', adherence: dailyAdherence, completed: completedToday, missed: checkInItems.filter(i => i.isMissed).length, mood: 'Calm', symptoms: symptomMsgs.length },
  ];

  const avgWeeklyAdherence = Math.round(
    weeklyData.reduce((acc, curr) => acc + curr.adherence, 0) / weeklyData.length
  );

  const weeklySymptoms = [
    { name: 'Mild Dizziness', count: 2, severity: 'Moderate' },
    { name: 'Throat Discomfort', count: 1, severity: 'Mild' },
    { name: 'Cold Chills', count: 1, severity: 'Mild' },
  ];

  // Monthly Mocked Data
  const monthlyStats = {
    overallAdherence: 91,
    totalCheckInsCompleted: 142,
    totalMissedPills: 4,
    emergencyAlertsTriggered: emergencyAlerts.length,
    averageHeartRate: '72 bpm',
    averageBP: '124/82 mmHg',
    cognitiveMMSEScore: '24 / 30 (Mild Impairment - Stable)',
    emotionalStabilityIndex: '88% Stable / Calm',
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setExportNotice(null);
    setTimeout(() => {
      setIsExporting(false);
      setExportNotice(`✨ ${timeframe.toUpperCase()} Health Report for ${profile.name} exported successfully as PDF!`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  return (
    <div id="caregiver-reports-section" className="bg-white rounded-[24px] border border-slate-200/90 shadow-lg overflow-hidden animate-fade-in">
      
      {/* HEADER BAR WITH TIMEFRAME NAVIGATION */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              <FileText className="w-4 h-4 stroke-[2.2]" />
              <span>Guardian Reports & Clinical Analytics</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              Elder Wellbeing & Multi-Timeframe Digest
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              Historical trends for medication compliance, mood stability, symptom frequency & doctor consultations
            </p>
          </div>

          {/* TIMEFRAME TAB SELECTOR */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 border border-slate-800 p-2 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => setTimeframe('daily')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                timeframe === 'daily'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Daily Breakdown</span>
            </button>

            <button
              type="button"
              onClick={() => setTimeframe('weekly')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                timeframe === 'weekly'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>7-Day Weekly Trends</span>
            </button>

            <button
              type="button"
              onClick={() => setTimeframe('monthly')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                timeframe === 'monthly'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>30-Day Monthly Digest</span>
            </button>
          </div>
        </div>

        {/* QUICK STATS SUMMARY STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-extrabold text-sm border border-teal-500/30 shrink-0">
              {timeframe === 'daily' ? `${dailyAdherence}%` : timeframe === 'weekly' ? `${avgWeeklyAdherence}%` : `${monthlyStats.overallAdherence}%`}
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Compliance Rate</span>
              <span className="text-white font-extrabold text-sm">
                {timeframe === 'daily' ? "Today's Adherence" : timeframe === 'weekly' ? "7-Day Adherence Average" : "30-Day Adherence Rate"}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-extrabold text-sm border border-amber-500/30 shrink-0">
              <Smile className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Emotional Tone</span>
              <span className="text-white font-extrabold text-sm">
                {timeframe === 'daily' ? "Calm & Content" : timeframe === 'weekly' ? "85% Positive Sentiment" : monthlyStats.emotionalStabilityIndex}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-extrabold text-sm border border-rose-500/30 shrink-0">
              <Stethoscope className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Flagged Symptoms</span>
              <span className="text-white font-extrabold text-sm">
                {timeframe === 'daily' ? `${symptomMsgs.length} Reported` : timeframe === 'weekly' ? "4 Mild Events" : "8 Events Monitored"}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Clinical Export</span>
              <span className="text-white font-extrabold text-sm">Doctor Consultation PDF</span>
            </div>
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-70"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Generating...' : 'Export'}</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs font-bold text-center animate-bounce">
            {exportNotice}
          </div>
        )}
      </div>

      {/* BODY CONTENT BY TIMEFRAME */}
      <div className="p-6 sm:p-8 space-y-8">

        {/* ----------------- DAILY TAB VIEW ----------------- */}
        {timeframe === 'daily' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span>Today's Detailed Health & Compliance Breakdown</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time status for medicine adherence, check-in responses, voice mood analysis & transcripts
                </p>
              </div>
              <span className="bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Medicine & Check-in Compliance Timeline */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Today's Medicine & Check-in Timeline</span>
                  </h5>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {completedToday} of {totalToday} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {checkInItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        item.completed
                          ? 'bg-white border-emerald-200 text-slate-900 shadow-sm'
                          : item.isMissed
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          item.completed ? 'bg-emerald-100 text-emerald-800' : item.isMissed ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : item.isMissed ? <XCircle className="w-4 h-4 text-rose-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {item.dosageOrDetails} • Scheduled: {item.scheduledTime}
                          </div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold ${
                        item.completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.isMissed
                          ? 'bg-rose-200 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {item.completed ? `Taken (${item.completedAt || '08:12 AM'})` : item.isMissed ? 'Missed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Analysis & Spoken Transcripts */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Smile className="w-4 h-4 text-amber-600" />
                      <span>Today's Mood Analysis & Voice Transcripts</span>
                    </h5>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Speech AI Active
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acoustic Mood Classification</div>
                    <div className="text-base font-black text-slate-900">
                      "Calm, Content & Highly Responsive"
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Voice pitch stability: 94%. No signs of slurred speech, acute agitation, or cognitive hesitation detected.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Dialogue Highlights</div>
                    {elderMsgs.slice(-3).map((m) => (
                      <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-500 text-[11px]">
                          <span>{profile.preferredName}</span>
                          <span>{m.timestamp}</span>
                        </div>
                        <p className="font-semibold text-slate-900">"{m.text}"</p>
                        {m.symptomDetected && (
                          <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-300">
                            Flagged: {m.symptomDetected}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-200">
                  Transcripts synchronized in real-time from Senior Voice Box
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- WEEKLY TAB VIEW ----------------- */}
        {timeframe === 'weekly' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>7-Day Aggregated Trends & Compliance Charts</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Weekly adherence percentages, recurring symptoms, and emotional stability index
                </p>
              </div>
              <span className="bg-indigo-50 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                Weekly Adherence Avg: {avgWeeklyAdherence}%
              </span>
            </div>

            {/* 7-DAY ADHERENCE BAR VISUALIZATION */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <span>Daily Medication Adherence Rate (Past 7 Days)</span>
                </h5>
                <span className="text-xs font-bold text-slate-500">Target: ≥85%</span>
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end h-48 border-b border-slate-200">
                {weeklyData.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-black text-slate-800">{d.adherence}%</span>
                    <div className="w-full bg-slate-200 rounded-t-xl h-32 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          d.adherence >= 90
                            ? 'bg-emerald-500 group-hover:bg-emerald-400'
                            : d.adherence >= 75
                            ? 'bg-teal-500 group-hover:bg-teal-400'
                            : 'bg-amber-500 group-hover:bg-amber-400'
                        }`}
                        style={{ height: `${d.adherence}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-900 block">{d.day}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{d.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600 pt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Excellent (≥90%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-teal-500"></span> Good (75-89%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500"></span> Missed Tasks (&lt;75%)</span>
                </div>
                <span className="text-indigo-600 font-extrabold">Overall Trend: Stable (+4% vs last week)</span>
              </div>
            </div>

            {/* RECURRING SYMPTOMS & EMOTIONAL STABILITY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-rose-600" />
                  <span>Recurring Symptoms Frequency (Past 7 Days)</span>
                </h5>

                <div className="space-y-2.5">
                  {weeklySymptoms.map((sym, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{sym.name}</div>
                        <div className="text-slate-500 text-[11px]">Severity level: {sym.severity}</div>
                      </div>
                      <span className="bg-rose-100 text-rose-800 font-extrabold px-3 py-1 rounded-full">
                        {sym.count} {sym.count === 1 ? 'Event' : 'Events'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-600" />
                  <span>7-Day Emotional Stability & Voice Tone Index</span>
                </h5>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Calm & Content Days</span>
                    <span className="text-emerald-600 font-extrabold">5 Days (71%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[71%] rounded-full"></div>
                  </div>

                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Happy / Energetic Days</span>
                    <span className="text-teal-600 font-extrabold">1 Day (14%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full w-[14%] rounded-full"></div>
                  </div>

                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Mild Anxiety / Hesitation Days</span>
                    <span className="text-amber-600 font-extrabold">1 Day (14%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[14%] rounded-full"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- MONTHLY TAB VIEW ----------------- */}
        {timeframe === 'monthly' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-teal-600" />
                  <span>30-Day Long-term Health & Wellness Digest</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Comprehensive long-term metrics for physician consultation, family review, and emergency alert frequency
                </p>
              </div>
              <span className="bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                Period: July 08 - August 07
              </span>
            </div>

            {/* MONTHLY METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">30-Day Adherence</span>
                <div className="text-2xl font-black text-emerald-600">{monthlyStats.overallAdherence}%</div>
                <p className="text-slate-500 text-[11px] font-medium">{monthlyStats.totalCheckInsCompleted} Check-ins Completed</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Missed Pills (30 Days)</span>
                <div className="text-2xl font-black text-amber-600">{monthlyStats.totalMissedPills} Missed</div>
                <p className="text-slate-500 text-[11px] font-medium">Auto-notified to Guardian</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">SOS Emergency Alerts</span>
                <div className="text-2xl font-black text-rose-600">{monthlyStats.emergencyAlertsTriggered} SOS</div>
                <p className="text-slate-500 text-[11px] font-medium">100% Resolved by Guardian</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Cognitive MMSE Score</span>
                <div className="text-lg font-black text-slate-900">{monthlyStats.cognitiveMMSEScore}</div>
                <p className="text-slate-500 text-[11px] font-medium">Stable Speech Score</p>
              </div>
            </div>

            {/* DOCTOR CONSULTATION PACKAGE PREVIEW */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl space-y-5 border border-slate-800 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-500/30">
                    <Stethoscope className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h5 className="text-lg font-extrabold text-white">
                      Physician Consultation & Clinical Summary Package
                    </h5>
                    <p className="text-xs text-slate-400 font-medium">
                      Prepared for Dr. {profile.doctorName} • EHR Portal ID: EHR-99120
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Clinical Consultation Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-300">
                <div className="space-y-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-teal-400 font-extrabold block text-[11px] uppercase">1. Vital Signs & Chronic Conditions</span>
                  <p>• Blood Pressure Avg: <strong className="text-white">{monthlyStats.averageBP}</strong></p>
                  <p>• Resting Heart Rate: <strong className="text-white">{monthlyStats.averageHeartRate}</strong></p>
                  <p>• Diagnoses: <strong className="text-white">{profile.medicalConditions?.join(', ') || 'Mild Hypertension'}</strong></p>
                </div>

                <div className="space-y-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-teal-400 font-extrabold block text-[11px] uppercase">2. AI Behavioral Observations</span>
                  <p>• Emotional Sentiment: <strong className="text-white">{monthlyStats.emotionalStabilityIndex}</strong></p>
                  <p>• Routine Adherence: <strong className="text-emerald-400 font-bold">{monthlyStats.overallAdherence}% Compliance</strong></p>
                  <p>• Memory & Cognitive Score: <strong className="text-white">{monthlyStats.cognitiveMMSEScore}</strong></p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
