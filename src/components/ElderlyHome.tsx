import React, { useState, useEffect, useRef } from 'react';
import { SeniorProfile, CheckInItem, VoiceConversationMessage, TextScale, SUPPORTED_LANGUAGES, CaregiverNotification } from '../types';
import { Mic, MicOff, Volume2, CheckCircle2, Circle, Phone, Sparkles, Smile, Frown, Meh, AlertTriangle, Clock, RefreshCw, Send, Sun, HeartHandshake, Stethoscope, Thermometer, ShieldAlert, Globe, Lock, BarChart3, Pill, Heart, ArrowUpRight, FileText } from 'lucide-react';
import { speakText, stopSpeaking, getSpeechRecognition } from '../utils/speech';
import { validateTaskTime } from '../utils/timeValidation';
import { MedicationModule } from './MedicationModule';
import { ProactiveCheckIn } from './ProactiveCheckIn';
import { SpeechMonitoringModule } from './SpeechMonitoringModule';
import { MemoryExercisesModule } from './MemoryExercisesModule';
import { ProactiveNotificationBanner } from './ProactiveNotificationBanner';
import { HealthMetricsDashboard } from './HealthMetricsDashboard';
import { AICompanionModule } from './AICompanionModule';
import { HealthcareWidgetSuite } from './HealthcareWidgetSuite';


interface ElderlyHomeProps {
  profile: SeniorProfile;
  checkInItems: CheckInItem[];
  onToggleCheckIn: (id: string) => void;
  onEscalateMissedTask?: (item: CheckInItem) => void;
  conversationHistory: VoiceConversationMessage[];
  onSendMessage: (text: string) => Promise<void>;
  textScale: TextScale;
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
}

