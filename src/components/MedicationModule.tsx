import React, { useState, useEffect } from 'react';
import { Medication, MedicationLog, MedicationFrequency } from '../types';
import { Pill, CheckCircle2, XCircle, Clock, Plus, AlertCircle, RefreshCw, Calendar, FileText, Check, ShieldCheck, Trash2, Filter, Lock, AlertTriangle } from 'lucide-react';
import { validateTaskTime } from '../utils/timeValidation';
import { speakText } from '../utils/speech';

interface MedicationModuleProps {
  userRole?: 'senior' | 'caregiver';
  onLogUpdated?: () => void;
}

export const MedicationModule: React.FC<MedicationModuleProps> = ({ userRole = 'caregiver', onLogUpdated }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [prematureNotice, setPrematureNotice] = useState<string | null>(null);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [frequency, setFrequency] = useState<MedicationFrequency>('Daily');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('Heart & Blood Pressure');
  const [pillCount, setPillCount] = useState<number>(30);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  // Log filter state
  const [logFilter, setLogFilter] = useState<'all' | 'taken' | 'missed'>('all');

  // Fetch medications & logs from backend API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [medsRes, logsRes] = await Promise.all([
        fetch('/api/medications'),
        fetch('/api/medications/logs')
      ]);

      const medsData = await medsRes.json();
      const logsData = await logsRes.json();

      if (medsData.medications) setMedications(medsData.medications);
      if (logsData.logs) setLogs(logsData.logs);
    } catch (err) {
      console.error('Error fetching medication data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Mark Taken / Missed in Real Time
  const handleLogEvent = async (medicationId: string, status: 'taken' | 'missed') => {
    const med = medications.find((m) => m.id === medicationId);
    if (!med) return;

    // PREVENT PREMATURE COMPLETION: If status is 'taken', check if scheduled time has arrived
    if (status === 'taken') {
      const timeValidation = validateTaskTime(med.scheduledTime);
      if (timeValidation.isFuture) {
        const warningText = `Task Locked: "${med.name}" is scheduled for later today at ${med.scheduledTime} (in ${timeValidation.formattedUntil}). Premature logging is restricted until then.`;
        setPrematureNotice(warningText);

        if (userRole === 'senior') {
          speakText(`This medication is scheduled for ${med.scheduledTime} later today. Please wait until its scheduled time to log it.`);
        }
        return; // Stop early
      }
    }

    setPrematureNotice(null);
    setSubmittingId(medicationId);

    try {
      const res = await fetch('/api/medications/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId,
          status,
          loggedBy: userRole,
          notes: status === 'taken' ? 'Confirmed pill taken by user.' : 'Marked as missed.',
        }),
      });

      const data = await res.json();
      if (data.isPremature) {
        setPrematureNotice(data.error);
        if (userRole === 'senior') {
          speakText(data.error);
        }
      } else if (data.success) {
        if (data.medications) setMedications(data.medications);
        if (data.logs) setLogs(data.logs);
        if (onLogUpdated) onLogUpdated();
      }
    } catch (err) {
      console.error('Error logging medication event:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  // Handle Add New Medication Submit
  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !scheduledTime.trim()) {
      setFormError('Please fill in the medication name, dosage, and scheduled time.');
      return;
    }

    setFormError(null);
    setIsSubmittingForm(true);

    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          dosage: dosage.trim(),
          scheduledTime: scheduledTime.trim(),
          frequency,
          instructions: instructions.trim() || undefined,
          category,
          pillCount: Number(pillCount) || 30,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.medications) setMedications(data.medications);
        // Reset form
        setName('');
        setDosage('');
        setInstructions('');
        setShowAddModal(false);
      } else {
        setFormError(data.error || 'Failed to add medication.');
      }
    } catch (err) {
      console.error('Error adding medication:', err);
      setFormError('Server error while saving medication.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Delete Medication
  const handleDeleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medication reminder?')) return;
    try {
      const res = await fetch(`/api/medications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.medications) {
        setMedications(data.medications);
      }
    } catch (err) {
      console.error('Error deleting medication:', err);
    }
  };

  // Summary Metrics Calculation
  const totalMeds = medications.length;
  const takenCount = medications.filter((m) => m.todayStatus === 'taken').length;
  const missedCount = medications.filter((m) => m.todayStatus === 'missed').length;
  const pendingCount = medications.filter((m) => m.todayStatus === 'pending' || !m.todayStatus).length;
  const adherencePercent = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 100;

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'taken') return log.status === 'taken';
    if (logFilter === 'missed') return log.status === 'missed';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* HEADER BAR & METRIC CARDS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Medication Management & Reminders
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Real-time dosage schedules, interactive reminders & clinical event logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Today's Adherence</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-teal-700">{adherencePercent}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${adherencePercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 space-y-1">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
              <span>Taken Today</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-800">{takenCount}</div>
            <p className="text-xs text-emerald-700 font-medium">Of {totalMeds} scheduled doses</p>
          </div>

          <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200/80 space-y-1">
            <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center justify-between">
              <span>Missed Doses</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-800">{missedCount}</div>
            <p className="text-xs text-rose-700 font-medium">{missedCount > 0 ? 'Requires attention' : 'Zero missed today'}</p>
          </div>

          <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200/80 space-y-1">
            <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider flex items-center justify-between">
              <span>Pending Upcoming</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-sky-900">{pendingCount}</div>
            <p className="text-xs text-sky-700 font-medium">Scheduled later today</p>
          </div>
        </div>
      </div>

      {/* ACTIVE REMINDERS CARDS GRID */}
      <div className="space-y-4">
        {/* Premature Completion Warning Banner */}
        {prematureNotice && (
          <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 font-bold text-xs sm:text-sm animate-fade-in shadow-sm">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{prematureNotice}</span>
            </div>
            <button
              onClick={() => setPrematureNotice(null)}
              className="bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 self-end sm:self-auto"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Active & Upcoming Medication Reminders</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Time-validated task completion enabled
          </span>
        </div>

        {medications.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
            <Pill className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-medium">No medications added yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-teal-600 font-bold hover:underline text-sm"
            >
              + Add First Medication
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const isTaken = med.todayStatus === 'taken';
              const isMissed = med.todayStatus === 'missed';
              const isPending = !isTaken && !isMissed;
              const isBusy = submittingId === med.id;
              const timeVal = validateTaskTime(med.scheduledTime);

              return (
                <div
                  key={med.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-sm ${
                    isTaken
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : isMissed
                      ? 'bg-rose-50/40 border-rose-200/80'
                      : timeVal.isFuture
                      ? 'bg-slate-50/90 border-slate-200/90'
                      : 'bg-white border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {med.scheduledTime} ({med.frequency})
                      </span>

                      {/* Status Badge */}
                      {isTaken && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Taken {med.lastTakenAt ? `@ ${med.lastTakenAt}` : ''}
                        </span>
                      )}
                      {isMissed && (
                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Missed Dose
                        </span>
                      )}
                      {isPending && timeVal.isFuture && (
                        <span className="bg-amber-100/90 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" />
                          Scheduled in {timeVal.formattedUntil}
                        </span>
                      )}
                      {isPending && !timeVal.isFuture && (
                        <span className="bg-sky-50 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                          Ready Now
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-snug">
                          {med.name}
                        </h4>
                        <p className="text-sm font-semibold text-teal-700">{med.dosage}</p>
                      </div>
                      {userRole === 'caregiver' && (
                        <button
                          onClick={() => handleDeleteMedication(med.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete medication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100 font-medium">
                        💡 {med.instructions}
                      </p>
                    )}

                    {med.category && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {med.category}
                        </span>
                        {typeof med.pillCount === 'number' && (
                          <span className={`${med.pillCount <= (med.refillThreshold || 5) ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                            • Pills remaining: {med.pillCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* INTERACTIVE ACTION BUTTONS */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleLogEvent(med.id, 'taken')}
                      disabled={isBusy}
                      className={`flex-1 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                        isTaken
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{isTaken ? 'Completed (Taken)' : 'Mark as Taken'}</span>
                    </button>

                    <button
                      onClick={() => handleLogEvent(med.id, 'missed')}
                      disabled={isBusy}
                      className={`flex-1 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                        isMissed
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white border border-rose-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4 stroke-[2]" />
                      <span>{isMissed ? 'Flagged (Missed)' : 'Mark as Missed'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PERSISTENT EVENT LOGS AUDIT TRAIL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">Medication Event Audit Logs</h3>
          </div>

          {/* Log Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLogFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                logFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setLogFilter('taken')}
              className={`px-3 py-1 rounded-lg transition-all ${
                logFilter === 'taken' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Taken
            </button>
            <button
              onClick={() => setLogFilter('missed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                logFilter === 'missed' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Missed
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">No medication logs recorded for this filter.</p>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="text-slate-800">{log.medicationName}</span>
                    <span className="text-slate-400 font-normal">({log.dosage})</span>
                  </div>
                  <div className="text-slate-500 font-medium">
                    Scheduled: {log.scheduledTime} • Recorded by {log.loggedBy} ({log.notes})
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 font-medium">
                    {log.date} @ {log.timestamp}
                  </span>

                  {log.status === 'taken' ? (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Taken
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Missed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD MEDICATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Pill className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Add New Medication</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddMedication} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lisinopril, Metformin, Atorvastatin"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 10mg, 1 tablet, 5ml"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="e.g. 08:00 AM, 02:00 PM"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as MedicationFrequency)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 bg-white text-slate-900"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Every 8 Hours">Every 8 Hours</option>
                    <option value="Weekly">Weekly</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 bg-white text-slate-900"
                  >
                    <option value="Heart & Blood Pressure">Heart & Blood Pressure</option>
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Vitamins & Bone Health">Vitamins & Bone Health</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Instructions / Notes
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take with warm water after lunch"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  {isSubmittingForm ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Medication</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
