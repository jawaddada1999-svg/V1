import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Flame,
  Gauge,
  Info,
  MessageCircle,
  Phone,
  Snowflake,
  Sun,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import {
  AppointmentStatus,
  ContactMethod,
  LeadClassification,
  LeadStatus,
  PropertyStatus,
  ToastMessage,
} from '../../types/domain';
import { buildTelHref, buildWhatsAppHref } from '../../utils/contactLinks';
import { LeadScoreTier } from '../../utils/leadScoring';

export const SafeImage: React.FC<{
  src?: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F5F7F5] text-[#64748B] ${className}`}
        aria-label={alt}
      >
        <Building2 className="h-7 w-7 stroke-[1.5]" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export const Avatar: React.FC<{
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ name, src, size = 'md' }) => {
  const [failed, setFailed] = useState(false);
  const sizeClass =
    size === 'sm'
      ? 'h-8 w-8 text-xs'
      : size === 'lg'
        ? 'h-14 w-14 text-lg'
        : 'h-10 w-10 text-sm';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover border border-[#E3EAE5] shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: 'var(--agency-primary)' }}
    >
      {initials || 'IB'}
    </div>
  );
};

type SemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

const toneClasses: Record<SemanticTone, string> = {
  neutral: 'bg-[#F5F7F5] text-[#64748B] border-[#E3EAE5]',
  info: 'bg-sky-50 text-[#0284C7] border-[#0EA5E9]/30',
  success: 'bg-emerald-50 text-[#117A57] border-[#10B981]/35',
  warning: 'bg-amber-50 text-amber-700 border-[#F59E0B]/35',
  danger: 'bg-red-50 text-[#DC2626] border-[#EF4444]/35',
  accent: 'bg-[#ECFDF5] text-[#16966A] border-[#16966A]/35',
};

const leadStatusTone: Record<LeadStatus, SemanticTone> = {
  new: 'info',
  visit_scheduled: 'accent',
  visited: 'success',
  no_show: 'danger',
  follow_up: 'warning',
  closed_won: 'success',
  not_interested: 'neutral',
  closed_lost: 'danger',
};

const propertyStatusTone: Record<PropertyStatus, SemanticTone> = {
  available: 'success',
  reserved: 'warning',
  sold: 'info',
  rented: 'accent',
  unavailable: 'neutral',
};

const appointmentStatusTone: Record<AppointmentStatus, SemanticTone> = {
  scheduled: 'info',
  confirmed: 'accent',
  attended: 'success',
  no_show: 'danger',
  cancelled: 'neutral',
  rescheduled: 'warning',
};