export const ElderlyHome: React.FC<ElderlyHomeProps> = ({
  profile,
  checkInItems,
  onToggleCheckIn,
  onEscalateMissedTask,
  conversationHistory,
  onSendMessage,
  textScale,
  selectedLanguage = 'en-US',
  onChangeLanguage,
  onTriggerSOS,
  isProcessingAi,
  isSpeaking = false,
  onStopSpeaking,
  taskWarningNotice,
  onDismissTaskWarning,
  onNavigateToCaregiver,
  notifications = [],
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'talk_ai' | 'medicine' | 'health_check' | 'reports' | 'emergency'>('all');
  const [isListening, setIsListening] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [manualText, setManualText] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [micErrorNotice, setMicErrorNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Text scaling class mapping
  const getTextSize = (type: 'title' | 'body' | 'large') => {
    if (textScale === 'extra') {
      if (type === 'title') return 'text-4xl md:text-5xl';
      if (type === 'large') return 'text-2xl md:text-3xl';
      return 'text-xl md:text-2xl';
    }
    if (textScale === 'large') {
      if (type === 'title') return 'text-3xl md:text-4xl';
      if (type === 'large') return 'text-xl md:text-2xl';
      return 'text-lg md:text-xl';
    }
    // Normal scale
    if (type === 'title') return 'text-2xl md:text-3xl';
    if (type === 'large') return 'text-lg md:text-xl';
    return 'text-base md:text-lg';
  };

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, isProcessingAi, isSpeaking]);

  // Hands-free auto relisten trigger after AI finishes speaking
  const wasSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    if (wasSpeakingRef.current && !isSpeaking && handsFreeMode && !isListening && !isProcessingAi) {
      // Small pause before restarting listening so senior can speak again
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
          } catch (e) {
            console.warn('Error parsing speech recognition transcript:', e);
          }
        };

        recognition.onerror = (event: any) => {
          try {
            console.warn('Speech recognition error:', event?.error);
            setIsListening(false);
          } catch (e) {
            console.warn('Error in recognition.onerror:', e);
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
            console.warn('Error in recognition.onend:', e);
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn('Error setting up speech recognition:', err);
    }
  }, [onSendMessage, selectedLanguage]);

  // Localized prompt options generator
  const getLocalizedPrompts = (langCode: string) => {
    const code = langCode || 'en-US';
    if (code.startsWith('te')) {
      return [
        { text: "నాకు ఈ రోజు చాలా చలిగా అనిపిస్తోంది", label: "🥶 \"నాకు చాలా చలిగా ఉంది\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
        { text: "నా గొంతు కాస్త నెప్పిగా ఉంది, దగ్గు వస్తోంది", label: "🗣️ \"నా గొంతు నెప్పిగా ఉంది\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
        { text: "నేను ఉదయం వేసుకోవాల్సిన మందులు వేసుకున్నాను!", label: "💊 \"నేను మందులు వేసుకున్నాను\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
        { text: "నిలబడినప్పుడు నాకు కాస్త కళ్లు తిరుగుతున్నాయి", label: "💫 \"నాకు కళ్లు తిరుగుతున్నాయి\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
      ];
    }
    if (code.startsWith('es')) {
      return [
        { text: "Tengo frío y escalofríos hoy", label: "🥶 \"Tengo frío y escalofríos\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
        { text: "Me duele un poco la garganta y tengo tos", label: "🗣️ \"Me duele la garganta\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
        { text: "¡Ya tomé mi medicina de la mañana y tomé agua!", label: "💊 \"Ya tomé mi medicina\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
        { text: "Me siento un poco mareado y desorientado al levantarme", label: "💫 \"Me siento mareado o inestable\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
      ];
    }
    if (code.startsWith('fr')) {
      return [
        { text: "J'ai très froid et des frissons aujourd'hui", label: "🥶 \"J'ai froid et des frissons\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
        { text: "J'ai un peu mal à la gorge et je tousse", label: "🗣️ \"J'ai mal à la gorge\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
        { text: "J'ai bien pris mes médicaments de ce matin", label: "💊 \"J'ai pris mes médicaments\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
        { text: "Je me sens un peu étourdi en me levant", label: "💫 \"Je me sens étourdi\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
      ];
    }
    if (code.startsWith('hi')) {
      return [
        { text: "मुझे आज ठंड और कपकपी लग रही है", label: "🥶 \"मुझे ठंड लग रही है\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
        { text: "मेरे गले में थोड़ा दर्द और खराश है", label: "🗣️ \"गले में दर्द है\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
        { text: "मैंने सुबह की दवा और पानी ले लिया है!", label: "💊 \"दवा ले ली है\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
        { text: "मुझे खड़े होने पर थोड़ा चक्कर आ रहा है", label: "💫 \"थोड़ा चक्कर आ रहा है\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
      ];
    }
    if (code.startsWith('zh')) {
      return [
        { text: "我今天感觉有点冷、发抖", label: "🥶 \"我今天感觉有点冷\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
        { text: "我喉咙有点痛，还有点咳嗽", label: "🗣️ \"我喉咙有点痛\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
        { text: "我今天早上的药已经吃了！", label: "💊 \"早上的药已经吃了\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
        { text: "我站起来时感觉有点头晕", label: "💫 \"感觉有点头晕\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
      ];
    }
    if (code.startsWith('de')) {
      return [
        { text: "Mir ist heute sehr kalt und ich friere", label: "🥶 \"Mir ist heute kalt\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
        { text: "Mein Hals tut etwas weh und ich huste", label: "🗣️ \"Mein Hals tut weh\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
        { text: "Ich habe meine Morgenmedikamente genommen!", label: "💊 \"Medikamente genommen\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
        { text: "Mir ist etwas schwindelig beim Aufstehen", label: "💫 \"Mir ist schwindelig\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
      ];
    }
    if (code.startsWith('tl')) {
      return [
        { text: "Medyo ginaw at malamig ang pakiramdam ko ngayon", label: "🥶 \"Medyo malamig ang pakiramdam ko\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
        { text: "Masakit ang lalamunan ko at may ubo ako", label: "🗣️ \"Masakit ang lalamunan ko\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
        { text: "Naiinom ko na ang gamot ko ngayong umaga!", label: "💊 \"Naiinom ko na ang gamot ko\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
        { text: "Medyo nahihilo ako kapag tumatayo", label: "💫 \"Medyo nahihilo ako\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
      ];
    }
    return [
      { text: "I am feeling cold and chilly today", label: "🥶 \"I am feeling cold and chilly\"", icon: Thermometer, color: "bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200" },
      { text: "My throat feels a bit sore and I have a cough", label: "🗣️ \"My throat feels a bit sore\"", icon: Stethoscope, color: "bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200" },
      { text: "I took my morning medicine and drank water!", label: "💊 \"I took my morning medicine\"", icon: CheckCircle2, color: "bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200" },
      { text: "I feel a bit dizzy and lightheaded when standing", label: "💫 \"I feel a bit dizzy or unsteady\"", icon: ShieldAlert, color: "bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200" },
    ];
  };

  const localizedPrompts = getLocalizedPrompts(selectedLanguage);

  const handleToggleListening = () => {
    setMicErrorNotice(null);

    if (onStopSpeaking && isSpeaking) {
      onStopSpeaking();
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping speech recognition:', e);
        }
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

    // Always re-initialize speech recognition instance with selectedLanguage
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
        } catch (e) {
          console.warn('Error parsing speech recognition result in handleToggleListening:', e);
        }
      };

      rec.onerror = (event: any) => {
        try {
          console.warn('Speech recognition error:', event?.error);
          const errType = event?.error || '';
          setIsListening(false);

          if (errType === 'not-allowed' || errType === 'service-not-allowed') {
            setMicErrorNotice('Microphone access blocked. Please click the mic icon in your browser address bar to allow microphone access.');
          } else if (errType === 'no-speech') {
            setMicErrorNotice('No speech was detected. Tap the microphone button again and speak clearly.');
          } else if (errType === 'network') {
            setMicErrorNotice('Network error with speech engine. You can tap quick prompts or type below.');
          } else if (errType !== 'aborted') {
            setMicErrorNotice(`Speech status: ${errType || 'Unable to start recording'}. Retry mic or tap prompts below.`);
          }
        } catch (e) {
          console.warn('Error handling speech recognition error:', e);
          setIsListening(false);
        }
      };

      rec.onend = () => {
        try {
          setIsListening(false);
          const finalSpeakerText = (latestTranscriptRef.current || '').trim();
          latestTranscriptRef.current = '';
          setVoiceInputText('');
          if (finalSpeakerText && typeof onSendMessage === 'function') {
            onSendMessage(finalSpeakerText);
          }
        } catch (e) {
          console.warn('Error in rec.onend in handleToggleListening:', e);
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
      try {
        rec.start();
        setIsListening(true);
      } catch (err: any) {
        console.warn('Error starting speech recognition:', err);
        setIsListening(false);
        setMicErrorNotice('Could not initialize microphone. Tap retry or select a prompt below.');
      }
    } else {
      // Fallback state if Web Speech API is not supported in current browser context
      setIsListening(true);
      setMicErrorNotice('Web Speech API is running in fallback mode in this browser environment. Tap any sample prompt button or type below.');
      setVoiceInputText(
        selectedLanguage.startsWith('te')
          ? 'వినబడుతోంది... (మాట్లాడండి లేదా ఉదాహరణ బటన్ నొక్కండి)'
          : 'Listening... (Speak clearly or tap prompt buttons below)'
      );
    }
  };

  const handleSendManual = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = voiceInputText || manualText;
    if (textToSend.trim()) {
      onSendMessage(textToSend);
      setVoiceInputText('');
      setManualText('');
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    stopSpeaking();
    onSendMessage(promptText);
  };

  // Format time display
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Calculate completed check-ins
  const completedCount = checkInItems.filter(i => i.completed).length;
  const totalCount = checkInItems.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white py-10 px-6 sm:px-12 border-b border-emerald-900/50 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-extrabold border border-emerald-500/30 shadow-inner">
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>Voice Assistant Connected & Synced</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
              Good Day, {profile.preferredName}.
            </h2>
            <p className="text-xl sm:text-2xl font-medium text-slate-300 tracking-tight">
              {dateString}
            </p>
          </div>

          {/* Senior Digital Clock & Progress Block */}
          <div className="flex flex-wrap items-center gap-6 bg-slate-900/80 p-5 rounded-[22px] border border-emerald-500/30 shadow-2xl shrink-0 backdrop-blur-md">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight font-mono">
                {timeString}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Local Time</div>
            </div>
            <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>
            <div className="bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-2xl font-black text-white">
                {completedCount}/{totalCount}
              </div>
              <div className="text-xs font-semibold uppercase text-slate-400">Routines Done</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* PROACTIVE REMINDER & NOTIFICATION SYSTEM BANNER */}
        <ProactiveNotificationBanner
          seniorName={profile.preferredName}
          checkInItems={checkInItems}
          onToggleCheckIn={onToggleCheckIn}
          onEscalateMissedTask={onEscalateMissedTask}
          selectedLanguage={selectedLanguage}
          isSpeaking={isSpeaking}
          onStopSpeaking={onStopSpeaking}
        />

        {/* HEALTH METRICS & VITALITY DASHBOARD */}
        <HealthMetricsDashboard
          seniorName={profile.preferredName}
          checkInItems={checkInItems}
          notifications={notifications}
          onTriggerSOS={onTriggerSOS}
          selectedLanguage={selectedLanguage}
          onNavigateToCaregiver={onNavigateToCaregiver}
        />

        {/* PREMIUM HEALTHCARE WIDGET SUITE */}
        <HealthcareWidgetSuite
          profile={profile}
          checkInItems={checkInItems}
          onToggleCheckIn={onToggleCheckIn}
          onTriggerSOS={onTriggerSOS}
          notifications={notifications}
          selectedLanguage={selectedLanguage}
        />

        {/* 5 PRIMARY ACCESSIBLE OPTIONS CONTROL CENTER */}
        <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-slate-200/90 shadow-lg shadow-slate-200/60 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Senior Dashboard Options</span>
              </h3>
              <p className="text-xs sm:text-sm font-extrabold text-slate-600 mt-0.5">
                High-contrast, large touch controls tailored for quick access
              </p>
            </div>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <span>← Show All Sections</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. TALK TO AI */}
            <button
              onClick={() => {
                setActiveTab('talk_ai');
                const checkMsg = selectedLanguage.startsWith('te')
                  ? "AI వాయిస్ అసిస్టెంట్‌తో మాట్లాడండి!"
                  : "Voice Companion Active. Tap microphone button to speak!";
                speakText(checkMsg, undefined, undefined, 0.9, 1.0, selectedLanguage);
              }}
              className={`p-4 rounded-[20px] border-4 text-left transition-all duration-200 flex flex-col justify-between gap-3 shadow-md active:scale-98 ${
                activeTab === 'talk_ai'
                  ? 'bg-slate-950 border-emerald-400 text-white ring-4 ring-emerald-200/80 shadow-emerald-950/30'
                  : 'bg-slate-900 hover:bg-slate-850 border-emerald-500/80 text-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-md">
                  Multilingual
                </span>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1">
                  <span>🎙️ Talk to AI</span>
                </h4>
                <p className="text-xs font-semibold text-emerald-200/90 leading-snug mt-0.5">
                  Voice companion, symptoms & audio
                </p>
              </div>
            </button>

            {/* 2. MEDICINE */}
            <button
              onClick={() => {
                setActiveTab('medicine');
                speakText("Medication tracker and time validated schedule open.", undefined, undefined, 0.9, 1.0, selectedLanguage);
              }}
              className={`p-4 rounded-[20px] border-4 text-left transition-all duration-200 flex flex-col justify-between gap-3 shadow-md active:scale-98 ${
                activeTab === 'medicine'
                  ? 'bg-slate-950 border-sky-400 text-white ring-4 ring-sky-200/80 shadow-sky-950/30'
                  : 'bg-slate-900 hover:bg-slate-850 border-sky-500/80 text-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/50 flex items-center justify-center shrink-0">
                  <Pill className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-300 text-slate-950 px-2 py-0.5 rounded-md">
                  Time-Bound
                </span>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1">
                  <span>💊 Medicine</span>
                </h4>
                <p className="text-xs font-semibold text-sky-200/90 leading-snug mt-0.5">
                  Medication schedule & locked tasks
                </p>
              </div>
            </button>

            {/* 3. HEALTH CHECK */}
            <button
              onClick={() => {
                setActiveTab('health_check');
                speakText("Daily health check-in and vitals open.", undefined, undefined, 0.9, 1.0, selectedLanguage);
              }}
              className={`p-4 rounded-2xl border-4 text-left transition-all duration-200 flex flex-col justify-between gap-3 shadow-md active:scale-98 ${
                activeTab === 'health_check'
                  ? 'bg-emerald-950 border-emerald-400 text-white ring-4 ring-emerald-200/80 shadow-emerald-900/20'
                  : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-400/80 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center justify-center shrink-0">
                  <Heart className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-md">
                  Vitals
                </span>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1">
                  <span>❤️ Health Check</span>
                </h4>
                <p className="text-xs font-semibold text-emerald-200/90 leading-snug mt-0.5">
                  Mood, wellness & daily check-in
                </p>
              </div>
            </button>

            {/* 4. REPORTS */}
            <button
              onClick={() => {
                setActiveTab('reports');
                speakText("Daily summary reports and caregiver log open.", undefined, undefined, 0.9, 1.0, selectedLanguage);
              }}
              className={`p-4 rounded-2xl border-4 text-left transition-all duration-200 flex flex-col justify-between gap-3 shadow-md active:scale-98 ${
                activeTab === 'reports'
                  ? 'bg-purple-950 border-purple-400 text-white ring-4 ring-purple-200/80 shadow-purple-900/20'
                  : 'bg-purple-950 hover:bg-purple-900 border-purple-400/80 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/50 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-300 text-slate-950 px-2 py-0.5 rounded-md">
                  Synced Logs
                </span>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1">
                  <span>📊 Reports</span>
                </h4>
                <p className="text-xs font-semibold text-purple-200/90 leading-snug mt-0.5">
                  Daily summary & caregiver link
                </p>
              </div>
            </button>

            {/* 5. EMERGENCY */}
            <button
              onClick={() => {
                setActiveTab('emergency');
                onTriggerSOS();
                speakText("Emergency SOS activated! Notifying guardian and contacts immediately.", undefined, undefined, 1.0, 1.1, selectedLanguage);
              }}
              className={`p-4 rounded-2xl border-4 text-left transition-all duration-200 flex flex-col justify-between gap-3 shadow-xl active:scale-95 ${
                activeTab === 'emergency'
                  ? 'bg-rose-700 border-rose-200 text-white ring-4 ring-rose-300'
                  : 'bg-rose-600 hover:bg-rose-700 border-rose-300 text-white animate-pulse'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-rose-950 text-rose-200 border border-rose-400/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-7 h-7 stroke-[2.8]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-rose-950 px-2 py-0.5 rounded-md">
                  One-Tap SOS
                </span>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1">
                  <span>🚨 Emergency</span>
                </h4>
                <p className="text-xs font-semibold text-rose-100 leading-snug mt-0.5">
                  Instant guardian alert & dial
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* DEDICATED REPORTS SECTION (When Reports active or All) */}
        {(activeTab === 'all' || activeTab === 'reports') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    📊 Senior Daily Health Summary & Synced Logs
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    Real-time activity logs, symptom detection, and guardian synchronization
                  </p>
                </div>
              </div>

              {onNavigateToCaregiver && (
                <button
                  onClick={onNavigateToCaregiver}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
                >
                  <span>Open Guardian/Caregiver Dashboard</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200/80 space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-wider text-purple-800">
                  Routine Checklist
                </div>
                <div className="text-3xl font-black text-purple-950">
                  {completedCount} / {totalCount} Done
                </div>
                <p className="text-[11px] font-bold text-purple-700">
                  {completedCount === totalCount ? '✓ All daily tasks completed!' : `${totalCount - completedCount} tasks remaining today`}
                </p>
              </div>

              <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                  AI Voice Exchanges
                </div>
                <div className="text-3xl font-black text-teal-950">
                  {conversationHistory.length} Messages
                </div>
                <p className="text-[11px] font-bold text-teal-700">
                  Active voice companion streaming
                </p>
              </div>

              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                  Detected Health Flags
                </div>
                <div className="text-3xl font-black text-amber-950">
                  {conversationHistory.filter(m => m.symptomDetected).length} Symptoms
                </div>
                <p className="text-[11px] font-bold text-amber-800">
                  Synced to Caregiver alerts
                </p>
              </div>
            </div>

            {/* Recent Symptom Logs */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Logged Symptoms & Vocal Tone Records Today</span>
                <span className="text-[10px] text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Encrypted Sync Active
                </span>
              </h4>

              <div className="space-y-2">
                {conversationHistory.filter(m => m.symptomDetected).length === 0 ? (
                  <p className="text-xs font-medium text-slate-500 italic p-2">
                    No acute symptoms reported today. Senior health status is stable.
                  </p>
                ) : (
                  conversationHistory
                    .filter(m => m.symptomDetected)
                    .map(m => (
                      <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200/90 text-xs flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            Symptom: {m.symptomDetected}
                          </span>
                          <p className="font-medium text-slate-800 text-[11px] mt-1">"{m.text}"</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold shrink-0">{m.timestamp}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT MAIN COLUMN: Voice Companion Interface (7 cols) */}
          {(activeTab === 'all' || activeTab === 'talk_ai') && (
            <section className={`${activeTab === 'talk_ai' ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col gap-8`}>
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
              />
            </section>
          )}

          {/* RIGHT COLUMN: Daily Schedule, Health Check & Emergency Quick Dial */}
          <section className={`${activeTab !== 'all' && activeTab !== 'talk_ai' ? 'lg:col-span-12' : 'lg:col-span-5'} flex flex-col gap-8`}>

            {/* Quick Mood Check-In Widget (Health Check) */}
            {(activeTab === 'all' || activeTab === 'health_check') && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className={`${getTextSize('large')} font-bold text-slate-900 flex items-center gap-2.5`}>
                  <HeartHandshake className="w-6 h-6 text-teal-600 stroke-[2.2]" />
                  <span>How are you feeling right now?</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleQuickPrompt("I am feeling happy and energetic right now!")}
                    className="p-3.5 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Smile className="w-8 h-8 text-emerald-600 stroke-[2.2]" />
                    <span className="font-bold text-emerald-950 text-sm">Feeling Great</span>
                  </button>

                  <button
                    onClick={() => handleQuickPrompt("I am feeling okay and calm right now.")}
                    className="p-3.5 bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/80 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Meh className="w-8 h-8 text-sky-600 stroke-[2.2]" />
                    <span className="font-bold text-sky-950 text-sm">Feeling Okay</span>
                  </button>

                  <button
                    onClick={() => handleQuickPrompt("I feel a little tired and slow today.")}
                    className="p-3.5 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Frown className="w-8 h-8 text-amber-600 stroke-[2.2]" />
                    <span className="font-bold text-amber-950 text-sm">A Bit Tired</span>
                  </button>

                  <button
                    onClick={onTriggerSOS}
                    className="p-3.5 bg-rose-50/90 hover:bg-rose-100 border border-rose-200 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <AlertTriangle className="w-8 h-8 text-rose-600 stroke-[2.2]" />
                    <span className="font-bold text-rose-900 text-sm">Need Help</span>
                  </button>
                </div>
              </div>
            )}

            {/* Proactive Morning & Evening Check-In Module */}
            {(activeTab === 'all' || activeTab === 'health_check') && (
              <ProactiveCheckIn seniorName={profile.preferredName || profile.name} userRole="senior" />
            )}

            {/* Interactive Medication Reminders (Medicine Tab) */}
            {(activeTab === 'all' || activeTab === 'medicine') && (
              <MedicationModule userRole="senior" />
            )}

            {/* Memory & Cognitive Exercises Module */}
            {(activeTab === 'all' || activeTab === 'health_check') && (
              <MemoryExercisesModule seniorName={profile.preferredName || profile.name} userRole="senior" />
            )}

            {/* Speech Cadence & Acoustic Monitoring Module */}
            {(activeTab === 'all' || activeTab === 'health_check') && (
              <SpeechMonitoringModule seniorName={profile.preferredName || profile.name} userRole="senior" />
            )}

            {/* Daily Schedule & Medication Checklist (Medicine Tab) */}
            {(activeTab === 'all' || activeTab === 'medicine') && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className={`${getTextSize('large')} font-bold text-slate-900 flex items-center gap-2.5`}>
                    <Clock className="w-6 h-6 text-teal-600 stroke-[2.2]" />
                    <span>Today's Check-Ins</span>
                  </h3>
                  <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-200">
                    Time-validated completion
                  </span>
                </div>

                {/* Premature Task Warning Toast Alert */}
                {taskWarningNotice && (
                  <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 font-bold text-xs sm:text-sm animate-fade-in shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>{taskWarningNotice}</span>
                    </div>
                    {onDismissTaskWarning && (
                      <button
                        onClick={onDismissTaskWarning}
                        className="bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 self-end sm:self-auto"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {checkInItems.map((item) => {
                    const timeVal = validateTaskTime(item.scheduledTime);
                    const isFuture = !item.completed && timeVal.isFuture;
                    const isMissed = !item.completed && item.isMissed;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                          item.completed
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : isMissed
                            ? 'bg-rose-50/50 border-rose-300'
                            : isFuture
                            ? 'bg-slate-50/90 border-slate-200/90'
                            : 'bg-white border-slate-200/90 hover:border-teal-300'
                        }`}
                      >
                        <button
                          onClick={() => onToggleCheckIn(item.id)}
                          className="mt-0.5 focus:outline-none shrink-0"
                          title={item.completed ? 'Mark as pending' : isFuture ? 'Locked until scheduled time' : 'Mark as completed'}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-7 h-7 text-emerald-600 fill-emerald-100 stroke-[2.2]" />
                          ) : isFuture ? (
                            <div className="w-7 h-7 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-500">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          ) : isMissed ? (
                            <div className="w-7 h-7 rounded-full bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-rose-700">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : (
                            <Circle className="w-7 h-7 text-slate-400 hover:text-emerald-600 stroke-[2.2]" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              ⏰ {item.scheduledTime}
                            </span>
                            {item.completedAt && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                                Done {item.completedAt}
                              </span>
                            )}
                            {isFuture && (
                              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                                <Lock className="w-3 h-3 text-amber-700" />
                                Locked until {item.scheduledTime}
                              </span>
                            )}
                            {isMissed && (
                              <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Overdue Task
                              </span>
                            )}
                          </div>

                          <h4 className={`${getTextSize('body')} font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {item.title}
                          </h4>

                          {item.dosageOrDetails && (
                            <p className="text-xs font-medium text-slate-600">
                              {item.dosageOrDetails}
                            </p>
                          )}

                          {item.audioPrompt && (
                            <button
                              onClick={() => speakText(item.audioPrompt || item.title)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline mt-1"
                            >
                              <Volume2 className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>Listen Audio</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Family Contacts Dialing Card (Emergency Tab) */}
            {(activeTab === 'all' || activeTab === 'emergency') && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                  <h3 className={`${getTextSize('large')} font-bold text-slate-900 flex items-center gap-2.5`}>
                    <Phone className="w-6 h-6 text-rose-600 stroke-[2.2]" />
                    <span>Quick Call Emergency Contacts</span>
                  </h3>
                  <span className="bg-rose-100 text-rose-900 text-xs font-black px-2.5 py-1 rounded-full border border-rose-200">
                    24/7 Guardian Linked
                  </span>
                </div>

                <div className="space-y-3">
                  {profile.emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        {contact.photoUrl ? (
                          <img
                            src={contact.photoUrl}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base">
                            {contact.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {contact.name}
                          </h4>
                          <p className="text-xs font-medium text-slate-500">
                            {contact.relationship}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${contact.phone}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-sm text-xs flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Call Now</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
};
