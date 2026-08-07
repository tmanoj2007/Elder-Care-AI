import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: "ElderCare AI" });
});

// In-Memory Medication Data Store
interface MedicationStoreItem {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  frequency: 'Daily' | 'Twice Daily' | 'Every 8 Hours' | 'Weekly' | 'As Needed';
  instructions?: string;
  category?: string;
  pillCount?: number;
  refillThreshold?: number;
  status: 'active' | 'paused';
  todayStatus: 'taken' | 'missed' | 'pending';
  lastTakenAt?: string;
}

interface MedicationLogStoreItem {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: 'taken' | 'missed' | 'skipped';
  timestamp: string;
  date: string;
  loggedBy: 'senior' | 'caregiver' | 'system';
  notes?: string;
}

let medicationsStore: MedicationStoreItem[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dosage: '10mg (1 tablet)',
    scheduledTime: '08:00 AM',
    frequency: 'Daily',
    instructions: 'Take in the morning with a full glass of water',
    category: 'Heart & Blood Pressure',
    pillCount: 24,
    refillThreshold: 7,
    status: 'active',
    todayStatus: 'taken',
    lastTakenAt: '08:12 AM',
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500mg (1 tablet)',
    scheduledTime: '01:00 PM',
    frequency: 'Twice Daily',
    instructions: 'Take with food or immediately after lunch',
    category: 'Diabetes Care',
    pillCount: 18,
    refillThreshold: 5,
    status: 'active',
    todayStatus: 'pending',
  },
  {
    id: 'med-3',
    name: 'Amlodipine',
    dosage: '5mg (1 tablet)',
    scheduledTime: '06:30 PM',
    frequency: 'Daily',
    instructions: 'Take during dinner',
    category: 'Heart & Blood Pressure',
    pillCount: 28,
    refillThreshold: 7,
    status: 'active',
    todayStatus: 'pending',
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 & Calcium',
    dosage: '2000 IU (1 softgel)',
    scheduledTime: '09:00 AM',
    frequency: 'Daily',
    instructions: 'Take after breakfast',
    category: 'Vitamins & Bone Health',
    pillCount: 45,
    refillThreshold: 10,
    status: 'active',
    todayStatus: 'taken',
    lastTakenAt: '09:05 AM',
  },
];

let medicationLogsStore: MedicationLogStoreItem[] = [
  {
    id: 'log-101',
    medicationId: 'med-1',
    medicationName: 'Lisinopril',
    dosage: '10mg (1 tablet)',
    scheduledTime: '08:00 AM',
    status: 'taken',
    timestamp: '08:12 AM',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    loggedBy: 'senior',
    notes: 'Taken with breakfast tea.',
  },
  {
    id: 'log-102',
    medicationId: 'med-4',
    medicationName: 'Vitamin D3 & Calcium',
    dosage: '2000 IU (1 softgel)',
    scheduledTime: '09:00 AM',
    status: 'taken',
    timestamp: '09:05 AM',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    loggedBy: 'senior',
    notes: 'Logged via voice check-in.',
  },
  {
    id: 'log-100',
    medicationId: 'med-3',
    medicationName: 'Amlodipine',
    dosage: '5mg (1 tablet)',
    scheduledTime: '06:30 PM',
    status: 'missed',
    timestamp: '07:45 PM',
    date: 'Yesterday',
    loggedBy: 'system',
    notes: 'Auto-flagged missed dose by system timer.',
  },
];

// Helper function to parse scheduled time into minutes
function parseScheduledTimeToMinutesServer(timeStr: string): number {
  if (!timeStr) return 0;
  const cleanStr = timeStr.trim().toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');
  const match = cleanStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isPM && hours < 12) hours += 12;
  else if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// GET All Medications (with automatic missed task enforcement)
app.get("/api/medications", (req, res) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Auto-flag missed doses if scheduled time + 30 mins has passed and still pending
  medicationsStore.forEach((med) => {
    if (med.todayStatus === 'pending' || !med.todayStatus) {
      const scheduledMinutes = parseScheduledTimeToMinutesServer(med.scheduledTime);
      if (currentMinutes > (scheduledMinutes + 30)) {
        med.todayStatus = 'missed';
        
        // Add system log entry if not already logged
        const existingLog = medicationLogsStore.find(l => l.medicationId === med.id && l.status === 'missed' && l.date === now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        if (!existingLog) {
          medicationLogsStore.unshift({
            id: `log-auto-${Date.now()}`,
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            scheduledTime: med.scheduledTime,
            status: 'missed',
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            loggedBy: 'system',
            notes: 'Auto-flagged missed dose by system time-check.',
          });
        }
      }
    }
  });

  res.json({ medications: medicationsStore });
});

