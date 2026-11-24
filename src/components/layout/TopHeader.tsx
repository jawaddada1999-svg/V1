import React, { useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  Building2,
  CalendarPlus,
  ChevronDown,
  Globe,
  Menu,
  Plus,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import {
  localizeAgencyName,
  localizeJobTitle,
  localizeNotification,
  localizePersonName,
  localizePropertyTitle,
  localizeRelativeTime,
  matchesLocalizedQuery,
} from '../../i18n/localizeData';
import { formatMAD } from '../../i18n/translations';
import { Language } from '../../types/domain';
import { Avatar } from '../ui/DataPrimitives';

export const TopHeader: React.FC<{
  onOpenMobileMenu: () => void;
}> = ({ onOpenMobileMenu }) => {
  const {
    t,
    language,
    setLanguage,
    activeSection,
    settings,
    leads,
    properties,
    owners,
    employees,
    notifications,
    markNotificationRead,
    setActiveSection,
    setSelectedOwnerId,
    openLeadProfile,
    openPropertyDetails,
    setQuickModal,
    currentUser,
  } = useAgency();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return { leads: [], properties: [], owners: [], employees: [] };
    return {
      leads: leads
        .filter((l) => matchesLocalizedQuery(q, language, [l.name, l.phone, l.city, l.district]))
        .slice(0, 4),
      properties: properties
        .filter((p) =>
          matchesLocalizedQuery(q, language, [p.title, p.ref, p.city, p.district])
        )
        .slice(0, 4),
      owners: owners
        .filter((o) =>
          matchesLocalizedQuery(q, language, [o.name, o.phone, o.city, o.national_id])
        )
        .slice(0, 4),
      employees: employees
        .filter((e) => matchesLocalizedQuery(q, language, [e.name, e.job_title]))
        .slice(0, 3),
    };
  }, [searchQuery, language, leads, properties, owners, employees]);

  const hasResults =
    searchResults.leads.length > 0 ||
    searchResults.properties.length > 0 ||
    searchResults.owners.length > 0 ||
    searchResults.employees.length > 0;

  const contextualAction = useMemo(() => {
    if (activeSection === 'properties') {
      return {
        label: t.properties.addProperty,
        icon: Plus,
        onClick: () => setQuickModal('property'),
      };
    }
    if (activeSection === 'owners') {
      return {
        label: t.owners.addOwner,
        icon: Briefcase,
        onClick: () => setQuickModal('owner'),
      };
    }
    if (activeSection === 'appointments') {
      return {
        label: t.appointments.newAppointment,
        icon: CalendarPlus,
        onClick: () => setQuickModal('appointment'),
      };
    }
    return {
      label: t.leads.addLead,
      icon: UserPlus,
      onClick: () => setQuickModal('lead'),
    };
  }, [activeSection, t, setQuickModal]);

  const ActionIcon = contextualAction.icon;

  return (
    <header
      className="sticky top-0 z-30 text-white px-4 lg:px-6 h-16 flex items-center justify-between gap-4 border-b border-white/10"
      style={{ backgroundColor: 'var(--agency-header)' }}
    >
      {/* Left / Start: Mobile Toggle + Breadcrumb & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-white/15 bg-[#12352B]/70 text-white hover:bg-[#12352B]"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-100/80 whitespace-nowrap">
            <span>{localizeAgencyName(settings.name, language)}</span>
            <span>/</span>
            <span className="text-white font-bold">{t.nav[activeSection]}</span>
          </div>
          <h1 className="text-base lg:text-[17px] font-bold text-white truncate">
            {t.nav[activeSection]}
          </h1>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:block relative flex-1 max-w-md">
        <div className="relative group">
          <Search className="h-4 w-4 text-white/70 group-focus-within:text-[#1F2937] absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
            placeholder={t.app.searchPlaceholder}
            className="w-full h-10 ps-9 pe-3 text-xs bg-[#12352B]/75 border border-white/15 rounded-xl text-white placeholder:text-white/65 focus:outline-none focus:bg-white focus:text-[#1F2937] focus:placeholder:text-[#64748B] focus:border-white transition-all"
          />
        </div>

        {searchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute top-11 inset-x-0 bg-white border border-[#E3EAE5] rounded-xl shadow-xl p-2 z-40 max-h-96 overflow-y-auto">
            {!hasResults ? (
              <div className="py-6 text-center text-xs text-[#64748B]">
                {t.app.noSearchResults}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.leads.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#64748B]">
                      {t.nav.leads}
                    </div>
                    {searchResults.leads.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onMouseDown={() => {
                          openLeadProfile(l.id);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-[#F5F7F5] text-start text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="h-3.5 w-3.5 text-[#16966A] shrink-0" />
                          <span className="font-bold text-[#1F2937] truncate">
                            {localizePersonName(l.name, language)}
                          </span>
                        </div>
                        <span className="text-[#64748B] font-mono-num shrink-0">{l.phone}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.properties.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#64748B]">
                      {t.nav.properties}
                    </div>
                    {searchResults.properties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => {
                          openPropertyDetails(p.id);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-[#F5F7F5] text-start text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="h-3.5 w-3.5 text-[#16966A] shrink-0" />
                          <span className="font-bold text-[#1F2937] truncate">
                            {localizePropertyTitle(p.title, language)}
                          </span>
                        </div>
                        <span className="text-[#1F2937] font-bold font-mono-num shrink-0">
                          {formatMAD(p.price, language)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.owners.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#64748B]">
                      {t.nav.owners}
                    </div>
                    {searchResults.owners.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedOwnerId(o.id);
                          setActiveSection('owners');
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-[#F5F7F5] text-start text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Briefcase className="h-3.5 w-3.5 text-[#16966A] shrink-0" />
                          <span className="font-bold text-[#1F2937] truncate">
                            {localizePersonName(o.name, language)}
                          </span>
                        </div>
                        <span className="text-[#64748B] font-mono-num shrink-0">{o.phone}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.employees.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#64748B]">
                      {t.nav.team}
                    </div>
                    {searchResults.employees.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onMouseDown={() => {
                          setActiveSection('team');
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-[#F5F7F5] text-start text-xs"
                      >
                        <span className="font-bold text-[#1F2937]">
                          {localizePersonName(e.name, language)}
                        </span>
                        <span className="text-[#64748B] truncate max-w-[160px]">
                          {localizeJobTitle(e.job_title, language)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right / End: Language Selector, Notifications, Contextual Action, User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setLangOpen(!langOpen);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap bg-white/12 border border-white/15 text-white hover:bg-white/20 transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-200" />
            <span className="hidden sm:inline">{t.languages[language]}</span>
            <ChevronDown className="h-3 w-3 text-white/75" />
          </button>

          {langOpen && (
            <div className="absolute end-0 mt-1.5 w-36 bg-white border border-[#E3EAE5] rounded-xl shadow-lg py-1 z-40 text-[#1F2937]">
              {(['ar', 'en', 'fr'] as Language[]).map((langCode) => (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => {
                    setLanguage(langCode);
                    setLangOpen(false);
                  }}
                  className={`w-full text-start px-3 py-2 text-xs hover:bg-[#F5F7F5] flex items-center justify-between ${
                    language === langCode ? 'font-bold text-[#16966A] bg-[#ECFDF5]/60' : 'text-[#1F2937]'
                  }`}
                >
                  <span>{t.languages[langCode]}</span>
                  <span className="text-[10px] text-[#64748B] uppercase">{langCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Shortcut */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setLangOpen(false);
              setProfileOpen(false);
            }}
            className="relative h-9 w-9 rounded-xl bg-white/12 border border-white/15 text-white hover:bg-white/20 transition-colors inline-flex items-center justify-center"
            aria-label={t.app.notificationsShortcut}
          >
            <Bell className="h-4 w-4 text-white" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -end-1 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-bold text-white bg-[#EF4444] flex items-center justify-center tabular-nums shadow-xs"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute end-0 mt-1.5 w-80 bg-white border border-[#E3EAE5] rounded-xl shadow-xl z-40 overflow-hidden text-[#1F2937]">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E3EAE5] bg-[#F5F7F5]">
                <span className="text-xs font-bold text-[#1F2937]">{t.nav.notifications}</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('notifications');
                    setNotifOpen(false);
                  }}
                  className="text-[11px] font-bold hover:underline text-[#16966A]"
                >
                  {t.app.viewAll}
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#E3EAE5]">
                {notifications.slice(0, 5).map((n) => {
                  const loc = localizeNotification(n.id, n.title, n.message, language);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        setActiveSection(n.related_section);
                        setNotifOpen(false);
                      }}
                      className={`w-full text-start px-3.5 py-2.5 hover:bg-[#F5F7F5] transition-colors ${
                        !n.is_read ? 'bg-[#ECFDF5]/60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#1F2937] truncate">{loc.title}</span>
                        <span className="text-[10px] text-[#64748B] font-semibold shrink-0">
                          {localizeRelativeTime(n.timestamp, language)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{loc.message}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Contextual Primary Action */}
        <button
          type="button"
          onClick={contextualAction.onClick}
          className="h-9 px-4 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 whitespace-nowrap shrink-0 bg-[#EA580C] hover:bg-[#C2410C] text-white border border-[#C2410C] shadow-sm transition-colors"
        >
          <ActionIcon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{contextualAction.label}</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setLangOpen(false);
              setNotifOpen(false);
            }}
            className="h-9 ps-1.5 pe-2 rounded-xl border border-white/15 bg-white/12 hover:bg-white/20 text-white inline-flex items-center gap-2 transition-colors"
            aria-label={t.app.profileMenu}
          >
            <Avatar
              name={localizePersonName(currentUser.name, language)}
              src={currentUser.avatar}
              size="sm"
            />
            <ChevronDown className="h-3.5 w-3.5 text-white/75 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute end-0 mt-1.5 w-56 bg-white border border-[#E3EAE5] rounded-xl shadow-lg py-2 z-40">
              <div className="px-3.5 py-2 border-b border-[#E3EAE5]">
                <div className="text-xs font-bold text-[#1F2937]">
                  {localizePersonName(currentUser.name, language)}
                </div>
                <div className="text-[11px] text-[#64748B]">{currentUser.email}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('team');
                  setProfileOpen(false);
                }}
                className="w-full text-start px-3.5 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F5F7F5]"
              >
                {t.nav.team}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('settings');
                  setProfileOpen(false);
                }}
                className="w-full text-start px-3.5 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F5F7F5]"
              >
                {t.nav.settings}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
