import { Appointment, Conversation, Lead } from '../types/domain';

export type LeadScoreTier = 'high' | 'medium' | 'low';

export type LeadScoreFactorKey =
  | 'classification'
  | 'financial'
  | 'timing'
  | 'visits'
  | 'engagement';

export interface LeadScoreFactor {
  key: LeadScoreFactorKey;
  points: number;
  max: number;
}

export interface LeadScoreResult {
  score: number;
  tier: LeadScoreTier;
  factors: LeadScoreFactor[];
}

export function daysBetweenIso(fromIso: string, toIso: string): number {
  if (!fromIso || !toIso) return 0;
  const fromMs = Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`);
  const toMs = Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return 0;
  return Math.round((toMs - fromMs) / 86_400_000);
}

export function isLeadNeedingFollowup(lead: Lead, todayIso: string): boolean {
  if (['closed_won', 'closed_lost', 'not_interested'].includes(lead.status)) {
    return false;
  }
  if (lead.status === 'follow_up' || lead.status === 'no_show') {
    return true;
  }
  if (lead.next_followup && lead.next_followup <= todayIso) {
    return true;
  }
  if (daysBetweenIso(lead.last_interaction, todayIso) >= 4) {
    return true;
  }
  return false;
}

export function computeLeadScore(
  lead: Lead,
  appointments: Appointment[],
  conversations: Conversation[]
): LeadScoreResult {
  // 1. Priority classification (max 25)
  const classificationMap: Record<Lead['classification'], number> = {
    vip: 25,
    hot: 21,
    warm: 14,
    cold: 6,
  };
  const classificationPts = classificationMap[lead.classification] ?? 10;

  // 2. Financial / mandate readiness (max 20)
  const isOwner = lead.transaction_type === 'sell' || lead.transaction_type === 'rent_out';
  let financialPts = 0;
  if (isOwner) {
    const mandatePts =
      lead.mandate_status === 'exclusive'
        ? 12
        : lead.mandate_status === 'non_exclusive'
          ? 8
          : lead.mandate_status === 'not_signed'
            ? 3
            : 5;
    const conditionPts =
      lead.property_condition === 'new' || lead.property_condition === 'excellent'
        ? 8
        : lead.property_condition === 'good'
          ? 6
          : lead.property_condition === 'needs_renovation'
            ? 4
            : 4;
    financialPts = mandatePts + conditionPts;
  } else {
    const paymentPts = lead.payment_method === 'cash' ? 12 : 7;
    const isRent = lead.transaction_type === 'rent';
    let budgetPts = 2;
    if (isRent) {
      if (lead.budget >= 12000) budgetPts = 8;
      else if (lead.budget >= 6500) budgetPts = 6;
      else if (lead.budget >= 3500) budgetPts = 4;
    } else {
      if (lead.budget >= 2_500_000) budgetPts = 8;
      else if (lead.budget >= 1_200_000) budgetPts = 6;
      else if (lead.budget >= 600_000) budgetPts = 4;
    }
    financialPts = paymentPts + budgetPts;
  }

  // 3. Urgency & timeline readiness (max 15)
  let timingPts = 7;
  if (lead.transaction_type === 'sale') {
    timingPts =
      lead.purchase_timing === 'immediate'
        ? 15
        : lead.purchase_timing === 'within_3_months'
          ? 11
          : lead.purchase_timing === 'within_6_months'
            ? 7
            : lead.purchase_timing === 'flexible'
              ? 4
              : 8;
  } else if (lead.transaction_type === 'rent') {
    const durationPts =
      lead.rental_duration === 'long_term' ? 8 : lead.rental_duration === 'short_term' ? 5 : 4;
    const moveInPts = lead.move_in_date ? 7 : 3;
    timingPts = durationPts + moveInPts;
  } else {
    const availPts = lead.viewing_availability?.trim() ? 8 : 3;
    const addrPts = lead.property_address?.trim() ? 7 : 3;
    timingPts = availPts + addrPts;
  }

  // 4. Visits & stage momentum (max 20)
  const leadApts = appointments.filter((a) => a.lead_id === lead.id);
  const attendedCount = leadApts.filter((a) => a.status === 'attended').length;
  const activeAptCount = leadApts.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'rescheduled'
  ).length;
  const noShowCount = leadApts.filter((a) => a.status === 'no_show').length;

  let visitsPts = 6;
  if (attendedCount > 0) {
    visitsPts = Math.min(20, 16 + (attendedCount - 1) * 2);
  } else if (activeAptCount > 0) {
    visitsPts = 14;
  } else if (
    lead.status === 'visited' ||
    lead.status === 'follow_up' ||
    lead.status === 'closed_won'
  ) {
    visitsPts = 16;
  } else if (lead.status === 'visit_scheduled') {
    visitsPts = 13;
  } else if (noShowCount > 0 || lead.status === 'no_show') {
    visitsPts = 2;
  }

  // 5. Communication & dossier completeness (max 20)
  const messageCount = conversations
    .filter((c) => c.lead_id === lead.id)
    .reduce((sum, c) => sum + c.messages.length, 0);
  const msgPts = messageCount >= 3 ? 10 : messageCount >= 1 ? 6 : 2;
  const notesPts = lead.notes.length >= 2 ? 4 : lead.notes.length === 1 ? 2 : 0;
  const profilePts =
    (lead.interested_property_id ? 3 : 0) +
    (lead.district?.trim() ? 2 : 0) +
    (lead.email?.trim() ? 1 : 0);
  const engagementPts = Math.min(20, msgPts + notesPts + profilePts);

  let rawScore = classificationPts + financialPts + timingPts + visitsPts + engagementPts;
  if (lead.status === 'closed_won') {
    rawScore = Math.max(rawScore, 94);
  } else if (lead.status === 'closed_lost' || lead.status === 'not_interested') {
    rawScore = Math.min(rawScore, 28);
  } else if (lead.status === 'no_show') {
    rawScore = Math.max(10, rawScore - 10);
  }

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const tier: LeadScoreTier = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';

  return {
    score,
    tier,
    factors: [
      { key: 'classification', points: classificationPts, max: 25 },
      { key: 'financial', points: financialPts, max: 20 },
      { key: 'timing', points: timingPts, max: 15 },
      { key: 'visits', points: visitsPts, max: 20 },
      { key: 'engagement', points: engagementPts, max: 20 },
    ],
  };
}