// POST Add New Medication
app.post("/api/medications", (req, res) => {
  try {
    const { name, dosage, scheduledTime, frequency, instructions, category, pillCount, refillThreshold } = req.body;
    if (!name || !dosage || !scheduledTime) {
      return res.status(400).json({ error: "Medicine name, dosage, and scheduled time are required." });
    }

    const newMed: MedicationStoreItem = {
      id: `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim(),
      scheduledTime: scheduledTime.trim(),
      frequency: frequency || 'Daily',
      instructions: instructions ? instructions.trim() : undefined,
      category: category || 'General',
      pillCount: typeof pillCount === 'number' ? pillCount : 30,
      refillThreshold: typeof refillThreshold === 'number' ? refillThreshold : 7,
      status: 'active',
      todayStatus: 'pending',
    };

    medicationsStore.unshift(newMed);
    res.status(201).json({ success: true, medication: newMed, medications: medicationsStore });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add medication" });
  }
});

// DELETE Medication
app.delete("/api/medications/:id", (req, res) => {
  const { id } = req.params;
  medicationsStore = medicationsStore.filter((m) => m.id !== id);
  res.json({ success: true, medications: medicationsStore });
});

// GET Medication Event Logs
app.get("/api/medications/logs", (req, res) => {
  res.json({ logs: medicationLogsStore });
});

// POST Log Medication Event ('taken' or 'missed')
app.post("/api/medications/log", (req, res) => {
  try {
    const { medicationId, status, loggedBy = 'senior', notes = '', overrideTime = false } = req.body;
    
    const medIndex = medicationsStore.findIndex((m) => m.id === medicationId);
    if (medIndex === -1) {
      return res.status(404).json({ error: "Medication not found" });
    }

    const med = medicationsStore[medIndex];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const scheduledMinutes = parseScheduledTimeToMinutesServer(med.scheduledTime);

    // TIME-BASED VALIDATION: Prevent premature logging if scheduled time has not arrived yet
    if (status === 'taken' && !overrideTime && currentMinutes < scheduledMinutes) {
      const minutesUntil = scheduledMinutes - currentMinutes;
      const hrs = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      const timeRemainingStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

      return res.status(400).json({
        error: `Premature completion restricted: "${med.name}" is scheduled for later today at ${med.scheduledTime} (in ${timeRemainingStr}). Please wait until its scheduled time.`,
        isPremature: true,
        scheduledTime: med.scheduledTime,
        timeRemaining: timeRemainingStr,
      });
    }

    const nowTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Update medication status
    med.todayStatus = status === 'taken' ? 'taken' : 'missed';
    if (status === 'taken') {
      med.lastTakenAt = nowTimeStr;
      if (typeof med.pillCount === 'number' && med.pillCount > 0) {
        med.pillCount -= 1;
      }
    }

    // Create Log Entry
    const newLog: MedicationLogStoreItem = {
      id: `log-${Date.now()}`,
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledTime: med.scheduledTime,
      status: status,
      timestamp: nowTimeStr,
      date: nowDateStr,
      loggedBy,
      notes: notes || (status === 'taken' ? 'Confirmed pill taken.' : 'Marked as missed by user/caregiver.'),
    };

    medicationLogsStore.unshift(newLog);

    res.json({
      success: true,
      log: newLog,
      medications: medicationsStore,
      logs: medicationLogsStore,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to log medication event" });
  }
});

// Daily Check-In Store & Endpoints
interface DailyCheckInItem {
  id: string;
  period: 'morning' | 'evening';
  date: string;
  timestamp: string;
  wellbeing: string;
  meals: string;
  sleep: string;
  mood: string;
  completedBy: 'senior' | 'caregiver';
}

let dailyCheckInsStore: DailyCheckInItem[] = [
  {
    id: 'checkin-1',
    period: 'morning',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: '08:15 AM',
    wellbeing: 'Feeling refreshed and well',
    meals: 'Ate oatmeal and fruit breakfast',
    sleep: 'Rested for 7.5 hours quietly',
    mood: 'Cheerful & calm',
    completedBy: 'senior',
  },
  {
    id: 'checkin-0',
    period: 'evening',
    date: 'Yesterday',
    timestamp: '07:30 PM',
    wellbeing: 'Comfortable, mild knee tightness',
    meals: 'Had warm soup & salad dinner',
    sleep: 'Slept well night before',
    mood: 'Content & relaxed',
    completedBy: 'senior',
  },
];

app.get("/api/daily-checkins", (req, res) => {
  res.json({ checkIns: dailyCheckInsStore });
});

app.post("/api/daily-checkins", (req, res) => {
  try {
    const { period = 'morning', wellbeing, meals, sleep, mood, completedBy = 'senior' } = req.body;
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newLog: DailyCheckInItem = {
      id: `checkin-${Date.now()}`,
      period: period === 'evening' ? 'evening' : 'morning',
      date: nowDateStr,
      timestamp: nowTimeStr,
      wellbeing: wellbeing || 'Feeling good',
      meals: meals || 'Meals taken on schedule',
      sleep: sleep || 'Rested comfortably',
      mood: mood || 'Calm',
      completedBy,
    };

    dailyCheckInsStore.unshift(newLog);
    res.status(201).json({ success: true, checkIn: newLog, checkIns: dailyCheckInsStore });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to record daily check-in" });
  }
});

// Speech Monitoring Metrics Store & Endpoints
const speechBaseline = {
  speakingRate: 135, // Words Per Minute (WPM)
  pauseDuration: 0.8, // Seconds average
  responseLatency: 1.1, // Seconds delay before speaking
};

let speechHistory = [
  { date: 'Aug 1', speakingRate: 136, pauseDuration: 0.78, responseLatency: 1.05, cadenceIndex: 98 },
  { date: 'Aug 2', speakingRate: 134, pauseDuration: 0.82, responseLatency: 1.10, cadenceIndex: 97 },
  { date: 'Aug 3', speakingRate: 135, pauseDuration: 0.80, responseLatency: 1.08, cadenceIndex: 98 },
  { date: 'Aug 4', speakingRate: 133, pauseDuration: 0.85, responseLatency: 1.12, cadenceIndex: 95 },
  { date: 'Aug 5', speakingRate: 136, pauseDuration: 0.79, responseLatency: 1.09, cadenceIndex: 98 },
  { date: 'Aug 6', speakingRate: 132, pauseDuration: 0.88, responseLatency: 1.20, cadenceIndex: 93 },
  { date: 'Aug 7', speakingRate: 134, pauseDuration: 0.83, responseLatency: 1.12, cadenceIndex: 97 },
];

let currentSpeechMetrics = {
  date: 'Today',
  speakingRate: 134,
  pauseDuration: 0.83,
  responseLatency: 1.12,
  cadenceIndex: 97,
};

function evaluateSpeechStatus(current: typeof currentSpeechMetrics, baseline: typeof speechBaseline) {
  // Check deviation from personal baseline (e.g. >18% slower rate or >45% longer pause/latency)
  const rateDiff = Math.abs(current.speakingRate - baseline.speakingRate) / baseline.speakingRate;
  const pauseDiff = Math.abs(current.pauseDuration - baseline.pauseDuration) / baseline.pauseDuration;
  const latencyDiff = Math.abs(current.responseLatency - baseline.responseLatency) / baseline.responseLatency;

  if (rateDiff > 0.18 || pauseDiff > 0.45 || latencyDiff > 0.45) {
    return {
      status: 'Possible Change Detected' as const,
      statusReason: 'Speech cadence shows slight variation from target personal acoustic baseline. Rhythm monitoring recommended.',
    };
  }

  return {
    status: 'Stable' as const,
    statusReason: 'Speech rate, pause timing, and response latency remain within steady personal acoustic baseline range.',
  };
}

app.get("/api/speech-metrics", (req, res) => {
  const evalResult = evaluateSpeechStatus(currentSpeechMetrics, speechBaseline);
  res.json({
    baseline: speechBaseline,
    history: speechHistory,
    currentMetrics: currentSpeechMetrics,
    status: evalResult.status,
    statusReason: evalResult.statusReason,
  });
});

app.post("/api/speech-metrics/sample", (req, res) => {
  try {
    const { speakingRate, pauseDuration, responseLatency } = req.body;

    const rate = Number(speakingRate) || (128 + Math.floor(Math.random() * 12));
    const pause = Number(pauseDuration) || Number((0.75 + Math.random() * 0.25).toFixed(2));
    const latency = Number(responseLatency) || Number((1.0 + Math.random() * 0.3).toFixed(2));

    // Simple cadence index calculation out of 100
    const score = Math.max(70, Math.min(100, Math.round(100 - (Math.abs(rate - speechBaseline.speakingRate) * 0.5 + Math.abs(pause - speechBaseline.pauseDuration) * 10 + Math.abs(latency - speechBaseline.responseLatency) * 8))));

    currentSpeechMetrics = {
      date: 'Today',
      speakingRate: rate,
      pauseDuration: pause,
      responseLatency: latency,
      cadenceIndex: score,
    };

    // Update today entry in history
    speechHistory[speechHistory.length - 1] = { ...currentSpeechMetrics, date: 'Aug 7' };

    const evalResult = evaluateSpeechStatus(currentSpeechMetrics, speechBaseline);

    res.json({
      success: true,
      baseline: speechBaseline,
      history: speechHistory,
      currentMetrics: currentSpeechMetrics,
      status: evalResult.status,
      statusReason: evalResult.statusReason,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to record speech metric sample" });
  }
});



// Helper function for speech transcript cleaning & normalization
function cleanSpeechTranscript(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/^["'\s]+|["'\s]+$/g, "") // trim leading/trailing quotes and spaces
    .replace(/\b(um|uh|hmm|err|ah|like)\b/gi, "") // remove common voice fillers
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

// Helper function for rule-based symptom extraction fallback with Telugu & Multilingual support
function analyzeSymptomFallback(prompt: string, seniorName: string, selectedLanguage: string = 'English') {
  const cleanedPrompt = cleanSpeechTranscript(prompt);
  const text = cleanedPrompt.toLowerCase();
  const langLower = (selectedLanguage || 'English').toLowerCase();
  
  const isTelugu = /[\u0C00-\u0C7F]/.test(cleanedPrompt) || langLower.includes('telugu') || langLower.startsWith('te');
  const isHindi = /[\u0900-\u097F]/.test(cleanedPrompt) || langLower.includes('hindi') || langLower.startsWith('hi');
  const isKannada = /[\u0C80-\u0CFF]/.test(cleanedPrompt) || langLower.includes('kannada') || langLower.startsWith('kn');
  const isTamil = /[\u0B80-\u0BFF]/.test(cleanedPrompt) || langLower.includes('tamil') || langLower.startsWith('ta');
  const isMalayalam = /[\u0D00-\u0D7F]/.test(cleanedPrompt) || langLower.includes('malayalam') || langLower.startsWith('ml');
  const isMarathi = langLower.includes('marathi') || langLower.startsWith('mr');
  const isBengali = /[\u0980-\u09FF]/.test(cleanedPrompt) || langLower.includes('bengali') || langLower.startsWith('bn');
  const isGujarati = /[\u0A80-\u0AFF]/.test(cleanedPrompt) || langLower.includes('gujarati') || langLower.startsWith('gu');
  const isPunjabi = /[\u0A00-\u0A7F]/.test(cleanedPrompt) || langLower.includes('punjabi') || langLower.startsWith('pa');
  const isOdia = /[\u0B00-\u0B7F]/.test(cleanedPrompt) || langLower.includes('odia') || langLower.startsWith('or');
  const isUrdu = /[\u0600-\u06FF]/.test(cleanedPrompt) || langLower.includes('urdu') || langLower.startsWith('ur');

  // Helper generator for fallback messages in specific script
  const getLocalizedFallbackReply = (type: 'emergency' | 'cold' | 'throat' | 'headache' | 'dizziness' | 'joint' | 'meds' | 'general') => {
    if (isTelugu) {
      if (type === 'emergency') return `${seniorName} గారూ, దయచేసి ప్రశాంతంగా ఒక్కచోట కూర్చోండి! నేను వెంటనే మీ కేర్‌గైవర్‌కు అత్యవసర అలర్ట్ పంపుతున్నాను.`;
      if (type === 'cold') return `${seniorName} గారూ, మీకు చలిగా అనిపిస్తోందా! దయచేసి వెచ్చని దుప్పటి కప్పుకొని, వేడి నీరు లేదా టీ తాగండి.`;
      if (type === 'throat') return `${seniorName} గారూ, మీ గొంతు నొప్పిగా ఉంటే, కొద్దిగా తేనె కలిపిన గోరువెచ్చని నీరు తాగండి.`;
      if (type === 'headache') return `${seniorName} గారూ, మీ తలనొప్పి తగ్గడానికి ప్రశాంతంగా కళ్ళు మూసుకొని విశ్రాంతి తీసుకోండి.`;
      if (type === 'dizziness') return `${seniorName} గారూ, దయచేసి వెంటనే కూర్చోండి! కొద్దిగా నీరు తాగండి. కేర్‌గైవర్‌కు సమాచారం అందించాను.`;
      if (type === 'joint') return `${seniorName} గారూ, నొప్పి ఉన్న చోట వెచ్చని కాపడం పెట్టుకొని హాయిగా విశ్రాంతి తీసుకోండి.`;
      if (type === 'meds') return `చాలా మంచిది ${seniorName} గారూ! మీ మందులు వేసుకున్నందుకు సంతోషం. తగినంత మంచినీళ్లు తాగండి!`;
      return `నమస్కారం ${seniorName} గారూ! ఈ రోజు మీరు ఎలా ఉన్నారు? మీ మందులు వేసుకోవడం మరచిపోకండి!`;
    }
    if (isHindi || isMarathi) {
      if (type === 'emergency') return `${seniorName} जी, कृपया शांत रहें और बैठ जाएँ! मैं तुरंत आपके केयरगिवर को इमरजेंसी अलर्ट भेज रहा हूँ।`;
      if (type === 'cold') return `${seniorName} जी, क्या आपको ठंड लग रही है? कृपया गर्म कंबल ओढ़ें और गर्म पानी या चाय पिएं।`;
      if (type === 'throat') return `${seniorName} जी, अगर आपके गले में दर्द है, तो शहद के साथ गुनगुना पानी पिएं और आराम करें।`;
      if (type === 'headache') return `${seniorName} जी, सिरदर्द के लिए थोड़ी देर आँखें बंद करके शांत कमरे में आराम करें।`;
      if (type === 'dizziness') return `${seniorName} जी, कृपया तुरंत बैठ जाएँ! थोड़ा पानी पिएं। मैंने आपके केयरगिवर को सूचित कर दिया है।`;
      if (type === 'joint') return `${seniorName} जी, दर्द वाली जगह पर हल्की सिकाई करें और आराम से बैठें।`;
      if (type === 'meds') return `बहुत बढ़िया ${seniorName} जी! दवा लेने के लिए धन्यवाद। पर्याप्त पानी पिएं!`;
      return `नमस्ते ${seniorName} जी! आज आप कैसा महसूस कर रहे हैं? अपनी दवाएं और पानी समय पर लें!`;
    }
    if (isKannada) {
      if (type === 'emergency') return `${seniorName} ಅವರೇ, ದಯವಿಟ್ಟು ಶಾಂತವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ! ನಾನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ಗಾರ್ಡಿಯನ್‌ಗೆ ತುರ್ತು ಸಂದೇಶ ಕಳುಹಿಸುತ್ತಿದ್ದೇನೆ.`;
      if (type === 'cold') return `${seniorName} ಅವರೇ, ನಿಮಗೆ ಚಳಿ ಅನಿಸುತ್ತಿದೆಯೇ? ಬಿಸಿ ನೀರು ಕುಡಿದು ಬೆಚ್ಚನೆಯ ಹೊದಿಕೆ ಹೊದ್ದುಕೊಳ್ಳಿ.`;
      if (type === 'throat') return `${seniorName} ಅವರೇ, ಗಂಟಲು ನೋವಿದ್ದರೆ ಜೇನುತುಪ್ಪದೊಂದಿಗೆ ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರು ಕುಡಿಯಿರಿ.`;
      if (type === 'headache') return `${seniorName} ಅವರೇ, ತಲೆನೋವಿಗೆ ಸ್ವಲ್ಪ ಸಮಯ ಕಣ್ಣು ಮುಚ್ಚಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.`;
      if (type === 'dizziness') return `${seniorName} ಅವರೇ, ತಕ್ಷಣ ಕುಳಿತುಕೊಳ್ಳಿ ಮತ್ತು ಸ್ವಲ್ಪ ನೀರು ಕುಡಿಯಿರಿ.`;
      if (type === 'joint') return `${seniorName} ಅವರೇ, ನೋವಿರುವ ಜಾಗಕ್ಕೆ ಬಿಸಿ ಶಾಖ ಕೊಟ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.`;
      if (type === 'meds') return `ತುಂಬಾ ಒಳ್ಳೆಯದು ${seniorName} ಅವರೇ! ನಿಮ್ಮ ಔಷಧಿಯನ್ನು ತೆಗೆದುಕೊಂಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.`;
      return `ನಮಸ್ಕಾರ ${seniorName} ಅವರೇ! ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯ ಹೇಗಿದೆ?`;
    }
    if (isTamil) {
      if (type === 'emergency') return `${seniorName}, தயவுசெய்து அமைதியாக உட்காருங்கள்! நான் உடனே உங்கள் பராமரிப்பாளருக்கு அவசர எச்சரிக்கை அனுப்புகிறேன்.`;
      if (type === 'cold') return `${seniorName}, உங்களுக்கு குளிராக இருக்கிறதா? இதமான போர்வை போர்த்தி வெதுவெதுப்பான நீர் அருந்துங்கள்.`;
      if (type === 'throat') return `${seniorName}, தொண்டை வலிக்கு தேன் கலந்த வெதுவெதுப்பான நீர் அருந்தி ஓய்வெடுங்கள்.`;
      if (type === 'headache') return `${seniorName}, தலைவலி குறைய சிறிது நேரம் அமைதியாக ஓய்வெடுங்கள்.`;
      if (type === 'dizziness') return `${seniorName}, உடனே அமருங்கள்! சிறிது தண்ணீர் அருந்துங்கள்.`;
      if (type === 'joint') return `${seniorName}, வலி உள்ள இடத்தில் மிதமான ஒத்தடம் கொடுத்து ஓய்வெடுங்கள்.`;
      if (type === 'meds') return `மிக நன்று ${seniorName}! உங்கள் மருந்துகளை எடுத்துக் கொண்டதற்கு நன்றி.`;
      return `வணக்கம் ${seniorName}! இன்று உங்கள் உடல்நலம் எப்படி இருக்கிறது?`;
    }
    if (isMalayalam) {
      if (type === 'emergency') return `${seniorName}, ദയവായി ശാന്തമായി ഇരിക്കൂ! ഞാൻ ഉടൻ തന്നെ അടിയന്തര സന്ദേശം അയക്കുന്നു.`;
      if (type === 'cold') return `${seniorName}, തണുപ്പ് അനുഭവപ്പെടുന്നുണ്ടെങ്കിൽ ചൂടുവെള്ളം കുടിക്കൂ, വിശ്രമിക്കൂ.`;
      if (type === 'throat') return `${seniorName}, തൊണ്ടവേദനയ്ക്ക് തേൻ ചേർത്ത ചെറുചൂടുവെള്ളം കുടിക്കൂ.`;
      if (type === 'headache') return `${seniorName}, തലവേദന മാറ്റാൻ കുറച്ചു സമയം കണ്ണടച്ച് വിശ്രമിക്കൂ.`;
      if (type === 'dizziness') return `${seniorName}, ദയവായി ഉടൻ ഇരിക്കൂ! അല്പം വെള്ളം കുടിക്കൂ.`;
      if (type === 'joint') return `${seniorName}, വേദനയുള്ള ഭാഗത്ത് ചൂടുപിടിക്കൂ, വിശ്രമിക്കൂ.`;
      if (type === 'meds') return `വളരെ സന്തോഷം ${seniorName}! മരുന്ന് കഴിച്ചതിന് നന്ദി.`;
      return `നമസ്കാരം ${seniorName}! ഇന്ന് നിങ്ങളുടെ ആരോഗ്യം എങ്ങനെയുണ്ട്?`;
    }
    if (isBengali) {
      if (type === 'emergency') return `${seniorName}, দয়া করে শান্ত হয়ে বসুন! আমি অবিলম্বে জরুরি অ্যালার্ট পাঠাচ্ছি।`;
      if (type === 'cold') return `${seniorName}, আপনার কি ঠান্ডা লাগছে? গরম জল বা চা পান করুন এবং বিশ্রাম নিন।`;
      if (type === 'throat') return `${seniorName}, গলার ব্যথার জন্য হালকা গরম জলে মধু মিশিয়ে পান করুন।`;
      if (type === 'headache') return `${seniorName}, মাথা ব্যথার জন্য একটু চোখ বন্ধ করে শান্ত ঘরে বিশ্রাম নিন।`;
      if (type === 'dizziness') return `${seniorName}, দয়া করে এখনই বসে পড়ুন! অল্প জল পান করুন।`;
      if (type === 'joint') return `${seniorName}, ব্যথার জায়গায় হালকা গরম সেক দিন এবং বিশ্রাম নিন।`;
      if (type === 'meds') return `খুব ভালো ${seniorName}! ওষুধ খাওয়ার জন্য ধন্যবাদ।`;
      return `নমস্কার ${seniorName}! আজ আপনার শরীর কেমন আছে?`;
    }
    if (isGujarati) {
      if (type === 'emergency') return `${seniorName}, કૃપા કરીને શાંતિથી બેસી જાવ! હું તરત જ ઇમરજન્સી એલર્ટ મોકલી રહ્યો છું.`;
      if (type === 'cold') return `${seniorName}, શું તમને ઠંડી લાગે છે? ગરમ ધાબળો ઓઢીને નવશેકું પાણી પીઓ.`;
      if (type === 'throat') return `${seniorName}, ગળાના દુખાવા માટે મધવાળું નવશેકું પાણી પીઓ.`;
      if (type === 'headache') return `${seniorName}, માથાના દુખાવા માટે થોડીવાર આંખો બંધ કરીને આરામ કરો.`;
      if (type === 'dizziness') return `${seniorName}, કૃપા કરીને તરત જ બેસી જાવ! થોડું પાણી પીઓ.`;
      if (type === 'joint') return `${seniorName}, દુખાવા વાળી જગ્યાએ શેક કરો અને આરામ કરો.`;
      if (type === 'meds') return `ખૂબ સરસ ${seniorName}! દવા લેવા બદલ આભાર.`;
      return `નમસ્તે ${seniorName}! આજે તમારી તબિયત કેવી છે?`;
    }
    if (isPunjabi) {
      if (type === 'emergency') return `${seniorName}, ਕਿਰਪਾ ਕਰਕੇ ਸ਼ਾਂਤ ਹੋ ਕੇ ਬੈਠ ਜਾਓ! ਮੈਂ ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਭੇਜ ਰਿਹਾ ਹਾਂ।`;
      if (type === 'cold') return `${seniorName}, ਕੀ ਤੁਹਾਨੂੰ ਠੰਢ ਲੱਗ ਰਹੀ ਹੈ? ਗਰਮ ਪਾਣੀ ਜਾਂ ਚਾਹ ਪੀਓ ਅਤੇ ਆਰਾਮ ਕਰੋ।`;
      if (type === 'throat') return `${seniorName}, ਗਲੇ ਦੇ ਦਰਦ ਲਈ ਸ਼ਹਿਦ ਵਾਲਾ ਗਰਮ ਪਾਣੀ ਪੀਓ।`;
      if (type === 'headache') return `${seniorName}, ਸਿਰ ਦਰਦ ਲਈ ਥੋੜ੍ਹੀ ਦੇਰ ਅੱਖਾਂ ਬੰਦ ਕਰਕੇ ਆਰਾਮ ਕਰੋ।`;
      if (type === 'dizziness') return `${seniorName}, ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਬੈਠ ਜਾਓ! ਥੋੜ੍ਹਾ ਪਾਣੀ ਪੀਓ।`;
      if (type === 'joint') return `${seniorName}, ਦਰਦ ਵਾਲੀ ਜਗ੍ਹਾ 'ਤੇ ਸੇਕ ਦਿਓ ਅਤੇ ਆਰਾਮ ਕਰੋ।`;
      if (type === 'meds') return `ਬਹੁਤ ਵਧੀਆ ${seniorName}! ਦਵਾਈ ਲੈਣ ਲਈ ਧੰਨਵਾਦ।`;
      return `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${seniorName}! ਅੱਜ ਤੁਹਾਡੀ ਸਿਹਤ ਕਿਵੇਂ ਹੈ?`;
    }
    if (isUrdu) {
      if (type === 'emergency') return `${seniorName}، براہ کرم سکون سے بیٹھ جائیں! میں فوراً ایمرجنسی الرٹ بھیج رہا ہوں۔`;
      if (type === 'cold') return `${seniorName}، کیا آپ کو سردی لگ رہی ہے؟ گرم پانی پیئیں اور آرام کریں۔`;
      if (type === 'throat') return `${seniorName}، گلے کے درد کے لیے شہد کا گرم پانی پیئیں۔`;
      if (type === 'headache') return `${seniorName}، سر درد کے لیے تھوڑی دیر آرام کریں۔`;
      if (type === 'dizziness') return `${seniorName}، براہ کرم فوراً بیٹھ جائیں! کچھ پانی پیئیں۔`;
      if (type === 'joint') return `${seniorName}، درد کی جگہ پر ہلکی سیک دیں اور آرام کریں۔`;
      if (type === 'meds') return `بہت خوب ${seniorName}! دوا لینے کا شکریہ۔`;
      return `السلام علیکم ${seniorName}! آج آپ کی طبیعت کیسی ہے؟`;
    }

    // Default English
    if (type === 'emergency') return `Oh dear ${seniorName}, please sit still and stay calm! I am immediately triggering an automated high-priority guardian alert for your caregiver right now. Help is on the way!`;
    if (type === 'cold') return `I hear you ${seniorName}! It sounds like you're feeling chilly. Wrap yourself in a warm blanket and sip a warm mug of tea or warm water.`;
    if (type === 'throat') return `I'm sorry your throat is bothering you ${seniorName}. Try sipping warm water with honey and resting comfortably.`;
    if (type === 'headache') return `I'm so sorry you have a headache ${seniorName}. Please drink a fresh glass of water and rest comfortably in a quiet room.`;
    if (type === 'dizziness') return `${seniorName}, please sit down comfortably right now! Sip water slowly while I inform your caregiver.`;
    if (type === 'joint') return `I'm sending warm comfort your way ${seniorName}. Apply a gentle warm compress to the sore area and rest comfortably.`;
    if (type === 'meds') return `Wonderful job ${seniorName}! Thank you for keeping up with your scheduled medicine today. You are doing great!`;
    return `It is lovely talking with you ${seniorName}! How are you feeling overall today? Remember to take your scheduled medications and drink fresh water!`;
  };

  // 1. Urgent / Emergency
  if (
    text.includes('fall') || text.includes('fell') || text.includes('chest pain') ||
    text.includes('cannot breathe') || text.includes("can't breathe") || text.includes('bleeding') ||
    text.includes('stroke') || text.includes('severe pain') || text.includes('emergency') ||
    text.includes('help me') || text.includes('sos') || text.includes('collapsed') ||
    text.includes('పడిపోయాను') || text.includes('ఛాతీ నొప్పి') || text.includes('సహాయం') ||
    text.includes('padi poyanu') || text.includes('gir gaya') || text.includes('chhati dard')
  ) {
    return {
      replyText: getLocalizedFallbackReply('emergency'),
      detectedMood: 'anxious',
      symptomDetected: 'Emergency Distress Incident',
      suggestedSelfCare: 'Stay completely still in a safe position.',
      detectedTone: 'distressed',
      urgencyLevel: 'critical',
      flaggedConcern: `CRITICAL GUARDIAN ALERT: ${seniorName} reported "${cleanedPrompt}"`,
      isEmergency: true,
    };
  }

  // 2. Cold / Chills
  if (
    text.includes('cold') || text.includes('chilly') || text.includes('shivering') ||
    text.includes('చలి') || text.includes('thand') || text.includes('frio')
  ) {
    return {
      replyText: getLocalizedFallbackReply('cold'),
      detectedMood: 'tired',
      symptomDetected: 'Feeling Cold / Chills',
      suggestedSelfCare: 'Wrap in a warm blanket and drink warm water or tea.',
      detectedTone: 'shivering',
      urgencyLevel: 'low',
      flaggedConcern: `${seniorName} reported feeling cold/chilly.`,
      isEmergency: false,
    };
  }

  // 3. Sore Throat / Cough
  if (
    text.includes('throat') || text.includes('cough') || text.includes('flu') ||
    text.includes('గొంతు') || text.includes('దగ్గు') || text.includes('khansi')
  ) {
    return {
      replyText: getLocalizedFallbackReply('throat'),
      detectedMood: 'tired',
      symptomDetected: 'Sore Throat / Cough Discomfort',
      suggestedSelfCare: 'Sip warm water with honey and rest.',
      detectedTone: 'fatigued',
      urgencyLevel: 'low',
      flaggedConcern: `${seniorName} mentioned sore throat/cough symptoms.`,
      isEmergency: false,
    };
  }

  // 4. Headache / Fever
  if (
    text.includes('headache') || text.includes('fever') ||
    text.includes('తలనొప్పి') || text.includes('జ్వరం') || text.includes('sar dard')
  ) {
    return {
      replyText: getLocalizedFallbackReply('headache'),
      detectedMood: 'tired',
      symptomDetected: 'Headache / Tension',
      suggestedSelfCare: 'Dim room lights, drink fresh water, and rest.',
      detectedTone: 'fatigued',
      urgencyLevel: 'low',
      flaggedConcern: `${seniorName} reported a headache.`,
      isEmergency: false,
    };
  }

  // 5. Dizziness
  if (
    text.includes('dizzy') || text.includes('lightheaded') || text.includes('unsteady') ||
    text.includes('కళ్లు తిరగడం') || text.includes('chakkar')
  ) {
    return {
      replyText: getLocalizedFallbackReply('dizziness'),
      detectedMood: 'anxious',
      symptomDetected: 'Dizziness / Unsteady Balance',
      suggestedSelfCare: 'Sit down immediately and drink water slowly.',
      detectedTone: 'unsteady',
      urgencyLevel: 'moderate',
      flaggedConcern: `MODERATE ESCALATION: ${seniorName} reported feeling dizzy.`,
      isEmergency: false,
    };
  }

  // 6. Joint Pain
  if (
    text.includes('pain') || text.includes('hurt') || text.includes('knee') ||
    text.includes('నొప్పి') || text.includes('dard')
  ) {
    return {
      replyText: getLocalizedFallbackReply('joint'),
      detectedMood: 'tired',
      symptomDetected: 'Joint Stiffness / Body Ache',
      suggestedSelfCare: 'Apply gentle warm compress and rest.',
      detectedTone: 'pained',
      urgencyLevel: 'low',
      flaggedConcern: `${seniorName} noted joint/body ache.`,
      isEmergency: false,
    };
  }

  // 7. Medication
  if (
    text.includes('mandulu') || text.includes('medicine') || text.includes('meds') ||
    text.includes('tablet') || text.includes('మందులు') || text.includes('dawai')
  ) {
    return {
      replyText: getLocalizedFallbackReply('meds'),
      detectedMood: 'happy',
      symptomDetected: null,
      suggestedSelfCare: 'Keep hydrated and enjoy a relaxed day.',
      detectedTone: 'cheerful',
      urgencyLevel: 'none',
      flaggedConcern: null,
      isEmergency: false,
    };
  }

  // Default General Friendly Chat
  return {
    replyText: getLocalizedFallbackReply('general'),
    detectedMood: 'calm',
    symptomDetected: null,
    suggestedSelfCare: 'Stay hydrated with fresh water and stay relaxed.',
    detectedTone: 'cheerful',
    urgencyLevel: 'none',
    flaggedConcern: null,
    isEmergency: false,
  };
}

// AI Companion Chat Endpoint
app.post("/api/companion/chat", async (req, res) => {
  try {
    const { prompt, conversationHistory = [], seniorName = "Eleanor", selectedLanguage = "English", languageCode = "en-US" } = req.body;

    const cleanedPrompt = cleanSpeechTranscript(prompt || "");
    const fallbackResult = analyzeSymptomFallback(cleanedPrompt, seniorName, selectedLanguage);

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(fallbackResult);
    }

    const systemInstruction = `You are ElderCare AI Companion & Health Symptom Monitor, a compassionate, patient, warm, polite, and highly observant AI companion for an elderly senior named ${seniorName}.

EXPERT MULTILINGUAL & INTENT PARSING ENGINE INSTRUCTIONS:
1) AUTOMATIC LANGUAGE DETECTION & MANDATORY SAME-LANGUAGE RESPONSE:
   - Carefully analyze the senior's input: "${cleanedPrompt}".
   - Detect the language spoken or typed automatically (including native scripts AND transliterated code-switching e.g. Telish, Hinglish, Tanglish, Kanglish).
   - ALWAYS REPLY IN THE EXACT SAME LANGUAGE THAT THE USER SPEAKS:
     * TELUGU (Telugu script / Telish) -> Reply COMPLETELY in fluent, natural, polite TELUGU SCRIPT (తెలుగు)! Add "గారూ" for respect.
     * KANNADA (Kannada script / Kanglish) -> Reply COMPLETELY in fluent, natural, polite KANNADA SCRIPT (ಕನ್ನಡ)! Add "ಅವರೇ" for respect.
     * HINDI (Hindi script / Hinglish) -> Reply COMPLETELY in fluent, natural, polite HINDI SCRIPT (हिन्दी)! Add "जी" for respect.
     * TAMIL (Tamil script / Tanglish) -> Reply COMPLETELY in fluent, natural, polite TAMIL SCRIPT (தமிழ்)!
     * MALAYALAM (Malayalam script) -> Reply COMPLETELY in fluent, natural MALAYALAM SCRIPT (മലയാളം)!
     * MARATHI (Marathi script) -> Reply COMPLETELY in fluent, natural MARATHI SCRIPT (मराठी)!
     * BENGALI (Bengali script) -> Reply COMPLETELY in fluent, natural BENGALI SCRIPT (বাংলা)!
     * GUJARATI (Gujarati script) -> Reply COMPLETELY in fluent, natural GUJARATI SCRIPT (ગુજરાતી)!
     * PUNJABI (Punjabi script) -> Reply COMPLETELY in fluent, natural PUNJABI SCRIPT (ਪੰਜਾਬੀ)!
     * ODIA (Odia script) -> Reply COMPLETELY in fluent, natural ODIA SCRIPT (ଓଡ଼ିଆ)!
     * URDU (Urdu script) -> Reply COMPLETELY in fluent, natural URDU SCRIPT (اردو)!
     * ENGLISH -> Reply in natural, clear, warm English!
     * SPANISH / FRENCH / GERMAN / CHINESE / JAPANESE / TAGALOG / ARABIC -> Reply in that exact language script!
   - IF THE USER SWITCHES LANGUAGES mid-conversation, detect the new language automatically and immediately switch your reply to that new language.
   - If the user input is ambiguous or extremely short (e.g. "hello", "hi"), use the configured preferred language: "${selectedLanguage}".

2) HEALTH & SYMPTOM EXTRACTION:
   - Identify any health discomforts (e.g. cold/chills, fever, sore throat, cough, joint pain, dizziness, fatigue, anxiety, loneliness) OR acute emergency events (falls, chest pain, breathing difficulty, stroke, severe bleeding).
   - Interpret colloquial and indirect phrases (e.g., "feeling under the weather", "chali ga undi", "talenovu", "sar dard", "body is hurting", "forgot my pill").

3) SUPPORTIVE SELF-CARE & REMINDER ADVICE:
   - Whenever any symptom or discomfort is mentioned, immediately include warm, safe, non-medical self-care guidance directly inside your spoken reply in the target script (e.g. in Telugu: "వెచ్చని దుప్పటి కప్పుకొని గోరువెచ్చని మంచినీరు తాగండి").
   - Acknowledge daily routine updates or medication confirmations warmly.

4) GUARDIAN ESCALATION RULES:
   - Emergency/Critical (falls, chest pain, breathing distress, severe bleeding): Set isEmergency=true, urgencyLevel="critical" or "high", and write an urgent flaggedConcern for the caregiver.
   - Moderate (dizziness, unsteady balance, high pain): Set urgencyLevel="moderate" and summarize the concern.
   - Low/Routine: Set urgencyLevel="low" or "none".

Output strict JSON with these exact keys:
- replyText: string (Warm spoken reply in 2-3 simple sentences in the exact detected language script e.g. Telugu script or Kannada script, containing gentle self-care advice)
- detectedMood: "happy" | "calm" | "lonely" | "anxious" | "tired" | "confused"
- symptomDetected: string | null (Specific health issue in native script or English e.g. "చలిగా అనిపించడం", "തലവേദന", "Sore Throat")
- suggestedSelfCare: string | null (Practical non-medical self-care tip in native script)
- detectedTone: string (e.g. "shivering", "distressed", "fatigued", "calm", "cheerful")
- urgencyLevel: "none" | "low" | "moderate" | "high" | "critical"
- flaggedConcern: string | null (Brief clinical summary for caregiver dashboard)
- isEmergency: boolean (true if fall, chest pain, breathing difficulty, severe emergency)`;

    // Construct conversation context
    const formattedHistory = conversationHistory
      .slice(-6)
      .map((msg: any) => `${msg.sender === 'elder' ? seniorName : 'Companion'}: ${msg.text}`)
      .join('\n');

    const fullUserPrompt = `${formattedHistory ? `Recent conversation context:\n${formattedHistory}\n\n` : ''}${seniorName} says (Configured Language: ${selectedLanguage}, Code: ${languageCode}): "${cleanedPrompt}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullUserPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: { type: Type.STRING },
            detectedMood: {
              type: Type.STRING,
              enum: ["happy", "calm", "lonely", "anxious", "tired", "confused"]
            },
            symptomDetected: { type: Type.STRING, nullable: true },
            suggestedSelfCare: { type: Type.STRING, nullable: true },
            detectedTone: { type: Type.STRING },
            urgencyLevel: {
              type: Type.STRING,
              enum: ["none", "low", "moderate", "high", "critical"]
            },
            flaggedConcern: { type: Type.STRING, nullable: true },
            isEmergency: { type: Type.BOOLEAN }
          },
          required: ["replyText", "detectedMood", "isEmergency", "urgencyLevel", "detectedTone"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    return res.json({
      replyText: parsedData.replyText || fallbackResult.replyText,
      detectedMood: parsedData.detectedMood || fallbackResult.detectedMood,
      symptomDetected: parsedData.symptomDetected || fallbackResult.symptomDetected,
      suggestedSelfCare: parsedData.suggestedSelfCare || fallbackResult.suggestedSelfCare,
      detectedTone: parsedData.detectedTone || fallbackResult.detectedTone,
      urgencyLevel: parsedData.urgencyLevel || fallbackResult.urgencyLevel,
      flaggedConcern: parsedData.flaggedConcern || fallbackResult.flaggedConcern,
      isEmergency: typeof parsedData.isEmergency === 'boolean' ? parsedData.isEmergency : fallbackResult.isEmergency,
    });
  } catch (error: any) {
    console.error("Error in /api/companion/chat:", error);
    const fallbackResult = analyzeSymptomFallback(req.body.prompt || "", req.body.seniorName || "Eleanor");
    return res.json(fallbackResult);
  }
});

// Caregiver AI Insights Generation Endpoint
app.post("/api/caregiver/generate-summary", async (req, res) => {
  try {
    const { conversationLogs = [], checkInItems = [], seniorName = "Eleanor" } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        overallMood: "Calm & Content",
        checkInCompletionRate: 80,
        keyHighlights: [
          `${seniorName} engaged in morning check-in on time.`,
          "Medication adherence remains high."
        ],
        flaggedConcerns: ["Mild stiffness reported in the morning."],
        suggestedCaregiverActions: ["Check on afternoon walk progress."],
        aiAnalysisText: `${seniorName} demonstrates steady cognitive clarity and high engagement with the voice companion. No acute distress detected.`
      });
    }

    const systemInstruction = `You are ElderCare AI Medical & Wellness Analytics engine.
Analyze the daily voice conversations and health check-ins for elderly senior ${seniorName}.
Generate a concise, compassionate, actionable report for family caregivers and nurses.

Return strict JSON:
- overallMood: "Energetic & Cheerful" | "Calm & Content" | "A Bit Tired" | "Needs Support" | "Unusual Fatigue"
- checkInCompletionRate: number (0 to 100 percentage based on completed items)
- keyHighlights: array of strings (2-3 top positive daily observations)
- flaggedConcerns: array of strings (any symptoms, stiffness, missed meds, or emotional distress noted)
- suggestedCaregiverActions: array of strings (1-3 simple practical recommendations for caregivers)
- aiAnalysisText: string (2 sentence clinical/wellness summary for caregivers)`;

    const inputData = JSON.stringify({
      seniorName,
      conversations: conversationLogs.slice(-10),
      checkIns: checkInItems
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze these senior daily records:\n${inputData}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallMood: { type: Type.STRING },
            checkInCompletionRate: { type: Type.NUMBER },
            keyHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            flaggedConcerns: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedCaregiverActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            aiAnalysisText: { type: Type.STRING }
          },
          required: [
            "overallMood",
            "checkInCompletionRate",
            "keyHighlights",
            "flaggedConcerns",
            "suggestedCaregiverActions",
            "aiAnalysisText"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/caregiver/generate-summary:", error);
    return res.status(500).json({ error: "Failed to generate caregiver insight report" });
  }
});

// Setup Vite Development or Static Production Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ElderCare AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
