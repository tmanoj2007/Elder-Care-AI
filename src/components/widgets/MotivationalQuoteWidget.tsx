import React, { useState } from 'react';
import { Quote, RefreshCw, Volume2, Sparkles, Heart } from 'lucide-react';
import { speakText } from '../../utils/speech';

interface MotivationalQuoteWidgetProps {
  selectedLanguage?: string;
}

export const MotivationalQuoteWidget: React.FC<MotivationalQuoteWidgetProps> = ({ selectedLanguage = 'en-US' }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  const quotes = [
    {
      text: "Age is an issue of mind over matter. If you don't mind, it doesn't matter.",
      author: "Mark Twain",
      category: "Wisdom & Vitality",
    },
    {
      text: "You are never too old to set another goal or to dream a new dream.",
      author: "C.S. Lewis",
      category: "Inspiration",
    },
    {
      text: "It is not how old you are, but how you are old.",
      author: "Marie Dressler",
      category: "Life Perspective",
    },
    {
      text: "Wrinkles should merely indicate where smiles have been.",
      author: "Mark Twain",
      category: "Joy & Smile",
    },
    {
      text: "Do not grow old, no matter how long you live. Never cease to stand like curious children before the great mystery into which we were born.",
      author: "Albert Einstein",
      category: "Curiosity & Wonder",
    },
    {
      text: "Every day is a gift and a opportunity to bring light to someone's life.",
      author: "Senior Health Wisdom",
      category: "Daily Gratitude",
    },
  ];

  const currentQuote = quotes[quoteIndex];

  const handleNextQuote = () => {
    setIsRotating(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
      setIsRotating(false);
    }, 250);
  };

  const handleSpeakQuote = () => {
    speakText(`Quote by ${currentQuote.author}: "${currentQuote.text}"`, undefined, undefined, 0.88, 1.0, selectedLanguage);
  };

  return (
    <div className="bg-gradient-to-br from-amber-950/90 via-slate-900 to-teal-950/80 text-white rounded-3xl p-5 sm:p-6 border-2 border-amber-400/50 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {/* Decorative Quote Icon Background */}
      <Quote className="absolute -bottom-4 -right-4 w-32 h-32 text-amber-500/10 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-400/30 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300 stroke-[2.5]" />
          <span className="font-black text-xs sm:text-sm text-amber-200 uppercase tracking-wider">
            Daily Motivational Quote
          </span>
        </div>
        <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
          {currentQuote.category}
        </span>
      </div>

      {/* Quote Content */}
      <div className="space-y-3 py-2 relative z-10">
        <p className="text-base sm:text-lg font-bold text-slate-100 italic leading-relaxed">
          "{currentQuote.text}"
        </p>
        <div className="text-right text-xs sm:text-sm font-black text-amber-300 flex items-center justify-end gap-1.5">
          <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>— {currentQuote.author}</span>
        </div>
      </div>

      {/* Action Buttons: Read Aloud & New Quote */}
      <div className="flex items-center justify-between gap-2 border-t border-amber-400/30 pt-3">
        <button
          onClick={handleSpeakQuote}
          className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/50 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all active:scale-95 min-h-[40px]"
          title="Listen to Quote Aloud"
        >
          <Volume2 className="w-4 h-4 text-amber-300 stroke-[2.5]" />
          <span>Read Quote Aloud</span>
        </button>

        <button
          onClick={handleNextQuote}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-amber-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all active:scale-95 shadow-md min-h-[40px]"
          title="Get New Motivational Quote"
        >
          <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
          <span>Inspire Me</span>
        </button>
      </div>
    </div>
  );
};
