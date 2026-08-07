import { SeniorProfile, CheckInItem, VoiceConversationMessage, CaregiverInsight, PrivacySettings, EmergencyAlert, CaregiverNotification } from '../types';

export const initialSeniorProfile: SeniorProfile = {
  id: 'senior-01',
  name: 'Eleanor Vance',
  preferredName: 'Eleanor',
  age: 82,
  gender: 'Female',
  height: "5' 4\" (163 cm)",
  weight: '62 kg (136 lbs)',
  bloodGroup: 'O+',
  location: 'Oakridge Senior Residence, Apt 4B',
  diabetes: false,
  bloodPressure: true,
  heartDisease: true,
  asthma: false,
  otherDiseases: 'Mild Osteoarthritis in knees',
  emergencyContacts: [
    {
      id: 'c1',
      name: 'Sarah Vance',
      relationship: 'Daughter (Primary)',
      phone: '(555) 234-5678',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      isPrimary: true,
    },
    {
      id: 'c2',
      name: 'David Vance',
      relationship: 'Son',
      phone: '(555) 876-5432',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      isPrimary: false,
    },
    {
      id: 'c3',
      name: 'Dr. Robert Evans',
      relationship: 'Primary Care Physician',
      phone: '(555) 999-1122',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
      isPrimary: false,
    }
  ],
  doctorName: 'Dr. Robert Evans (Geriatrics)',
  doctorPhone: '(555) 999-1122',
  allergies: ['Penicillin', 'Shellfish'],
  medicalConditions: ['Hypertension (High BP)', 'Cardiac Care / Heart Disease', 'Osteoarthritis / Joint Pain']
};

export const initialCheckInItems: CheckInItem[] = [
  {
    id: 'chk-1',
    title: 'Morning Heart Medicine (Lisinopril 10mg)',
    category: 'medication',
    dosageOrDetails: '1 pill with warm water',
    scheduledTime: '08:00 AM',
    completed: true,
    completedAt: '08:12 AM',
    audioPrompt: 'Remember to take your Lisinopril heart pill with a full glass of water.'
  },
  {
    id: 'chk-2',
    title: 'Morning Water & Hydration Check',
    category: 'hydration',
    dosageOrDetails: '1 large glass of water',
    scheduledTime: '09:30 AM',
    completed: true,
    completedAt: '09:35 AM',
    audioPrompt: 'Time for a nice glass of water to keep your joints feeling smooth!'
  },
  {
    id: 'chk-3',
    title: 'Afternoon Joint Stretch & Walk',
    category: 'activity',
    dosageOrDetails: '10 min light living room walk',
    scheduledTime: '02:00 PM',
    completed: false,
    audioPrompt: 'How about a gentle 10-minute stretch or walk around the living room?'
  },
  {
    id: 'chk-4',
    title: 'Evening Blood Pressure Pill (Amlodipine 5mg)',
    category: 'medication',
    dosageOrDetails: '1 pill with dinner',
    scheduledTime: '06:30 PM',
    completed: false,
    audioPrompt: 'Evening time! Please take your blood pressure tablet with dinner.'
  },
  {
    id: 'chk-5',
    title: 'Night Water & Sleep Check-In',
    category: 'health_check',
    dosageOrDetails: 'Quick voice check-in',
    scheduledTime: '09:00 PM',
    completed: false,
    audioPrompt: 'Tell me how your day went before you rest tonight.'
  }
];

export const initialConversation: VoiceConversationMessage[] = [
  {
    id: 'msg-1',
    sender: 'companion',
    text: "Good morning Eleanor! I hope you slept well. It's a sunny Thursday today. Have you taken your morning heart pill yet?",
    timestamp: '08:10 AM',
    detectedMood: 'calm'
  },
  {
    id: 'msg-2',
    sender: 'elder',
    text: "Yes, I just had it with my breakfast tea! My knee is a bit stiff today, but otherwise I feel good.",
    timestamp: '08:12 AM',
    detectedMood: 'happy'
  },
  {
    id: 'msg-3',
    sender: 'companion',
    text: "Wonderful job taking your medication, Eleanor! I noted down your knee stiffness so Sarah can keep an eye on it. Shall I play some classical morning piano or tell you about today's weather?",
    timestamp: '08:12 AM',
    detectedMood: 'calm'
  }
];

