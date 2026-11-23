import { Language } from '../types/domain';

const CITY_TRANSLATIONS: Record<string, { ar: string; en: string; fr: string }> = {
  'الدار البيضاء': { ar: 'الدار البيضاء', en: 'Casablanca', fr: 'Casablanca' },
  'الرباط': { ar: 'الرباط', en: 'Rabat', fr: 'Rabat' },
  'مراكش': { ar: 'مراكش', en: 'Marrakech', fr: 'Marrakech' },
  'طنجة': { ar: 'طنجة', en: 'Tangier', fr: 'Tanger' },
  'أكادير': { ar: 'أكادير', en: 'Agadir', fr: 'Agadir' },
  'فاس': { ar: 'فاس', en: 'Fez', fr: 'Fès' },
  'مكناس': { ar: 'مكناس', en: 'Meknes', fr: 'Meknès' },
  'وجدة': { ar: 'وجدة', en: 'Oujda', fr: 'Oujda' },
  'القنيطرة': { ar: 'القنيطرة', en: 'Kenitra', fr: 'Kénitra' },
  'تطوان': { ar: 'تطوان', en: 'Tetouan', fr: 'Tétouan' },
  'المحمدية': { ar: 'المحمدية', en: 'Mohammedia', fr: 'Mohammédia' },
  'تمارة': { ar: 'تمارة', en: 'Temara', fr: 'Témara' },
  'سلا': { ar: 'سلا', en: 'Sale', fr: 'Salé' },
  'الجديدة': { ar: 'الجديدة', en: 'El Jadida', fr: 'El Jadida' },
  'بني ملال': { ar: 'بني ملال', en: 'Beni Mellal', fr: 'Béni Mellal' },
  'الناظور': { ar: 'الناظور', en: 'Nador', fr: 'Nador' },
  'آسفي': { ar: 'آسفي', en: 'Safi', fr: 'Safi' },
  'خريبكة': { ar: 'خريبكة', en: 'Khouribga', fr: 'Khouribga' },
  'سطات': { ar: 'سطات', en: 'Settat', fr: 'Settat' },
  'الصويرة': { ar: 'الصويرة', en: 'Essaouira', fr: 'Essaouira' },
  'ورزازات': { ar: 'ورزازات', en: 'Ouarzazate', fr: 'Ouarzazate' },
  'تازة': { ar: 'تازة', en: 'Taza', fr: 'Taza' },
  'العرائش': { ar: 'العرائش', en: 'Larache', fr: 'Larache' },
  'الحسيمة': { ar: 'الحسيمة', en: 'Al Hoceima', fr: 'Al Hoceïma' },
  'شفشاون': { ar: 'شفشاون', en: 'Chefchaouen', fr: 'Chefchaouen' },
  'الداخلة': { ar: 'الداخلة', en: 'Dakhla', fr: 'Dakhla' },
  'العيون': { ar: 'العيون', en: 'Laayoune', fr: 'Laâyoune' },
};

const CITY_BY_LATIN: Record<string, string> = Object.entries(CITY_TRANSLATIONS).reduce(
  (acc, [arKey, forms]) => {
    acc[forms.en.toLowerCase()] = arKey;
    acc[forms.fr.toLowerCase()] = arKey;
    return acc;
  },
  {} as Record<string, string>
);

