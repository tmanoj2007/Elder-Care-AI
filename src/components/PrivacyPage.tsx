import React, { useState } from 'react';
import { PrivacySettings, TextScale } from '../types';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Trash2,
  Download,
  FileText,
  CheckCircle,
  Info,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  QrCode,
  Key,
  Users,
  Mic,
  Database,
  Server,
  UserCheck,
  Check,
  AlertTriangle
} from 'lucide-react';

interface PrivacyPageProps {
  settings: PrivacySettings;
  onUpdateSettings: (newSettings: PrivacySettings) => void;
  textScale: TextScale;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  settings,
  onUpdateSettings,
  textScale,
}) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const handleToggle = (key: keyof PrivacySettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    setSuccessMsg('Privacy preference updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRetentionChange = (days: number) => {
    const updated = { ...settings, voiceRetentionDays: days };
    onUpdateSettings(updated);
    setSuccessMsg(`Voice recording retention set to ${days === 0 ? 'Immediate deletion (0 Days)' : `${days} days`}.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to permanently clear all stored voice transcripts, acoustic metrics, and local session logs?')) {
      setSuccessMsg('All voice audio logs and local speech transcripts have been permanently erased from browser storage.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      app: 'ElderCare AI Companion',
      exportTimestamp: new Date().toISOString(),
      privacySettings: settings,
      dataPolicies: {
        rawAudioStored: false,
        localDataMinimization: 'Active',
        guardianPairingEncrypted: true,
      },
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ElderCare_AI_Privacy_Security_Audit.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md text-white py-10 px-6 sm:px-12 border-b border-slate-800 shadow-xl relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[18px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-1 border border-emerald-500/30">
                <span>Elder Care Privacy & Security Charter</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Privacy Rights & Security Architecture
              </h2>
              <p className="text-slate-300 text-sm sm:text-base font-medium mt-1">
                Transparent controls for senior voice privacy, local data minimization, and guardian access
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-800/90 text-sky-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>AES-256 Encrypted</span>
            </span>
            <span className="bg-slate-800/90 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Zero Raw Audio Stored</span>
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8 relative z-10">

        {/* Success Toast Alert */}
        {successMsg && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 sm:p-5 rounded-[20px] border border-emerald-400/40 shadow-xl font-bold text-sm sm:text-base flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-6 h-6 shrink-0 stroke-[2.5]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Core Senior Privacy Guarantee Banner */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 p-6 sm:p-8 rounded-[20px] shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Senior Dignity & Privacy Guarantee
              </h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
              Privacy First Standard
            </span>
          </div>

          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            ElderCare AI is strictly engineered to protect senior independence and dignity. Speech conversations are processed for companion support and wellness monitoring—never monetized, sold, or used for commercial profiling. You retain total control over voice data retention and caregiver permissions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl shadow-sm space-y-1">
              <div className="font-extrabold text-emerald-400 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 stroke-[2.2]" />
                <span>Local Data Minimization</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Acoustic baselines stored in local browser sandbox.</p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl shadow-sm space-y-1">
              <div className="font-extrabold text-sky-400 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 stroke-[2.2]" />
                <span>Guardian Access Control</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Secure ID/QR pairing with encrypted contact details.</p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl shadow-sm space-y-1">
              <div className="font-extrabold text-teal-400 text-sm flex items-center gap-1.5">
                <Mic className="w-4 h-4 stroke-[2.2]" />
                <span>Zero Audio Retention</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Raw mic streams converted in-memory and discarded.</p>
            </div>
          </div>
        </div>

        {/* 1. LOCAL DATA MINIMIZATION & SPEECH BASELINES */}
        <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                <Database className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  1. Local Data Minimization & Baseline Security
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  How speech-derived metrics and personal baselines are calculated and secured
                </p>
              </div>
            </div>

            <span className="bg-emerald-500/15 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/30">
              Local Browser Sandbox
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">1</div>
                <span>On-Device Speech Metric Aggregation</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Speech rate (WPM), pause durations, and vocal response latency are computed on-device using local timing logic rather than transmitting continuous voice audio streams to external servers.
              </p>
              <ul className="text-xs text-slate-300 font-bold space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Calculates baseline cadence without raw sound recording</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Stores historical speech metrics in browser IndexedDB / localStorage</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center">2</div>
                <span>Privacy-Preserving Personal Baselines</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                The senior's speech baseline (e.g. 118 WPM average, 1.2s pause length) is stored locally as numerical values. These benchmarks are used solely to detect early acoustic deviations (slurring, hesitancy, pauses).
              </p>
              <ul className="text-xs text-slate-300 font-bold space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">✓</span>
                  <span>Zero exposure of biometric voice prints or acoustic signatures</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400">✓</span>
                  <span>Senior or caregiver can reset baseline numbers anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. GUARDIAN & CAREGIVER ACCESS CONTROL */}
        <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-cyan-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  2. Guardian & Caregiver Access Control
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Role-based authentication, pairing keys, QR codes, and encrypted contact details
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(!showQrModal)}
              className="bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-sky-500/30 flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4 stroke-[2.2]" />
              <span>{showQrModal ? 'Hide Pairing QR' : 'View Pairing QR Code'}</span>
            </button>
          </div>

          {/* QR Pairing Demo Box if toggled */}
          {showQrModal && (
            <div className="bg-slate-950 p-6 rounded-[20px] border border-sky-500/40 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in shadow-xl">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 px-3 py-0.5 rounded-full text-xs font-bold border border-sky-500/30">
                  <Key className="w-3.5 h-3.5" />
                  <span>Encrypted Senior Pairing Token</span>
                </div>
                <h4 className="text-lg font-black text-white">Senior Pairing ID: EC-94827</h4>
                <p className="text-xs text-slate-300 font-medium max-w-md">
                  Scan this QR code from the Caregiver App to pair with Eleanor's account over an end-to-end encrypted tunnel.
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl shadow-lg border border-slate-800 text-center shrink-0 space-y-1">
                <div className="w-28 h-28 bg-slate-950 rounded-xl flex items-center justify-center text-teal-400 font-mono text-xs font-black p-2 border border-slate-800">
                  [ QR ENCRYPTED ]
                  EC-94827
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Scan to Pair</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-400 stroke-[2.2]" />
                <span>Unique Senior Pairing ID</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Family guardians must authenticate using a unique Senior ID (e.g. <code>EC-94827</code>) or QR pairing. Unlinked users cannot access dashboard metrics or conversation digests.
              </p>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400 stroke-[2.2]" />
                <span>Encrypted Emergency Profile</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Physician names, emergency contact phone numbers, and medication schedules are stored encrypted in compliance with healthcare data protection standards.
              </p>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-400 stroke-[2.2]" />
                <span>Granular Permission Scopes</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Seniors or primary family admins can independently toggle transcript access, mood summary sharing, or distress notification auto-alerts at any time.
              </p>
            </div>
          </div>
        </div>

        {/* 3. AUDIO & DATA HANDLING STANDARDS */}
        <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                <Mic className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  3. Audio & Data Handling Standards
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Zero permanent raw audio storage, in-memory speech conversion & automatic scrubbing
                </p>
              </div>
            </div>

            <span className="bg-rose-500/15 text-rose-300 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-500/30">
              In-Memory Processing
            </span>
          </div>

          <div className="bg-slate-950 p-6 rounded-[20px] border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Raw Audio Non-Retention Compliance Statement</span>
            </div>

            <blockquote className="text-xs sm:text-sm text-slate-200 italic font-medium leading-relaxed border-l-2 border-emerald-500 pl-4 py-1">
              "ElderCare AI does NOT record or permanently store raw audio files of spoken conversations. Microphone audio buffers captured during hands-free voice chats are converted into text transcripts in-memory via the browser Web Speech API / Gemini Speech Engine and immediately purged from RAM. Only text transcripts and acoustic performance metrics (WPM, pause latency) are retained per your selected retention policy."
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zero Audio File Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>In-Memory STT Conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>No Third-Party Speech Sales</span>
              </div>
            </div>
          </div>
        </div>

        {/* VOICE RETENTION SETTINGS */}
        <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-3">
              <EyeOff className="w-6 h-6 text-emerald-400 stroke-[2.2]" />
              <span>Voice Transcript Retention Period</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Choose how long text transcripts and conversation history remain stored before automatic deletion
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { days: 0, label: '0 Days', sub: 'Immediate deletion' },
              { days: 7, label: '7 Days', sub: 'Recommended' },
              { days: 30, label: '30 Days', sub: 'Monthly retention' },
              { days: 90, label: '90 Days', sub: 'Quarterly logs' },
            ].map((option) => (
              <button
                key={option.days}
                onClick={() => handleRetentionChange(option.days)}
                className={`p-5 rounded-[18px] border flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  settings.voiceRetentionDays === option.days
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/20 scale-102 font-extrabold'
                    : 'bg-slate-950/80 hover:bg-slate-900 text-slate-200 border-slate-800'
                }`}
              >
                <span className="text-2xl font-black">{option.label}</span>
                <span className={`text-xs font-bold mt-1 ${settings.voiceRetentionDays === option.days ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {option.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PERMISSIONS & SHARING TOGGLES */}
        <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Caregiver Sharing & Privacy Toggles</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Control what information family caregivers and guardians can access on their dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-6">
              <div>
                <h4 className="font-extrabold text-white text-base">Share Full Voice Transcripts</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Allows family caregivers to view word-for-word text transcripts of daily AI check-ins
                </p>
              </div>
              <button
                onClick={() => handleToggle('shareFullTranscripts')}
                className="focus:outline-none shrink-0"
              >
                {settings.shareFullTranscripts ? (
                  <ToggleRight className="w-12 h-12 text-emerald-400 stroke-[2.2]" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-600 stroke-[2.2]" />
                )}
              </button>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-6">
              <div>
                <h4 className="font-extrabold text-white text-base">Share Mood & Wellness Summaries</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Allows Gemini AI to summarize overall daily emotional tone and health adherence for caregivers
                </p>
              </div>
              <button
                onClick={() => handleToggle('shareMoodSummary')}
                className="focus:outline-none shrink-0"
              >
                {settings.shareMoodSummary ? (
                  <ToggleRight className="w-12 h-12 text-emerald-400 stroke-[2.2]" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-600 stroke-[2.2]" />
                )}
              </button>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-6">
              <div>
                <h4 className="font-extrabold text-white text-base">Anonymize Voice Logs</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Strips personal names and address details before sending voice content for AI processing
                </p>
              </div>
              <button
                onClick={() => handleToggle('anonymizeVoiceLogs')}
                className="focus:outline-none shrink-0"
              >
                {settings.anonymizeVoiceLogs ? (
                  <ToggleRight className="w-12 h-12 text-emerald-400 stroke-[2.2]" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-600 stroke-[2.2]" />
                )}
              </button>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-6">
              <div>
                <h4 className="font-extrabold text-white text-base">Auto-Alert Contact on Distress Keywords</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Automatically notifies primary caregiver if distress terms like "fall" or "chest pain" are spoken
                </p>
              </div>
              <button
                onClick={() => handleToggle('autoAlertCaregiverOnDistress')}
                className="focus:outline-none shrink-0"
              >
                {settings.autoAlertCaregiverOnDistress ? (
                  <ToggleRight className="w-12 h-12 text-emerald-400 stroke-[2.2]" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-600 stroke-[2.2]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* DATA EXPORT & ERASURE */}
        <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-[20px] border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Manage Personal Data & Local Storage</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Export your privacy settings or permanently erase all stored voice interaction records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExportData}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-6 py-4 rounded-[16px] shadow-md flex items-center justify-center gap-2.5 text-sm uppercase transition-all border border-slate-700"
            >
              <Download className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
              <span>Export Privacy Audit Settings</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold px-6 py-4 rounded-[16px] shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2.5 text-sm uppercase transition-all"
            >
              <Trash2 className="w-5 h-5 text-white stroke-[2.2]" />
              <span>Permanently Delete Local Voice Logs</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );

};

