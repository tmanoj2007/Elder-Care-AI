import React, { useState } from 'react';
import { SeniorProfile, CheckInItem, CaregiverNotification } from '../types';
import { WeatherWidget } from './widgets/WeatherWidget';
import { DigitalClockWidget } from './widgets/DigitalClockWidget';
import { MotivationalQuoteWidget } from './widgets/MotivationalQuoteWidget';
import { DailyHealthTipWidget } from './widgets/DailyHealthTipWidget';
import { MedicationCountdownWidget } from './widgets/MedicationCountdownWidget';
import { EmergencyContactWidget } from './widgets/EmergencyContactWidget';
import { SeniorCalendarWidget } from './widgets/SeniorCalendarWidget';
import { NotificationsBadgeWidget } from './widgets/NotificationsBadgeWidget';
import { Sparkles, LayoutGrid, ChevronDown, ChevronUp, Activity, Bell } from 'lucide-react';

interface HealthcareWidgetSuiteProps {
  profile: SeniorProfile;
  checkInItems: CheckInItem[];
  onToggleCheckIn: (id: string) => void;
  onTriggerSOS: () => void;
  notifications: CaregiverNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  selectedLanguage?: string;
}

export const HealthcareWidgetSuite: React.FC<HealthcareWidgetSuiteProps> = ({
  profile,
  checkInItems,
  onToggleCheckIn,
  onTriggerSOS,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  selectedLanguage = 'en-US',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'schedule' | 'wellness' | 'emergency'>('all');

  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border-2 border-slate-200 shadow-xl space-y-6">
      {/* Top Suite Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 text-white flex items-center justify-center shadow-lg border-2 border-emerald-300 shrink-0">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Healthcare & Vitality Dashboard
              </h3>
              <span className="bg-emerald-100 text-emerald-950 font-black text-xs px-3 py-1 rounded-full border-2 border-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                <span>Live Suite</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-slate-700 mt-0.5">
              Weather, Medication Countdowns, Calendar, Daily Tips & Emergency Hotline
            </p>
          </div>
        </div>

        {/* Controls & Filter Category Pills */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 flex items-center gap-1 text-xs font-black">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              All Widgets
            </button>
            <button
              onClick={() => setActiveCategory('schedule')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategory === 'schedule'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Schedule & Pills
            </button>
            <button
              onClick={() => setActiveCategory('wellness')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategory === 'wellness'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Weather & Tips
            </button>
          </div>

          {/* Toggle Expand/Collapse Suite */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-800 px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 min-h-[44px]"
            title={isExpanded ? 'Collapse Suite' : 'Expand Suite'}
          >
            <span>{isExpanded ? 'Hide Widgets' : 'Show Widgets'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid of All Healthcare Features */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Date, Time & Digital Clock Widget */}
          {(activeCategory === 'all' || activeCategory === 'schedule') && (
            <div className="h-full">
              <DigitalClockWidget />
            </div>
          )}

          {/* 2. Weather Widget */}
          {(activeCategory === 'all' || activeCategory === 'wellness') && (
            <div className="h-full">
              <WeatherWidget location={profile.location || 'Oakridge Senior Residence'} />
            </div>
          )}

          {/* 3. Medication Countdown Widget */}
          {(activeCategory === 'all' || activeCategory === 'schedule') && (
            <div className="h-full">
              <MedicationCountdownWidget
                checkInItems={checkInItems}
                onToggleCheckIn={onToggleCheckIn}
                selectedLanguage={selectedLanguage}
              />
            </div>
          )}

          {/* 4. Senior Health Calendar Widget */}
          {(activeCategory === 'all' || activeCategory === 'schedule') && (
            <div className="h-full">
              <SeniorCalendarWidget />
            </div>
          )}

          {/* 5. Daily Health Tip Widget */}
          {(activeCategory === 'all' || activeCategory === 'wellness') && (
            <div className="h-full">
              <DailyHealthTipWidget selectedLanguage={selectedLanguage} />
            </div>
          )}

          {/* 6. Motivational Quote Widget */}
          {(activeCategory === 'all' || activeCategory === 'wellness') && (
            <div className="h-full">
              <MotivationalQuoteWidget selectedLanguage={selectedLanguage} />
            </div>
          )}

          {/* 7. Emergency Contacts Widget */}
          {(activeCategory === 'all' || activeCategory === 'emergency') && (
            <div className="h-full">
              <EmergencyContactWidget
                contacts={profile.emergencyContacts || []}
                onTriggerSOS={onTriggerSOS}
                selectedLanguage={selectedLanguage}
              />
            </div>
          )}

          {/* 8. Notifications Feed Widget */}
          {(activeCategory === 'all' || activeCategory === 'emergency' || activeCategory === 'schedule') && (
            <div className="h-full">
              <NotificationsBadgeWidget
                notifications={notifications}
                onMarkAsRead={onMarkNotificationAsRead}
                onMarkAllAsRead={onMarkAllNotificationsAsRead}
                onDeleteNotification={onDeleteNotification}
                selectedLanguage={selectedLanguage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