const DISTRICT_TRANSLATIONS: Record<string, { ar: string; en: string; fr: string }> = {
  'أنفا العليا': { ar: 'أنفا العليا', en: 'Upper Anfa', fr: 'Anfa Supérieur' },
  'حي الرياض': { ar: 'حي الرياض', en: 'Hay Riad', fr: 'Hay Riad' },
  'القطب المالي CFC': { ar: 'القطب المالي CFC', en: 'Casablanca Finance City (CFC)', fr: 'Casablanca Finance City (CFC)' },
  'النخيل / المدينة': { ar: 'النخيل / المدينة', en: 'Palmeraie / Medina', fr: 'Palmeraie / Médina' },
  'مالاباطا': { ar: 'مالاباطا', en: 'Malabata', fr: 'Malabata' },
  'المعاريف': { ar: 'المعاريف', en: 'Maarif', fr: 'Maârif' },
  'فونتي العليا': { ar: 'فونتي العليا', en: 'Upper Founty', fr: 'Founty Haut' },
  'طريق إيموزار': { ar: 'طريق إيموزار', en: 'Immouzzer Road', fr: 'Route d’Immouzzer' },
  'عين الذئاب': { ar: 'عين الذئاب', en: 'Ain Diab', fr: 'Aïn Diab' },
  'المهدية / المركز': { ar: 'المهدية / المركز', en: 'Mehdia / City Center', fr: 'Mehdia / Centre-ville' },
  'أكدال': { ar: 'أكدال', en: 'Agdal', fr: 'Agdal' },
  'كاليفورنيا': { ar: 'كاليفورنيا', en: 'Californie', fr: 'Californie' },
  'الجبل الكبير': { ar: 'الجبل الكبير', en: 'Jbel Kebir', fr: 'Jbel Kebir' },
  'السويسي': { ar: 'السويسي', en: 'Souissi', fr: 'Souissi' },
  'راسين': { ar: 'راسين', en: 'Racine', fr: 'Racine' },
  'جليز': { ar: 'جليز', en: 'Gueliz', fr: 'Guéliz' },
};

const PERSON_TRANSLATIONS: Record<string, { ar: string; en: string; fr: string }> = {
  // Team
  'سلمى العلمي': { ar: 'سلمى العلمي', en: 'Salma El Alami', fr: 'Salma El Alami' },
  'يوسف التازي': { ar: 'يوسف التازي', en: 'Youssef Tazi', fr: 'Youssef Tazi' },
  'خديجة الإدريسي': { ar: 'خديجة الإدريسي', en: 'Khadija El Idrissi', fr: 'Khadija El Idrissi' },
  'عمر بوعبيد': { ar: 'عمر بوعبيد', en: 'Omar Bouabid', fr: 'Omar Bouabid' },
  'مريم المنصوري': { ar: 'مريم المنصوري', en: 'Meriem El Mansouri', fr: 'Meriem El Mansouri' },

  // Leads
  'كريم بنجلون': { ar: 'كريم بنجلون', en: 'Karim Benjelloun', fr: 'Karim Benjelloun' },
  'نادية الشرايبي': { ar: 'نادية الشرايبي', en: 'Nadia Chraibi', fr: 'Nadia Chraïbi' },
  'أمين الفاسي الفهري': { ar: 'أمين الفاسي الفهري', en: 'Amine El Fassi El Fihri', fr: 'Amine El Fassi El Fihri' },
  'أمين الفاسي': { ar: 'أمين الفاسي', en: 'Amine El Fassi', fr: 'Amine El Fassi' },
  'حنان الوزاني': { ar: 'حنان الوزاني', en: 'Hanane Ouazzani', fr: 'Hanane Ouazzani' },
  'مهدي السقاط': { ar: 'مهدي السقاط', en: 'Mehdi Sekkat', fr: 'Mehdi Sekkat' },
  'زكرياء بلخياط': { ar: 'زكرياء بلخياط', en: 'Zakaria Belkhayat', fr: 'Zakaria Belkhayat' },
  'سارة المرابط': { ar: 'سارة المرابط', en: 'Sara El Mrabet', fr: 'Sara El Mrabet' },
  'إلياس الحجوي': { ar: 'إلياس الحجوي', en: 'Ilyas El Hajjoui', fr: 'Ilyas El Hajjoui' },
  'ليلى التمسماني': { ar: 'ليلى التمسماني', en: 'Leila Temsamani', fr: 'Leïla Temsamani' },
  'مصطفى البقالي': { ar: 'مصطفى البقالي', en: 'Mustapha Bakkali', fr: 'Mustapha Bakkali' },
  'ياسين أيت حدو': { ar: 'ياسين أيت حدو', en: 'Yassine Ait Haddou', fr: 'Yassine Aït Haddou' },
  'عبد الرحيم المنوني': { ar: 'عبد الرحيم المنوني', en: 'Abderrahim El Mennouni', fr: 'Abderrahim El Mennouni' },
  'سعاد بنشقرون': { ar: 'سعاد بنشقرون', en: 'Souad Benchakroun', fr: 'Souad Benchakroun' },
  'عادل التمسماني': { ar: 'عادل التمسماني', en: 'Adil Temsamani', fr: 'Adil Temsamani' },
  'سفيان القادري': { ar: 'سفيان القادري', en: 'Soufiane Kadiri', fr: 'Soufiane Kadiri' },
  'سمير العزوزي': { ar: 'سمير العزوزي', en: 'Samir El Azouzi', fr: 'Samir El Azouzi' },
  'وليد الحمزاوي': { ar: 'وليد الحمزاوي', en: 'Walid Hamzaoui', fr: 'Walid Hamzaoui' },

  // Owners
  'الحاج عبد اللطيف برادة': { ar: 'الحاج عبد اللطيف برادة', en: 'Abdellatif Berrada', fr: 'Abdellatif Berrada' },
  'الدكتورة فاطمة الزهراء بنموسى': { ar: 'الدكتورة فاطمة الزهراء بنموسى', en: 'Dr. Fatima-Zahra Benmoussa', fr: 'Dr Fatima-Zahra Benmoussa' },
  'شركة النماء للتطوير العقاري': { ar: 'شركة النماء للتطوير العقاري', en: 'Namaa Real Estate Development', fr: 'Namaa Promotion Immobilière' },
  'رشيد الكتاني': { ar: 'رشيد الكتاني', en: 'Rachid Kettani', fr: 'Rachid Kettani' },
  'طارق العرائشي': { ar: 'طارق العرائشي', en: 'Tarik El Laraichi', fr: 'Tarik El Laraïchi' },
  'النظام': { ar: 'النظام', en: 'System', fr: 'Système' },
};

