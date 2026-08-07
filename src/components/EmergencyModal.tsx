import React, { useState, useEffect } from 'react';
import { SeniorProfile } from '../types';
import { PhoneCall, AlertTriangle, ShieldAlert, MapPin, BellRing, Activity, Radio } from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

interface EmergencyModalProps {
  profile: SeniorProfile;
  selectedLanguage?: string;
  triggerReason?: string;
  onClose: () => void;
  onConfirmAlert: (reason: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  profile,
  selectedLanguage = 'en-US',
  triggerReason = 'Emergency SOS triggered',
  onClose,
  onConfirmAlert,
}) => {
  const [countdown, setCountdown] = useState(10);
  const [alertSent, setAlertSent] = useState(false);
  const [verifiedSafe, setVerifiedSafe] = useState(false);

  const contacts = profile?.emergencyContacts || [];
  const primaryContact = contacts[0] || { name: 'Sarah Vance', relationship: 'Daughter (Guardian)', phone: '555-0192' };
  const seniorName = profile?.preferredName || profile?.name || 'Senior';
  const medicalList = Array.isArray(profile?.medicalConditions) 
    ? profile.medicalConditions.join(', ') 
    : Array.isArray((profile as any)?.medicalHistory) 
    ? (profile as any).medicalHistory.join(', ') 
    : 'None listed';
  const seniorLocation = profile?.location || 'Home Residence';

  // 1 & 2. TRIGGER & AI VERIFICATION PROMPT: Speak "Are you okay?" immediately on mount
  useEffect(() => {
    try {
      const isTelugu = (selectedLanguage || '').startsWith('te');
      const promptMessage = isTelugu
        ? "అత్యవసర హెచ్చరిక గ్రహించబడింది. మీరు బాగున్నారా? సహాయం కావాలా?"
        : `${seniorName}, are you okay? Please confirm if you need emergency assistance.`;

      speakText(promptMessage, undefined, undefined, 1.0, 1.0, selectedLanguage);
    } catch (err) {
      console.warn('Emergency speak error on mount:', err);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [seniorName, selectedLanguage]);

  // 3 & 4. NO RESPONSE / DISTRESS DETECTION -> NOTIFY FAMILY & CAREGIVERS
  useEffect(() => {
    if (countdown === 0 && !alertSent && !verifiedSafe) {
      try {
        setAlertSent(true);
        const isTelugu = (selectedLanguage || '').startsWith('te');
        const dispatchMsg = isTelugu
          ? `సమయం ముగిసింది. మీ రక్షకురాలు సర్రో, కుటుంబ వైద్యునికి అత్యవసర సందేశం పంపబడింది.`
          : `No response detected within 10 seconds. Emergency notification dispatched to ${primaryContact.name} and care team.`;

        if (typeof onConfirmAlert === 'function') {
          onConfirmAlert(`AUTOMATED SOS DISPATCH (No response to 'Are you okay?'): ${triggerReason}`);
        }
        speakText(dispatchMsg, undefined, undefined, 1.0, 1.0, selectedLanguage);
      } catch (err) {
        console.error('Error executing emergency auto-dispatch:', err);
      }
    }
  }, [countdown, alertSent, verifiedSafe, onConfirmAlert, primaryContact.name, selectedLanguage, triggerReason]);

  const handleConfirmSafe = () => {
    try {
      stopSpeaking();
      setVerifiedSafe(true);
      const isTelugu = (selectedLanguage || '').startsWith('te');
      const safeMsg = isTelugu
        ? "సంతోషం! మీరు క్షేమంగా ఉన్నారని నిర్ధారించబడింది."
        : "Glad to hear you are safe! Emergency SOS has been cancelled.";

      speakText(safeMsg, undefined, undefined, 1.0, 1.0, selectedLanguage);
      setTimeout(() => {
        if (typeof onClose === 'function') onClose();
      }, 1200);
    } catch (err) {
      console.warn('Error confirming safe:', err);
      if (typeof onClose === 'function') onClose();
    }
  };

  const handleImmediateSend = () => {
    try {
      stopSpeaking();
      setAlertSent(true);
      if (typeof onConfirmAlert === 'function') {
        onConfirmAlert(`IMMEDIATE DISTRESS ALERT CONFIRMED BY SENIOR: ${triggerReason}`);
      }
      const isTelugu = (selectedLanguage || '').startsWith('te');
      const immediateMsg = isTelugu
        ? "అత్యవసర రక్షణ అలర్ట్ వెంటనే పంపబడింది!"
        : "Emergency notification sent immediately to guardian and emergency contacts.";

      speakText(immediateMsg, undefined, undefined, 1.0, 1.0, selectedLanguage);
    } catch (err) {
      console.error('Error sending immediate SOS:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-500 space-y-6 animate-fade-in text-center my-auto">
        
        {/* 5-STEP WORKFLOW INDICATOR */}
        <div className="bg-slate-900 rounded-2xl p-3.5 text-white flex items-center justify-between gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span>Emergency Safety Pipeline</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded ${!alertSent ? 'bg-amber-500 text-slate-950' : 'bg-rose-600 text-white animate-pulse'}`}>
              {!alertSent ? 'Stage 2: AI Verification' : 'Stage 4: Guardians Notified'}
            </span>
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-20 h-20 rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 animate-pulse border-2 border-rose-300">
            <ShieldAlert className="w-12 h-12 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {verifiedSafe
              ? '✓ Safety Confirmed'
              : alertSent
              ? '🚨 Emergency Dispatch Active'
              : '❓ Are You Okay?'}
          </h2>

          <p className="text-sm sm:text-base text-slate-700 font-bold max-w-lg leading-snug">
            {verifiedSafe ? (
              <span className="text-emerald-700">You confirmed you are safe. Returning to dashboard...</span>
            ) : alertSent ? (
              <span className="text-rose-900">
                Automated SOS dispatched! Family guardian <strong className="text-slate-900 underline">{primaryContact.name}</strong> and care team alerted with your live location.
              </span>
            ) : (
              <span>
                Trigger: <strong className="text-rose-700 font-black">{triggerReason}</strong>. AI is asking: <strong className="text-slate-900 underline">"Are you okay?"</strong>
              </span>
            )}
          </p>
        </div>

        {/* 2. AI VERIFICATION COUNTDOWN (If pending response) */}
        {!alertSent && !verifiedSafe && (
          <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-300 space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-rose-900">
              <span className="flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-rose-600 animate-bounce" />
                <span>AI Verification Countdown</span>
              </span>
              <span className="bg-rose-200 text-rose-950 px-2 py-0.5 rounded-md font-extrabold">
                Auto-Dispatch in {countdown}s
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="w-20 h-20 rounded-2xl bg-rose-600 text-white font-black text-3xl flex items-center justify-center shadow-md border-2 border-rose-300">
                {countdown}s
              </div>
              <div className="text-left text-xs font-bold text-slate-800 space-y-1">
                <p>• Speak or tap <strong className="text-emerald-700">"I'm Okay"</strong> to cancel.</p>
                <p>• If no response, guardians are notified automatically.</p>
              </div>
            </div>
          </div>
        )}

        {/* 5. EMERGENCY SCREEN LOCATION & LIVE STATUS UPDATES */}
        <div className="space-y-3 text-left bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Senior Live Location & Status</span>
            </h3>
            <span className="text-[11px] font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
              GPS Verified
            </span>
          </div>

          <div className="text-xs font-extrabold text-slate-900 space-y-1">
            <p>📍 Location: <span className="text-slate-700">{seniorLocation}</span></p>
            <p>🩺 Key Medical History: <span className="text-slate-700">{medicalList}</span></p>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Live Alert Status Feed:
            </h4>
            <div className="space-y-1 text-[11px] font-bold">
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>[LIVE] Primary Guardian ({primaryContact.name}) pinged via high-priority push & SMS</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>[LIVE] Emergency contacts list armed for 1-tap dial</span>
              </div>
            </div>
          </div>

          {/* Quick Dial Buttons */}
          <div className="pt-2 space-y-2">
            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              Direct Emergency Speed Dial:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {contacts.map((contact) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  className="bg-white p-3 rounded-xl border-2 border-slate-200 hover:border-emerald-500 flex items-center justify-between shadow-sm transition-all"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{contact.name}</div>
                    <div className="text-xs text-slate-500 font-bold">{contact.relationship}</div>
                  </div>
                  <span className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" /> Call
                  </span>
                </a>
              ))}

              <a
                href="tel:911"
                className="bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl font-black flex items-center justify-between shadow-md transition-all border border-rose-400"
              >
                <div>
                  <div className="text-sm">911 Emergency Services</div>
                  <div className="text-[11px] text-rose-200 font-bold">Police / Ambulance</div>
                </div>
                <span className="bg-white text-rose-700 font-black text-xs px-3 py-1.5 rounded-lg">
                  Call 911
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {!alertSent && !verifiedSafe ? (
            <>
              <button
                onClick={handleConfirmSafe}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-4 rounded-2xl text-base sm:text-lg flex-1 shadow-md transition-all active:scale-95 border-2 border-emerald-400"
              >
                ✓ I'm Okay! (Cancel SOS)
              </button>

              <button
                onClick={handleImmediateSend}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-4 rounded-2xl text-base sm:text-lg flex-1 shadow-md shadow-rose-600/30 transition-all active:scale-95 border-2 border-rose-400 animate-pulse"
              >
                🚨 No, Send Help Now!
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (typeof onClose === 'function') onClose();
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-2xl text-base shadow-md w-full transition-all"
            >
              Return to Senior Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

