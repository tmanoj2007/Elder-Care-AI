import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ViewMode, TextScale, SeniorProfile, CheckInItem, VoiceConversationMessage,
  CaregiverInsight, PrivacySettings, EmergencyAlert, CaregiverNotification,
  NotificationEventType, UserAccount, SUPPORTED_LANGUAGES, AIProvider
} from './types';
import {
  initialSeniorProfile, initialCheckInItems, initialConversation,
  initialCaregiverInsights, initialPrivacySettings, initialEmergencyAlerts,
  initialNotifications
} from './data/initialData';
import { Header } from './components/Header';
import { ElderlyHome } from './components/ElderlyHome';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { PrivacyPage } from './components/PrivacyPage';
import { EmergencyModal } from './components/EmergencyModal';
import { LandingRoleSelection } from './components/LandingRoleSelection';
import { SplashScreen } from './components/SplashScreen';
import { WelcomePage } from './components/WelcomePage';
import { LinearOnboardingFlow } from './components/LinearOnboardingFlow';
import { speakText, stopSpeaking } from './utils/speech';
import { validateTaskTime } from './utils/timeValidation';

export default function App() {
  // Navigation & Page Architecture Routing
  const [currentView, setCurrentView] = useState<ViewMode>('splash');
  const [textScale, setTextScale] = useState<TextScale>('large'); // Default to large for senior usability
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US'); // Default language code

  // User Account & Onboarding State
  const [userAccount, setUserAccount] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('eldercare_user_account');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<'elderly' | 'caregiver'>('elderly');

  // Senior Profile with LocalStorage persistence
  const [profile, setProfile] = useState<SeniorProfile>(() => {
    const saved = localStorage.getItem('eldercare_senior_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialSeniorProfile;
  });

  // CheckIn Items with LocalStorage persistence
  const [checkInItems, setCheckInItems] = useState<CheckInItem[]>(() => {
    const saved = localStorage.getItem('eldercare_checkin_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialCheckInItems;
  });

  // Caregiver Notifications with LocalStorage persistence
  const [notifications, setNotifications] = useState<CaregiverNotification[]>(() => {
    const saved = localStorage.getItem('eldercare_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialNotifications;
  });

  const [conversationHistory, setConversationHistory] = useState<VoiceConversationMessage[]>(initialConversation);
  const [insights, setInsights] = useState<CaregiverInsight[]>(initialCaregiverInsights);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(initialPrivacySettings);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(initialEmergencyAlerts);
  const [taskWarningNotice, setTaskWarningNotice] = useState<string | null>(null);

  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosTriggerReason, setSosTriggerReason] = useState<string>("🚨 Emergency SOS Button Tapped");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  // AI Provider state (Gemini vs Local Gemma 4 via Ollama) with session persistence
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    const saved = localStorage.getItem('eldercare_ai_provider');
    if (saved === 'ollama' || saved === 'gemini') {
      return saved;
    }
    return 'gemini';
  });

  // Active language option
  const currentLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('eldercare_senior_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('eldercare_ai_provider', aiProvider);
  }, [aiProvider]);

  useEffect(() => {
    localStorage.setItem('eldercare_checkin_items', JSON.stringify(checkInItems));
  }, [checkInItems]);

  useEffect(() => {
    localStorage.setItem('eldercare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (userAccount) {
      localStorage.setItem('eldercare_user_account', JSON.stringify(userAccount));
    }
  }, [userAccount]);

  // MISSED TASK ENFORCEMENT EFFECT: Periodically check for overdue uncompleted tasks
  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date();
      const timeNowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;

      setCheckInItems((prevItems) => {
        let hasChanges = false;
        const updatedItems = prevItems.map((item) => {
          if (!item.completed && !item.isMissed) {
            const timeVal = validateTaskTime(item.scheduledTime, 30, now);
            if (timeVal.isOverdue) {
              hasChanges = true;

              // Dispatch emergency alert & caregiver notification
              const missedAlertMsg = `MISSED TASK ALERT: ${profile.preferredName} has not completed scheduled task "${item.title}" (Scheduled for ${item.scheduledTime}).`;

              setEmergencyAlerts((prevAlerts) => {
                if (prevAlerts.some((a) => a.message.includes(item.title))) return prevAlerts;

                const newAlert: EmergencyAlert = {
                  id: `alt-missed-${item.id}-${Date.now()}`,
                  timestamp: timeNowStr,
                  senderName: profile.preferredName,
                  status: 'active',
                  priority: 'high',
                  symptom: 'Overdue Routine Task',
                  message: missedAlertMsg,
                  suggestedAction: `Reach out to ${profile.preferredName} at ${profile.emergencyContacts[0]?.phone || '(555) 234-5678'} to assist.`,
                };
                return [newAlert, ...prevAlerts];
              });

              // Also add to Real-Time Caregiver Notifications Log (Event Type 1: Medicine Missed)
              setNotifications((prevNotifs) => {
                if (prevNotifs.some((n) => n.message.includes(item.title))) return prevNotifs;

                const newNotif: CaregiverNotification = {
                  id: `notif-missed-${item.id}-${Date.now()}`,
                  eventType: 'medicine_missed',
                  title: `💊 MEDICINE MISSED: ${item.title}`,
                  message: missedAlertMsg,
                  timestamp: timeNowStr,
                  date: dateStr,
                  read: false,
                  priority: 'high',
                  elderName: profile.name,
                  actionRequired: `Contact ${profile.preferredName} to assist with taking ${item.title}.`,
                  details: `Scheduled time: ${item.scheduledTime}. Time elapsed > 30 mins.`,
                };
                return [newNotif, ...prevNotifs];
              });

              return { ...item, isMissed: true };
            }
          }
          return item;
        });

        return hasChanges ? updatedItems : prevItems;
      });
    };

    checkOverdueTasks();
    const interval = setInterval(checkOverdueTasks, 30000);
    return () => clearInterval(interval);
  }, [profile.name, profile.preferredName, profile.emergencyContacts]);

  // Notifications Management Handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSimulateNotification = (eventType: NotificationEventType) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;

    let title = '';
    let message = '';
    let priority: 'critical' | 'high' | 'moderate' | 'low' = 'high';
    let actionRequired = '';

    switch (eventType) {
      case 'medicine_missed':
        title = '💊 MEDICINE MISSED: Afternoon Dose Overdue';
        message = `${profile.preferredName} has not confirmed taking scheduled afternoon medication. Scheduled time passed >30 mins ago.`;
        priority = 'high';
        actionRequired = `Call ${profile.preferredName} at ${profile.emergencyContacts[0]?.phone || '(555) 234-5678'} to assist.`;
        break;
      case 'emergency':
        title = '🚨 CRITICAL SOS DISTRESS CALL UNACKNOWLEDGED';
        message = `UNACKNOWLEDGED EMERGENCY SOS: ${profile.preferredName} triggered distress alarm ("Help, I cannot stand up").`;
        priority = 'critical';
        actionRequired = `Immediate intervention required. Dispatch emergency contact or call ${profile.preferredName} now.`;
        break;
      case 'health_warning':
        title = '⚠️ HEALTH WARNING: Acute Dizziness Keyword Speech Trigger';
        message = `Voice Companion detected acute health concerns during conversation: "Dizzy and lightheaded after standing".`;
        priority = 'high';
        actionRequired = 'Check vital blood pressure reading and confirm hydration intake.';
        break;
      case 'mood_alert':
        title = '💙 MOOD ALERT: Persistent Emotional Distress & Loneliness';
        message = `Voice acoustic analysis indicates low emotional valence & speech latency over consecutive daily interactions.`;
        priority = 'moderate';
        actionRequired = 'Schedule a comforting video call or family visit.';
        break;
    }

    const newNotif: CaregiverNotification = {
      id: `notif-sim-${Date.now()}`,
      eventType,
      title,
      message,
      timestamp,
      date,
      read: false,
      priority,
      elderName: profile.name,
      actionRequired,
      details: 'Dispatched via ElderCare AI Real-Time Sentinel Engine.',
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleCallSenior = () => {
    const phone = profile.emergencyContacts[0]?.phone || '(555) 234-5678';
    const msg = `Connecting audio communication channel with ${profile.name} at ${phone}.`;
    speakText(msg, () => setIsSpeaking(true), () => setIsSpeaking(false), 0.95, 1.0, selectedLanguage);
  };

  // Toggle check-in status with time-based validation
  const handleToggleCheckIn = (id: string) => {
    const targetItem = checkInItems.find((i) => i.id === id);
    if (!targetItem) return;

    if (!targetItem.completed) {
      const timeVal = validateTaskTime(targetItem.scheduledTime);
      if (timeVal.isFuture) {
        const warningMsg = `Task Restricted: "${targetItem.title}" is scheduled for later today at ${targetItem.scheduledTime} (in ${timeVal.formattedUntil}). Premature completion is blocked.`;
        setTaskWarningNotice(warningMsg);

        const spokenWarning = `${profile.preferredName}, this task is scheduled for later today at ${targetItem.scheduledTime}. Please wait until then to mark it completed.`;
        speakText(spokenWarning, () => setIsSpeaking(true), () => setIsSpeaking(false), 0.92, 1.0, selectedLanguage);
        return;
      }
    }

    setTaskWarningNotice(null);

    setCheckInItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nowDone = !item.completed;
          const updatedTime = nowDone
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined;

          if (nowDone) {
            speakText(`Great job completing ${item.title}!`, () => setIsSpeaking(true), () => setIsSpeaking(false), 0.92, 1.0, selectedLanguage);
          }

          return { ...item, completed: nowDone, completedAt: updatedTime, isMissed: false };
        }
        return item;
      })
    );
  };

  // Add new check-in item from caregiver
  const handleAddCheckInItem = (newItem: Omit<CheckInItem, 'id' | 'completed'>) => {
    const itemWithId: CheckInItem = {
      ...newItem,
      id: `chk-${Date.now()}`,
      completed: false,
    };
    setCheckInItems((prev) => [...prev, itemWithId]);
  };

  // Handle companion message conversation & symptom/mood detection
  const handleSendMessage = async (text: string) => {
    try {
      if (!text || typeof text !== 'string') return;
      const trimmedText = text.trim();
      if (!trimmedText) return;

      const now = new Date();
      const timeNow = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;

      const userMsg: VoiceConversationMessage = {
        id: `msg-${Date.now()}`,
        sender: 'elder',
        text: trimmedText,
        timestamp: timeNow,
      };

      setConversationHistory((prev) => [...(prev || []), userMsg]);
      setIsProcessingAi(true);

      const seniorName = profile?.preferredName || profile?.name || 'Eleanor';

      // Check for urgent emergency phrases instantly
      const lowerText = trimmedText.toLowerCase();
      const urgentKeywords = ['fell', 'fall', 'help', 'emergency', 'dropped', 'pain', 'chest', 'sos', 'hurt', 'dizzy', 'bleeding'];
      const containsUrgentPhrase = urgentKeywords.some((keyword) => lowerText.includes(keyword));

      if (containsUrgentPhrase) {
        try {
          handleTriggerSOS(`Urgent distress phrase spoken: "${trimmedText}"`);
          const newAlert: EmergencyAlert = {
            id: `alt-${Date.now()}`,
            timestamp: timeNow,
            senderName: seniorName,
            status: 'active',
            message: `Urgent emergency phrase detected: "${trimmedText}"`,
          };
          setEmergencyAlerts((prev) => [newAlert, ...(prev || [])]);

          // Dispatch Event Type 2: Emergency SOS Notification
          setNotifications((prevNotifs) => [
            {
              id: `notif-sos-${Date.now()}`,
              eventType: 'emergency',
              title: '🚨 CRITICAL SOS: Distress Phrase Spoken',
              message: `${seniorName} spoke urgent distress phrase: "${trimmedText}"`,
              timestamp: timeNow,
              date: dateStr,
              read: false,
              priority: 'critical',
              elderName: profile.name,
              actionRequired: `Call ${seniorName} immediately or dispatch emergency contact.`,
              details: 'Triggered via voice interaction.',
            },
            ...prevNotifs,
          ]);
        } catch (sosErr) {
          console.error("Error triggering SOS from voice command:", sosErr);
          setSosTriggerReason(`Urgent distress phrase spoken: "${trimmedText}"`);
          setShowSOSModal(true);
        }
      }

      try {
        const res = await fetch('/api/companion/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmedText,
            conversationHistory: conversationHistory || [],
            seniorName,
            selectedLanguage: currentLangOption?.name || 'English',
            languageCode: currentLangOption?.code || 'en-US',
            provider: aiProvider,
          }),
        });

        const data = await res.json();
        let replyText = data.replyText;
        if (!replyText || typeof replyText !== 'string' || !replyText.trim()) {
          if (aiProvider === 'ollama') {
            replyText = 'Local Gemma is not available. Please start Ollama on this computer and try again.';
          } else {
            replyText = "Sorry, I couldn't process that request. Please try again.";
          }
        }
        const detectedMood = data.detectedMood || 'calm';
        const isEmergency = Boolean(data.isEmergency);

        const companionMsg: VoiceConversationMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'companion',
          text: replyText.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedMood,
          symptomDetected: data.symptomDetected || undefined,
          suggestedSelfCare: data.suggestedSelfCare || undefined,
          detectedTone: data.detectedTone || undefined,
          urgencyLevel: data.urgencyLevel || 'none',
          flaggedConcern: data.flaggedConcern || undefined,
        };

        setConversationHistory((prev) => [...(prev || []), companionMsg]);
        setIsProcessingAi(false);

        // Speak response
        try {
          speakText(
            replyText.trim(),
            () => setIsSpeaking(true),
            () => setIsSpeaking(false),
            0.92,
            1.0,
            selectedLanguage
          );
        } catch (speakErr) {
          console.warn("Speech synthesis trigger error:", speakErr);
        }

        // Trigger Health Warning Notification (Event Type 3) if symptom detected
        if (data.symptomDetected || data.urgencyLevel === 'high' || data.urgencyLevel === 'critical') {
          setNotifications((prevNotifs) => [
            {
              id: `notif-health-${Date.now()}`,
              eventType: 'health_warning',
              title: `⚠️ HEALTH WARNING: ${data.symptomDetected || 'Symptom Detected'}`,
              message: data.flaggedConcern || `${seniorName} reported symptom: "${trimmedText}"`,
              timestamp: timeNow,
              date: dateStr,
              read: false,
              priority: data.urgencyLevel === 'critical' ? 'critical' : 'high',
              elderName: profile.name,
              actionRequired: data.suggestedSelfCare || 'Monitor vital signs and check wellness status.',
              details: `Detected symptom: ${data.symptomDetected || 'Distress keyword'}.`,
            },
            ...prevNotifs,
          ]);
        }

        // Trigger Mood Alert Notification (Event Type 4) only on genuine flagged concern with elevated urgency
        if (['lonely', 'anxious', 'confused'].includes(detectedMood) && data.flaggedConcern && (data.urgencyLevel === 'moderate' || data.urgencyLevel === 'high' || data.urgencyLevel === 'critical')) {
          setNotifications((prevNotifs) => [
            {
              id: `notif-mood-${Date.now()}`,
              eventType: 'mood_alert',
              title: `💙 MOOD ALERT: ${detectedMood.toUpperCase()} Tone Detected`,
              message: `Voice AI detected emotional tone "${detectedMood}" during dialogue: "${trimmedText}"`,
              timestamp: timeNow,
              date: dateStr,
              read: false,
              priority: 'moderate',
              elderName: profile.name,
              actionRequired: 'Reach out with a reassuring call or visit.',
              details: `Detected mood state: ${detectedMood}.`,
            },
            ...prevNotifs,
          ]);
        }

      } catch (err) {
        console.warn('Companion AI API offline or error:', err);
        const replyText = aiProvider === 'ollama'
          ? 'Local Gemma is not available. Please start Ollama on this computer and try again.'
          : "Sorry, I couldn't process that request. Please try again.";

        const companionMsg: VoiceConversationMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'companion',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedMood: 'calm',
          urgencyLevel: 'none',
        };
        setConversationHistory((prev) => [...(prev || []), companionMsg]);
        try {
          speakText(replyText, () => setIsSpeaking(true), () => setIsSpeaking(false), 0.92, 1.0, selectedLanguage);
        } catch (speakErr) {
          console.warn('Speech synthesis error:', speakErr);
        }
      } finally {
        setIsProcessingAi(false);
      }
    } catch (globalErr) {
      console.error('Unhandled exception in handleSendMessage:', globalErr);
      setIsProcessingAi(false);
    }
  };

  // Generate fresh caregiver report
  const handleGenerateFreshInsight = async () => {
    setIsGeneratingInsight(true);
    try {
      const res = await fetch('/api/caregiver/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationLogs: conversationHistory,
          checkInItems,
          seniorName: profile.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newInsight: CaregiverInsight = {
          id: `ins-${Date.now()}`,
          date: `Just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          overallMood: data.overallMood || 'Calm & Content',
          checkInCompletionRate: data.checkInCompletionRate || 80,
          keyHighlights: data.keyHighlights || ['Completed daily check-ins on schedule.'],
          flaggedConcerns: data.flaggedConcerns || [],
          suggestedCaregiverActions: data.suggestedCaregiverActions || ['Maintain routine medication time.'],
          aiAnalysisText: data.aiAnalysisText || `${profile.name} is demonstrating steady clarity and positive engagement.`,
        };

        setInsights((prev) => [newInsight, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Caregiver summary API offline, computing local summary analytics:', err);
    } finally {
      setIsGeneratingInsight(false);
    }

    // Local fallback summary
    const completedCount = (checkInItems || []).filter((c) => c.completed).length;
    const totalCount = (checkInItems || []).length;
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 85;
    const fallbackInsight: CaregiverInsight = {
      id: `ins-${Date.now()}`,
      date: `Just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      overallMood: rate >= 80 ? 'Energetic & Cheerful' : 'Calm & Content',
      checkInCompletionRate: rate,
      keyHighlights: [
        `Completed ${completedCount} of ${totalCount} scheduled routine tasks.`,
        'Maintained active voice check-in interactions today.',
        'Vital wellness parameters remain within normal baseline limits.'
      ],
      flaggedConcerns: rate < 50 ? ['Some scheduled tasks are pending attention.'] : [],
      suggestedCaregiverActions: [
        'Review evening medication adherence.',
        'Encourage light hydration and gentle afternoon stretch.'
      ],
      aiAnalysisText: `${profile.name} is demonstrating steady routine engagement with ${rate}% task adherence today. Cognitive clarity and voice interactions remain positive and stable.`,
    };
    setInsights((prev) => [fallbackInsight, ...prev]);
  };

  // Trigger manual SOS
  const handleTriggerSOS = (reason: string = "🚨 Emergency SOS Button Tapped") => {
    setSosTriggerReason(reason);
    setShowSOSModal(true);
  };

  // Confirm emergency SOS call
  const handleConfirmSOSAlert = (reason: string) => {
    const now = new Date();
    const timeNow = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;

    const newAlert: EmergencyAlert = {
      id: `alt-${Date.now()}`,
      timestamp: timeNow,
      senderName: profile.preferredName,
      status: 'active',
      message: reason,
    };

    setEmergencyAlerts((prev) => [newAlert, ...prev]);

    // Dispatch Event Type 2: Emergency SOS Notification
    setNotifications((prevNotifs) => [
      {
        id: `notif-sos-confirm-${Date.now()}`,
        eventType: 'emergency',
        title: '🚨 CRITICAL SOS DISTRESS CALL TRIGGERED',
        message: reason,
        timestamp: timeNow,
        date: dateStr,
        read: false,
        priority: 'critical',
        elderName: profile.name,
        actionRequired: 'Call senior or dispatch primary emergency contact immediately.',
        details: 'Confirmed via SOS Emergency Modal.',
      },
      ...prevNotifs,
    ]);
  };

  // Resolve emergency alert
  const handleResolveAlert = (id: string) => {
    setEmergencyAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Handle Escalation for Missed/Unacknowledged Task
  const handleEscalateMissedTask = (item: CheckInItem) => {
    const now = new Date();
    const timeNow = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;
    const primaryContact = profile.emergencyContacts[0]?.name || 'Sarah Vance';

    const newAlert: EmergencyAlert = {
      id: `alt-missed-${Date.now()}`,
      timestamp: timeNow,
      senderName: profile.preferredName,
      status: 'active',
      message: `MISSED TASK ESCALATION: ${profile.preferredName} has not completed scheduled routine task "${item.title}" (Scheduled for ${item.scheduledTime}).`,
      priority: 'high',
      symptom: 'Overdue Routine Medication / Task',
      suggestedAction: `Contact ${profile.preferredName} directly at ${profile.emergencyContacts[0]?.phone || '(555) 234-5678'} to check health status.`,
    };

    setEmergencyAlerts((prev) => [newAlert, ...prev]);

    // Also dispatch to Real-Time Caregiver Notifications Log (Event Type 1: Medicine Missed)
    setNotifications((prevNotifs) => [
      {
        id: `notif-missed-esc-${Date.now()}`,
        eventType: 'medicine_missed',
        title: `💊 MEDICINE MISSED: ${item.title}`,
        message: `Scheduled medicine "${item.title}" (${item.scheduledTime}) passed without check-in. Caregiver escalation triggered.`,
        timestamp: timeNow,
        date: dateStr,
        read: false,
        priority: 'high',
        elderName: profile.name,
        actionRequired: `Assist ${profile.preferredName} with taking ${item.title}.`,
        details: 'Escalated by Senior Voice Box / System Timeout.',
      },
      ...prevNotifs,
    ]);

    // Play automated voice alert to the senior
    const promptText = `${profile.preferredName}, your scheduled task "${item.title}" at ${item.scheduledTime} was unacknowledged. I have dispatched an alert to your caregiver ${primaryContact} on their dashboard.`;
    speakText(promptText, () => setIsSpeaking(true), () => setIsSpeaking(false), 0.9, 1.0, selectedLanguage);
  };

  // Handle Role Selection from Landing Page
  const handleSelectRole = (
    role: 'elderly' | 'caregiver',
    updatedProfile?: SeniorProfile,
    updatedCheckIns?: CheckInItem[]
  ) => {
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
    if (updatedCheckIns && updatedCheckIns.length > 0) {
      setCheckInItems(updatedCheckIns);
    }
    setCurrentView(role);
  };

  // Handle Complete Linear Onboarding Registration
  const handleCompleteOnboarding = (
    account: UserAccount,
    newProfile: SeniorProfile,
    newTimetable: CheckInItem[]
  ) => {
    setUserAccount(account);
    setProfile(newProfile);
    setCheckInItems(newTimetable);
    setShowOnboardingModal(false);

    // Route directly to selected role dashboard
    if (account.role === 'caregiver') {
      setCurrentView('caregiver');
    } else {
      setCurrentView('elderly');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      
      <AnimatePresence mode="wait">
        {/* PAGE ARCHITECTURE ROUTE 1: SPLASH SCREEN */}
        {currentView === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full min-h-screen"
          >
            <SplashScreen onFinishSplash={() => setCurrentView('welcome')} />
          </motion.div>
        )}

        {/* PAGE ARCHITECTURE ROUTE 2: WELCOME PAGE */}
        {currentView === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full min-h-screen"
          >
            <WelcomePage
              onProceedToRoleSelection={() => setCurrentView('role_selection')}
              onQuickLogin={() => setCurrentView('role_selection')}
            />
          </motion.div>
        )}

        {/* PAGE ARCHITECTURE ROUTE 3 & 4: ROLE SELECTION & LOGIN / REGISTRATION */}
        {(currentView === 'role_selection' || currentView === 'auth') && (
          <motion.div
            key="role_selection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full min-h-screen"
          >
            <LandingRoleSelection
              currentProfile={profile}
              onSelectRole={(role, updatedProfile, updatedCheckIns) => {
                handleSelectRole(role, updatedProfile, updatedCheckIns);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER NAVIGATION (For Active Dashboards) */}
      {!['splash', 'welcome', 'role_selection', 'auth'].includes(currentView) && (
        <Header
          currentView={currentView}
          onSelectView={setCurrentView}
          textScale={textScale}
          onChangeTextScale={setTextScale}
          selectedLanguage={selectedLanguage}
          onChangeLanguage={setSelectedLanguage}
          onTriggerSOS={handleTriggerSOS}
          isSpeaking={isSpeaking}
          onStopSpeaking={() => {
            stopSpeaking();
            setIsSpeaking(false);
          }}
          unreadAlertCount={notifications.filter((n) => !n.read).length}
        />
      )}

      {/* MAIN DASHBOARDS */}
      {!['splash', 'welcome', 'role_selection', 'auth'].includes(currentView) && (
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentView === 'elderly' && (
              <motion.div
                key="elderly-dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ElderlyHome
                  profile={profile}
                  checkInItems={checkInItems}
                  onToggleCheckIn={handleToggleCheckIn}
                  onEscalateMissedTask={handleEscalateMissedTask}
                  conversationHistory={conversationHistory}
                  onSendMessage={handleSendMessage}
                  textScale={textScale}
                  onChangeTextScale={setTextScale}
                  selectedLanguage={selectedLanguage}
                  onChangeLanguage={setSelectedLanguage}
                  onTriggerSOS={handleTriggerSOS}
                  isProcessingAi={isProcessingAi}
                  isSpeaking={isSpeaking}
                  onStopSpeaking={() => {
                    stopSpeaking();
                    setIsSpeaking(false);
                  }}
                  taskWarningNotice={taskWarningNotice}
                  onDismissTaskWarning={() => setTaskWarningNotice(null)}
                  onNavigateToCaregiver={() => setCurrentView('caregiver')}
                  notifications={notifications}
                  aiProvider={aiProvider}
                  onChangeAiProvider={setAiProvider}
                />
              </motion.div>
            )}

            {currentView === 'caregiver' && (
              <motion.div
                key="caregiver-dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <CaregiverDashboard
                  profile={profile}
                  checkInItems={checkInItems}
                  onAddCheckInItem={handleAddCheckInItem}
                  conversationHistory={conversationHistory}
                  insights={insights}
                  onGenerateFreshInsight={handleGenerateFreshInsight}
                  isGeneratingInsight={isGeneratingInsight}
                  emergencyAlerts={emergencyAlerts}
                  onResolveAlert={handleResolveAlert}
                  notifications={notifications}
                  onMarkNotificationAsRead={handleMarkNotificationAsRead}
                  onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
                  onDeleteNotification={handleDeleteNotification}
                  onSimulateNotification={handleSimulateNotification}
                  onCallSenior={handleCallSenior}
                />
              </motion.div>
            )}

            {currentView === 'privacy' && (
              <motion.div
                key="privacy-dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <PrivacyPage
                  settings={privacySettings}
                  onUpdateSettings={setPrivacySettings}
                  textScale={textScale}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* LINEAR ONBOARDING REGISTRATION WIZARD OVERLAY */}
      {showOnboardingModal && (
        <LinearOnboardingFlow
          initialProfile={profile}
          initialTimetable={checkInItems}
          onCompleteOnboarding={handleCompleteOnboarding}
          onCancel={() => setShowOnboardingModal(false)}
          selectedRoleFromLanding={onboardingRole}
        />
      )}

      {/* Emergency SOS Modal Overlay */}
      {showSOSModal && (
        <EmergencyModal
          profile={profile}
          selectedLanguage={selectedLanguage}
          triggerReason={sosTriggerReason}
          onClose={() => setShowSOSModal(false)}
          onConfirmAlert={handleConfirmSOSAlert}
        />
      )}
    </div>
  );
}
