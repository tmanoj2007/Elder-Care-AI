import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, Globe, Sun, Moon } from 'lucide-react';

export const DigitalClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const isNight = hours < 6 || hours >= 20;

  const timeString = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !is24Hour,
  });

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate day of the year
  const startOfYear = new Date(time.getFullYear(), 0, 0);
  const diff = time.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Calculate week of year
  const weekNumber = Math.ceil(dayOfYear / 7);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {isNight ? (
            <Moon className="w-5 h-5 text-indigo-300 stroke-[2.5]" />
          ) : (
            <Sun className="w-5 h-5 text-amber-300 stroke-[2.5] animate-spin-slow" />
          )}
          <span className="font-black text-xs sm:text-sm text-slate-200">
            {isNight ? 'Evening Rest Hours' : 'Daylight Hours'}
          </span>
        </div>

        {/* 12h / 24h Toggle Button */}
        <button
          onClick={() => setIs24Hour(!is24Hour)}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-black px-3 py-1 rounded-xl border border-white/20 transition-all active:scale-95"
          title="Toggle 12/24 Hour Clock Format"
        >
          {is24Hour ? '24-Hour Format' : '12-Hour AM/PM'}
        </button>
      </div>

      {/* Prominent Digital Clock */}
      <div className="text-center py-2 space-y-1">
        <div className="text-4xl sm:text-6xl font-black tracking-tight text-emerald-400 font-mono drop-shadow-md">
          {timeString}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-slate-300">
          <CalendarIcon className="w-4 h-4 text-teal-400 stroke-[2.5]" />
          <span>{dateString}</span>
        </div>
      </div>

      {/* Extra Date Metadata Badges */}
      <div className="grid grid-cols-2 gap-2 text-center bg-black/30 p-2.5 rounded-2xl border border-white/10 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Day of Year</span>
          <div className="font-black text-emerald-300 text-xs sm:text-sm">Day {dayOfYear} of 365</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Calendar Week</span>
          <div className="font-black text-emerald-300 text-xs sm:text-sm">Week {weekNumber}</div>
        </div>
      </div>
    </div>
  );
};
