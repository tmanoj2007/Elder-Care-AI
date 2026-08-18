import React, { useState, useEffect, useRef } from 'react';
import {
  SeniorProfile,
  CheckInItem,
  VoiceConversationMessage,
  TextScale,
  SUPPORTED_LANGUAGES,
  CaregiverNotification,
  AIProvider
} from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Heart,
  Pill,
  Brain,
  BarChart3,
  Settings as SettingsIcon,
  PhoneCall,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Cpu,
  Globe,
  Smile,
  Meh,
  Frown,
  Activity
} from 'lucide-react';
import { speakText, stopSpeaking, getSpeechRecognition } from '../utils/speech';
import { validateTaskTime } from '../utils/timeValidation';
import { AICompanionModule } from './AICompanionModule';
import { MedicationModule } from './MedicationModule';
import { ProactiveCheckIn } from './ProactiveCheckIn';
import { SpeechMonitoringModule } from './SpeechMonitoringModule';
import { MemoryExercisesModule } from './MemoryExercisesModule';
import { HealthMetricsDashboard } from './HealthMetricsDashboard';
import { HealthcareWidgetSuite } from './HealthcareWidgetSuite';
import { ProactiveNotificationBanner } from './ProactiveNotificationBanner';
import { SettingsModal } from './SettingsModal';

interface ElderlyHomeProps {
  profile: SeniorProfile;
  checkInItems: CheckInItem[];
  onToggleCheckIn: (id: string) => void;
  onEscalateMissedTask?: (item: CheckInItem) => void;
  conversationHistory: VoiceConversationMessage[];
  onSendMessage: (text: string) => Promise<void>;
  textScale: TextScale;
  onChangeTextScale?: (scale: TextScale) => void;
  selectedLanguage?: string;
  onChangeLanguage?: (lang: string) => void;
  onTriggerSOS: () => void;
  isProcessingAi: boolean;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
  taskWarningNotice?: string | null;
  onDismissTaskWarning?: () => void;
  onNavigateToCaregiver?: () => void;
  notifications?: CaregiverNotification[];
  aiProvider?: AIProvider;
  onChangeAiProvider?: (provider: AIProvider) => void;
}

export type SeniorTab = 'companion' | 'medication' | 'health_check' | 'memory' | 'reports';

