import React, { useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { localizeNotification, localizeRelativeTime } from '../../i18n/localizeData';
import { NotificationCategory } from '../../types/domain';
import { EmptyState, StatusLabel } from '../ui/DataPrimitives';

export const NotificationsSection: React.FC = () => {
  const {
    t,
    language,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveSection,
    openLeadProfile,
    openPropertyDetails,
  } = useAgency();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (unreadOnly && n.is_read) return false;
      return true;
    });
  }, [notifications, categoryFilter, unreadOnly]);

  const handleOpenRelated = (n: typeof notifications[number]) => {
    markNotificationRead(n.id);
    if (n.related_section === 'leads' && n.related_id) {
      openLeadProfile(n.related_id);
      return;
    }
    if (n.related_section === 'properties' && n.related_id) {
      openPropertyDetails(n.related_id);
      return;
    }
    setActiveSection(n.related_section);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1F2937]">{t.notifications.title}</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">
            {t.notifications.subtitle} · <span className="font-bold text-[#1F2937] tabular-nums">{unreadCount}</span>{' '}
            {t.notifications.unreadCount}
          </p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          disabled={unreadCount === 0}
          className="h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-45 btn-primary"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          <span>{t.notifications.markAllRead}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-xs border border-[#E3EAE5] rounded-lg bg-white text-[#1F2937]"
          >
            <option value="all">{t.app.all}</option>
            {(Object.keys(t.notificationCategories) as NotificationCategory[]).map((cat) => (
              <option key={cat} value={cat}>{t.notificationCategories[cat]}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs text-[#1F2937] cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="h-4 w-4 accent-[#16966A]"
            />
            <span>{t.notifications.unreadOnly}</span>
          </label>
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title={t.notifications.emptyTitle} />
      ) : (
        <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl divide-y divide-[#E3EAE5] overflow-hidden">
          {filtered.map((n) => {
            const loc = localizeNotification(n.id, n.title, n.message, language);
            return (
            <div
              key={n.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                !n.is_read ? 'bg-[#ECFDF5]/60' : 'hover:bg-[#F5F7F5]'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-[#10B981] shrink-0" />}
                  <StatusLabel
                    label={t.notificationCategories[n.category]}
                    tone={
                      n.category === 'client_no_show' || n.category === 'appointment_cancelled'
                        ? 'danger'
                        : n.category === 'upcoming_visit' || n.category === 'new_lead'
                          ? 'accent'
                          : 'info'
                    }
                  />
                  <span className="text-xs font-extrabold text-[#1F2937]">{loc.title}</span>
                  <span className="text-[11px] text-[#64748B] font-mono-num">
                    {localizeRelativeTime(n.timestamp, language)}
                  </span>
                </div>
                <p className="text-xs text-[#1F2937]">{loc.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="h-8 px-3 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 btn-secondary"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{t.notifications.markRead}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenRelated(n)}
                  className="h-8 px-3.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 btn-primary"
                >
                  <span>{t.notifications.openRelated}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