const JOB_TITLE_TRANSLATIONS: Record<string, { ar: string; en: string; fr: string }> = {
  'مديرة الوكالة العقارية': { ar: 'مديرة الوكالة العقارية', en: 'Managing Director', fr: 'Directrice d’agence' },
  'مسؤول المبيعات العليا': { ar: 'مسؤول المبيعات العليا', en: 'Head of Sales', fr: 'Directeur des ventes' },
  'مستشارة عقارية — الرباط والدار البيضاء': { ar: 'مستشارة عقارية — الرباط والدار البيضاء', en: 'Senior Property Advisor — Rabat & Casablanca', fr: 'Conseillère immobilière — Rabat & Casablanca' },
  'مستشار عقاري — مراكش وأكادير': { ar: 'مستشار عقاري — مراكش وأكادير', en: 'Senior Property Advisor — Marrakech & Agadir', fr: 'Conseiller immobilier — Marrakech & Agadir' },
  'منسقة الاستقبال والمواعيد': { ar: 'منسقة الاستقبال والمواعيد', en: 'Client Relations & Scheduling Coordinator', fr: 'Chargée d’accueil & Planification' },
};

const AGENCY_NAME_TRANSLATIONS: Record<string, { ar: string; en: string; fr: string }> = {
  'أطلس العقارية': { ar: 'أطلس العقارية', en: 'Atlas Real Estate', fr: 'Atlas Immobilier' },
};

