import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Globe,
  Sparkles,
  Cpu,
  Volume2,
  Check,
  RotateCcw,
  Shield,
  Eye,
  Zap,
  Sliders,
  Settings as SettingsIcon,
  HelpCircle,
  Play
} from 'lucide-react';
import { TextScale, SUPPORTED_LANGUAGES, AIProvider, AI_PROVIDERS, LanguageOption } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  onChangeLanguage: (code: string) => void;
  aiProvider: AIProvider;
  onChangeAiProvider: (provider: AIProvider) => void;
  textScale: TextScale;
  onChangeTextScale: (scale: TextScale) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onChangeLanguage,
  aiProvider,
  onChangeAiProvider,
  textScale,
  onChangeTextScale,
}) => {
  const [activeTab, setActiveTab] = useState<'language' | 'ai' | 'display' | 'voice'>('language');
  const [voiceRate, setVoiceRate] = useState(0.92);
  const [testSpeechStatus, setTestSpeechStatus] = useState(false);

  if (!isOpen) return null;

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handleTestSpeech = () => {
    setTestSpeechStatus(true);
    let sample = "Hello Eleanor! I am your ElderCare AI Voice Companion.";
    if (selectedLanguage.startsWith('te') || selectedLanguage === 'te-IN') {
      sample = "నమస్కారం! నేను మీ ఎల్డర్‌కేర్ ఏఐ వాయిస్ అసిస్టెంట్‌ని. మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.";
    } else if (selectedLanguage.startsWith('hi') || selectedLanguage === 'hi-IN') {
      sample = "नमस्ते! मैं आपका एल्डरकेयर एआई वॉयस साथी हूँ। आपकी सेवा में तैयार हूँ।";
    } else if (selectedLanguage.startsWith('ta')) {
      sample = "வணக்கம்! நான் உங்கள் எல்டர்கேர் குரல் துணைவன்.";
    } else if (selectedLanguage.startsWith('es')) {
      sample = "¡Hola! Soy tu asistente de voz de ElderCare AI.";
    }

    speakText(
      sample,
      () => setTestSpeechStatus(true),
      () => setTestSpeechStatus(false),
      voiceRate,
      1.0,
      selectedLanguage
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40">
                <SettingsIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Application Settings
                </h2>
                <p className="text-xs text-slate-300 font-bold">
                  Language, AI Provider & Voice Preferences
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              aria-label="Close Settings"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-100 p-2 gap-1.5 border-b border-slate-200 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('language')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'language'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Globe className="w-4 h-4 text-teal-600" />
              <span>Language ({currentLang.flag} {currentLang.name})</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>AI Model ({aiProvider === 'ollama' ? 'Local Gemma' : 'Gemini'})</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'voice'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>Voice & Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('display')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'display'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Text Size</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* 1. LANGUAGE SETTINGS TAB */}
            {activeTab === 'language' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Voice & Output Language
                    </h3>
                    <p className="text-xs text-slate-600 font-bold">
                      Select your preferred spoken language for speech recognition and AI responses.
                    </p>
                  </div>
                  <span className="bg-teal-100 text-teal-900 text-xs font-black px-3 py-1 rounded-full border border-teal-300">
                    Active: {currentLang.flag} {currentLang.nativeName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => {
                    const isSelected = selectedLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => onChangeLanguage(lang.code)}
                        className={`p-3.5 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm ring-2 ring-teal-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-tight">
                              {lang.nativeName}
                            </p>
                            <p className="text-xs font-bold text-slate-500">
                              {lang.name} ({lang.code})
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. AI MODEL & PROVIDER TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    AI Intelligence Provider
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    Choose between Google Gemini Cloud AI or Local Gemma 4 via Ollama.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {AI_PROVIDERS.map((provider) => {
                    const isSelected = aiProvider === provider.id;
                    const isLocal = provider.id === 'ollama';

                    return (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => onChangeAiProvider(provider.id)}
                        className={`p-5 rounded-2xl text-left border-2 transition-all flex items-start justify-between ${
                          isSelected
                            ? isLocal
                              ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-sm ring-2 ring-purple-600/20'
                              : 'bg-sky-50 border-sky-600 text-sky-950 shadow-sm ring-2 ring-sky-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                              isLocal
                                ? 'bg-purple-100 text-purple-700 border-purple-300'
                                : 'bg-sky-100 text-sky-700 border-sky-300'
                            }`}
                          >
                            {isLocal ? (
                              <Cpu className="w-6 h-6 stroke-[2.5]" />
                            ) : (
                              <Sparkles className="w-6 h-6 stroke-[2.5]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-slate-900">
                                {provider.name}
                              </h4>
                              <span
                                className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                  isLocal
                                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                                    : 'bg-sky-100 text-sky-800 border-sky-300'
                                }`}
                              >
                                {provider.badge}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-600 mt-1">
                              {provider.description}
                            </p>
                            {isLocal && (
                              <p className="text-[11px] font-extrabold text-purple-800 mt-2 bg-purple-100/70 p-2 rounded-lg border border-purple-200">
                                Requirements: Ollama running on <code className="font-mono">http://localhost:11434</code> with model <code className="font-mono">gemma4:latest</code>.
                              </p>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div
                            className={`w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0 ml-3 ${
                              isLocal ? 'bg-purple-600' : 'bg-sky-600'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. VOICE & AUDIO TAB */}
            {activeTab === 'voice' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Voice & Speech Settings
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    Adjust speech rate, test audio output, and preview spoken clarity.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-800">
                      Speech Rate (Elder Clarity)
                    </label>
                    <span className="text-xs font-black text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md">
                      {voiceRate <= 0.8 ? 'Slow & Gentle' : voiceRate >= 1.05 ? 'Fast' : 'Standard (0.92x)'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.7"
                    max="1.2"
                    step="0.05"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Slower (0.7x)</span>
                    <span>Standard (0.92x)</span>
                    <span>Faster (1.2x)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-teal-50 border border-teal-200 p-4 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-teal-950">
                      Test Speech Output
                    </h4>
                    <p className="text-xs text-teal-800 font-bold">
                      Hear how ElderCare AI speaks in {currentLang.name} ({currentLang.nativeName}).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestSpeech}
                    disabled={testSpeechStatus}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>{testSpeechStatus ? 'Speaking...' : 'Play Sample'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. DISPLAY / TEXT SIZE TAB */}
            {activeTab === 'display' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Display & Text Readability
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    Scale font sizing for high visibility and senior comfort.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeTextScale('normal')}
                    className={`p-4 rounded-2xl text-center border-2 transition-all ${
                      textScale === 'normal'
                        ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl font-black block mb-1">A</span>
                    <span className="text-xs font-black block">Standard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeTextScale('large')}
                    className={`p-4 rounded-2xl text-center border-2 transition-all ${
                      textScale === 'large'
                        ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-3xl font-black block mb-1">A+</span>
                    <span className="text-xs font-black block">Large (Recommended)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeTextScale('extra')}
                    className={`p-4 rounded-2xl text-center border-2 transition-all ${
                      textScale === 'extra'
                        ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-4xl font-black block mb-1">A++</span>
                    <span className="text-xs font-black block">Extra Large</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-bold">
              Settings auto-save to browser storage
            </span>
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
