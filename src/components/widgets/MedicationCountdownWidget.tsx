import React, { useState, useEffect } from 'react';
import { CheckInItem } from '../../types';
import { Pill, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { speakText } from '../../utils/speech';

interface MedicationCountdownWidgetProps {
  checkInItems: CheckInItem[];
  onToggleCheckIn: (id: string) => void;
  selectedLanguage?: string;
}

export const MedicationCountdownWidget: React.FC<MedicationCountdownWidgetProps> = ({
  checkInItems,
  onToggleCheckIn,
  selectedLanguage = 'en-US',
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter pending medication check-ins
  const pendingMeds = checkInItems.filter((i) => i.category === 'medication' && !i.completed);

  // Helper function to parse "08:00 AM" into Date today
  const parseTimeToDate = (timeStr: string): Date => {
    const d = new Date();
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return d;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Find next upcoming pending medication
  let nextMed: CheckInItem | null = null;
  let nextMedDate: Date | null = null;
  let minDiff = Infinity;

  pendingMeds.forEach((item) => {
    const targetDate = parseTimeToDate(item.scheduledTime);
    const diff = targetDate.getTime() - now.getTime();
    if (diff < minDiff) {
      minDiff = diff;
      nextMed = item;
      nextMedDate = targetDate;
    }
  });

  // Calculate formatted countdown hours, minutes, seconds
  let countdownText = '';
  let isOverdue = false;

  if (nextMedDate && nextMed) {
    const diffMs = (nextMedDate as Date).getTime() - now.getTime();
    if (diffMs < 0) {
      isOverdue = true;
      const overdueMins = Math.abs(Math.floor(diffMs / (1000 * 60)));
      countdownText = `OVERDUE by ${overdueMins} mins`;
    } else {
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);
      countdownText = `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
  }

  const handleTakePill = () => {
    if (nextMed) {
      onToggleCheckIn(nextMed.id);
      speakText(`Marked ${nextMed.title} as taken. Great job!`, undefined, undefined, 0.9, 1.0, selectedLanguage);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-sky-400/50 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-sky-400/30 pb-3">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-sky-300 stroke-[2.5]" />
          <span className="font-black text-xs sm:text-sm text-sky-200 uppercase tracking-wider">
            Medication Live Countdown
          </span>
        </div>
        <span className="text-[10px] font-black uppercase bg-sky-400 text-slate-950 px-2.5 py-0.5 rounded-full">
          {pendingMeds.length} Pending Today
        </span>
      </div>

      {/* Main Countdown Display */}
      {nextMed ? (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase">Next Pill Scheduled</div>
              <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                {nextMed.title}
              </h4>
              <p className="text-xs font-semibold text-sky-300 mt-0.5">
                {nextMed.dosageOrDetails || '1 dose with water'} • Scheduled at {nextMed.scheduledTime}
              </p>
            </div>

            <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-xl shrink-0 ${isOverdue ? 'bg-rose-500 text-white animate-pulse' : 'bg-sky-500 text-slate-950'}`}>
              {isOverdue ? 'OVERDUE' : 'UPCOMING'}
            </span>
          </div>

          {/* Large Live Digital Countdown Timer */}
          <div className="bg-black/40 p-3.5 rounded-2xl border border-sky-400/30 text-center">
            <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-sky-300">
              {countdownText}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" /> Countdown to Scheduled Dose
            </div>
          </div>

          {/* Mark Taken Button */}
          <button
            onClick={handleTakePill}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border-2 border-emerald-300 min-h-[48px]"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Mark {nextMed.title.split(' ')[0]} as Taken Now</span>
          </button>
        </div>
      ) : (
        <div className="text-center py-6 space-y-2 bg-black/20 p-4 rounded-2xl border border-white/10">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto stroke-[2.5]" />
          <h4 className="text-base sm:text-lg font-black text-white">
            All Daily Medications Completed!
          </h4>
          <p className="text-xs font-semibold text-slate-300">
            Great job adhering to your routine today! Next pill scheduled for tomorrow morning at 08:00 AM.
          </p>
        </div>
      )}
    </div>
  );
};
