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

// Build the shared system instruction for ElderCare AI Companion
function buildCompanionSystemInstruction(seniorName: string, selectedLanguage: string = "English", languageCode: string = "en-US"): string {
  return `You are ${seniorName}'s AI companion. Respond naturally, warmly, and directly to the user's actual message.
Understand the user's intent and answer the question or request directly.
Do not use a fixed response for different messages.
Do not automatically turn normal conversation into health advice or medication reminders.

INTENT CLASSIFICATION & RESPONSE GUIDELINES:
1. GREETING (e.g., "Hello", "Hi", "Good morning", "Good afternoon", "నమస్కారం", "नमस्ते"):
   - Respond with a friendly, natural greeting that specifically acknowledges what the user said.
2. QUESTION (e.g., "How are you?", "What is your name?", "What can you help me with?", "What time is it?"):
   - Answer the question directly.
   - If asked for your name/identity: state you are ElderCare AI companion.
   - If asked how you are: answer naturally and politely.
   - If asked what you can help with: explain you can converse, tell stories, share jokes, guide breathing exercises, track daily reminders, and assist with wellness.
   - If asked for time: reference the current system time provided in the prompt context.
3. JOKE REQUEST (e.g., "Tell me a joke"):
   - Tell a cheerful, clean, amusing joke.
4. STORY REQUEST (e.g., "Tell me a short story"):
   - Share a short, uplifting, engaging story (2-4 sentences).
5. BOREDOM & MOOD SUPPORT (e.g., "I am bored", "I am feeling lonely"):
   - Respond with empathy. Suggest a fun topic, light trivia, a short riddle, or asking about a favorite hobby or memory.
6. GENERAL CONVERSATION & CHIT-CHAT (e.g., "It is lovely talking with you Eleanor", talking about daily life, gardens, weather, cooking):
   - Converse genuinely and contextually. Directly address what the user said without formulaic phrases.
7. HEALTH & SYMPTOMS (e.g., "I have a headache", "I feel dizzy", "I am cold / shivering", "My knee hurts"):
   - Acknowledge with compassionate care, offer simple non-medical soothing tips (e.g. resting in a quiet dim room, sipping warm water, a warm blanket), set symptomDetected, suggestedSelfCare, detectedTone, and appropriate urgencyLevel.
8. EXPLICIT MEDICATION & REMINDER REQUESTS (e.g., "Remind me to take my medicine", "When is my pill?"):
   - Recognize the reminder request and confirm clearly.
9. EMERGENCY / URGENT (e.g., "I fell down", "Chest pain", "Cannot breathe", "Severe bleeding", "SOS"):
   - Set isEmergency=true, urgencyLevel="critical". Instruct them calmly to remain safe and still, and reassure them that urgent guardian alerts are being dispatched.
10. OTHER / GENERAL REQUESTS:
   - Understand the user's exact words and respond contextually.

ANTI-REPETITION & NATURAL DIALOGUE RULES:
- DO NOT overuse "${seniorName}". Use the user's name naturally and only occasionally, not in every response.
- DO NOT start every response with generic fillers like "Thank you! It is lovely talking with you...".
- NEVER output the same fixed canned reply for different user inputs.
- Every response must directly address the specific words and intent of the CURRENT user message.

MULTILINGUAL SUPPORT:
- If the user speaks or writes in Telugu (or Telugu transliteration / Telish, e.g. "ela unnaru", "chali ga undi", "thala noppi", "katha cheppu"), respond entirely in natural, fluent Telugu script (తెలుగు)!
- If the user speaks or writes in Hindi (or Hinglish, e.g. "kaisa hai", "sar dard hai", "kahani sunao"), respond in natural Hindi script (हिन्दी)!
- If in English, respond in natural, clear English.
- If in another configured language (${selectedLanguage}), respond in that language.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
{
  "replyText": "The conversational reply addressing the user's specific message (1-3 natural sentences)",
  "detectedMood": "happy" | "calm" | "lonely" | "anxious" | "tired" | "confused",
  "symptomDetected": string | null,
  "suggestedSelfCare": string | null,
  "detectedTone": string,
  "urgencyLevel": "none" | "low" | "moderate" | "high" | "critical",
  "flaggedConcern": string | null,
  "isEmergency": boolean
}`;
}

