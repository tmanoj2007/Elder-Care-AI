import React, { useState } from 'react';
import { SeniorProfile, CheckInItem, UserAccount } from '../types';
import {
  Heart, User, Stethoscope, Pill, Phone, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck,
  UserPlus, Mail, Lock, Plus, Trash2, Clock, Sparkles, AlertCircle, Check
} from 'lucide-react';

interface LinearOnboardingFlowProps {
  initialProfile: SeniorProfile;
  initialTimetable: CheckInItem[];
  onCompleteOnboarding: (
    account: UserAccount,
    profile: SeniorProfile,
    timetable: CheckInItem[]
  ) => void;
  onCancel: () => void;
  selectedRoleFromLanding?: 'elderly' | 'caregiver';
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

export const LinearOnboardingFlow: React.FC<LinearOnboardingFlowProps> = ({
  initialProfile,
  initialTimetable,
  onCompleteOnboarding,
  onCancel,
  selectedRoleFromLanding = 'elderly',
}) => {
  // Linear sequence: 1: Register -> 2: Profile -> 3: Medical Details -> 4: Medicine Details -> 5: Emergency Contact
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // STEP 1: REGISTER (USER CREATION)
  const [email, setEmail] = useState('eleanor.vance@eldercare.ai');
  const [password, setPassword] = useState('seniorcare2026');
  const [selectedRole, setSelectedRole] = useState<'elderly' | 'caregiver'>(selectedRoleFromLanding);
  const [accountName, setAccountName] = useState(initialProfile.name);

  // STEP 2: PROFILE (PERSONAL DETAILS)
  const [seniorName, setSeniorName] = useState(initialProfile.name);
  const [preferredName, setPreferredName] = useState(initialProfile.preferredName);
  const [age, setAge] = useState(initialProfile.age.toString());
  const [gender, setGender] = useState(initialProfile.gender || 'Female');
  const [height, setHeight] = useState(initialProfile.height || "5' 4\" (163 cm)");
  const [weight, setWeight] = useState(initialProfile.weight || '62 kg');
  const [bloodGroup, setBloodGroup] = useState(initialProfile.bloodGroup || 'O+');
  const [location, setLocation] = useState(initialProfile.location || 'Oakridge Senior Residence, Apt 4B');

  // STEP 3: MEDICAL DETAILS
  const [diabetes, setDiabetes] = useState<boolean>(initialProfile.diabetes ?? false);
  const [bloodPressure, setBloodPressure] = useState<boolean>(initialProfile.bloodPressure ?? true);
  const [heartDisease, setHeartDisease] = useState<boolean>(initialProfile.heartDisease ?? true);
  const [asthma, setAsthma] = useState<boolean>(initialProfile.asthma ?? false);
  const [allergiesText, setAllergiesText] = useState((initialProfile.allergies || ['Penicillin', 'Shellfish']).join(', '));
  const [otherDiseasesText, setOtherDiseasesText] = useState(initialProfile.otherDiseases || 'Mild Osteoarthritis in knees');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(
    initialProfile.medicalConditions || ['Hypertension (High BP)', 'Osteoarthritis / Joint Pain']
  );
  const [doctorName, setDoctorName] = useState(initialProfile.doctorName || 'Dr. Robert Evans (Geriatrics)');
  const [doctorPhone, setDoctorPhone] = useState(initialProfile.doctorPhone || '(555) 999-1122');

  // STEP 4: MEDICINE DETAILS & TIMETABLE
  const [routineTimetable, setRoutineTimetable] = useState<CheckInItem[]>(initialTimetable);
  const [medTitle, setMedTitle] = useState('');
  const [medTime, setMedTime] = useState('08:00 AM');
  const [medDetails, setMedDetails] = useState('');
  const [medCategory, setMedCategory] = useState<'medication' | 'hydration' | 'meal' | 'activity' | 'health_check'>('medication');

  // STEP 5: EMERGENCY CONTACT
  const primaryContact = initialProfile.emergencyContacts[0] || { name: 'Sarah Vance', phone: '(555) 234-5678', relationship: 'Daughter (Primary)' };
  const [contactName, setContactName] = useState(primaryContact.name);
  const [contactRel, setContactRel] = useState(primaryContact.relationship);
  const [contactPhone, setContactPhone] = useState(primaryContact.phone);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Toggle Disease Selection
  const toggleDisease = (disease: string) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease) ? prev.filter((d) => d !== disease) : [...prev, disease]
    );
  };

  // Add Item to Timetable
  const handleAddMedicineItem = () => {
    if (!medTitle.trim()) return;
    const newItem: CheckInItem = {
      id: `chk-reg-${Date.now()}`,
      title: medTitle.trim(),
      category: medCategory,
      dosageOrDetails: medDetails.trim() || 'Scheduled daily routine medication',
      scheduledTime: medTime,
      completed: false,
      audioPrompt: `Reminder: It is time for your scheduled ${medTitle.trim()}.`,
    };
    setRoutineTimetable((prev) => [...prev, newItem]);
    setMedTitle('');
    setMedDetails('');
  };

  const handleRemoveMedicineItem = (id: string) => {
    setRoutineTimetable((prev) => prev.filter((m) => m.id !== id));
  };

  // STEP NAVIGATION VALIDATION
  const handleNextStep = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!email.trim() || !email.includes('@')) {
        setValidationError('Please enter a valid Email address for user registration.');
        return;
      }
      if (!password.trim() || password.length < 4) {
        setValidationError('Please enter a secure password (at least 4 characters).');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!seniorName.trim()) {
        setValidationError('Please enter Senior Full Name.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (routineTimetable.length === 0) {
        setValidationError('Please keep at least one scheduled medicine / task in the timetable.');
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!contactName.trim() || !contactPhone.trim()) {
        setValidationError('Please enter primary Emergency Contact Name and Mobile Number.');
        return;
      }

      // COMPLETE ENTIRE REGISTRATION FLOW
      const newAccount: UserAccount = {
        id: `usr-${Date.now()}`,
        email,
        role: selectedRole,
        name: seniorName || accountName,
        registeredAt: new Date().toLocaleDateString(),
      };

      const parsedAllergies = allergiesText
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const finalProfile: SeniorProfile = {
        ...initialProfile,
        name: seniorName,
        preferredName: preferredName || seniorName,
        age: parseInt(age) || 82,
        gender: gender || 'Female',
        height: height || "5' 4\"",
        weight: weight || '62 kg',
        bloodGroup: bloodGroup || 'O+',
        location: location || 'Senior Residence',
        diabetes,
        bloodPressure,
        heartDisease,
        asthma,
        otherDiseases: otherDiseasesText,
        doctorName: doctorName || 'Dr. Evans',
        doctorPhone: doctorPhone || '(555) 999-1122',
        allergies: parsedAllergies.length > 0 ? parsedAllergies : ['Penicillin'],
        medicalConditions: selectedDiseases,
        emergencyContacts: [
          {
            id: 'ec-primary',
            name: contactName,
            relationship: contactRel || 'Primary Guardian',
            phone: contactPhone,
            isPrimary: true,
          },
        ],
      };

      onCompleteOnboarding(newAccount, finalProfile, routineTimetable);
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 text-white my-8 animate-fade-in">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-black">
              <UserPlus className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                ElderCare AI Linear Registration & Setup
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Complete all 5 sequential steps to initialize senior voice profile & dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 bg-slate-800 rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>

        {/* STEP PROGRESS TRACKER BAR */}
        <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-[11px] font-black text-center">
          <div className={`py-2 px-1 rounded-xl transition-all ${currentStep === 1 ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' : currentStep > 1 ? 'bg-teal-950 text-teal-300' : 'text-slate-400'}`}>
            1. Register
          </div>
          <div className={`py-2 px-1 rounded-xl transition-all ${currentStep === 2 ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' : currentStep > 2 ? 'bg-teal-950 text-teal-300' : 'text-slate-400'}`}>
            2. Profile
          </div>
          <div className={`py-2 px-1 rounded-xl transition-all ${currentStep === 3 ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' : currentStep > 3 ? 'bg-teal-950 text-teal-300' : 'text-slate-400'}`}>
            3. Medical
          </div>
          <div className={`py-2 px-1 rounded-xl transition-all ${currentStep === 4 ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' : currentStep > 4 ? 'bg-teal-950 text-teal-300' : 'text-slate-400'}`}>
            4. Medicines
          </div>
          <div className={`py-2 px-1 rounded-xl transition-all ${currentStep === 5 ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400'}`}>
            5. Emergency
          </div>
        </div>

        {validationError && (
          <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: REGISTER (USER CREATION) */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <span>Step 1: User Account Creation</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Create user login credentials and assign primary platform access role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-bold">Select Access Role</label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('elderly')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      selectedRole === 'elderly'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-extrabold'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-teal-400" />
                    <span>Elderly Senior User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('caregiver')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      selectedRole === 'caregiver'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-extrabold'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-indigo-400" />
                    <span>Family Caregiver</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Registration Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="user@eldercare.ai"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Secure Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE (PERSONAL DETAILS) */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" />
                <span>Step 2: Personal Profile Details</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Enter personal metrics to tailor AI voice companion responses and vital thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Senior Full Legal Name</label>
                <input
                  type="text"
                  value={seniorName}
                  onChange={(e) => setSeniorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="Eleanor Vance"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Preferred Spoken Name (AI Prompt)</label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="Eleanor"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="82"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Height</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="5' 4'' (163 cm)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Weight</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="62 kg (136 lbs)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A-">A Negative (A-)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Residence Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="Oakridge Residence, Apt 4B"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MEDICAL DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-400" />
                <span>Step 3: Medical Details & Conditions</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Configure chronic condition tags, allergies & primary physician contact.
              </p>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">Major Medical Conditions (Select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiabetes(!diabetes)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      diabetes ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-black' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Diabetes
                  </button>

                  <button
                    type="button"
                    onClick={() => setBloodPressure(!bloodPressure)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      bloodPressure ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-black' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Hypertension (BP)
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeartDisease(!heartDisease)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      heartDisease ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-black' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Heart Disease
                  </button>

                  <button
                    type="button"
                    onClick={() => setAsthma(!asthma)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      asthma ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-black' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Asthma
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">Additional Diagnoses & Health Conditions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_DISEASES.map((disease) => (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => toggleDisease(disease)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        selectedDiseases.includes(disease)
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span>{disease}</span>
                      {selectedDiseases.includes(disease) && <Check className="w-4 h-4 text-teal-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Known Allergies (Comma separated)</label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="Penicillin, Shellfish, Peanuts"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Other Health Notes / Diseases</label>
                  <input
                    type="text"
                    value={otherDiseasesText}
                    onChange={(e) => setOtherDiseasesText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="Mild Osteoarthritis in knees"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: MEDICINE DETAILS & TIMETABLE */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-400" />
                <span>Step 4: Medicine Details & Daily Timetable</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Add scheduled medications, dosage details, and daily check-in times.
              </p>
            </div>

            {/* ADD NEW MEDICINE INLINE FORM */}
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
              <span className="text-xs font-extrabold text-teal-300 uppercase tracking-wider block">
                + Add Scheduled Medicine or Routine Task
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  value={medTitle}
                  onChange={(e) => setMedTitle(e.target.value)}
                  placeholder="Medicine Name (e.g. Lisinopril 10mg)"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />

                <input
                  type="text"
                  value={medDetails}
                  onChange={(e) => setMedDetails(e.target.value)}
                  placeholder="Dosage (e.g. 1 pill with warm water)"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-center font-bold"
                  />

                  <button
                    type="button"
                    onClick={handleAddMedicineItem}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TIMETABLE LIST */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {routineTimetable.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-teal-500/20 text-teal-300 font-extrabold px-2.5 py-1 rounded-lg border border-teal-500/30">
                      {item.scheduledTime}
                    </span>
                    <div>
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="text-slate-400 text-[11px]">{item.dosageOrDetails}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMedicineItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: EMERGENCY CONTACT */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <Phone className="w-5 h-5 text-teal-400" />
                <span>Step 5: Primary Emergency Contact</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Specify primary guardian or family member phone number for instant SOS alert routing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Family Member / Guardian Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="Sarah Vance"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Relationship</label>
                <input
                  type="text"
                  value={contactRel}
                  onChange={(e) => setContactRel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="Daughter (Primary Guardian)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mobile Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="(555) 234-5678"
                />
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-300 font-medium flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong>Automated Distress Dispatch:</strong> During unacknowledged SOS calls or critical symptom warnings, ElderCare AI will automatically send SMS/voice notifications to {contactName || 'Primary Guardian'} at {contactPhone || 'their mobile number'}.
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM STEP NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <span>{currentStep === 5 ? 'Finish & Launch Home Dashboard' : 'Continue to Next Step'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
};
