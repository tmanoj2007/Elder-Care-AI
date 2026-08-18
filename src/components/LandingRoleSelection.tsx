import React, { useState } from 'react';
import { Heart, Activity, User, ShieldCheck, ArrowRight, QrCode, Phone, Sparkles, CheckCircle2, UserCheck, Stethoscope, Pill, Lock, KeyRound, Clock, Plus, Trash2, Droplets, Utensils, Brain, HeartPulse, Camera, Scan, Mail, Check, UserPlus, LogIn, AlertCircle, Shield } from 'lucide-react';
import { SeniorProfile, CheckInItem } from '../types';

interface LandingRoleSelectionProps {
  currentProfile: SeniorProfile;
  onSelectRole: (role: 'elderly' | 'caregiver', updatedProfile?: SeniorProfile, updatedCheckIns?: CheckInItem[]) => void;
}

const COMMON_DISEASES = [
  'Hypertension (High BP)',
  'Type 2 Diabetes',
  'Mild Memory Loss / Dementia',
  'Osteoarthritis / Joint Pain',
  'Cardiac Care / Heart Disease',
  'Asthma / COPD',
  'Chronic Kidney Disease',
  'Glaucoma / Vision Impairment',
];

const DEFAULT_TIMETABLE_PRESETS: CheckInItem[] = [
  {
    id: 'chk-reg-1',
    title: 'Morning Medicine (Prescribed)',
    category: 'medication',
    dosageOrDetails: '1 dose with water',
    scheduledTime: '08:00 AM',
    completed: false,
    audioPrompt: 'Remember to take your scheduled morning medication.',
  },
  {
    id: 'chk-reg-2',
    title: 'Morning Hydration & Water Glass',
    category: 'hydration',
    dosageOrDetails: '1 large glass of fresh water (8 oz)',
    scheduledTime: '09:30 AM',
    completed: false,
    audioPrompt: 'Time for a fresh glass of water to keep yourself well-hydrated!',
  },
  {
    id: 'chk-reg-3',
    title: 'Nourishing Lunch Meal',
    category: 'meal',
    dosageOrDetails: 'Balanced lunch & rest',
    scheduledTime: '12:30 PM',
    completed: false,
    audioPrompt: 'It is lunchtime! Enjoy a warm, nourishing meal and relax comfortably.',
  },
  {
    id: 'chk-reg-4',
    title: 'Afternoon Memory & Brain Exercise Puzzle',
    category: 'activity',
    dosageOrDetails: '3-minute word trivia game',
    scheduledTime: '03:00 PM',
    completed: false,
    audioPrompt: 'Time for a fun 3-minute Memory Puzzle game! Exercising your brain keeps your mind sharp.',
  },
  {
    id: 'chk-reg-5',
    title: 'Evening Medicine (Prescribed)',
    category: 'medication',
    dosageOrDetails: '1 dose with dinner',
    scheduledTime: '06:30 PM',
    completed: false,
    audioPrompt: 'Evening time! Please take your scheduled evening medication.',
  },
  {
    id: 'chk-reg-6',
    title: 'Night Check-In & Rest',
    category: 'health_check',
    dosageOrDetails: 'Daily wellness check',
    scheduledTime: '08:30 PM',
    completed: false,
    audioPrompt: 'Let us complete your evening check-in before you rest tonight.',
  },
];

