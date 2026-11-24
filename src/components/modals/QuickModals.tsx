import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  KeyRound,
  MapPin,
  Tag,
  Trash2,
  Upload,
  User,
  UserCheck,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { MOROCCAN_CITIES, PRESET_PROPERTY_IMAGES } from '../../data/demoData';
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  ContactMethod,
  DeliveryStatus,
  Lead,
  LeadClassification,
  LeadSource,
  LeadStatus,
  OwnerType,
  PaymentMethod,
  Property,
  PropertyOwner,
  PropertyStatus,
  PropertyTransactionType,
  PropertyType,
  TransactionType,
} from '../../types/domain';
import { getTodayIso } from '../../utils/dateUtils';
import { formatMAD } from '../../i18n/translations';
import {
  localizeCity,
  localizePersonName,
  localizePropertyTitle,
} from '../../i18n/localizeData';
import { Modal } from '../ui/DataPrimitives';
import {
  generateDayWorkingHours,
  getDayKeyFromIsoDate,
  getSlotAvailability,
} from '../../utils/scheduleUtils';

const INPUT_CLASS =
  'w-full h-10 px-3 text-[13px] font-medium text-[#1F2937] bg-white border border-[#E3EAE5] rounded-xl focus:outline-none focus:border-[#16966A] transition-colors';
const SELECT_CLASS =
  'w-full h-10 px-3 text-[13px] font-semibold text-[#1F2937] bg-white border border-[#E3EAE5] rounded-xl focus:outline-none focus:border-[#16966A] transition-colors cursor-pointer';
const LABEL_CLASS = 'block text-xs font-bold text-[#1F2937] mb-1.5';

const INTENT_OPTIONS: {
  id: TransactionType;
  icon: React.ReactNode;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}[] = [
  {
    id: 'sale',
    icon: <Home className="h-4 w-4" />,
    accentBg: 'bg-sky-50',
    accentBorder: 'border-sky-500 ring-2 ring-sky-500/15',
    accentText: 'text-sky-800',
  },
  {
    id: 'rent',
    icon: <KeyRound className="h-4 w-4" />,
    accentBg: 'bg-amber-50',
    accentBorder: 'border-[#F59E0B] ring-2 ring-[#F59E0B]/15',
    accentText: 'text-amber-800',
  },
  {
    id: 'sell',
    icon: <Tag className="h-4 w-4" />,
    accentBg: 'bg-[#ECFDF5]',
    accentBorder: 'border-[#16966A] ring-2 ring-[#16966A]/15',
    accentText: 'text-[#16966A]',
  },
  {
    id: 'rent_out',
    icon: <Building2 className="h-4 w-4" />,
    accentBg: 'bg-[#F5F7F5]',
    accentBorder: 'border-[#12352B] ring-2 ring-[#12352B]/15',
    accentText: 'text-[#12352B]',
  },
];