export const initialCaregiverInsights: CaregiverInsight[] = [
  {
    id: 'ins-1',
    date: 'Today, Aug 6',
    overallMood: 'Energetic & Cheerful',
    checkInCompletionRate: 80,
    keyHighlights: [
      'Took morning Lisinopril on time at 8:12 AM.',
      'Reported good sleep quality (approx 7.5 hours).',
      'Expressed joy after talking with her daughter Sarah yesterday.'
    ],
    flaggedConcerns: [
      'Slight knee stiffness mentioned during 8:12 AM voice check-in.'
    ],
    suggestedCaregiverActions: [
      'Check if topical arthritis balm needs a refill.',
      'Remind Eleanor about afternoon stretch walk at 2:00 PM.'
    ],
    aiAnalysisText: 'Eleanor displays strong cognitive clarity and cheerful tone. Speech speed and cadence were stable with zero confusion detected. Medication adherence remains excellent at 98% this week.'
  },
  {
    id: 'ins-2',
    date: 'Yesterday, Aug 5',
    overallMood: 'Calm & Content',
    checkInCompletionRate: 100,
    keyHighlights: [
      'Completed all 5 scheduled check-ins successfully.',
      'Hydration goal reached (5 cups of water).',
      'Walked 15 minutes around garden patio.'
    ],
    flaggedConcerns: [],
    suggestedCaregiverActions: [
      'Maintain current medication schedule.'
    ],
    aiAnalysisText: 'Overall stable wellness day. Conversation topics focused on garden flowers and upcoming family weekend visit.'
  }
];

export const initialPrivacySettings: PrivacySettings = {
  voiceRetentionDays: 7,
  shareFullTranscripts: true,
  shareMoodSummary: true,
  anonymizeVoiceLogs: true,
  allowAiPersonalization: true,
  autoAlertCaregiverOnDistress: true
};

export const initialEmergencyAlerts: EmergencyAlert[] = [];

export const initialNotifications: CaregiverNotification[] = [
  {
    id: 'notif-1',
    eventType: 'emergency',
    title: '🚨 CRITICAL SOS DISTRESS CALL UNACKNOWLEDGED',
    message: 'Eleanor triggered manual Emergency SOS distress call ("Help me, I fell in the living room").',
    timestamp: '08:42 AM',
    date: 'Today, Aug 07',
    read: false,
    priority: 'critical',
    elderName: 'Eleanor Vance',
    actionRequired: 'Call Eleanor directly or dispatch primary contact Sarah Vance immediately.',
    details: 'Triggered via Senior Voice Box SOS button. High urgency priority.'
  },
  {
    id: 'notif-2',
    eventType: 'medicine_missed',
    title: '💊 MEDICINE MISSED: Evening BP Pill Overdue',
    message: 'Evening Blood Pressure Pill (Amlodipine 5mg) scheduled for 06:30 PM was unacknowledged for >45 minutes.',
    timestamp: '07:15 PM',
    date: 'Yesterday, Aug 06',
    read: false,
    priority: 'high',
    elderName: 'Eleanor Vance',
    actionRequired: 'Contact Eleanor to assist with taking Amlodipine 5mg with warm water.',
    details: 'Scheduled time: 06:30 PM. Voice AI reminder sent at 06:30 PM & 07:00 PM.'
  },
  {
    id: 'notif-3',
    eventType: 'health_warning',
    title: '⚠️ HEALTH WARNING: Acute Dizziness & Chest Tightness Detected',
    message: 'Voice AI companion detected keywords "dizzy", "chest feels tight", and "shortness of breath" during 02:15 PM check-in.',
    timestamp: '02:15 PM',
    date: 'Yesterday, Aug 06',
    read: true,
    priority: 'high',
    elderName: 'Eleanor Vance',
    actionRequired: 'Monitor vital signs and check blood pressure reading.',
    details: 'AI Companion classified urgency as HIGH. Recommended resting upright and taking deep breaths.'
  },
  {
    id: 'notif-4',
    eventType: 'mood_alert',
    title: '💙 MOOD ALERT: Persistent Anxiety & Loneliness Score',
    message: 'Elder voice tone analysis detected 3 consecutive interactions classified as "Anxious & Lonely" with low speech pitch.',
    timestamp: '11:00 AM',
    date: 'Aug 05, 2026',
    read: true,
    priority: 'moderate',
    elderName: 'Eleanor Vance',
    actionRequired: 'Initiate a warm video or phone call to offer emotional reassurance.',
    details: 'Speech acoustic cadence index decreased by 12% over 48 hours.'
  }
];