export const StatusLabel: React.FC<{
  label: string;
  tone?: SemanticTone;
  leadStatus?: LeadStatus;
  propertyStatus?: PropertyStatus;
  appointmentStatus?: AppointmentStatus;
}> = ({ label, tone, leadStatus, propertyStatus, appointmentStatus }) => {
  const resolvedTone: SemanticTone =
    tone ??
    (leadStatus
      ? leadStatusTone[leadStatus]
      : propertyStatus
        ? propertyStatusTone[propertyStatus]
        : appointmentStatus
          ? appointmentStatusTone[appointmentStatus]
          : 'neutral');

  const Icon =
    resolvedTone === 'success'
      ? CheckCircle2
      : resolvedTone === 'danger'
        ? XCircle
        : resolvedTone === 'warning' || resolvedTone === 'accent'
          ? Clock
          : Info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap ${toneClasses[resolvedTone]}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const ClassificationBadge: React.FC<{
  classification: LeadClassification;
  label: string;
}> = ({ classification, label }) => {
  const styles: Record<LeadClassification, string> = {
    vip: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/45 font-bold',
    hot: 'bg-[#FEE2E2] text-[#DC2626] border-[#EF4444]/35 font-semibold',
    warm: 'bg-[#FEF3C7]/70 text-[#B45309] border-[#F59E0B]/35 font-medium',
    cold: 'bg-[#E0F2FE] text-[#0284C7] border-[#0EA5E9]/35 font-medium',
  };
  const Icon =
    classification === 'vip'
      ? Crown
      : classification === 'hot'
        ? Flame
        : classification === 'warm'
          ? Sun
          : Snowflake;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border whitespace-nowrap ${styles[classification]}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const LeadScoreBadge: React.FC<{
  score: number;
  tier: LeadScoreTier;
  tierLabel?: string;
  compact?: boolean;
}> = ({ score, tier, tierLabel, compact = false }) => {
  const styles: Record<LeadScoreTier, { badge: string; bar: string }> = {
    high: {
      badge: 'bg-emerald-50 text-[#117A57] border-[#10B981]/40',
      bar: 'bg-[#10B981]',
    },
    medium: {
      badge: 'bg-sky-50 text-[#0284C7] border-[#0EA5E9]/40',
      bar: 'bg-[#0EA5E9]',
    },
    low: {
      badge: 'bg-[#F5F7F5] text-[#64748B] border-[#E3EAE5]',
      bar: 'bg-[#64748B]',
    },
  };
  const current = styles[tier];

  return (
    <span
      title={tierLabel ? `${score}/100 · ${tierLabel}` : `${score}/100`}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-extrabold whitespace-nowrap ${current.badge} ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      <Gauge className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span className="font-mono-num">{score}</span>
      {!compact && tierLabel && <span className="font-bold opacity-90">· {tierLabel}</span>}
    </span>
  );
};

export const ContactMethodBadge: React.FC<{
  method: ContactMethod;
  label: string;
  phone?: string;
  message?: string;
  title?: string;
}> = ({ method, label, phone, message, title }) => {
  const isWtsp = method === 'whatsapp';
  const baseClass = `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap transition-colors ${
    isWtsp
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-sky-50 text-sky-800 border-sky-200'
  }`;

  if (phone && phone.trim()) {
    const href = isWtsp ? buildWhatsAppHref(phone, message) : buildTelHref(phone);
    return (
      <a
        href={href}
        target={isWtsp ? '_blank' : undefined}
        rel={isWtsp ? 'noopener noreferrer' : undefined}
        onClick={(e) => e.stopPropagation()}
        title={title ?? label}
        className={`${baseClass} cursor-pointer ${
          isWtsp
            ? 'hover:bg-emerald-100 hover:border-emerald-400'
            : 'hover:bg-sky-100 hover:border-sky-400'
        }`}
      >
        {isWtsp ? <MessageCircle className="h-3 w-3 shrink-0" /> : <Phone className="h-3 w-3 shrink-0" />}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <span className={baseClass}>
      {isWtsp ? <MessageCircle className="h-3 w-3 shrink-0" /> : <Phone className="h-3 w-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

export type CardTone =
  | 'navy'
  | 'orange'
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'rose'
  | 'teal'
  | 'indigo'
  | 'slate';

const kpiToneStyles: Record<
  CardTone,
  { iconBg: string; iconText: string; iconBorder: string }
> = {
  navy: {
    iconBg: 'bg-[#12352B]/10',
    iconText: 'text-[#12352B]',
    iconBorder: 'border-[#12352B]/20',
  },
  orange: {
    iconBg: 'bg-[#FEF3C7]',
    iconText: 'text-[#F59E0B]',
    iconBorder: 'border-[#F59E0B]/40',
  },
  emerald: {
    iconBg: 'bg-[#ECFDF5]',
    iconText: 'text-[#16966A]',
    iconBorder: 'border-[#10B981]/40',
  },
  sky: {
    iconBg: 'bg-[#E0F2FE]',
    iconText: 'text-[#0EA5E9]',
    iconBorder: 'border-[#0EA5E9]/40',
  },
  teal: {
    iconBg: 'bg-[#D1FAE5]/75',
    iconText: 'text-[#117A57]',
    iconBorder: 'border-[#16966A]/35',
  },
  amber: {
    iconBg: 'bg-[#FEF3C7]',
    iconText: 'text-[#F59E0B]',
    iconBorder: 'border-[#F59E0B]/40',
  },
  rose: {
    iconBg: 'bg-[#FEE2E2]',
    iconText: 'text-[#EF4444]',
    iconBorder: 'border-[#EF4444]/40',
  },
  indigo: {
    iconBg: 'bg-[#E0F2FE]',
    iconText: 'text-[#0EA5E9]',
    iconBorder: 'border-[#0EA5E9]/40',
  },
  slate: {
    iconBg: 'bg-[#F5F7F5]',
    iconText: 'text-[#64748B]',
    iconBorder: 'border-[#E3EAE5]',
  },
};

export const KpiCard: React.FC<{
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  tone?: CardTone;
}> = ({ title, value, delta, deltaLabel, icon, tone = 'navy' }) => {
  const isPositive = (delta ?? 0) >= 0;
  const styles = kpiToneStyles[tone];

  return (
    <div className="bg-white rounded-[22px] border border-[#D5E2DB] ring-1 ring-[#12352B]/[0.04] shadow-[0_8px_24px_-16px_rgba(18,53,43,0.35)] hover:border-[#16966A]/55 card-surface p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_-14px_rgba(18,53,43,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.iconText} ${styles.iconBorder}`}
        >
          {icon}
        </div>
        {typeof delta === 'number' && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-lg border ${
              isPositive
                ? 'bg-emerald-50 text-[#10B981] border-[#10B981]/30'
                : 'bg-red-50 text-[#EF4444] border-[#EF4444]/30'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>

      <div>
        <div className="font-display text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight text-[#1F2937] leading-tight">
          {value}
        </div>
        <div className="mt-1.5 text-[13px] font-bold text-[#1F2937] leading-snug">
          {title}
        </div>
        {deltaLabel && (
          <div className="mt-0.5 text-[11px] font-semibold text-[#64748B] truncate">
            {deltaLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, size = 'lg', children }) => {
  if (!open) return null;
  const maxWidth =
    size === 'md' ? 'max-w-lg' : size === 'xl' ? 'max-w-4xl' : 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12352B]/45 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl border border-[#E3EAE5] shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-[#E3EAE5] bg-[#F5F7F5]">
          <div>
            <h3 className="text-[15px] font-bold text-[#1F2937]">{title}</h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#E3EAE5] bg-white text-[#64748B] hover:text-[#1F2937] hover:bg-[#F5F7F5] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  dir?: 'rtl' | 'ltr';
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, dir = 'rtl', children }) => {
  if (!open) return null;
  const sideClass = dir === 'rtl' ? 'left-0 border-r' : 'right-0 border-l';

  return (
    <div className="fixed inset-0 z-50 bg-[#12352B]/40 backdrop-blur-[2px]" role="dialog" aria-modal="true">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className={`fixed top-0 bottom-0 ${sideClass} border-[#E3EAE5] bg-white w-full max-w-2xl shadow-2xl flex flex-col z-10`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#E3EAE5] bg-[#F5F7F5]">
          <div>
            <h3 className="text-[15px] font-bold text-[#1F2937]">{title}</h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#E3EAE5] bg-white text-[#64748B] hover:text-[#1F2937] hover:bg-[#F5F7F5] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, description, confirmLabel, cancelLabel, danger = true, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title} size="md">
      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl shrink-0 border ${
            danger ? 'bg-red-50 text-[#EF4444] border-[#EF4444]/35' : 'bg-amber-50 text-[#F59E0B] border-[#F59E0B]/35'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-[#1F2937] leading-relaxed pt-1">{description}</p>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold rounded-xl btn-outline"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
            danger ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'btn-primary'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="bg-white border border-[#E3EAE5] card-surface rounded-2xl py-12 px-6 text-center flex flex-col items-center justify-center">
    <div className="h-12 w-12 rounded-xl bg-[#F5F7F5] border border-[#E3EAE5] text-[#12352B] flex items-center justify-center mb-3">
      {icon}
    </div>
    <h4 className="text-sm font-extrabold text-[#1F2937]">{title}</h4>
    {description && <p className="text-xs text-[#64748B] mt-1 max-w-md">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const PaginationBar: React.FC<{
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  showingLabel: string;
  ofLabel: string;
  itemsLabel: string;
  prevLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
}> = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  showingLabel,
  ofLabel,
  itemsLabel,
  prevLabel,
  nextLabel,
  onPageChange,
}) => {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[#E3EAE5] bg-[#F5F7F5] text-xs text-[#64748B]">
      <div className="tabular-nums font-medium">
        {showingLabel} <span className="font-bold text-[#1F2937]">{start}–{end}</span> {ofLabel}{' '}
        <span className="font-bold text-[#1F2937]">{totalItems}</span> {itemsLabel}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg btn-outline text-xs font-bold disabled:opacity-45 disabled:pointer-events-none"
        >
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
          <span>{prevLabel}</span>
        </button>
        <span className="px-3 py-1 rounded-lg bg-white border border-[#E3EAE5] font-bold text-[#1F2937] tabular-nums">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg btn-outline text-xs font-bold disabled:opacity-45 disabled:pointer-events-none"
        >
          <span>{nextLabel}</span>
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 end-5 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#12352B] text-white px-4 py-3 rounded-xl shadow-lg border border-[#16966A]/45 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold">{toast.title}</div>
              {toast.description && (
                <div className="text-xs text-white/75 mt-0.5">{toast.description}</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-white/70 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
