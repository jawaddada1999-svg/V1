import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Settings,
  Users,
  UserCheck,
  X,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { localizeAgencyName, localizeCity, localizePersonName } from '../../i18n/localizeData';
import { SectionId } from '../../types/domain';
import { Avatar, ConfirmDialog } from '../ui/DataPrimitives';

const navItems: { id: SectionId; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'leads', icon: Users },
  { id: 'pipeline', icon: GitBranch },
  { id: 'properties', icon: Building2 },
  { id: 'owners', icon: Briefcase },
  { id: 'appointments', icon: CalendarClock },
  { id: 'team', icon: UserCheck },
  { id: 'conversations', icon: MessageSquare },
  { id: 'notifications', icon: Bell },
  { id: 'ads', icon: Megaphone },
  { id: 'reports', icon: BarChart3 },
  { id: 'settings', icon: Settings },
];

export const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const {
    t,
    language,
    activeSection,
    setActiveSection,
    settings,
    currentUser,
    notifications,
    conversations,
    resetDemoSession,
  } = useAgency();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const handleSelect = (id: SectionId) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  const renderSidebarBody = (isMobileDrawer: boolean) => {
    const isCollapsed = !isMobileDrawer && collapsed;

    return (
      <div
        className="flex flex-col h-full text-white select-none"
        style={{ backgroundColor: 'var(--agency-sidebar)' }}
      >
        <div className="flex items-center justify-between gap-2 px-4 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={localizeAgencyName(settings.name, language)}
                className="h-9 w-9 rounded-lg object-cover bg-white shrink-0"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
                style={{ backgroundColor: 'var(--agency-primary)' }}
              >
                {localizeAgencyName(settings.name, language).slice(0, 2)}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {localizeAgencyName(settings.name, language)}
                </div>
                <div className="text-[11px] text-white/75 truncate">
                  {localizeCity(settings.city, language)}
                </div>
              </div>
            )}
          </div>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              aria-label={t.app.close}
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:inline-flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? t.app.expandSidebar : t.app.collapseSidebar}
              aria-label={isCollapsed ? t.app.expandSidebar : t.app.collapseSidebar}
            >
              {language === 'ar' ? (
                isCollapsed ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              ) : isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          {navItems.map(({ id, icon: Icon }) => {
            const isActive = activeSection === id;
            const badgeCount =
              id === 'notifications'
                ? unreadNotifications
                : id === 'conversations'
                  ? unreadMessages
                  : 0;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id)}
                title={isCollapsed ? t.nav[id] : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#16966A] text-white font-bold shadow-sm'
                    : 'text-white/80 font-medium hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`shrink-0 ${
                      isActive ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!isCollapsed && <span className="truncate">{t.nav[id]}</span>}
                </div>

                {badgeCount > 0 && !isCollapsed && (
                  <span
                    className="px-1.5 py-0.5 text-[11px] font-bold rounded-md text-white bg-[#10B981] tabular-nums"
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 shrink-0 space-y-2">
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <Avatar
              name={localizePersonName(currentUser.name, language)}
              src={currentUser.avatar}
              size="sm"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {localizePersonName(currentUser.name, language)}
                </div>
                <div className="text-[11px] text-white/75 truncate">
                  {t.employeeRoles[currentUser.role]}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            title={isCollapsed ? t.app.logout : undefined}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{t.app.logout}</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[262px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderSidebarBody(false)}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#12352B]/55 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 bottom-0 start-0 w-[272px] z-10 shadow-2xl">
            {renderSidebarBody(true)}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={logoutOpen}
        title={t.app.logoutConfirmTitle}
        description={t.app.logoutConfirmDesc}
        confirmLabel={t.app.logout}
        cancelLabel={t.app.cancel}
        danger={false}
        onConfirm={() => {
          setLogoutOpen(false);
          resetDemoSession();
        }}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
};
