import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Send,
  Search,
  X,
  RefreshCw,
  Globe,
  ShieldAlert,
  Stethoscope,
  ChevronDown,
  Bot,
  User,
  MessageSquare,
  Copy,
  Check,
  Zap,
  VolumeX,
  Play,
  RotateCcw,
  Sparkle,
  Cpu,
  Server
} from 'lucide-react';
import { SeniorProfile, VoiceConversationMessage, TextScale, SUPPORTED_LANGUAGES, AIProvider, AI_PROVIDERS } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface AICompanionModuleProps {
  profile: SeniorProfile;
  conversationHistory: VoiceConversationMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isProcessingAi: boolean;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
  isListening: boolean;
  voiceInputText: string;
  onToggleListening: () => void;
  selectedLanguage: string;
  onChangeLanguage?: (lang: string) => void;
  handsFreeMode: boolean;
  setHandsFreeMode: (val: boolean) => void;
  micErrorNotice: string | null;
  setMicErrorNotice: (val: string | null) => void;
  textScale: TextScale;
  aiProvider?: AIProvider;
  onChangeAiProvider?: (provider: AIProvider) => void;
}

export const AICompanionModule: React.FC<AICompanionModuleProps> = ({
  profile,
  conversationHistory,
  onSendMessage,
  isProcessingAi,
  isSpeaking = false,
  onStopSpeaking,
  isListening,
  voiceInputText,
  onToggleListening,
  selectedLanguage,
  onChangeLanguage,
  handsFreeMode,
  setHandsFreeMode,
  micErrorNotice,
  setMicErrorNotice,
  textScale,
  aiProvider = 'gemini',
  onChangeAiProvider,
}) => {
  const [manualText, setManualText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update, AI processes, or speaks
  const scrollToBottom = (smooth = true) => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [conversationHistory, isProcessingAi, isSpeaking, isListening]);

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottomBtn(isUp);
  };

  // Text scaling class mapping
  const getTextSize = (type: 'title' | 'body' | 'large') => {
    if (textScale === 'extra') {
      if (type === 'title') return 'text-2xl sm:text-3xl';
      if (type === 'large') return 'text-xl sm:text-2xl';
      return 'text-lg sm:text-xl';
    }
    if (textScale === 'large') {
      if (type === 'title') return 'text-xl sm:text-2xl';
      if (type === 'large') return 'text-lg sm:text-xl';
      return 'text-base sm:text-lg';
    }
    // Normal scale
    if (type === 'title') return 'text-lg sm:text-xl';
    if (type === 'large') return 'text-base sm:text-lg';
    return 'text-sm sm:text-base';
  };

  // Filtered messages based on search
  const filteredMessages = conversationHistory.filter((msg) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.text.toLowerCase().includes(query) ||
      (msg.symptomDetected && msg.symptomDetected.toLowerCase().includes(query)) ||
      (msg.suggestedSelfCare && msg.suggestedSelfCare.toLowerCase().includes(query))
    );
  });

  // Suggested Quick Replies tailored to Senior conversation & explicit requests
  const suggestedQuickReplies = [
    { label: '💬 Hello Eleanor!', prompt: 'Hello! How are you today?' },
    { label: '📖 Tell me a story', prompt: 'Tell me an inspiring and heartwarming short story.' },
    { label: '🧘 Breathing Exercise', prompt: 'Guide me through a simple 1-minute relaxing breathing exercise.' },
    { label: '🩺 I have a headache', prompt: 'I have a slight headache. What gentle self-care steps can I take?' },
    { label: '💊 Check scheduled tasks', prompt: 'What are my scheduled tasks for today?' },
  ];

  const handleSendManualText = async () => {
    if (!manualText.trim() || isProcessingAi) return;
    const textToSend = manualText.trim();
    setManualText('');
    await onSendMessage(textToSend);
  };

  const handleQuickReplyTap = async (promptText: string) => {
    if (isProcessingAi) return;
    await onSendMessage(promptText);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status text for AI Avatar Badge
  const getAiAvatarStatus = () => {
    if (isSpeaking) return { text: 'Speaking Aloud', color: 'bg-emerald-500 text-white border-emerald-300' };
    if (isListening) return { text: 'Listening to You...', color: 'bg-rose-500 text-white border-rose-300' };
    if (isProcessingAi) return { text: 'Analyzing & Thinking...', color: 'bg-amber-500 text-white border-amber-300' };
    return { text: 'Online & Ready', color: 'bg-teal-500 text-white border-teal-300' };
  };

  const aiStatus = getAiAvatarStatus();

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6">
      {/* HEADER BAR & AI AVATAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        
        {/* AI Avatar & Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            {/* Pulsing Avatar halo ring */}
            <motion.div
              animate={{
                scale: isSpeaking || isListening ? [1, 1.2, 1] : [1, 1.05, 1],
                opacity: isSpeaking || isListening ? [0.6, 0.2, 0.6] : [0.3, 0.1, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute -inset-1.5 rounded-2xl blur-sm ${
                isSpeaking
                  ? 'bg-emerald-500'
                  : isListening
                  ? 'bg-rose-500'
                  : isProcessingAi
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
              }`}
            />
            
            {/* Avatar Graphic Card */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 text-white flex items-center justify-center border-3 border-teal-400 shadow-lg shrink-0">
              {isSpeaking ? (
                <Volume2 className="w-9 h-9 text-emerald-300 animate-bounce stroke-[2.5]" />
              ) : isListening ? (
                <Mic className="w-9 h-9 text-rose-300 animate-pulse stroke-[2.5]" />
              ) : isProcessingAi ? (
                <RefreshCw className="w-9 h-9 text-amber-300 animate-spin stroke-[2.5]" />
              ) : (
                <Bot className="w-9 h-9 text-teal-300 stroke-[2.5]" />
              )}
            </div>

            {/* Online Indicator Badge */}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`${getTextSize('title')} font-black text-slate-900 tracking-tight`}>
                AI Health & Voice Companion
              </h3>
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border-2 ${aiStatus.color} shadow-sm`}>
                {aiStatus.text}
              </span>
            </div>
            <p className={`${getTextSize('body')} font-extrabold text-slate-700 mt-0.5`}>
              Voice assistant, daily care monitor & compassionate companion
            </p>
          </div>
        </div>

        {/* Audio Controls, AI Provider Selector & Language Selector */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch md:self-auto justify-between md:justify-end">
          
          {/* AI Provider Switcher (Gemini / Local Gemma 4 via Ollama) */}
          <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-1 flex items-center gap-1 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => onChangeAiProvider && onChangeAiProvider('gemini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 min-h-[38px] ${
                aiProvider === 'gemini'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="Use Google Gemini Cloud AI (Default)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeAiProvider && onChangeAiProvider('ollama')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 min-h-[38px] ${
                aiProvider === 'ollama'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="Use Local Gemma 4 via Ollama (localhost:11434)"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Local Gemma 4</span>
            </button>
          </div>

          {/* Read Latest Answer Aloud */}
          {conversationHistory.length > 0 && (
            <button
              onClick={() => {
                const lastAiMsg = [...conversationHistory].reverse().find(m => m.sender === 'companion' || m.sender === 'system');
                if (lastAiMsg) {
                  speakText(lastAiMsg.text, undefined, undefined, 0.85, 1.0, selectedLanguage);
                } else {
                  speakText("Welcome to ElderCare Voice Companion. Tap the microphone to speak.", undefined, undefined, 0.85, 1.0, selectedLanguage);
                }
              }}
              className="bg-teal-700 hover:bg-teal-800 text-white border-2 border-teal-800 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0 min-h-[48px]"
              aria-label="Read latest response aloud"
            >
              <Volume2 className="w-5 h-5 text-teal-200 stroke-[2.5]" />
              <span>Read Answer</span>
            </button>
          )}

          {/* Active Audio Stop Button */}
          {isSpeaking && onStopSpeaking && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStopSpeaking}
              className="bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-700 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0 min-h-[48px]"
            >
              <VolumeX className="w-5 h-5 animate-pulse" />
              <span>Mute Voice</span>
            </motion.button>
          )}

          {/* Language Selector Dropdown */}
          <div className="bg-slate-100 border-2 border-slate-400 rounded-xl px-3 py-2 flex items-center gap-2 text-xs sm:text-sm font-black shadow-sm hover:border-teal-600 transition-all shrink-0 min-h-[48px]">
            <Globe className="w-5 h-5 text-teal-700 shrink-0 stroke-[2.5]" />
            {onChangeLanguage && (
              <select
                value={selectedLanguage}
                onChange={(e) => onChangeLanguage(e.target.value)}
                className="bg-transparent text-slate-900 font-black focus:outline-none cursor-pointer pr-1 text-xs sm:text-sm max-w-[150px] truncate"
                aria-label="Select Assistant Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE AI PROVIDER STATUS BADGE BAR */}
      <div className="flex items-center justify-between gap-3 bg-slate-100/90 border border-slate-200 px-4 py-2.5 rounded-2xl flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Active AI Model:</span>
          {aiProvider === 'ollama' ? (
            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-purple-700" />
              <span>Local Gemma • Ollama</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-900 border border-sky-300 px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-700" />
              <span>Gemini Cloud (Default)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          {aiProvider === 'ollama' ? (
            <span>Running locally via <code className="bg-slate-200 px-1 py-0.5 rounded text-purple-800 font-bold">http://localhost:11434</code> (gemma4:latest)</span>
          ) : (
            <span>Google Gemini Flash Multilingual Engine</span>
          )}
        </div>
      </div>

      {/* ERROR NOTICE BANNER */}
      {micErrorNotice && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-950 font-bold text-xs sm:text-sm shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{micErrorNotice}</span>
          </div>
          <button
            onClick={() => setMicErrorNotice(null)}
            className="bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* DYNAMIC VOICE WAVEFORM & MIC CONTROL PANEL */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 border-2 border-teal-500/40 shadow-lg space-y-5 relative overflow-hidden">
        
        {/* Animated Background Grid Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.15),transparent_70%)] pointer-events-none" />

        {/* Top Waveform Header Status */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-black uppercase tracking-wider text-teal-300">
              Live Voice Equalizer & Speech Engine
            </span>
          </div>

          <label className="inline-flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700/80 text-[11px] font-bold text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={handsFreeMode}
              onChange={(e) => setHandsFreeMode(e.target.checked)}
              className="w-3.5 h-3.5 text-teal-500 rounded focus:ring-teal-400 border-slate-600"
            />
            <span>Hands-Free Relisten</span>
          </label>
        </div>

        {/* VOICE WAVEFORM ANIMATION COMPONENT */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4 relative z-10">
          
          {/* Animated Waveform Equalizer Bars */}
          <div className="h-12 flex items-center justify-center gap-1.5 w-full max-w-xs px-4 bg-slate-900/80 rounded-xl border border-slate-800">
            {Array.from({ length: 16 }).map((_, i) => {
              // Waveform heights depending on state
              const isWaveActive = isSpeaking || isListening;
              const heights = [
                'h-3', 'h-6', 'h-10', 'h-7', 'h-12', 'h-8', 'h-11', 'h-5',
                'h-9', 'h-12', 'h-6', 'h-10', 'h-4', 'h-8', 'h-5', 'h-3'
              ];
              
              return (
                <motion.div
                  key={i}
                  animate={
                    isWaveActive
                      ? {
                          height: ['12px', `${Math.floor(16 + Math.random() * 28)}px`, '12px'],
                        }
                      : { height: '8px' }
                  }
                  transition={{
                    duration: 0.4 + (i % 5) * 0.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`w-1.5 rounded-full transition-all ${
                    isSpeaking
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                      : isListening
                      ? 'bg-gradient-to-t from-rose-500 to-amber-300'
                      : isProcessingAi
                      ? 'bg-gradient-to-t from-amber-500 to-yellow-300'
                      : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Main Round Microphone Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onToggleListening}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer border-4 ${
              isSpeaking
                ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-500/40 animate-pulse ring-8 ring-emerald-500/20'
                : isListening
                ? 'bg-rose-600 border-rose-300 text-white shadow-rose-500/40 animate-pulse ring-8 ring-rose-500/20'
                : isProcessingAi
                ? 'bg-amber-500 border-amber-300 text-white shadow-amber-500/40 ring-8 ring-amber-500/20'
                : 'bg-gradient-to-tr from-teal-500 via-teal-600 to-emerald-500 border-teal-300 hover:from-teal-600 hover:to-emerald-600 text-white shadow-teal-500/30'
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-10 h-10 mb-1 animate-bounce stroke-[2.5]" />
            ) : isListening ? (
              <MicOff className="w-10 h-10 mb-1 stroke-[2.5]" />
            ) : isProcessingAi ? (
              <RefreshCw className="w-10 h-10 mb-1 animate-spin stroke-[2.5]" />
            ) : (
              <Mic className="w-10 h-10 mb-1 stroke-[2.5]" />
            )}
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isSpeaking ? 'Speaking' : isListening ? 'Listening' : isProcessingAi ? 'Thinking' : 'Tap to Speak'}
            </span>
          </motion.button>

          {/* Active Voice Transcript Preview / Prompt */}
          <div className="text-center space-y-1 max-w-md px-2">
            <p className={`font-bold transition-all ${
              isSpeaking
                ? 'text-emerald-300 font-extrabold'
                : isListening
                ? 'text-rose-300 animate-pulse'
                : isProcessingAi
                ? 'text-amber-300'
                : 'text-slate-300'
            } text-sm sm:text-base`}>
              {isSpeaking
                ? '🔊 ElderCare AI is responding in spoken voice...'
                : isListening
                ? voiceInputText || 'Listening... Speak clearly now'
                : isProcessingAi
                ? '⚡ Thinking...'
                : '"Tap microphone button to start voice conversation"'}
            </p>
          </div>
        </div>
      </div>

      {/* SUGGESTED QUICK REPLIES CHIPS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
          <span className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600 stroke-[2.5]" />
            <span>Suggested Quick Questions & Health Prompts</span>
          </span>
          <span className="text-xs font-black text-teal-800 bg-teal-100 px-3 py-1 rounded-lg border-2 border-teal-300">
            One-Tap Speech Prompt
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {suggestedQuickReplies.map((qr, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.96 }}
              disabled={isProcessingAi}
              onClick={() => handleQuickReplyTap(qr.prompt)}
              className="bg-slate-100 hover:bg-teal-100 text-slate-900 hover:text-teal-950 border-2 border-slate-300 hover:border-teal-600 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 min-h-[48px]"
            >
              <span>{qr.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* CHAT LOG WITH SEARCH BAR & TIMESTAMPS */}
      <div className="bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 sm:p-6 space-y-5">
        
        {/* Chat Search & Filter Header Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
            <MessageSquare className="w-5 h-5 text-teal-700 stroke-[2.5]" />
            <span>Conversation & Health Log ({filteredMessages.length})</span>
          </div>

          {/* Interactive Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white border-2 border-slate-400 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-950 font-black focus:outline-none focus:ring-3 focus:ring-teal-600 shadow-sm"
              aria-label="Search conversation history"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 p-1"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation Container */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="space-y-5 max-h-[480px] overflow-y-auto pr-2 relative"
        >
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 p-6">
              <Bot className="w-12 h-12 text-slate-400 mx-auto stroke-[2]" />
              <p className={`${getTextSize('large')} font-black text-slate-700`}>
                {searchQuery ? `No messages found matching "${searchQuery}"` : 'No messages yet. Tap the microphone or select a quick question above!'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isElder = msg.sender === 'elder';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 sm:gap-4 ${isElder ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shrink-0 border-3 shadow-md ${
                      isElder
                        ? 'bg-sky-800 border-sky-400 text-white'
                        : 'bg-slate-950 border-teal-400 text-teal-300'
                    }`}
                  >
                    {isElder ? '👵' : <Bot className="w-7 h-7 text-teal-300 stroke-[2.5]" />}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-5 space-y-3 border-2 shadow-md ${
                      isElder
                        ? 'bg-sky-900 text-white border-sky-400 rounded-tr-none'
                        : 'bg-white text-slate-950 border-slate-300 rounded-tl-none'
                    }`}
                  >
                    {/* Top Bar: Name & Timestamp */}
                    <div className="flex items-center justify-between gap-4 text-xs sm:text-sm font-black pb-1.5 border-b border-black/10">
                      <span className={isElder ? 'text-sky-100' : 'text-slate-800'}>
                        {isElder ? profile.preferredName : 'ElderCare AI Companion'}
                      </span>
                      <span className={`text-xs font-extrabold ${isElder ? 'text-sky-200' : 'text-slate-500'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Message Body Text */}
                    <p className={`${getTextSize('large')} font-bold leading-relaxed ${isElder ? 'text-white' : 'text-slate-900'}`}>
                      {msg.text}
                    </p>

                    {/* ADVANCED SYMPTOM & SELF-CARE CARD (AI Messages) */}
                    {!isElder && msg.symptomDetected && (
                      <div className="bg-amber-100/90 border-2 border-amber-400 rounded-2xl p-4 text-slate-950 space-y-2 mt-2">
                        <div className="flex items-center justify-between font-black uppercase text-amber-950 border-b-2 border-amber-300/80 pb-1.5 text-xs sm:text-sm">
                          <span className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-amber-800 stroke-[2.5]" />
                            <span>Detected Symptom: {msg.symptomDetected}</span>
                          </span>
                          {msg.detectedTone && (
                            <span className="bg-amber-300 text-amber-950 px-2.5 py-1 rounded-md text-xs font-black border border-amber-400">
                              {msg.detectedTone}
                            </span>
                          )}
                        </div>

                        {msg.suggestedSelfCare && (
                          <p className="font-extrabold text-amber-950 bg-white p-3 rounded-xl border-2 border-amber-300 text-xs sm:text-sm">
                            💡 Care Guidance: {msg.suggestedSelfCare}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Menu */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/10">
                      {!isElder ? (
                        <button
                          onClick={() => speakText(msg.text, undefined, undefined, 0.85, 1.0, selectedLanguage)}
                          className="inline-flex items-center gap-2 text-teal-900 hover:text-teal-950 font-black text-xs sm:text-sm bg-teal-100 hover:bg-teal-200 px-3.5 py-2 rounded-xl border-2 border-teal-300 transition-all active:scale-95 min-h-[40px]"
                        >
                          <Volume2 className="w-4 h-4 text-teal-800 stroke-[2.5]" />
                          <span>Read Aloud</span>
                        </button>
                      ) : (
                        <span className="text-xs text-sky-200 font-extrabold">Voice Transcribed</span>
                      )}

                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className={`p-2 rounded-xl font-bold transition-all min-h-[40px] flex items-center gap-1.5 ${
                          isElder ? 'text-sky-100 hover:bg-sky-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                        }`}
                        title="Copy message text"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-400 font-black text-xs flex items-center gap-1">
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Copied</span>
                          </span>
                        ) : (
                          <Copy className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* AI TYPING & PROCESSING LOADING ANIMATION */}
          {isProcessingAi && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 sm:gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center border-2 border-amber-400 shrink-0">
                <Bot className="w-7 h-7 text-amber-300 animate-spin stroke-[2.5]" />
              </div>

              <div className="bg-white border-3 border-amber-400 rounded-3xl p-5 shadow-md space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-amber-900">ElderCare AI Companion is thinking...</span>
                </div>

                {/* Animated Typing Dots */}
                <div className="flex items-center gap-2 py-1.5">
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"></span>
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-3 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <p className="text-xs font-bold text-slate-700 italic">
                  Analyzing health history and preparing spoken guidance...
                </p>
              </div>
            </motion.div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollBottomBtn && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-20 right-8 bg-teal-800 hover:bg-teal-900 text-white font-black px-4 py-2.5 rounded-full text-xs sm:text-sm shadow-xl flex items-center gap-2 border-2 border-teal-400 transition-all active:scale-95"
          >
            <span>Scroll to latest</span>
            <ChevronDown className="w-5 h-5 stroke-[3]" />
          </button>
        )}

        {/* MANUAL TEXT INPUT BAR */}
        <div className="pt-3 border-t-2 border-slate-200 flex items-center gap-2.5">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendManualText()}
            placeholder="Type your message or ask a health question..."
            className="flex-1 bg-white border-2 border-slate-400 rounded-2xl px-5 py-3.5 text-sm sm:text-base font-black text-slate-950 focus:outline-none focus:ring-3 focus:ring-teal-600 shadow-sm"
            aria-label="Type your message"
          />
          <button
            onClick={handleSendManualText}
            disabled={!manualText.trim() || isProcessingAi}
            className="bg-teal-700 hover:bg-teal-800 text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-base shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shrink-0 min-h-[52px]"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