const PROPERTY_TITLE_TRANSLATIONS: Record<string, { ar: string; en: string; fr: string }> = {
  'فيلا معاصرة مطلة على المحيط — أنفا العليا': {
    ar: 'فيلا معاصرة مطلة على المحيط — أنفا العليا',
    en: 'Contemporary Oceanfront Villa — Upper Anfa',
    fr: 'Villa contemporaine vue océan — Anfa Supérieur',
  },
  'شقة فاخرة مشمسة — حي الرياض': {
    ar: 'شقة فاخرة مشمسة — حي الرياض',
    en: 'Sunlit Luxury Apartment — Hay Riad',
    fr: 'Appartement de standing lumineux — Hay Riad',
  },
  'طابق مكتبي مهيأ — القطب المالي للدار البيضاء (CFC)': {
    ar: 'طابق مكتبي مهيأ — القطب المالي للدار البيضاء (CFC)',
    en: 'Fitted Executive Office Floor — Casablanca Finance City (CFC)',
    fr: 'Plateau de bureaux aménagé — Casablanca Finance City (CFC)',
  },
  'منزل تقليدي مجدد (رياض معاصر) — جليز والمدينة': {
    ar: 'منزل تقليدي مجدد (رياض معاصر) — جليز والمدينة',
    en: 'Renovated Contemporary Riad — Gueliz & Medina',
    fr: 'Riad contemporain rénové — Guéliz & Médina',
  },
  'شقة بإطلالة بحرية — مالاباطا': {
    ar: 'شقة بإطلالة بحرية — مالاباطا',
    en: 'Sea-View Residence — Malabata',
    fr: 'Appartement vue mer — Malabata',
  },
  'محل تجاري بواجهة مزدوجة — المعاريف': {
    ar: 'محل تجاري بواجهة مزدوجة — المعاريف',
    en: 'Corner Retail Space — Maarif',
    fr: 'Local commercial double façade — Maârif',
  },
  'قطعة أرضية مخصصة لبناء فيلا — فونتي': {
    ar: 'قطعة أرضية مخصصة لبناء فيلا — فونتي',
    en: 'Prime Residential Villa Plot — Founty',
    fr: 'Terrain constructible pour villa — Founty',
  },
  'شقة عائلية فسيحة — طريق إيموزار': {
    ar: 'شقة عائلية فسيحة — طريق إيموزار',
    en: 'Spacious Family Apartment — Immouzzer Road',
    fr: 'Grand appartement familial — Route d’Immouzzer',
  },
};

const CAMPAIGN_NAME_TRANSLATIONS: Record<string, { ar: string; en: string; fr: string }> = {
  'حملة فلل أنفا الفاخرة — الدار البيضاء': {
    ar: 'حملة فلل أنفا الفاخرة — الدار البيضاء',
    en: 'Luxury Villas Anfa — Casablanca',
    fr: 'Villas de prestige Anfa — Casablanca',
  },
  'شقق حي الرياض الحديثة — الرباط': {
    ar: 'شقق حي الرياض الحديثة — الرباط',
    en: 'Modern Residences Hay Riad — Rabat',
    fr: 'Résidences modernes Hay Riad — Rabat',
  },
  'بحث جوجل — مكاتب القطب المالي CFC': {
    ar: 'بحث جوجل — مكاتب القطب المالي CFC',
    en: 'Google Search — CFC Corporate Offices',
    fr: 'Google Search — Bureaux CFC',
  },
  'رياضات ومشاريع سياحية — مراكش': {
    ar: 'رياضات ومشاريع سياحية — مراكش',
    en: 'Hospitality Riads & Estates — Marrakech',
    fr: 'Riads & Actifs touristiques — Marrakech',
  },
  'بوابة العقار المحلية — طنجة وأكادير': {
    ar: 'بوابة العقار المحلية — طنجة وأكادير',
    en: 'Regional Property Portal — Tangier & Agadir',
    fr: 'Portail immobilier régional — Tanger & Agadir',
  },
};

