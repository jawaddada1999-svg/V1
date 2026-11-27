import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  CheckCheck,
  ExternalLink,
  Info,
  MessageSquare,
  Phone,
  Search,
  Send,
  User,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import {
  localizeCity,
  localizePersonName,
  localizePropertyTitle,
  localizeRelativeTime,
  matchesLocalizedQuery,
} from '../../i18n/localizeData';
import { formatMAD } from '../../i18n/translations';
import { ChannelType, LeadStatus } from '../../types/domain';
import { buildTelHref } from '../../utils/contactLinks';
import { Avatar, EmptyState, StatusLabel } from '../ui/DataPrimitives';

const channelStyles: Record<ChannelType, string> = {
  whatsapp: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  instagram: 'text-orange-800 bg-orange-50 border-orange-200',
  facebook: 'text-sky-800 bg-sky-50 border-sky-200',
  website: 'text-slate-800 bg-slate-100 border-slate-200',
  other: 'text-slate-700 bg-slate-50 border-slate-200',
};

type MobilePane = 'list' | 'chat' | 'context';

export const ConversationsSection: React.FC = () => {
  const {
    t,
    language,
    conversations,
    leads,
    properties,
    employees,
    currentUser,
    selectedConversationId,
    setSelectedConversationId,
    sendConversationMessage,
    markConversationRead,
    updateLead,
    addLeadNote,
    openLeadProfile,
    openPropertyDetails,
    setPreselectedLeadForApt,
    setQuickModal,
  } = useAgency();

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [mobilePane, setMobilePane] = useState<MobilePane>('list');

  const filteredConversations = useMemo(() => {
    const q = search.trim();
    return conversations
      .filter((c) => {
        if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
        if (employeeFilter !== 'all' && c.assigned_employee_id !== employeeFilter) return false;
        if (unreadOnly && c.unread_count === 0) return false;
        if (q && !matchesLocalizedQuery(q, language, [c.customer_name, c.last_message])) return false;
        return true;
      })
      .sort((a, b) => {
        const timeA = Date.parse(a.last_message_time) || 0;
        const timeB = Date.parse(b.last_message_time) || 0;
        return timeB - timeA;
      });
  }, [conversations, language, search, channelFilter, employeeFilter, unreadOnly]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread_count, 0),
    [conversations]
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? filteredConversations[0] ?? null,
    [conversations, selectedConversationId, filteredConversations]
  );

  const relatedLead = useMemo(
    () => leads.find((l) => l.id === activeConversation?.lead_id) ?? null,
    [leads, activeConversation]
  );

  const relatedProperty = useMemo(
    () => properties.find((p) => p.id === relatedLead?.interested_property_id) ?? null,
    [properties, relatedLead]
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !replyText.trim()) return;
    sendConversationMessage(activeConversation.id, replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-[19px] font-bold text-[#1F2937]">{t.conversations.title}</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.conversations.subtitle}</p>
        </div>
        {totalUnread > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-bold text-[#117A57] self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#16966A]" />
            <span>
              {totalUnread} {t.conversations.unreadOnly}
            </span>
          </div>
        )}
      </div>

      {/* Honest Integration Banner */}
      <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl px-4 py-3 flex items-center gap-2.5 text-xs font-medium text-[#1F2937]">
        <Info className="h-4 w-4 text-[#0EA5E9] shrink-0" />
        <span>{t.conversations.integrationBanner}</span>
      </div>

      {/* Mobile Pane Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-white border border-zinc-200 rounded-2xl lg:hidden">
        {(
          [
            { id: 'list', label: `${t.conversations.allChannels} (${filteredConversations.length})`, icon: MessageSquare },
            {
              id: 'chat',
              label: activeConversation
                ? localizePersonName(activeConversation.customer_name, language).split(' ')[0]
                : t.conversations.send,
              icon: Send,
            },
            { id: 'context', label: t.conversations.customerPanel, icon: User },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobilePane(id)}
            className={`h-9 px-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 truncate transition-all ${
              mobilePane === id ? 'btn-primary' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* 3-Pane Messaging Workspace */}
      <div className="bg-white border border-[#CBD5E1] card-surface rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left / Start: Conversation List */}
        <div
          className={`lg:col-span-4 border-b lg:border-b-0 lg:border-e border-emerald-200 bg-emerald-50/60 flex-col ${
            mobilePane === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3.5 border-b border-emerald-200 bg-emerald-100/70 space-y-2.5">
            <div className="relative">
              <Search className="h-4 w-4 text-[#64748B] absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.app.search}
                className="w-full h-10 ps-9 pe-3 text-xs font-medium border border-[#E3EAE5] rounded-xl bg-white focus:outline-none focus:border-[#16966A]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="h-9 px-2.5 text-xs font-semibold border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937]"
              >
                <option value="all">{t.conversations.allChannels}</option>
                {(Object.keys(t.channels) as ChannelType[]).map((ch) => (
                  <option key={ch} value={ch}>
                    {t.channels[ch]}
                  </option>
                ))}
              </select>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="h-9 px-2.5 text-xs font-semibold border border-[#E3EAE5] rounded-xl bg-white text-[#1F2937]"
              >
                <option value="all">{t.leads.filters.allEmployees}</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {localizePersonName(e.name, language)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1F2937] cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="h-4 w-4 accent-[#16966A] rounded"
              />
              <span>{t.conversations.unreadOnly}</span>
            </label>
          </div>

          <div className="divide-y divide-emerald-100 overflow-y-auto flex-1 max-h-[540px] bg-white/70">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">{t.app.noData}</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const emp = employees.find((e) => e.id === conv.assigned_employee_id);
                const localizedCustomer = localizePersonName(conv.customer_name, language);
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      if (conv.unread_count > 0) markConversationRead(conv.id);
                      setMobilePane('chat');
                    }}
                    className={`w-full text-start p-3.5 flex items-start gap-3 transition-colors border-s-4 ${
                      isSelected
                        ? 'bg-[#ECFDF5] border-s-[#16966A]'
                        : 'border-s-transparent hover:bg-[#F5F7F5]'
                    }`}
                  >
                    <Avatar name={localizedCustomer} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#1F2937] truncate">
                          {localizedCustomer}
                        </span>
                        <span className="text-[11px] text-[#64748B] font-mono-num shrink-0">
                          {localizeRelativeTime(conv.last_message_time, language)}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mt-1 ${
                          conv.unread_count > 0 ? 'font-bold text-[#1F2937]' : 'text-[#64748B]'
                        }`}
                      >
                        {conv.last_message || '—'}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              channelStyles[conv.channel]
                            }`}
                          >
                            {t.channels[conv.channel]}
                          </span>
                          <span className="text-[11px] text-[#64748B] font-medium truncate">
                            {emp ? localizePersonName(emp.name, language) : ''}
                          </span>
                        </div>
                        {conv.unread_count > 0 && (
                          <span
                            className="h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-extrabold text-white bg-[#10B981] flex items-center justify-center shrink-0"
                          >
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center: Message Thread */}
        <div
          className={`lg:col-span-5 border-b lg:border-b-0 lg:border-e border-violet-200 flex-col bg-violet-50/70 shadow-inner ${
            mobilePane === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title={t.conversations.noConversationSelected}
              />
            </div>
          ) : (
            <>
              <div className="px-4 py-3.5 bg-violet-100/80 border-b border-violet-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={localizePersonName(activeConversation.customer_name, language)}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[#1F2937] truncate">
                      {localizePersonName(activeConversation.customer_name, language)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          channelStyles[activeConversation.channel]
                        }`}
                      >
                        {t.channels[activeConversation.channel]}
                      </span>
                      {relatedLead && (
                        <a
                          href={buildTelHref(relatedLead.phone)}
                          className="text-[11px] font-mono-num text-sky-700 hover:underline inline-flex items-center gap-1"
                          dir="ltr"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{relatedLead.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => markConversationRead(activeConversation.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0 btn-outline"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t.conversations.markAsRead}</span>
                </button>
              </div>

              <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[470px] bg-violet-50/50">
                {activeConversation.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                          isAgent
                            ? 'bg-[#12352B] text-white rounded-ee-xs'
                            : 'bg-white border border-[#E3EAE5] text-[#1F2937] rounded-es-xs'
                        }`}
                      >
                        <p className="font-medium">{msg.text}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#64748B] mt-1 px-1 font-mono-num">
                        {localizePersonName(msg.sender_name, language)} ·{' '}
                        {localizeRelativeTime(msg.timestamp, language)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="p-3.5 bg-violet-100/70 border-t border-violet-200 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t.conversations.replyPlaceholder}
                  className="flex-1 h-10 px-3.5 text-xs font-medium border border-[#E3EAE5] rounded-xl focus:outline-none focus:border-[#16966A]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 btn-accent"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{t.conversations.send}</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Right / End: Customer Context Panel */}
        <div
          className={`lg:col-span-3 p-4 space-y-4 bg-amber-50/70 ${
            mobilePane === 'context' ? 'block' : 'hidden lg:block'
          }`}
        >
          {relatedLead ? (
            <>
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <h3 className="text-xs font-extrabold text-[#1F2937]">{t.conversations.customerPanel}</h3>
                <button
                  type="button"
                  onClick={() => openLeadProfile(relatedLead.id)}
                  className="text-xs font-bold text-[#16966A] inline-flex items-center gap-1 hover:underline"
                >
                  <span>{t.conversations.openFullProfile}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-amber-100/70 border border-amber-200 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="font-extrabold text-[#1F2937] text-sm">
                  {localizePersonName(relatedLead.name, language)}
                </div>
                <div className="font-mono-num text-[#64748B] font-semibold" dir="ltr">
                  {relatedLead.phone}
                </div>
                <div className="text-[#64748B] font-medium">
                  {localizeCity(relatedLead.city, language)} ·{' '}
                  <strong className="font-mono-num text-[#1F2937]">
                    {formatMAD(relatedLead.budget, language)}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t.conversations.leadStatus}
                </label>
                <select
                  value={relatedLead.status}
                  onChange={(e) => updateLead(relatedLead.id, { status: e.target.value as LeadStatus })}
                  className="w-full h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-xl bg-white"
                >
                  {(Object.keys(t.leadStatuses) as LeadStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {t.leadStatuses[st]}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <StatusLabel label={t.leadStatuses[relatedLead.status]} leadStatus={relatedLead.status} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {t.conversations.assignedEmployee}
                </label>
                <select
                  value={relatedLead.assigned_employee_id}
                  onChange={(e) =>
                    updateLead(relatedLead.id, { assigned_employee_id: e.target.value })
                  }
                  className="w-full h-9 px-3 text-xs font-semibold text-[#1F2937] border border-[#E3EAE5] rounded-xl bg-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {localizePersonName(e.name, language)}
                    </option>
                  ))}
                </select>
              </div>

              {relatedProperty && (
                <div className="border border-amber-200 rounded-xl p-3 bg-amber-100/50 space-y-1">
                  <div className="text-[11px] font-semibold text-[#64748B]">
                    {t.conversations.interestedProperty}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPropertyDetails(relatedProperty.id)}
                    className="text-xs font-extrabold text-[#1F2937] hover:underline text-start block"
                  >
                    {localizePropertyTitle(relatedProperty.title, language)}
                  </button>
                  <div className="text-xs font-mono-num font-bold text-[#16966A]">
                    {formatMAD(relatedProperty.price, language)}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setPreselectedLeadForApt(relatedLead.id);
                  setQuickModal('appointment');
                }}
                className="w-full h-10 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 btn-primary"
              >
                <CalendarPlus className="h-4 w-4" />
                <span>{t.conversations.bookVisit}</span>
              </button>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-[#1F2937]">{t.conversations.internalNotes}</div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder={t.leads.profile.addNotePlaceholder}
                    className="flex-1 h-9 px-2.5 text-xs border border-slate-200 rounded-xl text-[#1F2937]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const note = quickNote.trim();
                      if (!note) return;
                      addLeadNote(relatedLead.id, note);
                      setQuickNote('');
                    }}
                    disabled={!quickNote.trim()}
                    className="h-9 px-3 text-xs font-bold rounded-xl btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t.app.add}
                  </button>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {relatedLead.notes.map((n) => (
                    <div key={n.id} className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <div className="font-bold text-[#1F2937]">
                        {localizePersonName(n.author_name, language)}
                      </div>
                      <div className="text-zinc-700 mt-0.5">{n.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 py-8 text-center">{t.app.noData}</div>
          )}
        </div>
      </div>
    </div>
  );
};