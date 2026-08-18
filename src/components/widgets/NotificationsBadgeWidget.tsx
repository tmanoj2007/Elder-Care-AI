import React, { useState } from 'react';
import { CaregiverNotification, NotificationEventType } from '../../types';
import { Bell, ShieldAlert, Pill, Stethoscope, Heart, CheckCircle2, Trash2, Filter, X, Eye } from 'lucide-react';
import { speakText } from '../../utils/speech';

interface NotificationsBadgeWidgetProps {
  notifications: CaregiverNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  selectedLanguage?: string;
}

export const NotificationsBadgeWidget: React.FC<NotificationsBadgeWidgetProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  selectedLanguage = 'en-US',
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency' | 'medicine_missed' | 'health_warning' | 'mood_alert'>('all');
  const [showDrawer, setShowDrawer] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'emergency') return n.eventType === 'emergency';
    if (filter === 'medicine_missed') return n.eventType === 'medicine_missed';
    if (filter === 'health_warning') return n.eventType === 'health_warning';
    if (filter === 'mood_alert') return n.eventType === 'mood_alert';
    return true;
  });

  const getEventIcon = (type: NotificationEventType) => {
    switch (type) {
      case 'emergency':
        return <ShieldAlert className="w-5 h-5 text-rose-400 stroke-[2.5]" />;
      case 'medicine_missed':
        return <Pill className="w-5 h-5 text-amber-400 stroke-[2.5]" />;
      case 'health_warning':
        return <Stethoscope className="w-5 h-5 text-orange-400 stroke-[2.5]" />;
      case 'mood_alert':
        return <Heart className="w-5 h-5 text-sky-400 stroke-[2.5]" />;
    }
  };

  const handleReadAloud = (notif: CaregiverNotification) => {
    speakText(`Notification: ${notif.title}. ${notif.message}`, undefined, undefined, 0.9, 1.0, selectedLanguage);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="font-black text-xs sm:text-sm text-slate-200 uppercase tracking-wider">
            Healthcare Notifications Feed
          </span>
        </div>

        {/* Unread Counter Badge Button */}
        <button
          onClick={() => setShowDrawer(true)}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View All ({notifications.length})</span>
        </button>
      </div>

      {/* Notifications Quick Preview List */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No healthcare notifications in this category.
          </div>
        ) : (
          filteredNotifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                !n.read ? 'bg-slate-800 border-emerald-400/60' : 'bg-black/30 border-white/10'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-950 shrink-0 mt-0.5">
                {getEventIcon(n.eventType)}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-black text-white truncate text-xs">{n.title}</h5>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{n.timestamp}</span>
                </div>
                <p className="font-medium text-slate-300 line-clamp-2 text-[11px]">{n.message}</p>

                <div className="flex items-center justify-between pt-1">
                  {!n.read && onMarkAsRead && (
                    <button
                      onClick={() => onMarkAsRead(n.id)}
                      className="text-[10px] font-black text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleReadAloud(n)}
                    className="text-[10px] font-bold text-teal-300 hover:underline ml-auto"
                  >
                    🔊 Read Aloud
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-xs font-bold text-slate-300">
          {unreadCount > 0 ? `🚨 ${unreadCount} Unread Alerts` : '✓ All notifications up to date'}
        </span>
        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-black text-emerald-400 hover:text-emerald-300 underline"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Drawer Overlay for Full Feed */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col justify-between gap-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-emerald-400" />
                <h4 className="text-lg font-black text-white">Healthcare Notifications Stream</h4>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all ${filter === 'all' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-xl transition-all ${filter === 'unread' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('emergency')}
                className={`px-3 py-1 rounded-xl transition-all ${filter === 'emergency' ? 'bg-rose-500 text-white font-black' : 'bg-slate-800 text-slate-300'}`}
              >
                🚨 SOS
              </button>
              <button
                onClick={() => setFilter('medicine_missed')}
                className={`px-3 py-1 rounded-xl transition-all ${filter === 'medicine_missed' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}
              >
                💊 Medicine
              </button>
            </div>

            {/* Scrollable Feed */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[50vh]">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    !n.read ? 'bg-slate-800/90 border-emerald-400' : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-2">
                      {getEventIcon(n.eventType)}
                      <h5 className="font-black text-white text-xs sm:text-sm">{n.title}</h5>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{n.timestamp}</span>
                  </div>

                  <p className="font-medium text-slate-200 text-xs leading-relaxed">{n.message}</p>

                  {n.actionRequired && (
                    <div className="bg-amber-950/80 border border-amber-400/50 p-2.5 rounded-xl text-amber-200 text-[11px] font-bold">
                      💡 Action: {n.actionRequired}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleReadAloud(n)}
                      className="text-[11px] font-black text-teal-300 hover:underline flex items-center gap-1"
                    >
                      🔊 Read Aloud
                    </button>

                    <div className="flex items-center gap-2">
                      {!n.read && onMarkAsRead && (
                        <button
                          onClick={() => onMarkAsRead(n.id)}
                          className="text-[11px] font-black text-emerald-400 hover:underline"
                        >
                          Mark Read
                        </button>
                      )}
                      {onDeleteNotification && (
                        <button
                          onClick={() => onDeleteNotification(n.id)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                          title="Delete Notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
