import React, { useState } from 'react';
import { CaregiverNotification, NotificationEventType, SeniorProfile } from '../types';
import {
  Bell, AlertTriangle, ShieldAlert, Pill, Heart, Activity, CheckCircle2, Check, Eye, Trash2, Filter,
  Phone, Sparkles, Clock, Calendar, RefreshCw, Send, AlertCircle, Volume2, Shield
} from 'lucide-react';

interface CaregiverNotificationsModuleProps {
  notifications: CaregiverNotification[];
  profile: SeniorProfile;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onSimulateNotification: (eventType: NotificationEventType) => void;
  onCallSenior: () => void;
}

export const CaregiverNotificationsModule: React.FC<CaregiverNotificationsModuleProps> = ({
  notifications,
  profile,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onSimulateNotification,
  onCallSenior,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationEventType>('all');
  const [selectedNotif, setSelectedNotif] = useState<CaregiverNotification | null>(null);
  const [pushNotice, setPushNotice] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.eventType === activeFilter;
  });

  const handleSimulate = (type: NotificationEventType) => {
    onSimulateNotification(type);
    const labelMap: Record<NotificationEventType, string> = {
      medicine_missed: '💊 Medicine Missed Alert',
      emergency: '🚨 Emergency SOS Call',
      health_warning: '⚠️ Health Symptom Warning',
      mood_alert: '💙 Persistent Mood Alert',
    };
    setPushNotice(`Simulated ${labelMap[type]} dispatched in real time!`);
    setTimeout(() => setPushNotice(null), 3500);
  };

  const getEventBadge = (type: NotificationEventType) => {
    switch (type) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 border border-rose-300 px-2.5 py-1 rounded-full text-xs font-black uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Emergency SOS</span>
          </span>
        );
      case 'medicine_missed':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-black uppercase">
            <Pill className="w-3.5 h-3.5 text-amber-600" />
            <span>Medicine Missed</span>
          </span>
        );
      case 'health_warning':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-700 border border-purple-300 px-2.5 py-1 rounded-full text-xs font-black uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
            <span>Health Warning</span>
          </span>
        );
      case 'mood_alert':
        return (
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-700 border border-indigo-300 px-2.5 py-1 rounded-full text-xs font-black uppercase">
            <Heart className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mood Alert</span>
          </span>
        );
    }
  };

  return (
    <div id="caregiver-notifications-section" className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in space-y-0">
      
      {/* HEADER BAR */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-rose-500/30">
              <Bell className="w-4 h-4 text-rose-400 stroke-[2.2]" />
              <span>Real-Time Alert Feed & Notification Hub</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Caregiver Notifications & Safety Log
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              Real-time alert pushes for missed medicines, unacknowledged SOS calls, speech symptoms & mood trends
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border border-slate-700 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark All ({unreadCount}) Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCallSenior}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Phone className="w-4 h-4 fill-slate-950" />
              <span>Call {profile.preferredName}</span>
            </button>
          </div>
        </div>

        {/* REAL-TIME TEST TRIGGER PANEL */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Simulate Real-Time Push Notification Triggers</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Test Real-Time Caregiver Push Delivery</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSimulate('medicine_missed')}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Pill className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Medicine Missed</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulate('emergency')}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>+ Emergency SOS</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulate('health_warning')}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Health Warning</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulate('mood_alert')}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 text-indigo-400" />
              <span>+ Mood Alert</span>
            </button>
          </div>
        </div>

        {pushNotice && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs font-black text-center animate-bounce">
            {pushNotice}
          </div>
        )}
      </div>

      {/* FILTER TABS & STATS STRIP */}
      <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Alerts ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('medicine_missed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeFilter === 'medicine_missed'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Medicine Missed ({notifications.filter((n) => n.eventType === 'medicine_missed').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('emergency')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeFilter === 'emergency'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-rose-900 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency SOS ({notifications.filter((n) => n.eventType === 'emergency').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('health_warning')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeFilter === 'health_warning'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-purple-900 hover:bg-purple-50 border border-purple-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Health Warnings ({notifications.filter((n) => n.eventType === 'health_warning').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('mood_alert')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeFilter === 'mood_alert'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-indigo-900 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Mood Alerts ({notifications.filter((n) => n.eventType === 'mood_alert').length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS LOG FEED */}
      <div className="p-6 sm:p-8 space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Bell className="w-10 h-10 text-slate-400 mx-auto" />
            <h5 className="font-extrabold text-slate-800 text-base">No Notifications Found</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              There are currently no logged alerts matching the selected category filter.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                !notif.read
                  ? notif.eventType === 'emergency'
                    ? 'bg-rose-50/80 border-2 border-rose-400 shadow-md'
                    : notif.eventType === 'medicine_missed'
                    ? 'bg-amber-50/80 border-2 border-amber-400 shadow-md'
                    : notif.eventType === 'health_warning'
                    ? 'bg-purple-50/80 border-2 border-purple-400 shadow-md'
                    : 'bg-indigo-50/80 border-2 border-indigo-400 shadow-md'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {getEventBadge(notif.eventType)}
                  <span className="text-xs font-black text-slate-800">{notif.title}</span>
                  {!notif.read && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      UNREAD
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{notif.timestamp}</span>
                  <span>•</span>
                  <span>{notif.date}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                {notif.message}
              </p>

              {notif.actionRequired && (
                <div className="bg-white/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Recommended Caregiver Action:</span>
                  <div className="font-extrabold text-slate-900">{notif.actionRequired}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs font-bold">
                <span className="text-slate-500 text-[11px]">
                  Senior Elder: <strong className="text-slate-900">{notif.elderName}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => onMarkAsRead(notif.id)}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteNotification(notif.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete alert log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
