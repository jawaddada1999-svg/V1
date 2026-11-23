export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  // Convert Moroccan local format (e.g. 0661... or 0522...) to international 212...
  if (digits.startsWith('0') && digits.length === 10) {
    return `212${digits.slice(1)}`;
  }
  return digits;
}

export function buildTelHref(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return '#';
  const digits = normalizePhoneDigits(trimmed);
  if (!digits) return '#';
  return `tel:+${digits}`;
}

export function buildWhatsAppHref(phone: string, message?: string): string {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return '#';
  const base = `https://wa.me/${digits}`;
  if (message && message.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}
