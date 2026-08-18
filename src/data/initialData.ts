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
  bloodPressure: false,
  heartDisease: false,
  asthma: false,
  otherDiseases: 'None reported',
  emergencyContacts: [
    {
      id: 'c1',
      name: 'Family Emergency Contact',
      relationship: 'Primary Contact',
      phone: '(555) 234-5678',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      isPrimary: true,
    }
  ],
  doctorName: 'Dr. Evans',
  doctorPhone: '(555) 999-1122',
  allergies: [],
  medicalConditions: []
};

export const initialCheckInItems: CheckInItem[] = [];

export const initialConversation: VoiceConversationMessage[] = [
  {
    id: 'msg-1',
    sender: 'companion',
    text: "Hello Eleanor! I am your AI companion. How can I help you today?",
    timestamp: 'Just now',
    detectedMood: 'calm'
  }
];

export const initialCaregiverInsights: CaregiverInsight[] = [];

export const initialPrivacySettings: PrivacySettings = {
  voiceRetentionDays: 7,
  shareFullTranscripts: true,
  shareMoodSummary: true,
  anonymizeVoiceLogs: true,
  allowAiPersonalization: true,
  autoAlertCaregiverOnDistress: true
};

export const initialEmergencyAlerts: EmergencyAlert[] = [];

export const initialNotifications: CaregiverNotification[] = [];