export const LandingRoleSelection: React.FC<LandingRoleSelectionProps> = ({
  currentProfile,
  onSelectRole,
}) => {
  const [activeModal, setActiveModal] = useState<'none' | 'elderly_login' | 'caregiver_login'>('none');

  // Senior Registration / Profile Form State
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);

  // Personal Details
  const [seniorName, setSeniorName] = useState(currentProfile.name);
  const [preferredName, setPreferredName] = useState(currentProfile.preferredName);
  const [age, setAge] = useState(currentProfile.age.toString());
  const [gender, setGender] = useState(currentProfile.gender || 'Female');
  const [height, setHeight] = useState(currentProfile.height || "5' 4\" (163 cm)");
  const [weight, setWeight] = useState(currentProfile.weight || '62 kg');
  const [bloodGroup, setBloodGroup] = useState(currentProfile.bloodGroup || 'O+');
  const [location, setLocation] = useState(currentProfile.location);

  // Medical Details
  const [diabetes, setDiabetes] = useState<boolean>(currentProfile.diabetes ?? false);
  const [bloodPressure, setBloodPressure] = useState<boolean>(currentProfile.bloodPressure ?? true);
  const [heartDisease, setHeartDisease] = useState<boolean>(currentProfile.heartDisease ?? true);
  const [asthma, setAsthma] = useState<boolean>(currentProfile.asthma ?? false);
  const [allergiesText, setAllergiesText] = useState((currentProfile.allergies || ['Penicillin', 'Shellfish']).join(', '));
  const [otherDiseasesText, setOtherDiseasesText] = useState(currentProfile.otherDiseases || 'Mild Osteoarthritis in knees');
  const [doctorName, setDoctorName] = useState(currentProfile.doctorName);
  const [doctorPhone, setDoctorPhone] = useState(currentProfile.doctorPhone);

  // Disease & Condition Selection
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(
    currentProfile.medicalConditions || ['Hypertension (High BP)', 'Osteoarthritis / Joint Pain']
  );
  const [customCondition, setCustomCondition] = useState('');

  // Primary Emergency Contact
  const primaryContact = currentProfile.emergencyContacts[0] || { name: 'Sarah Vance', phone: '(555) 234-5678', relationship: 'Daughter (Primary)' };
  const [contactName, setContactName] = useState(primaryContact.name);
  const [contactPhone, setContactPhone] = useState(primaryContact.phone);
  const [contactRel, setContactRel] = useState(primaryContact.relationship);

  // Custom Daily Routine Timetable State (Medicine Details & Schedule)
  const [routineTimetable, setRoutineTimetable] = useState<CheckInItem[]>(DEFAULT_TIMETABLE_PRESETS);

  // New Item State for Timetable
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('02:00 PM');
  const [newCategory, setNewCategory] = useState<'medication' | 'hydration' | 'meal' | 'activity' | 'health_check'>('medication');
  const [newDetails, setNewDetails] = useState('');

  // Caregiver Login, Registration & Linking State
  const [caregiverAuthMode, setCaregiverAuthMode] = useState<'signin' | 'register'>('signin');
  const [caregiverEmail, setCaregiverEmail] = useState('sarah.vance@familycare.org');
  const [caregiverPassword, setCaregiverPassword] = useState('guardian123');
  const [caregiverName, setCaregiverName] = useState('Sarah Vance');
  const [caregiverPhone, setCaregiverPhone] = useState('(555) 234-5678');
  const [caregiverRel, setCaregiverRel] = useState('Daughter (Primary Guardian)');
  const [smsConsent, setSmsConsent] = useState(true);

  const [elderLinkId, setElderLinkId] = useState('ELD-88219');
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [qrScanSuccessMsg, setQrScanSuccessMsg] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

  // Toggle Disease Selection
  const toggleDisease = (disease: string) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease) ? prev.filter((d) => d !== disease) : [...prev, disease]
    );
  };

  // Add Custom Condition
  const handleAddCustomCondition = () => {
    if (customCondition.trim() && !selectedDiseases.includes(customCondition.trim())) {
      setSelectedDiseases((prev) => [...prev, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  // Add Item to Timetable
  const handleAddTimetableItem = () => {
    if (!newTitle.trim()) return;
    const newItem: CheckInItem = {
      id: `chk-custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      dosageOrDetails: newDetails.trim() || 'Custom daily routine task',
      scheduledTime: newTime,
      completed: false,
      audioPrompt: `Reminder for ${preferredName || 'Eleanor'}: It is time for your scheduled ${newTitle.trim()}.`,
    };
    setRoutineTimetable((prev) => [...prev, newItem]);
    setNewTitle('');
    setNewDetails('');
  };

  // Remove Item from Timetable
  const handleRemoveTimetableItem = (id: string) => {
    setRoutineTimetable((prev) => prev.filter((item) => item.id !== id));
  };

  // Handle Senior Form Submit
  const handleSeniorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAllergies = allergiesText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const updatedProf: SeniorProfile = {
      ...currentProfile,
      name: seniorName || 'Eleanor Vance',
      preferredName: preferredName || seniorName || 'Eleanor',
      age: parseInt(age) || 82,
      gender: gender || 'Female',
      height: height || "5' 4\"",
      weight: weight || '62 kg',
      bloodGroup: bloodGroup || 'O+',
      location: location || 'Oakridge Senior Residence, Apt 4B',
      diabetes,
      bloodPressure,
      heartDisease,
      asthma,
      otherDiseases: otherDiseasesText,
      doctorName: doctorName || 'Dr. Robert Evans (Geriatrics)',
      doctorPhone: doctorPhone || '(555) 999-1122',
      medicalConditions: selectedDiseases,
      allergies: parsedAllergies.length > 0 ? parsedAllergies : ['Penicillin'],
      emergencyContacts: [
        {
          id: 'ec-1',
          name: contactName || 'Sarah Vance',
          relationship: contactRel || 'Daughter (Primary)',
          phone: contactPhone || '(555) 234-5678',
          isPrimary: true,
        },
      ],
    };

    setActiveModal('none');
    onSelectRole('elderly', updatedProf, routineTimetable);
  };

  // Handle Caregiver Login / Registration & Elder Link Submit
  const handleCaregiverLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorNotice(null);

    if (caregiverAuthMode === 'register') {
      if (!caregiverName.trim()) {
        setAuthErrorNotice('Please enter your full Name.');
        return;
      }
      if (!caregiverPhone.trim()) {
        setAuthErrorNotice('Please enter a valid Mobile phone number.');
        return;
      }
      if (!caregiverEmail.trim() || !caregiverEmail.includes('@')) {
        setAuthErrorNotice('Please enter a valid Email address.');
        return;
      }
      if (!caregiverPassword.trim()) {
        setAuthErrorNotice('Please enter a secure Password.');
        return;
      }
    } else {
      if (!caregiverEmail.trim() || !caregiverEmail.includes('@')) {
        setAuthErrorNotice('Please enter a valid Email address.');
        return;
      }
      if (!caregiverPassword.trim()) {
        setAuthErrorNotice('Please enter your Password.');
        return;
      }
    }

    if (!elderLinkId.trim()) {
      setAuthErrorNotice('Please enter or scan a valid Senior Elder Link ID.');
      return;
    }

    setLinkSuccess(true);

    // Update profile emergency contacts with caregiver details
    const updatedProf: SeniorProfile = {
      ...currentProfile,
      emergencyContacts: [
        {
          id: 'ec-1',
          name: caregiverName || currentProfile.emergencyContacts[0]?.name || 'Sarah Vance',
          relationship: caregiverRel || currentProfile.emergencyContacts[0]?.relationship || 'Daughter (Primary)',
          phone: caregiverPhone || currentProfile.emergencyContacts[0]?.phone || '(555) 234-5678',
          isPrimary: true,
        },
        ...(currentProfile.emergencyContacts.slice(1) || []),
      ],
    };

    setTimeout(() => {
      onSelectRole('caregiver', updatedProf);
    }, 900);
  };

  const handleOpenQrScanner = () => {
    setShowQrScanModal(true);
    setIsQrScanning(true);
    setQrScanSuccessMsg(null);
  };

  const handleSimulateQrScanInModal = () => {
    setIsQrScanning(true);
    setQrScanSuccessMsg(null);
    setTimeout(() => {
      setElderLinkId('ELD-88219');
      setIsQrScanning(false);
      setQrScanSuccessMsg('✨ QR Code Detected! Linked Elder Account ELD-88219 (Eleanor Vance)');
      setTimeout(() => {
        setShowQrScanModal(false);
      }, 1200);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* BRANDING TOP BAR */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Heart className="w-7 h-7 fill-white/20 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">
              ElderCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Intelligent Voice Companion & Senior Wellness Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>HIPAA Compliant & Secure</span>
        </div>
      </div>

      {/* HERO TITLE SECTION */}
      <div className="max-w-3xl mx-auto text-center space-y-2.5 my-6 sm:my-8 z-10">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Select Your Portal
        </h2>
        <p className="text-slate-400 text-sm sm:text-base font-normal">
          Choose an account mode to continue
        </p>
      </div>

      {/* ROLE SELECTION CARDS */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-auto py-4 z-10">
        
        {/* CARD 1: ELDERLY USER / SENIOR */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border-2 border-emerald-500/30 hover:border-emerald-400 shadow-xl shadow-slate-950/60 transition-all duration-300 flex flex-col justify-between items-center text-center gap-6 group hover:-translate-y-1">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Heart className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Senior Voice Home</h3>
              <p className="text-xs text-slate-400">Large-button voice companion, daily check-ins & emergency SOS</p>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            <button
              type="button"
              onClick={() => onSelectRole('elderly')}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-extrabold py-4 px-6 rounded-2xl text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer min-h-[52px]"
            >
              <span>Enter Senior Voice Home</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('elderly_login')}
              className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Customize Profile & Schedule</span>
            </button>
          </div>
        </div>

        {/* CARD 2: CAREGIVER / FAMILY PROVIDER */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border-2 border-sky-500/30 hover:border-sky-400 shadow-xl shadow-slate-950/60 transition-all duration-300 flex flex-col justify-between items-center text-center gap-6 group hover:-translate-y-1">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-cyan-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/10">
              <Activity className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Caregiver Portal</h3>
              <p className="text-xs text-slate-400">Real-time health telemetry, speech cadence analysis & alert sentinel</p>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            <button
              type="button"
              onClick={() => onSelectRole('caregiver')}
              className="w-full bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-extrabold py-4 px-6 rounded-2xl text-base shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer min-h-[52px]"
            >
              <span>Enter Caregiver Portal</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('caregiver_login')}
              className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Link New Senior Account</span>
            </button>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="max-w-6xl mx-auto w-full text-center py-6 border-t border-slate-900 text-xs text-slate-500 font-medium z-10">
        ElderCare AI Platform • End-to-End Encryption & Privacy First Architecture
      </div>

      {/* MODAL 1: ELDERLY LOGIN / PROFILE COMPLETION */}
      {activeModal === 'elderly_login' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Elder Profile Setup</h3>
                  <p className="text-xs text-slate-400">Complete registration form for personalized AI voice care</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* STEP NAVIGATION TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSetupStep(1)}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  setupStep === 1
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>1. Personal</span>
              </button>
              <button
                type="button"
                onClick={() => setSetupStep(2)}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  setupStep === 2
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>2. Medical</span>
              </button>
              <button
                type="button"
                onClick={() => setSetupStep(3)}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  setupStep === 3
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>3. Emergency</span>
              </button>
              <button
                type="button"
                onClick={() => setSetupStep(4)}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  setupStep === 4
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>4. Medicines</span>
              </button>
            </div>

            <form onSubmit={handleSeniorLoginSubmit} className="space-y-4">
              
              {/* STEP 1: PERSONAL DETAILS */}
              {setupStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <User className="w-4 h-4 text-teal-400" />
                    <span>Step 1: Personal Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Full Name *</label>
                      <input
                        type="text"
                        value={seniorName}
                        onChange={(e) => setSeniorName(e.target.value)}
                        required
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:border-teal-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Preferred Name *</label>
                      <input
                        type="text"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        required
                        placeholder="e.g. Eleanor"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:border-teal-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-teal-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold focus:border-teal-400 outline-none"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Height</label>
                      <input
                        type="text"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="e.g. 5 ft 4 in or 163 cm"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Weight</label>
                      <input
                        type="text"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g. 62 kg"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-teal-400 outline-none"
                      >
                        <option value="O+">O positive (O+)</option>
                        <option value="A+">A positive (A+)</option>
                        <option value="B+">B positive (B+)</option>
                        <option value="AB+">AB positive (AB+)</option>
                        <option value="O-">O negative (O-)</option>
                        <option value="A-">A negative (A-)</option>
                        <option value="B-">B negative (B-)</option>
                        <option value="AB-">AB negative (AB-)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Living Residence / Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Oakridge Senior Residence, Apt 4B"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-teal-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSetupStep(2)}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <span>Next: Medical Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: MEDICAL DETAILS */}
              {setupStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <Stethoscope className="w-4 h-4 text-teal-400" />
                    <span>Step 2: Medical Details & Health Conditions</span>
                  </div>

                  {/* YES / NO TOGGLES FOR COMMON CONDITIONS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">Diabetes</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setDiabetes(true)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            diabetes ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiabetes(false)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            !diabetes ? 'bg-teal-600 text-white border-teal-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">BP (Hypertension)</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setBloodPressure(true)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            bloodPressure ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setBloodPressure(false)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            !bloodPressure ? 'bg-teal-600 text-white border-teal-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">Heart Disease</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setHeartDisease(true)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            heartDisease ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeartDisease(false)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            !heartDisease ? 'bg-teal-600 text-white border-teal-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">Asthma / Breathing</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setAsthma(true)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            asthma ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setAsthma(false)}
                          className={`flex-1 py-1 rounded-lg text-xs font-extrabold border ${
                            !asthma ? 'bg-teal-600 text-white border-teal-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Allergies (comma separated)</label>
                      <input
                        type="text"
                        value={allergiesText}
                        onChange={(e) => setAllergiesText(e.target.value)}
                        placeholder="e.g. Penicillin, Shellfish, Dust"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-teal-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Other Diseases / Conditions</label>
                      <input
                        type="text"
                        value={otherDiseasesText}
                        onChange={(e) => setOtherDiseasesText(e.target.value)}
                        placeholder="e.g. Mild Osteoarthritis in knees"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Primary Physician Name</label>
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="e.g. Dr. Robert Evans"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-teal-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Doctor Mobile Number</label>
                      <input
                        type="text"
                        value={doctorPhone}
                        onChange={(e) => setDoctorPhone(e.target.value)}
                        placeholder="e.g. (555) 999-1122"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSetupStep(1)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupStep(3)}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <span>Next: Emergency Contact</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: EMERGENCY CONTACT */}
              {setupStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <Phone className="w-4 h-4 text-teal-400" />
                    <span>Step 3: Primary Emergency Guardian Contact</span>
                  </div>

                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
                    <p className="text-xs text-slate-300 font-medium">
                      This contact receives instant SOS voice calls, automated missed medication alerts, and health distress notifications.
                    </p>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Family Member / Guardian Name *</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          required
                          placeholder="e.g. Sarah Vance"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-teal-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">Relationship *</label>
                          <input
                            type="text"
                            value={contactRel}
                            onChange={(e) => setContactRel(e.target.value)}
                            required
                            placeholder="e.g. Daughter (Primary)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-teal-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">Mobile Phone Number *</label>
                          <input
                            type="text"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            required
                            placeholder="e.g. (555) 234-5678"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-teal-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSetupStep(2)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupStep(4)}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <span>Next: Medicine Timetable</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: MEDICINE DETAILS & DAILY TIMETABLE */}
              {setupStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>Step 4: Medicine Details & Daily Timetable ({routineTimetable.length} Items)</span>
                  </div>

                  {/* TIMETABLE LIST */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {routineTimetable.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="bg-slate-900 text-teal-300 px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border border-slate-700 shrink-0">
                            {item.scheduledTime}
                          </span>
                          <div className="truncate">
                            <p className="font-extrabold text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">{item.dosageOrDetails}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-slate-700">
                            {item.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTimetableItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADD NEW MEDICINE / TIMETABLE ITEM FORM */}
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">Add Medicine / Routine Task:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Metformin 500mg)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:border-teal-400"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Time (e.g. 08:00 AM)"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:border-teal-400"
                        />
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold outline-none focus:border-teal-400"
                        >
                          <option value="medication">Medication</option>
                          <option value="hydration">Hydration</option>
                          <option value="meal">Meal</option>
                          <option value="health_check">Health Check</option>
                          <option value="activity">Memory/Activity</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Dosage Details (e.g. 1 pill with warm water)"
                        value={newDetails}
                        onChange={(e) => setNewDetails(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:border-teal-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddTimetableItem}
                        className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSetupStep(3)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs shrink-0"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-3.5 rounded-xl text-base shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Save Profile & Launch Senior Home</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CAREGIVER LOGIN, REGISTRATION & ELDER ACCOUNT LINKING */}
      {activeModal === 'caregiver_login' && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-white my-8 animate-fade-in">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Activity className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Caregiver & Guardian Portal</h3>
                  <p className="text-xs text-slate-400 font-medium">Authentication & Senior Account Linking Flow</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal('none');
                  setShowQrScanModal(false);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Close
              </button>
            </div>

            {/* AUTH MODE TOGGLE: SIGN IN vs REGISTER */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCaregiverAuthMode('signin')}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  caregiverAuthMode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>1. Caregiver Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setCaregiverAuthMode('register')}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  caregiverAuthMode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>2. Register Guardian</span>
              </button>
            </div>

            <form onSubmit={handleCaregiverLinkSubmit} className="space-y-5">
              
              {/* AUTH SECTION: SIGN IN */}
              {caregiverAuthMode === 'signin' && (
                <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Existing Caregiver Credentials</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCaregiverEmail('sarah.vance@familycare.org');
                        setCaregiverPassword('guardian123');
                      }}
                      className="text-[11px] text-teal-400 hover:underline font-bold"
                    >
                      Fill Demo Credentials
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Caregiver Email *</label>
                      <input
                        type="email"
                        value={caregiverEmail}
                        onChange={(e) => setCaregiverEmail(e.target.value)}
                        required
                        placeholder="sarah.vance@familycare.org"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-indigo-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Security Password / PIN *</label>
                      <input
                        type="password"
                        value={caregiverPassword}
                        onChange={(e) => setCaregiverPassword(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-indigo-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AUTH SECTION: REGISTER */}
              {caregiverAuthMode === 'register' && (
                <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New Guardian & Caregiver Registration</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Name *</label>
                      <input
                        type="text"
                        value={caregiverName}
                        onChange={(e) => setCaregiverName(e.target.value)}
                        required
                        placeholder="e.g. Sarah Vance"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-indigo-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Mobile *</label>
                      <input
                        type="tel"
                        value={caregiverPhone}
                        onChange={(e) => setCaregiverPhone(e.target.value)}
                        required
                        placeholder="(555) 234-5678"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-indigo-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Email *</label>
                      <input
                        type="email"
                        value={caregiverEmail}
                        onChange={(e) => setCaregiverEmail(e.target.value)}
                        required
                        placeholder="sarah.vance@familycare.org"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-indigo-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Password *</label>
                      <input
                        type="password"
                        value={caregiverPassword}
                        onChange={(e) => setCaregiverPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-indigo-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-bold text-slate-300">Relationship to Senior</label>
                    <select
                      value={caregiverRel}
                      onChange={(e) => setCaregiverRel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-400 outline-none"
                    >
                      <option value="Daughter (Primary Guardian)">Daughter (Primary Guardian)</option>
                      <option value="Son (Guardian)">Son (Guardian)</option>
                      <option value="Spouse / Partner">Spouse / Partner</option>
                      <option value="Clinical Care Nurse">Clinical Care Nurse</option>
                      <option value="Geriatric Physician">Geriatric Physician</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2.5 pt-1 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-400"
                    />
                    <span>Receive high-priority SMS & Push alerts for emergency SOS and missed pills</span>
                  </label>
                </div>
              )}

              {/* LINK SENIOR ID & QR SECTION */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3.5">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-teal-400" />
                    <span>Elder Account Linking Mechanism</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    🟢 Live Pairing Enabled
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={elderLinkId}
                    onChange={(e) => setElderLinkId(e.target.value.toUpperCase())}
                    required
                    placeholder="Enter Elder Link ID (e.g. ELD-88219)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-teal-300 tracking-wider outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleOpenQrScanner}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-md transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scan QR Code</span>
                  </button>
                </div>

                {/* PRESET LINK IDS */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">Quick Demo IDs:</span>
                  <button
                    type="button"
                    onClick={() => setElderLinkId('ELD-88219')}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border transition-all ${
                      elderLinkId === 'ELD-88219'
                        ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    ELD-88219 (Eleanor Vance - 82y)
                  </button>
                  <button
                    type="button"
                    onClick={() => setElderLinkId('ELD-55410')}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border transition-all ${
                      elderLinkId === 'ELD-55410'
                        ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    ELD-55410 (Robert Vance - 85y)
                  </button>
                </div>

                {/* VERIFIED MATCHED ELDER CARD PREVIEW */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-teal-500/40 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-500/30">
                      <Heart className="w-5 h-5 fill-teal-400/20" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {elderLinkId === 'ELD-55410' ? 'Robert Vance' : currentProfile.name}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.2 rounded-full border border-emerald-500/30">
                          Verified Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Age {elderLinkId === 'ELD-55410' ? '85' : currentProfile.age} • {elderLinkId === 'ELD-55410' ? 'Pine Crest Residence' : currentProfile.location}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 stroke-[2.5]" />
                </div>
              </div>

              {authErrorNotice && (
                <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authErrorNotice}</span>
                </div>
              )}

              {linkSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-3.5 rounded-xl text-xs font-extrabold text-center animate-pulse flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Senior Account {elderLinkId} successfully linked! Launching Caregiver Dashboard...</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={linkSuccess}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 rounded-2xl text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-80"
                >
                  <Activity className="w-5 h-5" />
                  <span>Authenticate & Open Caregiver Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INTERACTIVE QR CODE SCANNER VIEWFINDER */}
      {showQrScanModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white text-center animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Live QR Code Viewfinder</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrScanModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                Close Camera
              </button>
            </div>

            {/* CAMERA VIEWFINDER FRAME */}
            <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500/80 bg-slate-950 flex flex-col items-center justify-center shadow-inner group">
              {/* RETICLE CORNERS */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-sm"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-sm"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-sm"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-sm"></div>

              {/* LASER SWEEP ANIMATION */}
              {isQrScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_rgba(45,212,191,1)] animate-pulse top-1/2"></div>
              )}

              {/* CENTER QR TARGET ICON */}
              <div className="space-y-2 flex flex-col items-center p-4">
                <QrCode className={`w-20 h-20 text-indigo-400/80 ${isQrScanning ? 'animate-pulse' : ''}`} />
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  Point camera at Senior's Tag or QR Wristband
                </span>
              </div>
            </div>

            {/* STATUS & DETECT ACTION */}
            {qrScanSuccessMsg ? (
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs font-bold animate-bounce">
                {qrScanSuccessMsg}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">
                Align the QR code printed on the senior's voice box or profile card within the frame.
              </p>
            )}

            <button
              type="button"
              onClick={handleSimulateQrScanInModal}
              disabled={isQrScanning}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Scan className="w-4 h-4" />
              <span>{isQrScanning ? 'Scanning Camera Feed...' : 'Simulate QR Code Match'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