const RELATIVE_TIME_MAP: Record<string, { en: string; fr: string }> = {
  'الآن': { en: 'Just now', fr: 'À l’instant' },
  'أمس': { en: 'Yesterday', fr: 'Hier' },
  'منذ ساعتين': { en: '2 hours ago', fr: 'Il y a 2 h' },
  'منذ ساعة': { en: '1 hour ago', fr: 'Il y a 1 h' },
  'منذ 3 ساعات': { en: '3 hours ago', fr: 'Il y a 3 h' },
  'منذ 12 دقيقة': { en: '12 min ago', fr: 'Il y a 12 min' },
  'منذ 20 دقيقة': { en: '20 min ago', fr: 'Il y a 20 min' },
  'منذ 25 دقيقة': { en: '25 min ago', fr: 'Il y a 25 min' },
  'منذ 35 دقيقة': { en: '35 min ago', fr: 'Il y a 35 min' },
  'منذ 45 دقيقة': { en: '45 min ago', fr: 'Il y a 45 min' },
  'منذ يومين': { en: '2 days ago', fr: 'Il y a 2 jours' },
  'منذ 3 أيام': { en: '3 days ago', fr: 'Il y a 3 jours' },
  'أمس 17:40': { en: 'Yesterday 17:40', fr: 'Hier 17:40' },
  'أمس 12:15': { en: 'Yesterday 12:15', fr: 'Hier 12:15' },
  'اليوم 10:15': { en: 'Today 10:15', fr: 'Aujourd’hui 10:15' },
};

const ACTIVITY_ACTION_MAP: Record<string, { en: string; fr: string }> = {
  'اعتماد عقد بيع': { en: 'Approved Sales Contract', fr: 'Validation acte de vente' },
  'تعيين مستشار لعميل': { en: 'Assigned Advisor to Lead', fr: 'Affectation conseiller au prospect' },
  'تصدير تقرير المبيعات الشهري': { en: 'Exported Monthly Sales Report', fr: 'Export rapport mensuel des ventes' },
  'إتمام معاينة ميدانية': { en: 'Completed On-Site Viewing', fr: 'Visite terrain effectuée' },
  'تحديث حالة العميل': { en: 'Updated Lead Stage', fr: 'Statut prospect mis à jour' },
  'جدولة موعد معاينة': { en: 'Scheduled Property Viewing', fr: 'Visite planifiée' },
  'إضافة ملاحظة متابعة': { en: 'Added Follow-up Note', fr: 'Note de suivi ajoutée' },
  'إضافة عقار جديد': { en: 'Listed New Property', fr: 'Nouveau bien enregistré' },
  'تأكيد موعد معاينة هاتفياً': { en: 'Confirmed Viewing via Phone', fr: 'Visite confirmée par téléphone' },
};

const ACTIVITY_TARGET_MAP: Record<string, { en: string; fr: string }> = {
  'فيلا أنفا العليا - ATL-V104': { en: 'Upper Anfa Villa - ATL-V104', fr: 'Villa Anfa Supérieur - ATL-V104' },
  'كريم بنجلون ← يوسف التازي': { en: 'Karim Benjelloun → Youssef Tazi', fr: 'Karim Benjelloun → Youssef Tazi' },
  'تقرير نوفمبر 2026': { en: 'November 2026 Report', fr: 'Rapport Novembre 2026' },
  'مكتب برج القطب المالي CFC': { en: 'CFC Business Tower Office', fr: 'Bureau Tour CFC' },
  'نادية الشرايبي ← قيد التفاوض': { en: 'Nadia Chraibi → In Negotiation', fr: 'Nadia Chraïbi → En négociation' },
  'شقة حي الرياض - أمين الفاسي': { en: 'Hay Riad Apt - Amine El Fassi', fr: 'Appt Hay Riad - Amine El Fassi' },
  'مهدي السقاط': { en: 'Mehdi Sekkat', fr: 'Mehdi Sekkat' },
  'رياض النخيل - مراكش': { en: 'Palmeraie Riad - Marrakech', fr: 'Riad Palmeraie - Marrakech' },
  'حنان الوزاني - طنجة': { en: 'Hanane Ouazzani - Tangier', fr: 'Hanane Ouazzani - Tanger' },
};

