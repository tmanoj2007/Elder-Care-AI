import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewMode, TextScale, SUPPORTED_LANGUAGES } from '../types';
import { Heart, ShieldCheck, Activity, PhoneCall, Volume2, Globe, Users, Sparkles, Menu, X, ChevronRight, VolumeX, Eye } from 'lucide-react';
import { speakText } from '../utils/speech';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ViewMode) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  const speakHeaderSummary = () => {
    let msg = '';
    if (currentView === 'elderly') {
      msg = selectedLanguage.startsWith('te')
        ? 'మీరు ఇప్పుడు సీనియర్ హెల్త్ మరియు వాయిస్ అసిస్టెంట్ హోమ్ లో ఉన్నారు.'
        : selectedLanguage.startsWith('hi')
        ? 'आप अभी सीनियर हेल्थ और वॉयस असिस्टेंट होम पर हैं।'
        : selectedLanguage.startsWith('es')
        ? 'Estás en el panel de salud senior y asistente de voz.'
        : 'You are currently on the Senior Health Home and Voice Companion Dashboard.';
    } else if (currentView === 'caregiver') {
      msg = 'Caregiver Portal with real-time alerts and senior health monitoring.';
    } else if (currentView === 'privacy') {
      msg = 'Privacy and Security Settings. Your health data is securely encrypted.';
    } else {
      msg = 'Welcome Page. Select your role to get started.';
    }
    speakText(msg, undefined, undefined, 0.9, 1.0, selectedLanguage);
  };

  return (
    <header className="bg-slate-950 text-white sticky top-0 z-40 border-b-2 border-slate-800 shadow-xl shadow-slate-950/40">
      {/* Top Bar: Brand, Text Scaling, Voice Guide & SOS Emergency */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Platform Title */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => handleNavClick('welcome')}
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-300 shrink-0">
            <Heart className="w-6 h-6 fill-white/20 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                ElderCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">AI</span>
              </h1>
              <span className="hidden xs:inline-flex bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-400/40 items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Voice Assistant</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold hidden md:block">
              Accessible Senior Healthcare & Vitality Network
            </p>
          </div>
        </motion.div>

        {/* Right Desktop Controls, Voice Guide & SOS */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Voice Page Assistant Reader Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={speakHeaderSummary}
            className="hidden sm:flex items-center gap-1.5 bg-teal-900/80 hover:bg-teal-800 text-teal-200 border-2 border-teal-500/60 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-sm shrink-0 min-h-[44px]"
            title="Read Current View Out Loud"
          >
            <Volume2 className="w-4 h-4 text-teal-300 stroke-[2.5]" />
            <span className="hidden lg:inline">Read Screen Aloud</span>
          </motion.button>

          {/* Active Audio Speaking Indicator & Stop Button */}
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStopSpeaking}
              className="flex items-center gap-2 bg-amber-500/20 text-amber-200 border-2 border-amber-400/80 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all hover:bg-amber-500/30 shadow-sm shrink-0 min-h-[44px]"
              title="Stop Audio"
            >
              <VolumeX className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden lg:inline">Stop Audio</span>
            </motion.button>
          )}

          {/* Multilingual Voice Language Selector Dropdown */}
          <div className="hidden sm:flex bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 items-center gap-2 shadow-sm text-xs sm:text-sm hover:border-emerald-400 transition-all min-h-[44px]">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
            <select
              value={selectedLanguage}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer pr-1 text-xs sm:text-sm max-w-[130px] lg:max-w-[180px] truncate"
              title="Select AI Spoken Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white font-bold">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* High-Visibility Text Size Toggle */}
          <div className="hidden lg:flex bg-slate-900 p-1 rounded-xl items-center border-2 border-slate-700 min-h-[44px]">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => onChangeTextScale('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                textScale === 'normal' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Standard Text Size"
            >
              A
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => onChangeTextScale('large')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                textScale === 'large' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Large Senior Text Size"
            >
              A+
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => onChangeTextScale('extra')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                textScale === 'extra' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Extra Large Text Size"
            >
              A++
            </motion.button>
          </div>

          {/* High Visibility SOS Emergency Call Button */}
          <div className="relative shrink-0">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-1 bg-rose-500 rounded-2xl blur-xs pointer-events-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={onTriggerSOS}
              id="sos-button"
              className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black px-4 py-2.5 rounded-xl text-sm sm:text-base border-2 border-rose-300 shadow-xl shadow-rose-950/60 transition-all duration-200 min-h-[48px]"
              title="Trigger Emergency Call"
            >
              <PhoneCall className="w-5 h-5 stroke-[2.8] animate-pulse" />
              <span>SOS Emergency</span>
            </motion.button>
          </div>

          {/* Mobile Drawer Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl border-2 border-slate-700 shadow-sm flex items-center justify-center shrink-0 min-w-[48px] min-h-[48px]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7 text-white" /> : <Menu className="w-7 h-7 text-white" />}
          </motion.button>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:block bg-slate-900 border-t-2 border-slate-800 px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleNavClick('welcome')}
            id="nav-welcome-roles"
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black transition-all duration-200 text-sm sm:text-base shrink-0 min-h-[50px] border-2 ${
              currentView === 'welcome'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-5 h-5 stroke-[2.5]" />
            <span>Welcome / Role</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleNavClick('elderly')}
            id="nav-elderly-home"
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black transition-all duration-200 text-sm sm:text-base shrink-0 min-h-[50px] border-2 ${
              currentView === 'elderly'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className="w-5 h-5 stroke-[2.5]" />
            <span>Senior Home</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleNavClick('caregiver')}
            id="nav-caregiver-dashboard"
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black transition-all duration-200 text-sm sm:text-base relative shrink-0 min-h-[50px] border-2 ${
              currentView === 'caregiver'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-5 h-5 stroke-[2.5]" />
            <span>Caregiver Portal</span>
            {unreadAlertCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full border border-white animate-pulse ml-1">
                {unreadAlertCount}
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleNavClick('privacy')}
            id="nav-privacy-security"
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black transition-all duration-200 text-sm sm:text-base shrink-0 min-h-[50px] border-2 ${
              currentView === 'privacy'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <span>Privacy & Security</span>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-slate-950 border-t-2 border-slate-800 px-4 py-5 space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 pb-1">
                Navigation Menu
              </div>
              <button
                onClick={() => handleNavClick('welcome')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-black text-base transition-all min-h-[52px] border-2 ${
                  currentView === 'welcome'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <span>Welcome / Role Selection</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => handleNavClick('elderly')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-black text-base transition-all min-h-[52px] border-2 ${
                  currentView === 'elderly'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-emerald-400" />
                  <span>Senior Home Dashboard</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => handleNavClick('caregiver')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-black text-base transition-all min-h-[52px] border-2 ${
                  currentView === 'caregiver'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-emerald-400" />
                  <span>Caregiver Portal</span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadAlertCount > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                      {unreadAlertCount}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </button>

              <button
                onClick={() => handleNavClick('privacy')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-black text-base transition-all min-h-[52px] border-2 ${
                  currentView === 'privacy'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>Privacy & Security Settings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Mobile Accessibility & Language Controls */}
            <div className="pt-3 border-t-2 border-slate-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-2">
                Preferences & Voice Controls
              </div>

              <button
                onClick={speakHeaderSummary}
                className="w-full bg-teal-950 text-teal-200 p-3.5 rounded-2xl border-2 border-teal-500/60 font-black text-sm flex items-center gap-3 justify-center min-h-[50px]"
              >
                <Volume2 className="w-5 h-5 text-teal-400" />
                <span>Read Screen Aloud</span>
              </button>

              <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-2xl border-2 border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <span>Language</span>
                </div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => onChangeLanguage(e.target.value)}
                  className="bg-slate-800 text-white font-extrabold p-2 rounded-xl text-xs sm:text-sm border-2 border-slate-700"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-2xl border-2 border-slate-800">
                <span className="text-sm font-bold text-slate-200">Text Scale</span>
                <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                  <button
                    onClick={() => onChangeTextScale('normal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      textScale === 'normal' ? 'bg-emerald-500 text-white' : 'text-slate-300'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => onChangeTextScale('large')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      textScale === 'large' ? 'bg-emerald-500 text-white' : 'text-slate-300'
                    }`}
                  >
                    A+
                  </button>
                  <button
                    onClick={() => onChangeTextScale('extra')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      textScale === 'extra' ? 'bg-emerald-500 text-white' : 'text-slate-300'
                    }`}
                  >
                    A++
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


