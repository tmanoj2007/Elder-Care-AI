import React from 'react';
import { EmergencyContact } from '../../types';
import { PhoneCall, ShieldAlert, User, Heart, AlertTriangle, ExternalLink } from 'lucide-react';
import { speakText } from '../../utils/speech';

interface EmergencyContactWidgetProps {
  contacts: EmergencyContact[];
  onTriggerSOS: () => void;
  selectedLanguage?: string;
}

export const EmergencyContactWidget: React.FC<EmergencyContactWidgetProps> = ({
  contacts,
  onTriggerSOS,
  selectedLanguage = 'en-US',
}) => {
  const [callingContactId, setCallingContactId] = React.useState<string | null>(null);

  const handleCall = (contact: EmergencyContact) => {
    setCallingContactId(contact.id);
    const speakMsg = `Connecting call to ${contact.name}, ${contact.relationship} at ${contact.phone}.`;
    speakText(speakMsg, undefined, () => setCallingContactId(null), 0.9, 1.0, selectedLanguage);
    setTimeout(() => setCallingContactId(null), 4000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-rose-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-rose-500/30 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400 stroke-[2.5]" />
          <span className="font-black text-xs sm:text-sm text-rose-200 uppercase tracking-wider">
            Emergency Contacts & Guardian Hotline
          </span>
        </div>
        <span className="text-[10px] font-black uppercase bg-rose-500 text-white px-2.5 py-0.5 rounded-full animate-pulse">
          24/7 Active
        </span>
      </div>

      {/* Emergency Contacts List */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-3 bg-black/30 rounded-2xl border border-white/10 flex items-center justify-between gap-3 hover:border-rose-400/50 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              {contact.photoUrl ? (
                <img
                  src={contact.photoUrl}
                  alt={contact.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-rose-400 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-300 border border-rose-400 flex items-center justify-center shrink-0 font-black text-sm">
                  <User className="w-5 h-5 stroke-[2.5]" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h5 className="font-black text-xs sm:text-sm text-white truncate">
                    {contact.name}
                  </h5>
                  {contact.isPrimary && (
                    <span className="text-[9px] font-black bg-rose-500/30 text-rose-300 border border-rose-400/50 px-1.5 py-0.2 rounded">
                      PRIMARY
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-slate-300 truncate">
                  {contact.relationship} • {contact.phone}
                </p>
              </div>
            </div>

            {/* Quick Call Button */}
            <button
              type="button"
              onClick={() => handleCall(contact)}
              className={`${
                callingContactId === contact.id
                  ? 'bg-amber-600 border-amber-300 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300'
              } p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-md border min-h-[38px]`}
              title={`Call ${contact.name}`}
            >
              <PhoneCall className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">
                {callingContactId === contact.id ? 'Connecting...' : 'Call'}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Main SOS Trigger Button */}
      <button
        onClick={onTriggerSOS}
        className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl border-2 border-rose-300 transition-all active:scale-95 min-h-[48px]"
      >
        <AlertTriangle className="w-5 h-5 stroke-[2.8] animate-bounce" />
        <span>ONE-TAP SOS DISTRESS ALARM</span>
      </button>
    </div>
  );
};
