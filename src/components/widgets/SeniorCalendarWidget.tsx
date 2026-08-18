import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Stethoscope, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface CalendarEvent {
  id: string;
  dateStr: string; // "YYYY-MM-DD" e.g. "2026-08-12"
  title: string;
  type: 'doctor' | 'medication' | 'lab_test' | 'family';
  time: string;
}

export const SeniorCalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventType, setNewEventType] = useState<'doctor' | 'medication' | 'lab_test' | 'family'>('doctor');

  // Sample medical events
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'ev-1', dateStr: '2026-08-07', title: 'Morning Lisinopril & BP Check', type: 'medication', time: '08:00 AM' },
    { id: 'ev-2', dateStr: '2026-08-12', title: 'Dr. Evans Geriatric Follow-up', type: 'doctor', time: '10:30 AM' },
    { id: 'ev-3', dateStr: '2026-08-15', title: 'Blood Fasting Lab Test', type: 'lab_test', time: '09:00 AM' },
    { id: 'ev-4', dateStr: '2026-08-20', title: 'Pharmacy Prescription Refill Pickup', type: 'medication', time: '02:00 PM' },
    { id: 'ev-5', dateStr: '2026-08-23', title: 'Grandkids Weekend Tea Visit', type: 'family', time: '04:00 PM' },
  ]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;

  // Selected date string "YYYY-MM-DD"
  const formatPad = (n: number) => n.toString().padStart(2, '0');
  const selectedDateStr = selectedDay ? `${year}-${formatPad(month + 1)}-${formatPad(selectedDay)}` : '';
  const selectedDayEvents = events.filter((e) => e.dateStr === selectedDateStr);

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !selectedDay) return;
    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      dateStr: selectedDateStr,
      title: newEventTitle.trim(),
      type: newEventType,
      time: newEventTime,
    };
    setEvents((prev) => [...prev, newEv]);
    setNewEventTitle('');
    setShowAddEventModal(false);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
          <span className="font-black text-xs sm:text-sm text-slate-200 uppercase tracking-wider">
            Senior Health Calendar
          </span>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="font-black text-xs sm:text-sm text-emerald-300 min-w-[110px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="space-y-2">
        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-black uppercase text-slate-400">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Month Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`blank-${idx}`} className="h-8 sm:h-9" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = `${year}-${formatPad(month + 1)}-${formatPad(dayNum)}`;
            const isToday = isCurrentMonthToday && today.getDate() === dayNum;
            const isSelected = selectedDay === dayNum;
            const dayEvents = events.filter((e) => e.dateStr === dateKey);
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-8 sm:h-9 rounded-xl font-black text-xs relative flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-2 border-white shadow-md'
                    : isToday
                    ? 'bg-emerald-950 text-emerald-300 border-2 border-emerald-400'
                    : 'bg-black/30 text-slate-200 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{dayNum}</span>
                {hasEvents && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                      isSelected ? 'bg-slate-950' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda & Quick Event Add */}
      <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 space-y-2.5 text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-black text-slate-200">
            Agenda for {monthNames[month]} {selectedDay}, {year}
          </span>
          <button
            onClick={() => setShowAddEventModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded-lg font-black text-[11px] flex items-center gap-1 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
          {selectedDayEvents.length === 0 ? (
            <p className="text-[11px] font-bold text-slate-400 italic py-1">
              No scheduled appointments for this date.
            </p>
          ) : (
            selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2 bg-slate-800/80 rounded-xl border border-white/10 flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-extrabold text-white">{ev.title}</span>
                </div>
                <span className="font-bold text-slate-300 text-[10px] shrink-0">{ev.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Overlay Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 max-w-sm w-full space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-lg font-black text-white">Add Health Appointment</h4>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Appointment / Routine Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Dr. Visit or Blood Pressure Check"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Scheduled Time</label>
                <input
                  type="text"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Event Category</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                >
                  <option value="doctor">🩺 Doctor Visit</option>
                  <option value="medication">💊 Prescription / Refill</option>
                  <option value="lab_test">🧪 Medical Lab Test</option>
                  <option value="family">❤️ Family Visit / Activity</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddEventModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs shadow-md"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