export const ElderlyHome: React.FC<ElderlyHomeProps> = ({
  profile,
  checkInItems,
  onToggleCheckIn,
  onEscalateMissedTask,
  conversationHistory,
  onSendMessage,
  textScale,
  onChangeTextScale = () => {},
  selectedLanguage = 'en-US',
  onChangeLanguage = () => {},
  onTriggerSOS,
  isProcessingAi,
  isSpeaking = false,
  onStopSpeaking,
  taskWarningNotice,
  onDismissTaskWarning,
  onNavigateToCaregiver,
  notifications = [],
  aiProvider = 'gemini',
  onChangeAiProvider = () => {},
}) => {
  // Navigation tab inside Senior Home: Default is 'companion' (primary intent)
  const [activeTab, setActiveTab] = useState<SeniorTab>('companion');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [micErrorNotice, setMicErrorNotice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hands-free auto relisten trigger
  const wasSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    if (wasSpeakingRef.current && !isSpeaking && handsFreeMode && !isListening && !isProcessingAi) {
      const relistenTimer = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            latestTranscriptRef.current = '';
            setVoiceInputText('');
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.warn('Auto relisten start error:', e);
          }
        }
      }, 1000);
      return () => clearTimeout(relistenTimer);
    }
    wasSpeakingRef.current = isSpeaking;
  }, [isSpeaking, handsFreeMode, isListening, isProcessingAi]);

  // Setup Web Speech Recognition with active language
  useEffect(() => {
    try {
      const recognition = getSpeechRecognition(selectedLanguage);
      if (recognition) {
        recognition.onresult = (event: any) => {
          try {
            if (!event || !event.results) return;
            const transcript = Array.from(event.results)
              .map((result: any) => (result && result[0] ? result[0].transcript || '' : ''))
              .join('');
            setVoiceInputText(transcript);
            latestTranscriptRef.current = transcript;
            setMicErrorNotice(null);
          } catch (e) {
            console.warn('Error parsing speech recognition transcript:', e);
          }
        };

        recognition.onerror = (event: any) => {
          try {
            console.warn('Speech recognition error:', event?.error);
            const errType = event?.error || '';
            setIsListening(false);

            if (errType === 'not-allowed' || errType === 'service-not-allowed') {
              setMicErrorNotice('Microphone access is blocked. Please allow microphone permissions in your browser.');
            } else if (errType === 'no-speech') {
              setMicErrorNotice('No voice detected. Tap microphone and speak clearly.');
            } else if (errType !== 'aborted') {
              setMicErrorNotice(`Speech status: ${errType || 'Unable to record'}. You can also type below.`);
            }
          } catch (e) {
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          try {
            setIsListening(false);
            const finalSpeakerText = (latestTranscriptRef.current || '').trim();
            latestTranscriptRef.current = '';
            setVoiceInputText('');
            if (finalSpeakerText && typeof onSendMessage === 'function') {
              onSendMessage(finalSpeakerText);
            }
          } catch (e) {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn('Error setting up speech recognition:', err);
    }
  }, [onSendMessage, selectedLanguage]);

  const handleToggleListening = () => {
    setMicErrorNotice(null);

    if (onStopSpeaking && isSpeaking) {
      onStopSpeaking();
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      const text = latestTranscriptRef.current.trim() || voiceInputText.trim();
      if (text) {
        onSendMessage(text);
        latestTranscriptRef.current = '';
        setVoiceInputText('');
      }
      return;
    }

    setVoiceInputText('');
    latestTranscriptRef.current = '';

    const rec = getSpeechRecognition(selectedLanguage);
    if (rec) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      rec.onresult = (event: any) => {
        try {
          if (!event || !event.results) return;
          const transcript = Array.from(event.results)
            .map((result: any) => (result && result[0] ? result[0].transcript || '' : ''))
            .join('');
          setVoiceInputText(transcript);
          latestTranscriptRef.current = transcript;
          setMicErrorNotice(null);
        } catch (e) {}
      };

      rec.onerror = (event: any) => {
        setIsListening(false);
        const errType = event?.error || '';
        if (errType === 'not-allowed') {
          setMicErrorNotice('Microphone access blocked. Please enable mic access.');
        } else if (errType === 'no-speech') {
          setMicErrorNotice('No speech detected. Tap mic to try again.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
        const finalSpeakerText = (latestTranscriptRef.current || '').trim();
        latestTranscriptRef.current = '';
        setVoiceInputText('');
        if (finalSpeakerText && typeof onSendMessage === 'function') {
          onSendMessage(finalSpeakerText);
        }
      };

      recognitionRef.current = rec;
      try {
        rec.start();
        setIsListening(true);
      } catch (err: any) {
        setIsListening(false);
        setMicErrorNotice('Could not start microphone. You can type your message below.');
      }
    } else {
      setIsListening(true);
      setMicErrorNotice('Speech recognition fallback active. You can type or select quick prompts.');
      setVoiceInputText('Listening... (Speak clearly or select a prompt)');
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const completedCount = checkInItems.filter((i) => i.completed).length;
  const totalCount = checkInItems.length;

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* 1. COMPACT TOP HEADER BAR */}
      <div className="bg-slate-950 text-white px-4 sm:px-8 py-5 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Senior Profile & Welcome */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-emerald-300 shrink-0">
              👵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Hello, {profile.preferredName || profile.name}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-400/40 hidden sm:inline-flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ready</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-bold">
                {dateString} • {timeString}
              </p>
            </div>
          </div>

          {/* Quick Controls: Language Badge, AI Provider, Settings Button & SOS Emergency */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Active Language Badge */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm min-h-[42px]"
              title="Change Language & Voice"
            >
              <span className="text-base">{currentLang.flag}</span>
              <span>{currentLang.nativeName}</span>
            </button>

            {/* Active AI Provider Badge */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm border min-h-[42px] ${
                aiProvider === 'ollama'
                  ? 'bg-purple-950/80 text-purple-200 border-purple-500/60 hover:bg-purple-900'
                  : 'bg-sky-950/80 text-sky-200 border-sky-500/60 hover:bg-sky-900'
              }`}
              title="Switch AI Provider (Gemini / Local Gemma 4)"
            >
              {aiProvider === 'ollama' ? (
                <>
                  <Cpu className="w-3.5 h-3.5 text-purple-300" />
                  <span>Local Gemma 4</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                  <span>Gemini</span>
                </>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-sm min-h-[42px]"
              title="Open Settings"
            >
              <SettingsIcon className="w-4 h-4 text-teal-400 stroke-[2.5]" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Instant SOS Call Button */}
            <button
              onClick={onTriggerSOS}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border-2 border-rose-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all active:scale-95 min-h-[42px]"
              title="Emergency SOS"
            >
              <PhoneCall className="w-4 h-4 stroke-[2.8] animate-pulse" />
              <span>SOS</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Proactive Notification Banner (Only if genuine alerts exist) */}
        <ProactiveNotificationBanner
          seniorName={profile.preferredName || profile.name}
          checkInItems={checkInItems}
          onToggleCheckIn={onToggleCheckIn}
          onEscalateMissedTask={onEscalateMissedTask}
          selectedLanguage={selectedLanguage}
          isSpeaking={isSpeaking}
          onStopSpeaking={onStopSpeaking}
        />

        {/* 3. COMPACT SECTION NAVIGATION TABS */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          
          {/* Tab 1: AI Companion (Primary) */}
          <button
            onClick={() => setActiveTab('companion')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'companion'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              activeTab === 'companion' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-teal-700'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <span>AI Companion (Tap to Speak)</span>
          </button>

          {/* Tab 2: Medications */}
          <button
            onClick={() => setActiveTab('medication')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'medication'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              activeTab === 'medication' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-sky-700'
            }`}>
              <Pill className="w-4 h-4" />
            </div>
            <span>Medications & Schedule ({completedCount}/{totalCount})</span>
          </button>

          {/* Tab 3: Health Check */}
          <button
            onClick={() => setActiveTab('health_check')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'health_check'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              activeTab === 'health_check' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-emerald-700'
            }`}>
              <Heart className="w-4 h-4" />
            </div>
            <span>Daily Health Check</span>
          </button>

          {/* Tab 4: Memory & Speech */}
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'memory'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              activeTab === 'memory' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-indigo-700'
            }`}>
              <Brain className="w-4 h-4" />
            </div>
            <span>Memory & Speech</span>
          </button>

          {/* Tab 5: Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'reports'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              activeTab === 'reports' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-purple-700'
            }`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span>Reports & Vitals</span>
          </button>
        </div>

        {/* 4. ACTIVE TAB DISPLAY */}
        {/* TAB 1: AI COMPANION (PRIMARY & PROMINENT) */}
        {activeTab === 'companion' && (
          <div className="space-y-6">
            <AICompanionModule
              profile={profile}
              conversationHistory={conversationHistory}
              onSendMessage={onSendMessage}
              isProcessingAi={isProcessingAi}
              isSpeaking={isSpeaking}
              onStopSpeaking={onStopSpeaking}
              isListening={isListening}
              voiceInputText={voiceInputText}
              onToggleListening={handleToggleListening}
              selectedLanguage={selectedLanguage}
              onChangeLanguage={onChangeLanguage}
              handsFreeMode={handsFreeMode}
              setHandsFreeMode={setHandsFreeMode}
              micErrorNotice={micErrorNotice}
              setMicErrorNotice={setMicErrorNotice}
              textScale={textScale}
              aiProvider={aiProvider}
              onChangeAiProvider={onChangeAiProvider}
            />

            {/* Compact Quick Health & Mood Prompt Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
                <span>Quick Health & Mood Check</span>
                <span className="text-xs text-slate-500 font-bold">One-Tap Prompt</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => onSendMessage(
                    selectedLanguage.startsWith('te')
                      ? "నేను చాలా సంతోషంగా మరియు ఉల్లాసంగా ఉన్నాను!"
                      : "I am feeling happy and well today!"
                  )}
                  className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <Smile className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Feeling Great</span>
                </button>

                <button
                  onClick={() => onSendMessage(
                    selectedLanguage.startsWith('te')
                      ? "నేను బాగానే ఉన్నాను."
                      : "I am feeling calm and peaceful."
                  )}
                  className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <Meh className="w-5 h-5 text-sky-600 shrink-0" />
                  <span>Feeling Okay</span>
                </button>

                <button
                  onClick={() => onSendMessage(
                    selectedLanguage.startsWith('te')
                      ? "నాకు కొద్దిగా నీరసంగా అనిపిస్తోంది."
                      : "I am feeling a little tired today."
                  )}
                  className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <Frown className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>A Bit Tired</span>
                </button>

                <button
                  onClick={onTriggerSOS}
                  className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Need Assistance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDICATIONS */}
        {activeTab === 'medication' && (
          <div className="space-y-6">
            <MedicationModule userRole="senior" />

            {/* Checklist items */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                  <span>Today's Medication Checklist</span>
                </h3>
                <span className="bg-sky-50 text-sky-800 text-xs font-black px-3 py-1 rounded-full border border-sky-200">
                  {completedCount}/{totalCount} Completed
                </span>
              </div>

              {taskWarningNotice && (
                <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl flex items-center justify-between text-amber-950 font-bold text-xs sm:text-sm">
                  <span>{taskWarningNotice}</span>
                  {onDismissTaskWarning && (
                    <button
                      onClick={onDismissTaskWarning}
                      className="bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2.5">
                {checkInItems.map((item) => {
                  const timeVal = validateTaskTime(item.scheduledTime);
                  const isFuture = !item.completed && timeVal.isFuture;
                  const isMissed = !item.completed && item.isMissed;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        item.completed
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isMissed
                          ? 'bg-rose-50 border-rose-300'
                          : isFuture
                          ? 'bg-slate-50 border-slate-200 opacity-80'
                          : 'bg-white border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleCheckIn(item.id)}
                          className="w-7 h-7 rounded-xl flex items-center justify-center font-black"
                        >
                          {item.completed ? (
                            <span className="text-emerald-600 text-xl">✓</span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-slate-400"></span>
                          )}
                        </button>
                        <div>
                          <p className={`font-black text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 font-bold">
                            ⏰ {item.scheduledTime} {item.dosageOrDetails ? `• ${item.dosageOrDetails}` : ''}
                          </p>
                        </div>
                      </div>

                      {item.completed ? (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                          Completed
                        </span>
                      ) : isMissed ? (
                        <span className="text-xs font-black text-rose-800 bg-rose-100 px-3 py-1 rounded-lg animate-pulse">
                          Missed
                        </span>
                      ) : (
                        <button
                          onClick={() => onToggleCheckIn(item.id)}
                          className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          Take Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEALTH CHECK */}
        {activeTab === 'health_check' && (
          <div className="space-y-6">
            <ProactiveCheckIn seniorName={profile.preferredName || profile.name} userRole="senior" />
          </div>
        )}

        {/* TAB 4: MEMORY & SPEECH */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <MemoryExercisesModule seniorName={profile.preferredName || profile.name} userRole="senior" />
            <SpeechMonitoringModule seniorName={profile.preferredName || profile.name} userRole="senior" />
          </div>
        )}

        {/* TAB 5: REPORTS & VITALS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <HealthMetricsDashboard
              seniorName={profile.preferredName || profile.name}
              checkInItems={checkInItems}
              notifications={notifications}
              onTriggerSOS={onTriggerSOS}
              selectedLanguage={selectedLanguage}
              onNavigateToCaregiver={onNavigateToCaregiver}
            />
            <HealthcareWidgetSuite
              profile={profile}
              checkInItems={checkInItems}
              onToggleCheckIn={onToggleCheckIn}
              onTriggerSOS={onTriggerSOS}
              notifications={notifications}
              selectedLanguage={selectedLanguage}
            />
          </div>
        )}

      </main>

      {/* 5. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={onChangeLanguage}
        aiProvider={aiProvider}
        onChangeAiProvider={onChangeAiProvider}
        textScale={textScale}
        onChangeTextScale={onChangeTextScale}
      />
    </div>
  );
};
