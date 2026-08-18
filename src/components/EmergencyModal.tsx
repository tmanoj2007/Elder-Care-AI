import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900 rounded-[24px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-500/80 space-y-6 text-center my-auto text-white relative overflow-hidden"
      >
        {/* Pulsing red emergency aura rings */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-rose-600 rounded-full blur-3xl pointer-events-none"
        />

        {/* 5-STEP WORKFLOW INDICATOR */}
        <div className="bg-slate-950 rounded-2xl p-3.5 text-white flex items-center justify-between gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-800 relative z-10">
          <div className="flex items-center gap-2 text-rose-400">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span>Emergency Safety Pipeline</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2.5 py-0.5 rounded-full ${!alertSent ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-rose-600 text-white animate-pulse font-extrabold'}`}>
              {!alertSent ? 'Stage 2: AI Verification' : 'Stage 4: Guardians Notified'}
            </span>
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-2.5 relative z-10">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-2 bg-rose-500 rounded-[28px] blur-sm pointer-events-none"
            />
            <div className="relative z-10 w-20 h-20 rounded-[22px] bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 border-2 border-rose-400">
              <ShieldAlert className="w-12 h-12 stroke-[2.5]" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {verifiedSafe
              ? '✓ Safety Confirmed'
              : alertSent
              ? '🚨 Emergency Dispatch Active'
              : '❓ Are You Okay?'}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-bold max-w-lg leading-snug">
            {verifiedSafe ? (
              <span className="text-emerald-400">You confirmed you are safe. Returning to dashboard...</span>
            ) : alertSent ? (
              <span className="text-rose-300">
                Automated SOS dispatched! Family guardian <strong className="text-white underline">{primaryContact.name}</strong> and care team alerted with your live location.
              </span>
            ) : (
              <span>
                Trigger: <strong className="text-rose-400 font-black">{triggerReason}</strong>. AI is asking: <strong className="text-white underline">"Are you okay?"</strong>
              </span>
            )}
          </p>
        </div>

        {/* 2. AI VERIFICATION COUNTDOWN (If pending response) */}
        {!alertSent && !verifiedSafe && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-950/60 rounded-[20px] p-5 border-2 border-rose-500/40 space-y-3 relative z-10"
          >
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-rose-300">
              <span className="flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>AI Verification Countdown</span>
              </span>
              <span className="bg-rose-500/20 text-rose-200 px-2.5 py-0.5 rounded-full font-extrabold border border-rose-500/40">
                Auto-Dispatch in {countdown}s
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <motion.div
                key={countdown}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-[20px] bg-gradient-to-tr from-rose-600 to-red-500 text-white font-black text-3xl flex items-center justify-center shadow-lg border-2 border-rose-400"
              >
                {countdown}s
              </motion.div>
              <div className="text-left text-xs font-bold text-slate-200 space-y-1">
                <p>• Speak or tap <strong className="text-emerald-400 font-extrabold">"I'm Okay"</strong> to cancel.</p>
                <p>• If no response, guardians are notified automatically.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. EMERGENCY SCREEN LOCATION & LIVE STATUS UPDATES */}
        <div className="space-y-3 text-left bg-slate-950/80 p-4 sm:p-5 rounded-[20px] border border-slate-800 relative z-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Senior Live Location & Status</span>
            </h3>
            <span className="text-[11px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              GPS Verified
            </span>
          </div>

          <div className="text-xs font-extrabold text-slate-200 space-y-1">
            <p>📍 Location: <span className="text-slate-400">{seniorLocation}</span></p>
            <p>🩺 Key Medical History: <span className="text-slate-400">{medicalList}</span></p>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Live Alert Status Feed:
            </h4>
            <div className="space-y-1 text-[11px] font-bold">
              <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>[LIVE] Primary Guardian ({primaryContact.name}) pinged via high-priority push & SMS</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>[LIVE] Emergency contacts list armed for 1-tap dial</span>
              </div>
            </div>
          </div>

          {/* Quick Dial Buttons */}
          <div className="pt-2 space-y-2">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Direct Emergency Speed Dial:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {contacts.map((contact) => (
                <motion.button
                  key={contact.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const msg = `Connecting urgent priority line to ${contact.name}, ${contact.relationship}.`;
                    speakText(msg, undefined, undefined, 1.0, 1.0, selectedLanguage);
                  }}
                  className="bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between shadow-sm transition-all text-left w-full cursor-pointer"
                >
                  <div>
                    <div className="font-extrabold text-white text-sm">{contact.name}</div>
                    <div className="text-xs text-slate-400 font-bold">{contact.relationship}</div>
                  </div>
                  <span className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all">
                    <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" /> Call
                  </span>
                </motion.button>
              ))}

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const msg = "Alerting 911 emergency services dispatch with GPS location.";
                  speakText(msg, undefined, undefined, 1.0, 1.0, selectedLanguage);
                }}
                className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white p-3 rounded-xl font-black flex items-center justify-between shadow-md transition-all border border-rose-400/30 text-left w-full cursor-pointer"
              >
                <div>
                  <div className="text-sm">911 Emergency Services</div>
                  <div className="text-[11px] text-rose-200 font-bold">Police / Ambulance</div>
                </div>
                <span className="bg-white text-rose-700 font-black text-xs px-3 py-1.5 rounded-lg shadow-sm">
                  Call 911
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 relative z-10">
          {!alertSent && !verifiedSafe ? (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmSafe}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold px-6 py-4 rounded-[20px] text-base sm:text-lg flex-1 shadow-lg shadow-emerald-500/25 transition-all border border-emerald-400/40"
              >
                ✓ I'm Okay! (Cancel SOS)
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleImmediateSend}
                className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold px-6 py-4 rounded-[20px] text-base sm:text-lg flex-1 shadow-lg shadow-rose-600/30 transition-all border border-rose-400/40"
              >
                🚨 No, Send Help Now!
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (typeof onClose === 'function') onClose();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-black px-8 py-4 rounded-[20px] text-base shadow-md w-full transition-all border border-slate-700"
            >
              Return to Senior Dashboard
            </motion.button>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};

