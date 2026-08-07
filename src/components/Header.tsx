import React from 'react';
import { ViewMode, TextScale, SUPPORTED_LANGUAGES } from '../types';
import { Heart, ShieldCheck, Activity, PhoneCall, Volume2, VolumeX, ZoomIn, ZoomOut, Users, Globe } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  textScale: TextScale;
  onChangeTextScale: (scale: TextScale) => void;
  selectedLanguage: string;
  onChangeLanguage: (langCode: string) => void;
  onTriggerSOS: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  unreadAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  textScale,
  onChangeTextScale,
  selectedLanguage,
  onChangeLanguage,
  onTriggerSOS,
  isSpeaking,
  onStopSpeaking,
  unreadAlertCount,
}) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm">
      {/* Top Bar: Brand, Text Scaling & SOS Emergency */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            <Heart className="w-6 h-6 fill-white/20 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                ElderCare <span className="text-teal-400">AI</span>
              </h1>
              <span className="bg-teal-500/15 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-500/30">
                Voice Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Senior Wellness & Aging-in-Place Platform
            </p>
          </div>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Active Audio Speaking Indicator */}
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:bg-amber-500/30 animate-pulse"
              title="Stop Companion Audio"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Speaking... Tap to Mute</span>
            </button>
          )}

          {/* Multilingual Voice Language Selector Dropdown */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-sm text-xs">
            <Globe className="w-4 h-4 text-teal-400 shrink-0 stroke-[2.2]" />
            <select
              value={selectedLanguage}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1 text-xs"
              title="Select AI Spoken & Recognition Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Text Size Scale Toggle */}
          <div className="bg-slate-800/80 p-1 rounded-xl flex items-center border border-slate-700/80">
            <button
              onClick={() => onChangeTextScale('normal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                textScale === 'normal' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Standard Text Size"
            >
              A
            </button>
            <button
              onClick={() => onChangeTextScale('large')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                textScale === 'large' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Large Senior Text Size"
            >
              A+
            </button>
            <button
              onClick={() => onChangeTextScale('extra')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                textScale === 'extra' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Extra Large Text Size"
            >
              A++
            </button>
          </div>

          {/* SOS Emergency Call Button */}
          <button
            onClick={onTriggerSOS}
            id="sos-button"
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold px-4 py-2 rounded-xl text-sm sm:text-base border border-rose-500 shadow-md shadow-rose-900/30 transition-all active:scale-95"
            title="Trigger Emergency Call to Family & Caregiver"
          >
            <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse stroke-[2.5]" />
            <span>SOS Emergency</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-slate-950/80 border-t border-slate-800/60 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-around sm:justify-start gap-2 sm:gap-4">
          <button
            onClick={() => onSelectView('welcome')}
            id="nav-welcome-roles"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all text-sm sm:text-base ${
              currentView === 'welcome'
                ? 'bg-teal-600/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            <span>Welcome / Role</span>
          </button>

          <button
            onClick={() => onSelectView('elderly')}
            id="nav-elderly-home"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm sm:text-base ${
              currentView === 'elderly'
                ? 'bg-teal-600/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            <span>Senior Home</span>
          </button>

          <button
            onClick={() => onSelectView('caregiver')}
            id="nav-caregiver-dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm sm:text-base relative ${
              currentView === 'caregiver'
                ? 'bg-teal-600/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            <span>Caregiver Portal</span>
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectView('privacy')}
            id="nav-privacy-security"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm sm:text-base ${
              currentView === 'privacy'
                ? 'bg-teal-600/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            <span>Privacy & Security</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