// AI Companion Chat Endpoint (Supporting Google Gemini and Local Gemma 4 via Ollama)
app.post("/api/companion/chat", async (req, res) => {
  const {
    prompt,
    conversationHistory = [],
    seniorName = "Eleanor",
    selectedLanguage = "English",
    languageCode = "en-US",
    provider = "gemini",
  } = req.body;

  const cleanedPrompt = cleanSpeechTranscript(prompt || "");
  console.log(`[AI Companion] Request received: provider=${provider}, senior=${seniorName}, language=${selectedLanguage} (${languageCode}), prompt="${cleanedPrompt}"`);

  if (!cleanedPrompt) {
    return res.json({
      replyText: `Hello ${seniorName}! How can I help you today?`,
      detectedMood: "calm",
      symptomDetected: null,
      suggestedSelfCare: null,
      detectedTone: "friendly",
      urgencyLevel: "none",
      flaggedConcern: null,
      isEmergency: false,
      provider,
    });
  }

  const systemInstruction = buildCompanionSystemInstruction(seniorName, selectedLanguage, languageCode);

  // === 1. LOCAL GEMMA 4 VIA OLLAMA ===
  if (provider === "ollama") {
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

      // Prepare conversation history window (last 6 messages)
      const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
      const messages: Array<{ role: string; content: string }> = [
        {
          role: "system",
          content: `${systemInstruction}\n\nIMPORTANT: Return ONLY a valid JSON object with the specified keys. Do not include markdown code block backticks or any conversational text before or after the JSON.`,
        },
      ];

      for (const msg of recentHistory) {
        if (msg.sender === "elder") {
          messages.push({ role: "user", content: msg.text });
        } else if (msg.sender === "companion") {
          messages.push({ role: "assistant", content: msg.text });
        }
      }

      const currentTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      messages.push({
        role: "user",
        content: `[Current Time: ${currentTimeString}, User: ${seniorName}, Preferred Language: ${selectedLanguage}, Language Code: ${languageCode}]\nUser message: "${cleanedPrompt}"`,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma4:latest",
          messages,
          format: "json",
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!ollamaRes.ok) {
        const errorText = await ollamaRes.text().catch(() => "");
        console.error(`[AI Companion] Ollama returned status ${ollamaRes.status}:`, errorText);
        return res.status(503).json({
          replyText: "Local Gemma is not available. Please start Ollama on this computer and try again.",
          detectedMood: "calm",
          symptomDetected: null,
          suggestedSelfCare: null,
          detectedTone: "neutral",
          urgencyLevel: "none",
          flaggedConcern: null,
          isEmergency: false,
          error: "Local Gemma is not available. Please start Ollama on this computer and try again.",
          provider: "ollama",
        });
      }

      const ollamaData: any = await ollamaRes.json();
      const content = ollamaData?.message?.content || "";
      console.log(`[AI Companion] Ollama response content:`, content.slice(0, 80));

      let jsonStr = content.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      }

      let parsedData: any = {};
      try {
        parsedData = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.warn("[AI Companion] Failed to parse JSON directly from Gemma, attempting regex extraction:", parseErr);
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsedData = JSON.parse(match[0]);
          } catch {
            parsedData = { replyText: content };
          }
        } else {
          parsedData = { replyText: content };
        }
      }

      const replyText = parsedData.replyText ? parsedData.replyText.trim() : (content.trim() || "I am right here with you!");

      return res.json({
        replyText,
        detectedMood: parsedData.detectedMood || "calm",
        symptomDetected: parsedData.symptomDetected || null,
        suggestedSelfCare: parsedData.suggestedSelfCare || null,
        detectedTone: parsedData.detectedTone || "conversational",
        urgencyLevel: parsedData.urgencyLevel || "none",
        flaggedConcern: parsedData.flaggedConcern || null,
        isEmergency: typeof parsedData.isEmergency === "boolean" ? parsedData.isEmergency : false,
        provider: "ollama",
      });
    } catch (ollamaErr: any) {
      console.error("[AI Companion] Error communicating with Ollama Local Gemma 4:", ollamaErr.message || ollamaErr);
      return res.status(503).json({
        replyText: "Local Gemma is not available. Please start Ollama on this computer and try again.",
        detectedMood: "calm",
        symptomDetected: null,
        suggestedSelfCare: null,
        detectedTone: "neutral",
        urgencyLevel: "none",
        flaggedConcern: null,
        isEmergency: false,
        error: "Local Gemma is not available. Please start Ollama on this computer and try again.",
        provider: "ollama",
      });
    }
  }

  // === 2. GOOGLE GEMINI (DEFAULT PROVIDER) ===
  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.error("[AI Companion] Gemini client initialization failed. Check GEMINI_API_KEY.");
      return res.status(503).json({
        replyText: "Sorry, I couldn't process that request right now. Please try again.",
        detectedMood: "calm",
        symptomDetected: null,
        suggestedSelfCare: null,
        detectedTone: "neutral",
        urgencyLevel: "none",
        flaggedConcern: null,
        isEmergency: false,
        error: "Gemini API key is not configured.",
        provider: "gemini",
      });
    }

    // Construct conversation context from recent history
    const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
    const formattedHistory = recentHistory
      .map((msg: any) => `${msg.sender === 'elder' ? seniorName : 'Companion'}: ${msg.text}`)
      .join('\n');

    const currentTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const fullUserPrompt = `${formattedHistory ? `Recent conversation context:\n${formattedHistory}\n\n` : ''}[Current System Time: ${currentTimeString}, Configured Language: ${selectedLanguage} (Code: ${languageCode})]\n${seniorName} says: "${cleanedPrompt}"`;

    const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let response: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const fetchPromise = ai.models.generateContent({
          model,
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
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 6500)
        );

        response = await Promise.race([fetchPromise, timeoutPromise]);
        if (response && response.text) {
          console.log(`[AI Companion] Gemini response succeeded using model: ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[AI Companion] Model ${model} failed or timed out:`, err.message || err.status || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("No response returned from Gemini models");
    }

    const resultText = response.text || "{}";
    let jsonStr = resultText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.warn("[AI Companion] Failed direct JSON parse, trying regex extract:", parseErr);
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedData = JSON.parse(match[0]);
        } catch {
          parsedData = { replyText: resultText };
        }
      } else {
        parsedData = { replyText: resultText };
      }
    }

    const replyText = (parsedData.replyText && typeof parsedData.replyText === 'string' && parsedData.replyText.trim())
      ? parsedData.replyText.trim()
      : (resultText.trim() || "I am right here with you!");

    console.log(`[AI Companion] Gemini successful replyText: "${replyText.slice(0, 80)}"`);

    return res.json({
      replyText,
      detectedMood: parsedData.detectedMood || "calm",
      symptomDetected: parsedData.symptomDetected || null,
      suggestedSelfCare: parsedData.suggestedSelfCare || null,
      detectedTone: parsedData.detectedTone || "friendly",
      urgencyLevel: parsedData.urgencyLevel || "none",
      flaggedConcern: parsedData.flaggedConcern || null,
      isEmergency: typeof parsedData.isEmergency === 'boolean' ? parsedData.isEmergency : false,
      provider: "gemini",
    });
  } catch (error: any) {
    console.error("[AI Companion] Error in /api/companion/chat (Gemini):", error.message || error);
    return res.status(500).json({
      replyText: "Sorry, I couldn't process that request. Please try again.",
      detectedMood: "calm",
      symptomDetected: null,
      suggestedSelfCare: null,
      detectedTone: "neutral",
      urgencyLevel: "none",
      flaggedConcern: null,
      isEmergency: false,
      error: error.message || "Failed to process AI request. Please try again.",
      provider: "gemini",
    });
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
      model: "gemini-3.7-flash",
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