const NOTIFICATION_TRANSLATIONS: Record<string, { en: { title: string; message: string }; fr: { title: string; message: string } }> = {
  notif_1: {
    en: {
      title: 'New Lead Registered',
      message: 'Sara El Mrabet submitted an inquiry for a 3-bedroom apartment via Instagram Ads.',
    },
    fr: {
      title: 'Nouveau prospect enregistré',
      message: 'Sara El Mrabet a soumis une demande pour un appartement 3 chambres via Instagram Ads.',
    },
  },
  notif_2: {
    en: {
      title: 'Upcoming Viewing Today',
      message: 'Property viewing at Upper Anfa Villa with Karim Benjelloun today at 15:30.',
    },
    fr: {
      title: 'Visite prévue aujourd’hui',
      message: 'Visite de la Villa Anfa Supérieur avec Karim Benjelloun aujourd’hui à 15h30.',
    },
  },
  notif_3: {
    en: {
      title: 'Viewing Confirmed',
      message: 'Hanane Ouazzani confirmed the virtual tour for the Malabata sea-view apartment.',
    },
    fr: {
      title: 'Visite confirmée',
      message: 'Hanane Ouazzani a confirmé la visite virtuelle pour l’appartement à Malabata.',
    },
  },
  notif_4: {
    en: {
      title: 'Client No-Show Alert',
      message: 'Zakaria Belkhayat missed the scheduled viewing for the Founty land plot in Agadir.',
    },
    fr: {
      title: 'Alerte absence client',
      message: 'Zakaria Belkhayat ne s’est pas présenté à la visite du terrain Founty à Agadir.',
    },
  },
  notif_5: {
    en: {
      title: 'Listing Status Updated',
      message: 'Palmeraie Riad (ATL-H412) was marked as "Reserved" following preliminary contract signing.',
    },
    fr: {
      title: 'Statut du bien mis à jour',
      message: 'Le Riad Palmeraie (ATL-H412) est passé en statut « Réservé » après signature du compromis.',
    },
  },
  notif_6: {
    en: {
      title: 'Team Activity Update',
      message: 'Youssef Tazi logged a new follow-up note for client Amine El Fassi.',
    },
    fr: {
      title: 'Activité commerciale',
      message: 'Youssef Tazi a ajouté une note de suivi sur le dossier de Amine El Fassi.',
    },
  },
  notif_7: {
    en: {
      title: 'Weekly Executive Review',
      message: 'The monthly sales and viewing performance report is ready for review and PDF export.',
    },
    fr: {
      title: 'Revue hebdomadaire',
      message: 'Le rapport mensuel des ventes et visites est prêt pour consultation et export PDF.',
    },
  },
};

const ARABIC_CHAR_MAP: Record<string, string> = {
  ا: 'a', أ: 'a', إ: 'i', آ: 'a', ى: 'a', ة: 'a',
  ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'h', خ: 'kh',
  د: 'd', ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sh',
  ص: 's', ض: 'd', ط: 't', ظ: 'z', ع: 'a', غ: 'gh',
  ف: 'f', ق: 'k', ك: 'k', ل: 'l', م: 'm', ن: 'n',
  ه: 'h', و: 'ou', ي: 'i', ئ: 'i', ؤ: 'ou', ء: '',
};

export function transliterateArabicToLatin(input: string): string {
  if (!/[\u0600-\u06FF]/.test(input)) return input;
  return input
    .split(/\s+/)
    .map((word) => {
      if (!/[\u0600-\u06FF]/.test(word)) return word;
      let normalized = word.replace(/^ال/, 'El-');
      let out = '';
      for (const ch of normalized) {
        out += ARABIC_CHAR_MAP[ch] ?? ch;
      }
      return out.charAt(0).toUpperCase() + out.slice(1);
    })
    .join(' ');
}

