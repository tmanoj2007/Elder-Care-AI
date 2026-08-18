export type ViewMode = 'splash' | 'welcome' | 'role_selection' | 'auth' | 'elderly' | 'caregiver' | 'privacy';

export type TextScale = 'normal' | 'large' | 'extra';

export type NotificationEventType = 'medicine_missed' | 'emergency' | 'health_warning' | 'mood_alert';

export interface CaregiverNotification {
  id: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  timestamp: string;
  date: string;
  read: boolean;
  priority: 'critical' | 'high' | 'moderate' | 'low';
  elderName: string;
  actionRequired?: string;
  details?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  role: 'elderly' | 'caregiver';
  name: string;
  linkedElderId?: string;
  registeredAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  photoUrl?: string;
  isPrimary?: boolean;
}

export interface SeniorProfile {
  id: string;
  name: string;
  preferredName: string;
  age: number;
  gender?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  location: string;
  diabetes?: boolean;
  bloodPressure?: boolean;
  heartDisease?: boolean;
  asthma?: boolean;
  otherDiseases?: string;
  emergencyContacts: EmergencyContact[];
  doctorName: string;
  doctorPhone: string;
  allergies: string[];
  medicalConditions: string[];
}

export interface CheckInItem {
  id: string;
  title: string;
  category: 'medication' | 'hydration' | 'meal' | 'activity' | 'health_check';
  dosageOrDetails?: string;
  scheduledTime: string; // e.g. "08:00 AM"
  completed: boolean;
  completedAt?: string;
  audioPrompt?: string;
  isMissed?: boolean;
}

export interface VoiceConversationMessage {
  id: string;
  sender: 'elder' | 'companion' | 'system';
  text: string;
  timestamp: string;
  detectedMood?: 'happy' | 'calm' | 'lonely' | 'anxious' | 'tired' | 'confused';
  symptomDetected?: string;
  suggestedSelfCare?: string;
  detectedTone?: string;
  urgencyLevel?: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  flaggedConcern?: string;
}

export interface CaregiverInsight {
  id: string;
  date: string;
  overallMood: 'Energetic & Cheerful' | 'Calm & Content' | 'A Bit Tired' | 'Needs Support' | 'Unusual Fatigue';
  checkInCompletionRate: number; // percentage
  keyHighlights: string[];
  flaggedConcerns: string[];
  suggestedCaregiverActions: string[];
  aiAnalysisText: string;
}

export interface PrivacySettings {
  voiceRetentionDays: number; // 0 = don't save audio, 7, 30, 90
  shareFullTranscripts: boolean;
  shareMoodSummary: boolean;
  anonymizeVoiceLogs: boolean;
  allowAiPersonalization: boolean;
  autoAlertCaregiverOnDistress: boolean;
}

export interface EmergencyAlert {
  id: string;
  timestamp: string;
  senderName: string;
  status: 'active' | 'acknowledged' | 'resolved';
  resolvedBy?: string;
  message: string;
  priority?: 'critical' | 'high' | 'moderate' | 'low';
  symptom?: string;
  suggestedAction?: string;
}

export type MedicationFrequency = 'Daily' | 'Twice Daily' | 'Every 8 Hours' | 'Weekly' | 'As Needed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string; // e.g. "08:00 AM"
  frequency: MedicationFrequency;
  instructions?: string;
  category?: string;
  pillCount?: number;
  refillThreshold?: number;
  status: 'active' | 'paused';
  todayStatus?: 'taken' | 'missed' | 'pending';
  lastTakenAt?: string;
}

export type MedicationLogStatus = 'taken' | 'missed' | 'skipped';

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: MedicationLogStatus;
  timestamp: string; // e.g. "08:12 AM"
  date: string; // e.g. "Aug 7, 2026"
  loggedBy: 'senior' | 'caregiver' | 'system';
  notes?: string;
}

export type CheckInPeriod = 'morning' | 'evening';

export interface DailyCheckInLog {
  id: string;
  period: CheckInPeriod;
  date: string;
  timestamp: string;
  wellbeing: string;
  meals: string;
  sleep: string;
  mood: string;
  completedBy: 'senior' | 'caregiver';
}

export interface SpeechMetricEntry {
  date: string; // e.g. "Aug 1", "Aug 2", ...
  speakingRate: number; // WPM (words per minute)
  pauseDuration: number; // seconds
  responseLatency: number; // seconds
  cadenceIndex: number; // calculated score 0-100
}

export interface SpeechBaseline {
  speakingRate: number; // WPM
  pauseDuration: number; // seconds
  responseLatency: number; // seconds
}

export interface LanguageOption {
  code: string; // e.g. "en-US", "es-ES", "fr-FR", "hi-IN"
  name: string; // e.g. "English", "Español"
  nativeName: string; // e.g. "Español", "हिन्दी"
  flag: string; // e.g. "🇺🇸", "🇪🇸"
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'కన్నడ / ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh-CN', name: 'Mandarin Chinese', nativeName: '中文 (普通话)', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'tl-PH', name: 'Tagalog / Filipino', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export interface SpeechMonitoringData {
  baseline: SpeechBaseline;
  history: SpeechMetricEntry[];
  currentMetrics: SpeechMetricEntry;
  status: 'Stable' | 'Possible Change Detected';
  statusReason: string;
}