export const LeadFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  editingLead?: Lead | null;
}> = ({ open, onClose, editingLead }) => {
  const { t, language, employees, properties, addLead, updateLead, pushToast } = useAgency();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+212 6');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('facebook_ads');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [bedrooms, setBedrooms] = useState('3');
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('ready');
  const [desiredArea, setDesiredArea] = useState('140');
  const [classification, setClassification] = useState<LeadClassification>('warm');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [transactionType, setTransactionType] = useState<TransactionType>('sale');
  const [budget, setBudget] = useState('2500000');
  const [city, setCity] = useState('الدار البيضاء');
  const [district, setDistrict] = useState('');
  const [interestedPropertyId, setInterestedPropertyId] = useState<string>('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>(employees[0]?.id ?? '');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [preferences, setPreferences] = useState('');
  const [propertyCondition, setPropertyCondition] =
    useState<NonNullable<Lead['property_condition']>>('good');
  const [mandateStatus, setMandateStatus] =
    useState<NonNullable<Lead['mandate_status']>>('not_signed');
  const [viewingAvailability, setViewingAvailability] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [rentalDuration, setRentalDuration] =
    useState<NonNullable<Lead['rental_duration']>>('long_term');
  const [furnished, setFurnished] = useState<NonNullable<Lead['furnished']>>('unfurnished');
  const [moveInDate, setMoveInDate] = useState('');
  const [purchaseTiming, setPurchaseTiming] =
    useState<NonNullable<Lead['purchase_timing']>>('within_3_months');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initKeyRef = useRef<string>('');

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      return;
    }
    const nextKey = editingLead ? `edit:${editingLead.id}` : 'new';
    if (initKeyRef.current === nextKey) return;
    initKeyRef.current = nextKey;
    setErrors({});

    if (editingLead) {
      setName(editingLead.name);
      setPhone(editingLead.phone);
      setEmail(editingLead.email);
      setSource(editingLead.source);
      setContactMethod(editingLead.contact_method);
      setPaymentMethod(editingLead.payment_method);
      setBedrooms(String(editingLead.bedrooms));
      setDeliveryStatus(editingLead.delivery_status);
      setDesiredArea(String(editingLead.desired_area));
      setClassification(editingLead.classification);
      setPropertyType(editingLead.property_type);
      setTransactionType(editingLead.transaction_type);
      setBudget(String(editingLead.budget));
      setCity(editingLead.city);
      setDistrict(editingLead.district);
      setInterestedPropertyId(editingLead.interested_property_id ?? '');
      setAssignedEmployeeId(editingLead.assigned_employee_id);
      setStatus(editingLead.status);
      setPreferences(editingLead.preferences);
      setPropertyCondition(editingLead.property_condition || 'good');
      setMandateStatus(editingLead.mandate_status || 'not_signed');
      setViewingAvailability(editingLead.viewing_availability ?? '');
      setPropertyAddress(editingLead.property_address ?? '');
      setRentalDuration(editingLead.rental_duration || 'long_term');
      setFurnished(editingLead.furnished || 'unfurnished');
      setMoveInDate(editingLead.move_in_date ?? '');
      setPurchaseTiming(editingLead.purchase_timing || 'within_3_months');
    } else {
      setName('');
      setPhone('+212 6');
      setEmail('');
      setSource('facebook_ads');
      setContactMethod('whatsapp');
      setPaymentMethod('cash');
      setBedrooms('3');
      setDeliveryStatus('ready');
      setDesiredArea('140');
      setClassification('warm');
      setPropertyType('apartment');
      setTransactionType('sale');
      setBudget('2500000');
      setCity('الدار البيضاء');
      setDistrict('');
      setInterestedPropertyId('');
      setAssignedEmployeeId(employees[1]?.id ?? employees[0]?.id ?? '');
      setStatus('new');
      setPreferences('');
      setPropertyCondition('good');
      setMandateStatus('not_signed');
      setViewingAvailability('');
      setPropertyAddress('');
      setRentalDuration('long_term');
      setFurnished('unfurnished');
      setMoveInDate('');
      setPurchaseTiming('within_3_months');
    }
  }, [editingLead, open, employees]);

  const isOwnerIntent = transactionType === 'sell' || transactionType === 'rent_out';
  const isRentIntent = transactionType === 'rent' || transactionType === 'rent_out';
  const isBuyerIntent = transactionType === 'sale';

  const handleIntentChange = (nextIntent: TransactionType) => {
    setTransactionType(nextIntent);
    if (!editingLead) {
      if (nextIntent === 'rent' || nextIntent === 'rent_out') {
        if (budget === '2500000' || budget === '3000000') setBudget('15000');
      } else if (budget === '15000') {
        setBudget('2500000');
      }
    }
    setInterestedPropertyId('');
  };

  const getIntentMeta = (id: TransactionType) => {
    if (id === 'sale') return { title: t.leads.form.intentBuy, desc: t.leads.form.intentBuyDesc };
    if (id === 'rent') return { title: t.leads.form.intentRent, desc: t.leads.form.intentRentDesc };
    if (id === 'sell') return { title: t.leads.form.intentSell, desc: t.leads.form.intentSellDesc };
    return { title: t.leads.form.intentRentOut, desc: t.leads.form.intentRentOutDesc };
  };

  const budgetLabel =
    transactionType === 'sell'
      ? t.leads.form.askingSalePrice
      : transactionType === 'rent_out'
        ? t.leads.form.askingRentPrice
        : transactionType === 'rent'
          ? language === 'ar'
            ? 'ميزانية الكراء الشهرية (د.م)'
            : language === 'fr'
              ? 'Budget loyer mensuel (MAD)'
              : 'Monthly Rent Budget (MAD)'
          : t.leads.form.budget;

  const filteredMatchingProperties = properties.filter((p) => {
    if (transactionType === 'sale') return p.transaction_type === 'sale';
    if (transactionType === 'rent') return p.transaction_type === 'rent';
    return true;
  });

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = t.leads.form.validationRequired;
    const digitsOnly = phone.replace(/[^\d]/g, '');
    if (!phone.trim() || digitsOnly.length < 8) {
      nextErrors.phone = t.leads.form.validationPhone;
    }
    if (!budget || Number(budget) <= 0) {
      nextErrors.budget = t.leads.form.validationBudget;
    }
    if (!city.trim()) {
      nextErrors.city = t.leads.form.validationRequired;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      pushToast({ type: 'warning', title: t.app.requiredField });
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      source,
      contact_method: contactMethod,
      payment_method: isBuyerIntent ? paymentMethod : 'cash',
      bedrooms: Number(bedrooms) || 0,
      delivery_status: isBuyerIntent ? deliveryStatus : 'ready',
      desired_area: Number(desiredArea) || 0,
      classification,
      property_type: propertyType,
      transaction_type: transactionType,
      budget: Number(budget) || 0,
      city: city.trim() || 'الدار البيضاء',
      district: district.trim(),
      interested_property_id: isOwnerIntent ? null : interestedPropertyId || null,
      assigned_employee_id: assignedEmployeeId,
      next_followup: editingLead?.next_followup ?? null,
      status,
      preferences: preferences.trim(),
      property_condition: isOwnerIntent ? propertyCondition : '',
      mandate_status: isOwnerIntent ? mandateStatus : '',
      viewing_availability: isOwnerIntent ? viewingAvailability.trim() : '',
      property_address: isOwnerIntent ? propertyAddress.trim() : '',
      rental_duration: isRentIntent ? rentalDuration : '',
      furnished: isRentIntent ? furnished : '',
      move_in_date: transactionType === 'rent' ? moveInDate : '',
      purchase_timing: isBuyerIntent ? purchaseTiming : '',
    };

    if (editingLead) {
      updateLead(editingLead.id, payload);
    } else {
      addLead(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingLead ? t.leads.editLead : t.leads.addLead}
      size="xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Section 0: Adaptive 4-Intent Selector */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#1F2937]">
            <UserCheck className="h-4 w-4 text-[#16966A]" />
            <span>{t.leads.form.intentTitle}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {INTENT_OPTIONS.map((opt) => {
              const selected = transactionType === opt.id;
              const meta = getIntentMeta(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleIntentChange(opt.id)}
                  className={`text-start rounded-xl border p-3 transition-all flex flex-col gap-1.5 ${
                    selected
                      ? `${opt.accentBg} ${opt.accentBorder} shadow-xs`
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                        selected ? `${opt.accentText} bg-white shadow-2xs` : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.icon}
                    </span>
                    {selected && <CheckCircle2 className={`h-4 w-4 ${opt.accentText}`} />}
                  </div>
                  <div
                    className={`text-xs font-extrabold leading-snug ${
                      selected ? opt.accentText : 'text-slate-900'
                    }`}
                  >
                    {meta.title}
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 leading-relaxed">
                    {meta.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Personal & Contact Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-extrabold text-[#1F2937]">
            <User className="h-4 w-4 text-[#16966A]" />
            <span>{t.leads.form.sectionClientInfo}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={LABEL_CLASS}>
                {t.leads.form.name} <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder={
                  language === 'ar'
                    ? 'الاسم والنسب الكامل'
                    : language === 'fr'
                      ? 'Nom et prénom complets'
                      : 'Full name'
                }
                className={`${INPUT_CLASS} ${errors.name ? 'border-rose-500 bg-rose-50/40' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS}>
                {t.leads.form.phone} <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                className={`${INPUT_CLASS} font-mono-num ${
                  errors.phone ? 'border-rose-500 bg-rose-50/40' : ''
                }`}
              />
              {errors.phone && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS}>{t.leads.form.email}</label>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>{t.leads.form.source}</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className={SELECT_CLASS}
              >
                {(Object.keys(t.leadSources) as LeadSource[]).map((s) => (
                  <option key={s} value={s}>
                    {t.leadSources[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>{t.leads.form.classification}</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as LeadClassification)}
                className={SELECT_CLASS}
              >
                {(Object.keys(t.leadClassifications) as LeadClassification[]).map((cl) => (
                  <option key={cl} value={cl}>
                    {t.leadClassifications[cl]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Intent-Specific Property Specs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-extrabold text-[#1F2937]">
            <Building2 className="h-4 w-4 text-[#16966A]" />
            <span>
              {isOwnerIntent
                ? t.leads.form.sectionOfferedProperty
                : t.leads.form.sectionRequestSpecs}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Common property type, bedrooms, area, price/budget, city, district */}
            <div>
              <label className={LABEL_CLASS}>{t.leads.form.propertyType}</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className={SELECT_CLASS}
              >
                {(Object.keys(t.propertyTypes) as PropertyType[]).map((pt) => (
                  <option key={pt} value={pt}>
                    {t.propertyTypes[pt]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>
                {budgetLabel} <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  if (errors.budget) setErrors((prev) => ({ ...prev, budget: '' }));
                }}
                className={`${INPUT_CLASS} font-mono-num ${
                  errors.budget ? 'border-rose-500 bg-rose-50/40' : ''
                }`}
              />
              {errors.budget && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.budget}
                </p>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS}>
                {isOwnerIntent ? t.leads.form.offeredArea : t.leads.form.desiredArea}
              </label>
              <input
                type="number"
                min={0}
                value={desiredArea}
                onChange={(e) => setDesiredArea(e.target.value)}
                className={`${INPUT_CLASS} font-mono-num`}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>
                {isOwnerIntent ? t.leads.form.offeredBedrooms : t.leads.form.bedrooms}
              </label>
              <input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={`${INPUT_CLASS} font-mono-num`}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>
                {t.leads.form.city} <span className="text-rose-600">*</span>
              </label>
              <select
                value={MOROCCAN_CITIES.includes(city) ? city : MOROCCAN_CITIES[0]}
                onChange={(e) => setCity(e.target.value)}
                className={SELECT_CLASS}
              >
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {localizeCity(c, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>{t.leads.form.district}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'مثال: حي الرياض، أنفا، أكدال...'
                    : language === 'fr'
                      ? 'Ex. Hay Riad, Anfa, Agdal...'
                      : 'e.g. Hay Riad, Anfa, Agdal...'
                }
                className={INPUT_CLASS}
              />
            </div>

            {/* Category 3 specific: Buyer looking to buy ('sale') */}
            {transactionType === 'sale' && (
              <>
                <div>
                  <label className={LABEL_CLASS}>{t.leads.form.paymentMethod}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className={SELECT_CLASS}
                  >
                    {(Object.keys(t.paymentMethods) as PaymentMethod[]).map((pm) => (
                      <option key={pm} value={pm}>
                        {t.paymentMethods[pm]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>{t.leads.form.deliveryStatus}</label>
                  <select
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                    className={SELECT_CLASS}
                  >
                    {(Object.keys(t.deliveryStatuses) as DeliveryStatus[]).map((ds) => (
                      <option key={ds} value={ds}>
                        {t.deliveryStatuses[ds]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>
                    {language === 'ar'
                      ? 'توقيت الشراء المتوقع'
                      : language === 'fr'
                        ? 'Délai d’achat'
                        : 'Purchase Timeline'}
                  </label>
                  <select
                    value={purchaseTiming}
                    onChange={(e) =>
                      setPurchaseTiming(e.target.value as NonNullable<Lead['purchase_timing']>)
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="immediate">
                      {language === 'ar' ? 'فوري' : language === 'fr' ? 'Immédiat' : 'Immediately'}
                    </option>
                    <option value="within_3_months">
                      {language === 'ar'
                        ? 'خلال 3 أشهر'
                        : language === 'fr'
                          ? 'Sous 3 mois'
                          : 'Within 3 months'}
                    </option>
                    <option value="within_6_months">
                      {language === 'ar'
                        ? 'خلال 6 أشهر'
                        : language === 'fr'
                          ? 'Sous 6 mois'
                          : 'Within 6 months'}
                    </option>
                    <option value="flexible">
                      {language === 'ar' ? 'مرن' : language === 'fr' ? 'Flexible' : 'Flexible'}
                    </option>
                  </select>
                </div>
              </>
            )}

            {/* Category 4 & Category 2 shared rental fields ('rent' & 'rent_out') */}
            {isRentIntent && (
              <>
                <div>
                  <label className={LABEL_CLASS}>
                    {language === 'ar'
                      ? 'مدة الكراء'
                      : language === 'fr'
                        ? 'Durée de location'
                        : 'Rental Duration'}
                  </label>
                  <select
                    value={rentalDuration}
                    onChange={(e) =>
                      setRentalDuration(e.target.value as NonNullable<Lead['rental_duration']>)
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="long_term">
                      {language === 'ar'
                        ? 'طويل المدى (سنوي)'
                        : language === 'fr'
                          ? 'Longue durée'
                          : 'Long term'}
                    </option>
                    <option value="short_term">
                      {language === 'ar'
                        ? 'قصير المدى'
                        : language === 'fr'
                          ? 'Courte durée'
                          : 'Short term'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>
                    {language === 'ar'
                      ? 'حالة التأثيث'
                      : language === 'fr'
                        ? 'Ameublement'
                        : 'Furnishing'}
                  </label>
                  <select
                    value={furnished}
                    onChange={(e) =>
                      setFurnished(e.target.value as NonNullable<Lead['furnished']>)
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="furnished">
                      {language === 'ar' ? 'مفروش' : language === 'fr' ? 'Meublé' : 'Furnished'}
                    </option>
                    <option value="unfurnished">
                      {language === 'ar'
                        ? 'غير مفروش'
                        : language === 'fr'
                          ? 'Non meublé'
                          : 'Unfurnished'}
                    </option>
                  </select>
                </div>
              </>
            )}

            {/* Renter only: Move-in Date */}
            {transactionType === 'rent' && (
              <div>
                <label className={LABEL_CLASS}>
                  {language === 'ar'
                    ? 'تاريخ الدخول المرغوب'
                    : language === 'fr'
                      ? 'Date d’entrée souhaitée'
                      : 'Preferred Move-in Date'}
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className={`${INPUT_CLASS} font-mono-num`}
                />
              </div>
            )}

            {/* Owner intents ('sell' & 'rent_out'): Property Condition, Mandate, Address, Viewing availability */}
            {isOwnerIntent && (
              <>
                <div>
                  <label className={LABEL_CLASS}>
                    {language === 'ar'
                      ? 'حالة العقار'
                      : language === 'fr'
                        ? 'État du bien'
                        : 'Property Condition'}
                  </label>
                  <select
                    value={propertyCondition}
                    onChange={(e) =>
                      setPropertyCondition(
                        e.target.value as NonNullable<Lead['property_condition']>
                      )
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="new">
                      {language === 'ar' ? 'جديد' : language === 'fr' ? 'Neuf' : 'New'}
                    </option>
                    <option value="excellent">
                      {language === 'ar'
                        ? 'ممتاز'
                        : language === 'fr'
                          ? 'Excellent'
                          : 'Excellent'}
                    </option>
                    <option value="good">
                      {language === 'ar' ? 'جيد' : language === 'fr' ? 'Bon' : 'Good'}
                    </option>
                    <option value="needs_renovation">
                      {language === 'ar'
                        ? 'يحتاج إصلاح'
                        : language === 'fr'
                          ? 'À rénover'
                          : 'Needs renovation'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>
                    {language === 'ar'
                      ? 'حالة التفويض العقاري'
                      : language === 'fr'
                        ? 'Statut du mandat'
                        : 'Listing Mandate'}
                  </label>
                  <select
                    value={mandateStatus}
                    onChange={(e) =>
                      setMandateStatus(e.target.value as NonNullable<Lead['mandate_status']>)
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="not_signed">
                      {language === 'ar'
                        ? 'غير موقع بعد'
                        : language === 'fr'
                          ? 'Non signé'
                          : 'Not signed'}
                    </option>
                    <option value="exclusive">
                      {language === 'ar' ? 'تفويض حصري' : language === 'fr' ? 'Exclusif' : 'Exclusive'}
                    </option>
                    <option value="non_exclusive">
                      {language === 'ar'
                        ? 'تفويض غير حصري'
                        : language === 'fr'
                          ? 'Non exclusif'
                          : 'Non-exclusive'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>
                    {language === 'ar'
                      ? 'أوقات المعاينة المتاحة'
                      : language === 'fr'
                        ? 'Disponibilités de visite'
                        : 'Viewing Availability'}
                  </label>
                  <input
                    type="text"
                    value={viewingAvailability}
                    onChange={(e) => setViewingAvailability(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'مثال: يومياً بعد الساعة 16:00'
                        : language === 'fr'
                          ? 'Ex. En semaine après 16h00'
                          : 'e.g. Weekdays after 4:00 PM'
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className={LABEL_CLASS}>
                    {language === 'ar'
                      ? 'العنوان التفصيلي للعقار المعروض'
                      : language === 'fr'
                        ? 'Adresse complète du bien'
                        : 'Full Property Address'}
                  </label>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'الشارع، الإقامة، رقم الطابق أو العلامة المرجعية'
                        : language === 'fr'
                          ? 'Rue, résidence, étage ou point de repère...'
                          : 'Street, residence, floor, or landmark...'
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </>
            )}

            {/* Interested Property only for buyer/renter clients */}
            {!isOwnerIntent && (
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={LABEL_CLASS}>{t.leads.form.interestedProperty}</label>
                <select
                  value={interestedPropertyId}
                  onChange={(e) => setInterestedPropertyId(e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">{t.leads.form.selectProperty}</option>
                  {filteredMatchingProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.ref} · {localizePropertyTitle(p.title, language)} ({localizeCity(p.city, language)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Assignment & Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-extrabold text-[#1F2937]">
            <MapPin className="h-4 w-4 text-[#16966A]" />
            <span>{t.leads.form.sectionFollowup}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>{t.leads.form.assignedEmployee}</label>
              <select
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className={SELECT_CLASS}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {localizePersonName(emp.name, language)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>{t.leads.form.status}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className={SELECT_CLASS}
              >
                {(Object.keys(t.leadStatuses) as LeadStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {t.leadStatuses[st]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>
              {isOwnerIntent
                ? language === 'ar'
                  ? 'تفاصيل العقار وملاحظات المالك'
                  : language === 'fr'
                    ? 'Détails du bien et notes du propriétaire'
                    : 'Property details & owner notes'
                : t.leads.form.preferences}
            </label>
            <textarea
              rows={3}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder={
                isOwnerIntent
                  ? language === 'ar'
                    ? 'سجل حالة الوثائق، الشروط الخاصة بالمالك، وتجهيزات العقار...'
                    : language === 'fr'
                      ? 'Situation juridique, conditions du propriétaire, prestations...'
                      : 'Title deed status, owner terms, key amenities...'
                  : language === 'ar'
                    ? 'سجل متطلبات العميل الخاصة، القرب من المدارس، الطابق المفضل...'
                    : language === 'fr'
                      ? 'Critères spécifiques, proximité écoles/transports, étage souhaité...'
                      : 'Specific client requirements, preferred floor, proximity...'
              }
              className="w-full p-3 text-[13px] font-medium text-[#1F2937] bg-white border border-[#E3EAE5] rounded-xl focus:outline-none focus:border-[#16966A]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE9EF]">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline h-10 px-5 text-xs font-bold rounded-xl"
          >
            {t.app.cancel}
          </button>
          <button type="submit" className="btn-primary h-10 px-6 text-xs font-bold rounded-xl">
            {t.app.save}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const PropertyFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  editingProperty?: Property | null;
}> = ({ open, onClose, editingProperty }) => {
  const { t, language, employees, owners, addProperty, updateProperty, pushToast } = useAgency();

  const [title, setTitle] = useState('');
  const [ref, setRef] = useState('');
  const [type, setType] = useState<PropertyType>('apartment');
  const [transactionType, setTransactionType] = useState<PropertyTransactionType>('sale');
  const [price, setPrice] = useState('2200000');
  const [city, setCity] = useState('الدار البيضاء');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('140');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [status, setStatus] = useState<PropertyStatus>('available');
  const [ownerId, setOwnerId] = useState<string>('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+212 6');
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [ownerCountBeforeModal, setOwnerCountBeforeModal] = useState(0);
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(employees[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([PRESET_PROPERTY_IMAGES[1]]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initKeyRef = useRef<string>('');

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      return;
    }
    const nextKey = editingProperty ? `edit:${editingProperty.id}` : 'new';
    if (initKeyRef.current === nextKey) return;
    initKeyRef.current = nextKey;
    setErrors({});

    if (editingProperty) {
      setTitle(editingProperty.title);
      setRef(editingProperty.ref);
      setType(editingProperty.type);
      setTransactionType(editingProperty.transaction_type);
      setPrice(String(editingProperty.price));
      setCity(editingProperty.city);
      setDistrict(editingProperty.district);
      setAddress(editingProperty.address);
      setArea(String(editingProperty.area));
      setBedrooms(String(editingProperty.bedrooms));
      setBathrooms(String(editingProperty.bathrooms));
      setStatus(editingProperty.status);
      setOwnerId(editingProperty.owner_id ?? '');
      setOwnerName(editingProperty.owner_name);
      setOwnerPhone(editingProperty.owner_phone);
      setAssignedEmployeeId(editingProperty.assigned_employee_id);
      setDescription(editingProperty.description);
      setImages(
        editingProperty.images.length ? editingProperty.images : [PRESET_PROPERTY_IMAGES[1]]
      );
    } else {
      setTitle('');
      setRef(`ATL-${Math.floor(100 + Math.random() * 899)}`);
      setType('apartment');
      setTransactionType('sale');
      setPrice('2200000');
      setCity('الدار البيضاء');
      setDistrict('');
      setAddress('');
      setArea('140');
      setBedrooms('3');
      setBathrooms('2');
      setStatus('available');
      const firstOwner = owners[0];
      setOwnerId(firstOwner?.id ?? '');
      setOwnerName(firstOwner?.name ?? '');
      setOwnerPhone(firstOwner?.phone ?? '+212 6');
      setAssignedEmployeeId(employees[1]?.id ?? employees[0]?.id ?? '');
      setDescription('');
      setImages([PRESET_PROPERTY_IMAGES[1]]);
    }
  }, [editingProperty, open, employees, owners]);

  useEffect(() => {
    // addOwner prepends the new owner at index 0
    if (ownerModalOpen && owners.length > ownerCountBeforeModal && owners[0]) {
      handleOwnerSelect(owners[0].id);
      setOwnerModalOpen(false);
    }
  }, [owners, ownerModalOpen, ownerCountBeforeModal]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImages((prev) => [reader.result as string, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePreset = (img: string) => {
    setImages((prev) =>
      prev.includes(img)
        ? prev.length > 1
          ? prev.filter((i) => i !== img)
          : prev
        : [...prev, img]
    );
  };

  const removeImage = (imgToRemove: string) => {
    setImages((prev) => (prev.length > 1 ? prev.filter((i) => i !== imgToRemove) : prev));
  };

  const handleOwnerSelect = (selectedId: string) => {
    setOwnerId(selectedId);
    if (errors.ownerId) setErrors((prev) => ({ ...prev, ownerId: '' }));
    const matched = owners.find((o) => o.id === selectedId);
    if (matched) {
      setOwnerName(matched.name);
      setOwnerPhone(matched.phone);
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = t.leads.form.validationRequired;
    if (!ref.trim()) nextErrors.ref = t.leads.form.validationRequired;
    if (!ownerId) nextErrors.ownerId = t.leads.form.validationRequired;
    if (!price || Number(price) <= 0) nextErrors.price = t.leads.form.validationBudget;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      pushToast({ type: 'warning', title: t.app.requiredField });
      return;
    }

    const payload = {
      title: title.trim(),
      ref: ref.trim(),
      type,
      transaction_type: transactionType,
      price: Number(price) || 0,
      city: city.trim(),
      district: district.trim(),
      address: address.trim(),
      area: Number(area) || 0,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      status,
      owner_id: ownerId || undefined,
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      assigned_employee_id: assignedEmployeeId,
      description: description.trim(),
      images,
    };

    if (editingProperty) {
      updateProperty(editingProperty.id, payload);
    } else {
      addProperty(payload);
    }
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editingProperty ? t.properties.editProperty : t.properties.addProperty}
        size="xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Section 1: Core Listing Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-extrabold text-[#1F2937]">
              <Building2 className="h-4 w-4 text-[#16966A]" />
              <span>
                {language === 'ar'
                  ? 'المعلومات الأساسية للعقار'
                  : language === 'fr'
                    ? 'Informations générales du bien'
                    : 'Core Property Information'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>
                  {t.properties.form.title} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder={
                    language === 'ar'
                      ? 'مثال: شقة حديثة بإطلالة بحرية — أنفا'
                      : language === 'fr'
                        ? 'Ex. Appartement moderne vue océan — Anfa'
                        : 'e.g. Modern Ocean-View Apartment — Anfa'
                  }
                  className={`${INPUT_CLASS} ${errors.title ? 'border-rose-500 bg-rose-50/40' : ''}`}
                />
                {errors.title && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_CLASS}>
                  {t.properties.form.ref} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={ref}
                  onChange={(e) => {
                    setRef(e.target.value);
                    if (errors.ref) setErrors((prev) => ({ ...prev, ref: '' }));
                  }}
                  className={`${INPUT_CLASS} font-mono-num ${
                    errors.ref ? 'border-rose-500 bg-rose-50/40' : ''
                  }`}
                />
                {errors.ref && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.ref}
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.type}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className={SELECT_CLASS}
                >
                  {(Object.keys(t.propertyTypes) as PropertyType[]).map((pt) => (
                    <option key={pt} value={pt}>
                      {t.propertyTypes[pt]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.transactionType}</label>
                <select
                  value={transactionType}
                  onChange={(e) => {
                    const nextTx = e.target.value as PropertyTransactionType;
                    setTransactionType(nextTx);
                    if (!editingProperty) {
                      if (nextTx === 'rent' && price === '2200000') setPrice('16000');
                      if (nextTx === 'sale' && price === '16000') setPrice('2200000');
                    }
                  }}
                  className={SELECT_CLASS}
                >
                  <option value="sale">{t.transactionTypes.sale}</option>
                  <option value="rent">{t.transactionTypes.rent}</option>
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>
                  {transactionType === 'rent'
                    ? language === 'ar'
                      ? 'السومة الشهرية (د.م)'
                      : language === 'fr'
                        ? 'Loyer mensuel (MAD)'
                        : 'Monthly Rent (MAD)'
                    : t.properties.form.price}{' '}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                  className={`${INPUT_CLASS} font-mono-num ${
                    errors.price ? 'border-rose-500 bg-rose-50/40' : ''
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.price}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Location & Physical Specs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-extrabold text-[#1F2937]">
              <MapPin className="h-4 w-4 text-[#16966A]" />
              <span>
                {language === 'ar'
                  ? 'الموقع والمواصفات التقنية'
                  : language === 'fr'
                    ? 'Localisation et caractéristiques'
                    : 'Location & Specifications'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={LABEL_CLASS}>{t.properties.form.city}</label>
                <select
                  value={MOROCCAN_CITIES.includes(city) ? city : MOROCCAN_CITIES[0]}
                  onChange={(e) => setCity(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {localizeCity(c, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.district}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مثال: حي الرياض، المعاريف'
                      : language === 'fr'
                        ? 'Ex. Hay Riad, Maârif'
                        : 'e.g. Hay Riad, Maarif'
                  }
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.status}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                  className={SELECT_CLASS}
                >
                  {(Object.keys(t.propertyStatuses) as PropertyStatus[]).map((ps) => (
                    <option key={ps} value={ps}>
                      {t.propertyStatuses[ps]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.area}</label>
                <input
                  type="number"
                  min={0}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`${INPUT_CLASS} font-mono-num`}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.bedrooms}</label>
                <input
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className={`${INPUT_CLASS} font-mono-num`}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.bathrooms}</label>
                <input
                  type="number"
                  min={0}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className={`${INPUT_CLASS} font-mono-num`}
                />
              </div>

              <div className="sm:col-span-3">
                <label className={LABEL_CLASS}>{t.properties.form.address}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'الشارع، اسم الإقامة، الطابق والموقع الدقيق'
                      : language === 'fr'
                        ? 'Rue, nom de résidence, étage et adresse exacte'
                        : 'Street, building name, floor, and exact address'
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Owner & Assigned Advisor */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 text-xs font-extrabold text-slate-900">
              <User className="h-4 w-4 text-emerald-700" />
              <span>
                {language === 'ar'
                  ? 'بيانات المالك والمستشار المكلف'
                  : language === 'fr'
                    ? 'Propriétaire et conseiller assigné'
                    : 'Property Owner & Advisor'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>
                  {t.properties.form.ownerSelect} <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={ownerId}
                    onChange={(e) => handleOwnerSelect(e.target.value)}
                    className={`${SELECT_CLASS} flex-1 ${
                      errors.ownerId ? 'border-rose-500 bg-rose-50/40' : ''
                    }`}
                  >
                    <option value="">{t.properties.form.ownerSelect}</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {localizePersonName(o.name, language)} · {o.phone}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerCountBeforeModal(owners.length);
                      setOwnerModalOpen(true);
                    }}
                    className="h-10 px-4 rounded-xl text-xs font-bold btn-outline whitespace-nowrap"
                  >
                    + {t.owners.addOwner}
                  </button>
                </div>
                {errors.ownerId && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {errors.ownerId}
                  </p>
                )}
                {ownerId && (
                  <p className="mt-1.5 text-xs font-semibold text-zinc-700">
                    {localizePersonName(ownerName, language)} · <span dir="ltr" className="font-mono-num">{ownerPhone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_CLASS}>{t.properties.form.assignedEmployee}</label>
                <select
                  value={assignedEmployeeId}
                  onChange={(e) => setAssignedEmployeeId(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {localizePersonName(emp.name, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Description & Images */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <div>
              <label className={LABEL_CLASS}>{t.properties.form.description}</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اكتب وصفاً واضحاً لمميزات العقار، التوجيه، التجهيزات والقرب من المرافق...'
                    : language === 'fr'
                      ? 'Décrivez les atouts du bien, l’orientation, les prestations et la proximité des commodités...'
                      : 'Describe key highlights, exposure, finishes, and nearby amenities...'
                }
                className="w-full p-3 text-[13px] font-medium text-[#1F2937] bg-white border border-[#E3EAE5] rounded-xl focus:outline-none focus:border-[#16966A]"
              />
            </div>

            <div className="border border-[#E3EAE5] rounded-xl p-3.5 bg-[#F5F7F5]/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#1F2937]">
                  {t.properties.form.images} ({images.length})
                </span>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E3EAE5] text-xs font-bold text-[#1F2937] hover:bg-[#F5F7F5] cursor-pointer shadow-2xs">
                  <Upload className="h-3.5 w-3.5 text-[#16966A]" />
                  <span>{t.properties.form.uploadImageLabel}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {images.some((img) => !PRESET_PROPERTY_IMAGES.includes(img)) && (
                <div className="flex flex-wrap gap-2">
                  {images
                    .filter((img) => !PRESET_PROPERTY_IMAGES.includes(img))
                    .map((customImg, idx) => (
                      <div
                        key={`custom_${idx}`}
                        className="relative h-16 w-24 rounded-lg overflow-hidden border-2 border-emerald-600"
                      >
                        <img src={customImg} alt="Uploaded" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(customImg)}
                          className="absolute top-1 end-1 h-5 w-5 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <div className="text-[11px] font-semibold text-slate-600">
                {t.properties.form.selectPresetImages}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_PROPERTY_IMAGES.map((img, i) => {
                  const selected = images.includes(img);
                  return (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => togglePreset(img)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                        selected
                          ? 'border-[#16966A] ring-2 ring-[#16966A]/20'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Property preset" className="h-full w-full object-cover" />
                      {selected && (
                        <span className="absolute top-1.5 end-1.5 h-5 w-5 rounded-full bg-[#16966A] text-white flex items-center justify-center shadow">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE9EF]">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline h-10 px-5 text-xs font-bold rounded-xl"
            >
              {t.app.cancel}
            </button>
            <button type="submit" className="btn-primary h-10 px-6 text-xs font-bold rounded-xl">
              {t.app.save}
            </button>
          </div>
        </form>
      </Modal>
      <OwnerFormModal open={ownerModalOpen} onClose={() => setOwnerModalOpen(false)} />
    </>
  );
};

export const OwnerFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  editingOwner?: PropertyOwner | null;
}> = ({ open, onClose, editingOwner }) => {
  const { t, language, addOwner, updateOwner, pushToast } = useAgency();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+212 6');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('الدار البيضاء');
  const [ownerType, setOwnerType] = useState<OwnerType>('individual');
  const [ownerIntent, setOwnerIntent] = useState<'sell' | 'rent_out' | 'both'>('sell');
  const [preferredContact, setPreferredContact] = useState<ContactMethod>('whatsapp');
  const [commissionRate, setCommissionRate] = useState('2.5');
  const [nationalId, setNationalId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingOwner) {
      setName(editingOwner.name);
      setPhone(editingOwner.phone);
      setEmail(editingOwner.email);
      setCity(editingOwner.city);
      setOwnerType(editingOwner.owner_type);
      setOwnerIntent(editingOwner.owner_intent ?? 'sell');
      setPreferredContact(editingOwner.preferred_contact);
      setCommissionRate(String(editingOwner.commission_rate));
      setNationalId(editingOwner.national_id);
      setNotes(editingOwner.notes);
    } else {
      setName('');
      setPhone('+212 6');
      setEmail('');
      setCity('الدار البيضاء');
      setOwnerType('individual');
      setOwnerIntent('sell');
      setPreferredContact('whatsapp');
      setCommissionRate('2.5');
      setNationalId('');
      setNotes('');
    }
  }, [editingOwner, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      pushToast({ type: 'warning', title: t.app.requiredField });
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim() || 'الدار البيضاء',
      owner_type: ownerType,
      owner_intent: ownerIntent,
      preferred_contact: preferredContact,
      commission_rate: Number(commissionRate) || 0,
      national_id: nationalId.trim(),
      notes: notes.trim(),
    };

    if (editingOwner) {
      updateOwner(editingOwner.id, payload);
    } else {
      addOwner(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingOwner ? t.owners.editOwner : t.owners.addOwner}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>
              {t.owners.form.name} <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>
              {t.owners.form.phone} <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${INPUT_CLASS} font-mono-num`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>{t.owners.form.email}</label>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>{t.owners.form.city}</label>
            <select
              value={MOROCCAN_CITIES.includes(city) ? city : MOROCCAN_CITIES[0]}
              onChange={(e) => setCity(e.target.value)}
              className={SELECT_CLASS}
            >
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {localizeCity(c, language)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>{t.owners.form.ownerType}</label>
            <select
              value={ownerType}
              onChange={(e) => setOwnerType(e.target.value as OwnerType)}
              className={SELECT_CLASS}
            >
              {(Object.keys(t.ownerTypes) as OwnerType[]).map((ot) => (
                <option key={ot} value={ot}>
                  {t.ownerTypes[ot]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>
              {language === 'ar'
                ? 'تصنيف محفظة المالك'
                : language === 'fr'
                  ? 'Type de portefeuille'
                  : 'Portfolio Intent'}
            </label>
            <select
              value={ownerIntent}
              onChange={(e) => setOwnerIntent(e.target.value as 'sell' | 'rent_out' | 'both')}
              className={SELECT_CLASS}
            >
              <option value="sell">{t.owners.stats.ownersForSale}</option>
              <option value="rent_out">{t.owners.stats.ownersForRent}</option>
              <option value="both">
                {language === 'ar'
                  ? 'البيع والكراء معاً'
                  : language === 'fr'
                    ? 'Vente et Location'
                    : 'Sale & Rent'}
              </option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>{t.owners.form.preferredContact}</label>
            <select
              value={preferredContact}
              onChange={(e) => setPreferredContact(e.target.value as ContactMethod)}
              className={SELECT_CLASS}
            >
              {(Object.keys(t.contactMethods) as ContactMethod[]).map((cm) => (
                <option key={cm} value={cm}>
                  {t.contactMethods[cm]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>{t.owners.form.commissionRate}</label>
            <input
              type="number"
              step="0.5"
              min={0}
              max={100}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className={`${INPUT_CLASS} font-mono-num`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS}>{t.owners.form.nationalId}</label>
            <input
              type="text"
              dir="ltr"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className={`${INPUT_CLASS} font-mono-num`}
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>{t.owners.form.notes}</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 text-[13px] font-medium text-slate-900 bg-white border border-slate-300 rounded-xl"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE9EF]">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline h-10 px-5 text-xs font-bold rounded-xl"
          >
            {t.app.cancel}
          </button>
          <button type="submit" className="btn-primary h-10 px-6 text-xs font-bold rounded-xl">
            {t.app.save}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const AppointmentFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  editingAppointment?: Appointment | null;
  defaultLeadId?: string | null;
  defaultDate?: string;
  defaultTime?: string;
}> = ({ open, onClose, editingAppointment, defaultLeadId, defaultDate, defaultTime }) => {
  const {
    t,
    language,
    leads,
    properties,
    employees,
    settings,
    appointments,
    addAppointment,
    updateAppointment,
    pushToast,
  } = useAgency();

  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [employeeId, setEmployeeId] = useState(employees[1]?.id ?? employees[0]?.id ?? '');
  const [date, setDate] = useState(defaultDate || getTodayIso());
  const [time, setTime] = useState(defaultTime || '11:00');
  const [type, setType] = useState<AppointmentType>('in_person_visit');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initKeyRef = useRef<string>('');

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      return;
    }
    const nextKey = editingAppointment
      ? `edit:${editingAppointment.id}`
      : `new:${defaultLeadId ?? ''}:${defaultDate ?? ''}:${defaultTime ?? ''}`;
    if (initKeyRef.current === nextKey) return;
    initKeyRef.current = nextKey;
    setErrors({});

    if (editingAppointment) {
      setLeadId(editingAppointment.lead_id);
      setPropertyId(editingAppointment.property_id);
      setEmployeeId(editingAppointment.employee_id);
      setDate(editingAppointment.date);
      setTime(editingAppointment.time);
      setType(editingAppointment.type);
      setStatus(editingAppointment.status);
      setNotes(editingAppointment.notes);
    } else {
      const targetLead = leads.find((l) => l.id === defaultLeadId) ?? leads[0];
      setLeadId(targetLead?.id ?? '');
      setPropertyId(targetLead?.interested_property_id ?? properties[0]?.id ?? '');
      setEmployeeId(targetLead?.assigned_employee_id ?? employees[0]?.id ?? '');
      setDate(defaultDate || getTodayIso());
      setTime(defaultTime || '11:00');
      setType('in_person_visit');
      setStatus('scheduled');
      setNotes('');
    }
  }, [editingAppointment, defaultLeadId, defaultDate, defaultTime, open, leads, properties, employees]);

  const handleLeadSelect = (nextLeadId: string) => {
    setLeadId(nextLeadId);
    const matched = leads.find((l) => l.id === nextLeadId);
    if (matched && !editingAppointment) {
      if (matched.interested_property_id) setPropertyId(matched.interested_property_id);
      if (matched.assigned_employee_id) setEmployeeId(matched.assigned_employee_id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!leadId) nextErrors.leadId = t.leads.form.validationRequired;
    if (!propertyId) nextErrors.propertyId = t.leads.form.validationRequired;
    if (!date) nextErrors.date = t.leads.form.validationRequired;
    if (!time) nextErrors.time = t.leads.form.validationRequired;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      pushToast({ type: 'warning', title: t.app.requiredField });
      return;
    }

    const payload = {
      lead_id: leadId,
      property_id: propertyId,
      employee_id: employeeId,
      date,
      time,
      type,
      status,
      notes: notes.trim(),
    };

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, payload);
    } else {
      addAppointment(payload);
    }
    onClose();
  };

  const dayKey = getDayKeyFromIsoDate(date);
  const dayConfig = settings.working_days.find((d) => d.day_key === dayKey);
  const quickSlots = dayConfig?.enabled
    ? generateDayWorkingHours(dayConfig.open, dayConfig.close).filter(
        (slot) => getSlotAvailability(dayConfig, slot, settings, date).status === 'available'
      )
    : [];

  const selectedLead = leads.find((l) => l.id === leadId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingAppointment ? t.appointments.editAppointment : t.appointments.newAppointment}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Section 1: Client & Property Selection */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E3EAE5] text-xs font-extrabold text-[#1F2937]">
            <User className="h-4 w-4 text-[#16966A]" />
            <span>
              {language === 'ar'
                ? 'بيانات العميل والعقار والمستشار'
                : language === 'fr'
                  ? 'Client, bien et conseiller'
                  : 'Client, Property & Advisor'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS}>
                {t.appointments.form.lead} <span className="text-rose-600">*</span>
              </label>
              <select
                value={leadId}
                onChange={(e) => handleLeadSelect(e.target.value)}
                className={`${SELECT_CLASS} ${errors.leadId ? 'border-rose-500' : ''}`}
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {localizePersonName(l.name, language)} — {l.phone} ({localizeCity(l.city, language)})
                  </option>
                ))}
              </select>
              {selectedLead && (
                <div className="mt-2 rounded-xl bg-[#F5F7F5] border border-[#E3EAE5] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#1F2937]">
                    {t.propertyTypes[selectedLead.property_type]} · {localizeCity(selectedLead.city, language)}
                    {selectedLead.desired_area > 0 ? ` · ${selectedLead.desired_area} ${t.app.sqm}` : ''}
                  </span>
                  <span className="font-mono-num font-extrabold text-[#16966A]">
                    {formatMAD(selectedLead.budget, language)}
                  </span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className={LABEL_CLASS}>
                {t.appointments.form.property} <span className="text-rose-600">*</span>
              </label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className={`${SELECT_CLASS} ${errors.propertyId ? 'border-rose-500' : ''}`}
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ref} · {localizePropertyTitle(p.title, language)} ({localizeCity(p.city, language)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>{t.appointments.form.employee}</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={SELECT_CLASS}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {localizePersonName(emp.name, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>{t.appointments.form.type}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className={SELECT_CLASS}
              >
                {(Object.keys(t.appointmentTypes) as AppointmentType[]).map((at) => (
                  <option key={at} value={at}>
                    {t.appointmentTypes[at]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Prominent Date & Time Selection */}
        <div className="rounded-2xl border-2 border-[#16966A]/20 bg-[#F5F7F5] p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E3EAE5]">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#12352B]">
              <Calendar className="h-4 w-4 text-[#16966A]" />
              <span>
                {language === 'ar'
                  ? 'تحديد تاريخ وساعة الموعد'
                  : language === 'fr'
                    ? 'Date et heure du rendez-vous'
                    : 'Appointment Date & Time'}
              </span>
            </div>
            {dayConfig && (
              <span className="text-[11px] font-bold text-[#64748B]">
                {t.days[dayKey]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>
                {t.appointments.form.date} <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold text-[#1F2937] bg-white border-2 border-[#E3EAE5] rounded-xl font-mono-num focus:outline-none focus:border-[#16966A]"
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>
                {t.appointments.form.time} <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  step={300}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold text-[#1F2937] bg-white border-2 border-[#E3EAE5] rounded-xl font-mono-num focus:outline-none focus:border-[#16966A]"
                />
              </div>
            </div>
          </div>

          {quickSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B]">
                <Clock className="h-3.5 w-3.5 text-[#16966A]" />
                <span>
                  {language === 'ar'
                    ? 'اختر توقيتاً سريعاً من ساعات العمل المتاحة:'
                    : language === 'fr'
                      ? 'Créneaux rapides disponibles :'
                      : 'Quick available time slots:'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickSlots.map((slot) => {
                  const isBusy = appointments.some(
                    (a) =>
                      a.date === date &&
                      a.time.startsWith(slot.slice(0, 2)) &&
                      a.status !== 'cancelled' &&
                      a.id !== editingAppointment?.id
                  );
                  const selected = time.startsWith(slot.slice(0, 2));
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono-num font-bold border transition-all ${
                        selected
                          ? 'bg-[#EA580C] text-white border-[#C2410C] shadow-xs'
                          : isBusy
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white text-[#1F2937] border-[#E2E8F0] hover:border-[#EA580C]'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Status & Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5">
          <div>
            <label className={LABEL_CLASS}>{t.appointments.form.status}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className={SELECT_CLASS}
            >
              {(Object.keys(t.appointmentStatuses) as AppointmentStatus[]).map((as) => (
                <option key={as} value={as}>
                  {t.appointmentStatuses[as]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS}>{t.appointments.form.notes}</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: إحضار المفاتيح من الحارس، تأكيد الموقع عبر واتساب...'
                  : language === 'fr'
                    ? 'Ex. Récupérer les clés auprès du concierge, confirmer la localisation via WhatsApp...'
                    : 'e.g. Collect keys from concierge, confirm pin location via WhatsApp...'
              }
              className="w-full p-3 text-[13px] font-medium text-[#1F2937] bg-white border border-[#E3EAE5] rounded-xl focus:outline-none focus:border-[#16966A]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE9EF]">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline h-10 px-5 text-xs font-bold rounded-xl"
          >
            {t.app.cancel}
          </button>
          <button type="submit" className="btn-primary h-10 px-6 text-xs font-bold rounded-xl">
            {t.app.save}
          </button>
        </div>
      </form>
    </Modal>
  );
};