export function normalizeCityKey(city: string): string {
  const trimmed = city.trim();
  if (CITY_TRANSLATIONS[trimmed]) return trimmed;
  return CITY_BY_LATIN[trimmed.toLowerCase()] ?? trimmed;
}

export function localizeCity(city: string, lang: Language): string {
  if (!city) return '—';
  const key = normalizeCityKey(city);
  const entry = CITY_TRANSLATIONS[key];
  if (entry) return entry[lang];
  return lang === 'ar' ? city : transliterateArabicToLatin(city);
}

export function localizeDistrict(district: string, lang: Language): string {
  if (!district) return '';
  const entry = DISTRICT_TRANSLATIONS[district.trim()];
  if (entry) return entry[lang];
  return lang === 'ar' ? district : transliterateArabicToLatin(district);
}

export function localizePersonName(name: string, lang: Language): string {
  if (!name) return '—';
  const trimmed = name.trim();
  const entry = PERSON_TRANSLATIONS[trimmed];
  if (entry) return entry[lang];
  return lang === 'ar' ? trimmed : transliterateArabicToLatin(trimmed);
}

export function localizeJobTitle(title: string, lang: Language): string {
  if (!title) return '';
  const entry = JOB_TITLE_TRANSLATIONS[title.trim()];
  if (entry) return entry[lang];
  return lang === 'ar' ? title : transliterateArabicToLatin(title);
}

export function localizeAgencyName(name: string, lang: Language): string {
  if (!name) return '';
  const entry = AGENCY_NAME_TRANSLATIONS[name.trim()];
  if (entry) return entry[lang];
  return lang === 'ar' ? name : transliterateArabicToLatin(name);
}

export function localizePropertyTitle(title: string, lang: Language): string {
  if (!title) return '—';
  const entry = PROPERTY_TITLE_TRANSLATIONS[title.trim()];
  if (entry) return entry[lang];
  return title;
}

export function localizeCampaignName(name: string, lang: Language): string {
  if (!name) return '—';
  const entry = CAMPAIGN_NAME_TRANSLATIONS[name.trim()];
  if (entry) return entry[lang];
  return name;
}

export function localizeRelativeTime(ts: string, lang: Language): string {
  if (lang === 'ar' || !ts) return ts;
  return RELATIVE_TIME_MAP[ts.trim()]?.[lang] ?? ts;
}

export function localizeActivityAction(action: string, lang: Language): string {
  if (lang === 'ar' || !action) return action;
  return ACTIVITY_ACTION_MAP[action.trim()]?.[lang] ?? action;
}

export function localizeActivityTarget(target: string, lang: Language): string {
  if (lang === 'ar' || !target) return target;
  return ACTIVITY_TARGET_MAP[target.trim()]?.[lang] ?? target;
}

export function localizeNotification(
  id: string,
  title: string,
  message: string,
  lang: Language
): { title: string; message: string } {
  if (lang === 'ar') return { title, message };
  const found = NOTIFICATION_TRANSLATIONS[id];
  return found ? found[lang] : { title, message };
}

export function matchesLocalizedQuery(
  query: string,
  lang: Language,
  rawFields: (string | undefined | null)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return rawFields.some((val) => {
    if (!val) return false;
    const lower = val.toLowerCase();
    if (lower.includes(q)) return true;
    if (localizeCity(val, lang).toLowerCase().includes(q)) return true;
    if (localizePersonName(val, lang).toLowerCase().includes(q)) return true;
    if (localizePropertyTitle(val, lang).toLowerCase().includes(q)) return true;
    if (localizeDistrict(val, lang).toLowerCase().includes(q)) return true;
    return false;
  });
}
