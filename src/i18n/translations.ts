import {
  AdPlatform,
  AppointmentStatus,
  AppointmentType,
  ChannelType,
  ContactMethod,
  DeliveryStatus,
  EmployeeRole,
  Language,
  LeadClassification,
  LeadSource,
  LeadStatus,
  NotificationCategory,
  OwnerType,
  PaymentMethod,
  PropertyStatus,
  PropertyType,
  SectionId,
  TransactionType,
} from '../types/domain';

export interface TranslationDict {
  app: {
    dir: 'rtl' | 'ltr';
    demoBadge: string;
    platformAttribution: string;
    searchPlaceholder: string;
    noSearchResults: string;
    logout: string;
    logoutConfirmTitle: string;
    logoutConfirmDesc: string;
    logoutSuccess: string;
    collapseSidebar: string;
    expandSidebar: string;
    notificationsShortcut: string;
    profileMenu: string;
    viewAll: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    reset: string;
    apply: string;
    exportCsv: string;
    exportExcel: string;
    exportPdf: string;
    loading: string;
    noData: string;
    actions: string;
    all: string;
    search: string;
    filter: string;
    sortBy: string;
    previous: string;
    next: string;
    showing: string;
    of: string;
    items: string;
    currencyCode: string;
    sqm: string;
    perMonth: string;
    requiredField: string;
    selectedCount: string;
    clearSelection: string;
    demoDataNotice: string;
  };
  nav: Record<SectionId, string>;
  navShortDesc: Record<SectionId, string>;
  languages: Record<Language, string>;
  leadStatuses: Record<LeadStatus, string>;
  leadSources: Record<LeadSource, string>;
  contactMethods: Record<ContactMethod, string>;
  paymentMethods: Record<PaymentMethod, string>;
  deliveryStatuses: Record<DeliveryStatus, string>;
  leadClassifications: Record<LeadClassification, string>;
  ownerTypes: Record<OwnerType, string>;
  propertyTypes: Record<PropertyType, string>;
  transactionTypes: Record<TransactionType, string>;
  propertyStatuses: Record<PropertyStatus, string>;
  appointmentStatuses: Record<AppointmentStatus, string>;
  appointmentTypes: Record<AppointmentType, string>;
  employeeRoles: Record<EmployeeRole, string>;
  channels: Record<ChannelType, string>;
  notificationCategories: Record<NotificationCategory, string>;
  adPlatforms: Record<AdPlatform, string>;
  days: Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string>;
  overview: {
    title: string;
    subtitle: string;
    dateFilters: {
      today: string;
      last7: string;
      last30: string;
      thisMonth: string;
      custom: string;
    };
    fromDate: string;
    toDate: string;
    vsPrevPeriod: string;
    kpis: {
      totalLeads: string;
      newLeads: string;
      scheduledVisits: string;
      completedVisits: string;
      attendedClients: string;
      noShowClients: string;
      successfulDeals: string;
      activeProperties: string;
      ownersRentingOut: string;
    };
    charts: {
      acquisitionTitle: string;
      acquisitionSub: string;
      visitsTitle: string;
      visitsSub: string;
      attendanceTitle: string;
      attendanceSub: string;
      funnelTitle: string;
      funnelSub: string;
      sourcesTitle: string;
      sourcesSub: string;
      monthlyTitle: string;
      monthlySub: string;
      attended: string;
      absent: string;
      scheduled: string;
      completed: string;
      leadsLabel: string;
      dealsLabel: string;
    };
    widgets: {
      upcomingAppointments: string;
      latestLeads: string;
      recentActivity: string;
      topProperties: string;
      quickActions: string;
      importantNotifications: string;
      newLeadBtn: string;
      newPropertyBtn: string;
      newAppointmentBtn: string;
      openReportsBtn: string;
      viewsCount: string;
      inquiriesCount: string;
    };
  };
  leads: {
    title: string;
    subtitle: string;
    addLead: string;
    editLead: string;
    deleteLead: string;
    deleteConfirm: string;
    emptyTitle: string;
    emptyDesc: string;
    tabs: {
      all: string;
      buyers: string;
      renters: string;
      sellers: string;
      landlordsRent: string;
    };
    columns: {
      name: string;
      phone: string;
      email: string;
      source: string;
      contactMethod: string;
      paymentMethod: string;
      bedrooms: string;
      deliveryStatus: string;
      desiredArea: string;
      classification: string;
      score: string;
      property: string;
      budget: string;
      propertyType: string;
      city: string;
      employee: string;
      createdAt: string;
      lastInteraction: string;
      status: string;
    };
    filters: {
      allStatuses: string;
      allSources: string;
      allEmployees: string;
      allCities: string;
      allClassifications: string;
      allScores: string;
    };
    scoring: {
      title: string;
      outOf: string;
      tiers: {
        high: string;
        medium: string;
        low: string;
      };
      factors: {
        classification: string;
        financial: string;
        timing: string;
        visits: string;
        engagement: string;
      };
    };
    bulk: {
      assignEmployee: string;
      changeStatus: string;
      exportSelected: string;
      deleteSelected: string;
    };
    profile: {
      title: string;
      personalInfo: string;
      contactDetails: string;
      preferences: string;
      interestedProperty: string;
      assignedEmployee: string;
      internalNotes: string;
      addNotePlaceholder: string;
      addNoteBtn: string;
      scheduleFollowup: string;
      followupDate: string;
      saveFollowup: string;
      appointmentHistory: string;
      conversationHistory: string;
      activityTimeline: string;
      bookVisitBtn: string;
      openChatBtn: string;
    };
    form: {
      name: string;
      phone: string;
      email: string;
      source: string;
      contactMethod: string;
      paymentMethod: string;
      bedrooms: string;
      deliveryStatus: string;
      desiredArea: string;
      classification: string;
      propertyType: string;
      transactionType: string;
      budget: string;
      city: string;
      district: string;
      interestedProperty: string;
      assignedEmployee: string;
      status: string;
      preferences: string;
      selectProperty: string;
      intentTitle: string;
      intentBuy: string;
      intentBuyDesc: string;
      intentRent: string;
      intentRentDesc: string;
      intentSell: string;
      intentSellDesc: string;
      intentRentOut: string;
      intentRentOutDesc: string;
      sectionClientInfo: string;
      sectionRequestSpecs: string;
      sectionOfferedProperty: string;
      sectionFollowup: string;
      askingSalePrice: string;
      askingRentPrice: string;
      offeredArea: string;
      offeredBedrooms: string;
      validationRequired: string;
      validationPhone: string;
      validationBudget: string;
    };
  };
  pipeline: {
    title: string;
    subtitle: string;
    tabs: {
      all: string;
      sale: string;
      rent: string;
    };
    stages: {
      new: string;
      visit_scheduled: string;
      visited: string;
      no_show: string;
      follow_up: string;
      closed_won: string;
      closed_lost: string;
    };
    indicators: {
      totalPipelineValue: string;
      conversionRate: string;
      visitAttendanceRate: string;
      avgDealBudget: string;
    };
    moveToStage: string;
    quickNote: string;
    bookVisit: string;
    openProfile: string;
    dragHint: string;
    emptyStage: string;
    smartFilter: {
      title: string;
      matchingCount: string;
      presets: {
        all: string;
        high_score: string;
        hot_vip: string;
        cash_buyers: string;
        needs_followup: string;
        closing_soon: string;
      };
      sortLabel: string;
      sortOptions: {
        default: string;
        score_desc: string;
        budget_desc: string;
        recent: string;
      };
    };
  };
  properties: {
    title: string;
    subtitle: string;
    addProperty: string;
    editProperty: string;
    deleteProperty: string;
    deleteConfirm: string;
    gridView: string;
    tableView: string;
    refPrefix: string;
    bedrooms: string;
    bathrooms: string;
    area: string;
    views: string;
    tabs: {
      all: string;
      sale: string;
      rent: string;
    };
    stats: {
      total: string;
      available: string;
      forSale: string;
      forRent: string;
      reserved: string;
      closed: string;
    };
    filters: {
      allTypes: string;
      allTransactions: string;
      allStatuses: string;
      allCities: string;
      maxPrice: string;
    };
    details: {
      title: string;
      gallery: string;
      description: string;
      location: string;
      specifications: string;
      ownerInfo: string;
      assignedEmployee: string;
      interestedLeads: string;
      relatedAppointments: string;
      internalNotes: string;
      addNotePlaceholder: string;
      changeStatus: string;
      noInterestedLeads: string;
      noAppointments: string;
    };
    form: {
      title: string;
      ref: string;
      type: string;
      transactionType: string;
      price: string;
      city: string;
      district: string;
      address: string;
      area: string;
      bedrooms: string;
      bathrooms: string;
      status: string;
      ownerSelect: string;
      ownerName: string;
      ownerPhone: string;
      assignedEmployee: string;
      description: string;
      images: string;
      uploadImageLabel: string;
      selectPresetImages: string;
    };
  };
  owners: {
    title: string;
    subtitle: string;
    addOwner: string;
    editOwner: string;
    deleteOwner: string;
    deleteConfirm: string;
    stats: {
      totalOwners: string;
      totalPropertiesLinked: string;
      ownersForSale: string;
      ownersForRent: string;
      investorsCount: string;
    };
    columns: {
      name: string;
      phone: string;
      email: string;
      city: string;
      ownerType: string;
      preferredContact: string;
      propertiesCount: string;
      commissionRate: string;
      nationalId: string;
    };
    filters: {
      allTypes: string;
      allCities: string;
    };
    profile: {
      title: string;
      contactAndDetails: string;
      ownedProperties: string;
      noProperties: string;
      notes: string;
    };
    form: {
      name: string;
      phone: string;
      email: string;
      city: string;
      ownerType: string;
      preferredContact: string;
      commissionRate: string;
      nationalId: string;
      notes: string;
    };
  };
  appointments: {
    title: string;
    subtitle: string;
    newAppointment: string;
    editAppointment: string;
    rescheduleAppointment: string;
    cancelAppointment: string;
    cancelConfirm: string;
    views: {
      table: string;
      daily: string;
      weekly: string;
      monthly: string;
    };
    stats: {
      total: string;
      upcoming: string;
      completed: string;
      attended: string;
      noShow: string;
    };
    columns: {
      client: string;
      clientInfo: string;
      phone: string;
      property: string;
      day: string;
      date: string;
      time: string;
      area: string;
      city: string;
      budget: string;
      employee: string;
      type: string;
      status: string;
      notes: string;
    };
    form: {
      lead: string;
      property: string;
      employee: string;
      date: string;
      time: string;
      type: string;
      status: string;
      notes: string;
    };
    quickActions: {
      confirm: string;
      markAttended: string;
      markNoShow: string;
      reschedule: string;
      cancel: string;
    };
    agenda: {
      today: string;
      workingHoursLabel: string;
      closedDayBanner: string;
      closedDayHint: string;
      configureHoursBtn: string;
      outsideHours: string;
      breakPeriod: string;
      blockedSlot: string;
      availableSlot: string;
      bookAtTime: string;
      disableHour: string;
      enableHour: string;
      openSlotsCount: string;
      bookedCount: string;
      blockedCount: string;
      addForDay: string;
      directWhatsapp: string;
      directCall: string;
      legendLabel: string;
      morningPeriod: string;
      afternoonPeriod: string;
      eveningPeriod: string;
      jumpToNearestApt: string;
      noAptsTodayHint: string;
    };
  };
  team: {
    title: string;
    subtitle: string;
    addEmployee: string;
    editEmployee: string;
    activeAccount: string;
    inactiveAccount: string;
    activate: string;
    deactivate: string;
    assignedLeadsCount: string;
    scheduledVisitsCount: string;
    completedVisitsCount: string;
    attendanceRate: string;
    successfulDealsCount: string;
    profile: {
      title: string;
      contactInfo: string;
      performance: string;
      permissions: string;
      recentActivities: string;
      assignedLeadsList: string;
    };
    permissionsLabels: {
      manage_leads: string;
      manage_properties: string;
      manage_appointments: string;
      view_reports: string;
      manage_team: string;
      manage_settings: string;
      export_data: string;
    };
    form: {
      name: string;
      phone: string;
      email: string;
      jobTitle: string;
      role: string;
      active: string;
    };
  };
  conversations: {
    title: string;
    subtitle: string;
    integrationBanner: string;
    unreadOnly: string;
    allChannels: string;
    markAsRead: string;
    replyPlaceholder: string;
    send: string;
    customerPanel: string;
    interestedProperty: string;
    leadStatus: string;
    assignedEmployee: string;
    internalNotes: string;
    openFullProfile: string;
    bookVisit: string;
    noConversationSelected: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    unreadCount: string;
    markAllRead: string;
    markRead: string;
    unreadOnly: string;
    openRelated: string;
    emptyTitle: string;
  };
  ads: {
    title: string;
    subtitle: string;
    demoWarning: string;
    kpis: {
      totalSpend: string;
      totalLeads: string;
      cpl: string;
      qualifiedLeads: string;
      appointments: string;
      costPerAppointment: string;
      visits: string;
      attributedSales: string;
      conversionRate: string;
    };
    charts: {
      leadsByCampaign: string;
      leadsByPlatform: string;
      dailyTrends: string;
      spendAndCpl: string;
    };
    table: {
      campaignName: string;
      platform: string;
      budget: string;
      spend: string;
      leads: string;
      appointments: string;
      cpl: string;
      status: string;
    };
    campaignStatuses: {
      active: string;
      paused: string;
      completed: string;
    };
  };
  reports: {
    title: string;
    subtitle: string;
    timeFilter: {
      label: string;
      today: string;
      thisWeek: string;
      thisMonth: string;
      thisYear: string;
      all: string;
      custom: string;
      from: string;
      to: string;
    };
    tabs: {
      leads: string;
      appointments: string;
      properties: string;
      team: string;
      sales: string;
      ads: string;
    };
    leadsSection: {
      totalLeads: string;
      newLeads: string;
      conversionRate: string;
      byPropertyType: string;
      byDesiredCity: string;
      buyersCount: string;
      rentersCount: string;
      ownersCount: string;
      ownersSellCount: string;
      ownersRentOutCount: string;
      noLeadsInPeriod: string;
    };
    appointmentsSection: {
      total: string;
      completed: string;
      attendanceRate: string;
      absenceRate: string;
      closingRate: string;
      outcomeBreakdown: string;
      closedDealsFromVisits: string;
      attendedNoDeal: string;
      noShowLabel: string;
      pendingExcludedLabel: string;
      pendingExcludedNote: string;
      noCompletedVisits: string;
    };
    propertiesSection: {
      available: string;
      sold: string;
      rented: string;
      activeDemandCount: string;
      mostRequestedTypes: string;
      mostRequestedTableTitle: string;
      mostRequestedArea: string;
      areaRange: string;
      mostRequestedBudget: string;
      budgetRange: string;
      demandCount: string;
      singleSample: string;
      insufficientData: string;
      noDemandInPeriod: string;
    };
    teamSection: {
      employee: string;
      leadsHandled: string;
      appointments: string;
      visitsCompleted: string;
      attendanceRate: string;
      successfulDeals: string;
      lostDeals: string;
      conversionRate: string;
      financialPerformance: string;
      resetOverrides: string;
      editMetricsHint: string;
      manualOverrideBadge: string;
      autoComputedBadge: string;
      financialOverrideLabel: string;
      monthlyTeamFinancial: string;
    };
    salesSection: {
      successfulTransactions: string;
      totalRevenue: string;
      monthlyPerformance: string;
      conversionRate: string;
      monthlyLegendRevenue: string;
      monthlyLegendDeals: string;
      noClosedDealsInPeriod: string;
    };
    adsSection: {
      totalSpend: string;
      adLeads: string;
      cpl: string;
      qualifiedLeads: string;
      appointmentsGenerated: string;
      crmAdLeads: string;
      spendAndCplTitle: string;
      campaignBreakdown: string;
      periodComparison: string;
      vsPreviousLabel: string;
      noAdDataInPeriod: string;
    };
  };
  settings: {
    title: string;
    subtitle: string;
    tabs: {
      agency: string;
      identity: string;
      hours: string;
      appointments: string;
      notifications: string;
      localization: string;
      permissions: string;
      security: string;
    };
    agencyForm: {
      name: string;
      tagline: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      website: string;
      description: string;
      saveSuccess: string;
    };
    identityForm: {
      adminControlNotice: string;
      colorPresets: string;
      primaryColor: string;
      secondaryColor: string;
      logoUrl: string;
      uploadLogo: string;
      livePreview: string;
      previewCardTitle: string;
      previewButton: string;
    };
    hoursForm: {
      day: string;
      status: string;
      open: string;
      close: string;
      breakTime: string;
      hasBreak: string;
      noBreak: string;
      weeklySummary: string;
      activeDaysCount: string;
      weeklyHoursTotal: string;
      hoursUnit: string;
      copyMonToAll: string;
      copiedToast: string;
      hourlySlotsTitle: string;
      hourlySlotsHint: string;
      slotOpen: string;
      slotBreak: string;
      slotRemoved: string;
      excludedPeriodsTitle: string;
      addExcludedPeriod: string;
      periodStart: string;
      periodEnd: string;
      periodReason: string;
      periodReasonPlaceholder: string;
      removePeriod: string;
      holidays: string;
      openLabel: string;
      closedLabel: string;
      closedDayHint: string;
      quickTemplatesLabel: string;
      presetStandard: string;
      presetContinuous: string;
      presetWeekdays: string;
      presetAppliedToast: string;
      manageSlotsBtn: string;
      hideSlotsBtn: string;
      quickBreakPreset: string;
    };
    appointmentsForm: {
      duration: string;
      minutes: string;
      bookingWindowStart: string;
      bookingWindowEnd: string;
      autoConfirm: string;
      rescheduleLimit: string;
      hoursBefore: string;
      visitReminders: string;
    };
    notificationsForm: {
      newLead: string;
      appointments: string;
      attendance: string;
      teamActivity: string;
      emailDigest: string;
    };
    localizationForm: {
      language: string;
      timezone: string;
      dateFormat: string;
      currency: string;
      currencyNote: string;
    };
    securityForm: {
      accountInfo: string;
      changePassword: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      updatePassword: string;
      passwordMismatch: string;
      passwordUpdated: string;
      twoFactor: string;
      activeSessions: string;
      terminateSession: string;
      currentSessionBadge: string;
    };
  };
  toasts: {
    saved: string;
    leadAdded: string;
    leadUpdated: string;
    leadDeleted: string;
    propertyAdded: string;
    propertyUpdated: string;
    propertyDeleted: string;
    ownerAdded: string;
    ownerUpdated: string;
    ownerDeleted: string;
    appointmentCreated: string;
    appointmentUpdated: string;
    employeeAdded: string;
    employeeUpdated: string;
    messageSent: string;
    exported: string;
    noteAdded: string;
    statusUpdated: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  ar: {
    app: {
      dir: 'rtl',
      demoBadge: 'بيانات تجريبية للعرض',
      platformAttribution: 'مدعوم ببنية IBONDA العقارية',
      searchPlaceholder: 'ابحث عن عميل، عقار، مالك، رقم مرجعي، أو مستشار...',
      noSearchResults: 'لا توجد نتائج مطابقة للبحث.',
      logout: 'تسجيل الخروج',
      logoutConfirmTitle: 'تأكيد تسجيل الخروج',
      logoutConfirmDesc: 'هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة تحكم الوكالة؟ (في وضع العرض التوضيحي سيتم إعادة تحميل الجلسة).',
      logoutSuccess: 'تم تسجيل الخروج بنجاح',
      collapseSidebar: 'طي القائمة الجانبية',
      expandSidebar: 'توسيع القائمة الجانبية',
      notificationsShortcut: 'الإشعارات',
      profileMenu: 'حساب المستخدم',
      viewAll: 'عرض الكل',
      save: 'حفظ التغييرات',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      close: 'إغلاق',
      confirm: 'تأكيد',
      reset: 'إعادة تعيين',
      apply: 'تطبيق',
      exportCsv: 'تصدير CSV',
      exportExcel: 'تصدير Excel',
      exportPdf: 'تصدير PDF',
      loading: 'جارٍ التحميل...',
      noData: 'لا توجد بيانات متاحة حالياً',
      actions: 'الإجراءات',
      all: 'الكل',
      search: 'بحث',
      filter: 'تصفية',
      sortBy: 'ترتيب حسب',
      previous: 'السابق',
      next: 'التالي',
      showing: 'عرض',
      of: 'من أصل',
      items: 'عنصر',
      currencyCode: 'د.م',
      sqm: 'م²',
      perMonth: '/ شهر',
      requiredField: 'يرجى تعبئة جميع الحقول الإلزامية',
      selectedCount: 'تم تحديد',
      clearSelection: 'إلغاء التحديد',
      demoDataNotice: 'تنبيه: الأرقام المعروضة هي بيانات تجريبية لأغراض العرض والتجربة قبل الربط الفعلي بقاعدة البيانات.',
    },
    nav: {
      overview: 'نظرة عامة',
      leads: 'العملاء المحتملون',
      pipeline: 'مسار المبيعات',
      properties: 'العقارات والمخزون العقاري',
      owners: 'ملاك العقارات',
      appointments: 'المواعيد والمعاينات',
      team: 'فريق العمل',
      conversations: 'المحادثات والتواصل',
      notifications: 'الإشعارات',
      ads: 'تحليل الإعلانات',
      reports: 'التقارير والتحليلات',
      settings: 'إعدادات الوكالة',
    },
    navShortDesc: {
      overview: 'الملخص التنفيذي ومؤشرات الأداء اليومية للوكالة',
      leads: 'إدارة قاعدة بيانات المشترين والمستأجرين وتصنيفهم بدقة',
      pipeline: 'تتبع مراحل صفقات البيع والكراء بنظام كانبان التفاعلي',
      properties: 'إدارة المحفظة العقارية والوحدات المتاحة للبيع والكراء',
      owners: 'إدارة ملفات ملاك العقارات، العمولات، والعقارات المرتبطة بهم',
      appointments: 'جدولة المعاينات الميدانية ومتابعة نسبة الحضور',
      team: 'إدارة المستشارين العقاريين والصلاحيات ومؤشرات الإنجاز',
      conversations: 'صندوق الوارد الموحد لاستفسارات العملاء عبر القنوات',
      notifications: 'سجل التنبيهات الفورية للمواعيد والعملاء والعقارات',
      ads: 'قياس عائد الحملات الإعلانية وتكلفة العميل والمعاينة',
      reports: 'تقارير إدارية مفصلة قابلة للتصدير بصيغة PDF و Excel',
      settings: 'إعدادات الوكالة والتحكم الإداري في الهوية البصرية والأمان',
    },
    languages: {
      ar: 'العربية',
      en: 'English',
      fr: 'Français',
    },
    leadStatuses: {
      new: 'جديد',
      visit_scheduled: 'تمت جدولة المعاينة',
      visited: 'حضر المعاينة',
      no_show: 'لم يحضر المعاينة',
      follow_up: 'قيد المتابعة',
      closed_won: 'صفقة ناجحة',
      not_interested: 'غير مهتم',
      closed_lost: 'صفقة غير مكتملة',
    },
    leadSources: {
      facebook_ads: 'إعلانات فيسبوك',
      instagram_ads: 'إعلانات إنستغرام',
      google_ads: 'إعلانات جوجل',
      whatsapp: 'واتساب المباشر',
      website: 'الموقع الإلكتروني',
      referral: 'توصية عميل',
      walk_in: 'زيارة الوكالة',
    },
    contactMethods: {
      whatsapp: 'واتساب',
      phone_call: 'مكالمة هاتفية',
    },
    paymentMethods: {
      cash: 'نقداً (Cash)',
      credit: 'تمويل بنكي / قرض',
    },
    deliveryStatuses: {
      off_plan: 'قيد الإنشاء (على المخطط)',
      ready: 'جاهز للسكن',
    },
    leadClassifications: {
      vip: 'VIP (أولوية قصوى)',
      hot: 'VIP',
      warm: 'دافئ (Warm)',
      cold: 'بارد (Cold)',
    },
    ownerTypes: {
      individual: 'مالك فردي',
      investor: 'مستثمر عقاري',
      developer: 'منعش / مطور عقاري',
      company: 'شركة / مؤسسة',
    },
    propertyTypes: {
      apartment: 'شقة',
      villa: 'فيلا',
      house: 'منزل',
      land: 'أرض',
      commercial: 'محل تجاري',
      office: 'مكتب',
      other: 'عقار آخر',
    },
    transactionTypes: {
      sale: 'بيع',
      rent: 'كراء',
      sell: 'بيع عقار',
      rent_out: 'كراء عقار (مالك)',
    },
    propertyStatuses: {
      available: 'متاح',
      reserved: 'محجوز',
      sold: 'تم البيع',
      rented: 'تم الكراء',
      unavailable: 'غير متاح',
    },
    appointmentStatuses: {
      scheduled: 'مجدولة',
      confirmed: 'مؤكدة',
      attended: 'حضر العميل',
      no_show: 'لم يحضر العميل',
      cancelled: 'أُلغيت',
      rescheduled: 'أُعيدت جدولتها',
    },
    appointmentTypes: {
      in_person_visit: 'معاينة ميدانية',
      office_meeting: 'اجتماع في الوكالة',
      virtual_tour: 'جولة افتراضية',
      contract_signing: 'توقيع العقد',
    },
    employeeRoles: {
      agency_manager: 'مدير الوكالة',
      sales_manager: 'مسؤول المبيعات',
      real_estate_advisor: 'مستشار عقاري',
      receptionist: 'موظف استقبال',
      custom: 'دور مخصص',
    },
    channels: {
      whatsapp: 'واتساب',
      instagram: 'إنستغرام',
      facebook: 'فيسبوك',
      website: 'الموقع الإلكتروني',
      other: 'مصادر أخرى',
    },
    notificationCategories: {
      new_lead: 'عميل جديد',
      new_appointment: 'موعد جديد',
      upcoming_visit: 'اقتراب موعد معاينة',
      appointment_confirmed: 'تأكيد موعد',
      appointment_cancelled: 'إلغاء موعد',
      client_no_show: 'عدم حضور العميل',
      property_updated: 'تحديث حالة عقار',
      team_activity: 'نشاط أحد الموظفين',
      admin_alert: 'تنبيه إداري',
    },
    adPlatforms: {
      facebook_ads: 'Facebook Ads',
      instagram_ads: 'Instagram Ads',
      google_ads: 'Google Ads',
      other: 'مصادر أخرى',
    },
    days: {
      mon: 'الإثنين',
      tue: 'الثلاثاء',
      wed: 'الأربعاء',
      thu: 'الخميس',
      fri: 'الجمعة',
      sat: 'السبت',
      sun: 'الأحد',
    },
    overview: {
      title: 'نظرة عامة على أداء الوكالة',
      subtitle: 'متابعة فورية لمؤشرات العملاء المحتملين، المعاينات الميدانية، وحركة الصفقات العقارية',
      dateFilters: {
        today: 'اليوم',
        last7: 'آخر 7 أيام',
        last30: 'آخر 30 يوماً',
        thisMonth: 'هذا الشهر',
        custom: 'فترة مخصصة',
      },
      fromDate: 'من تاريخ',
      toDate: 'إلى تاريخ',
      vsPrevPeriod: 'مقارنة بالفترة السابقة',
      kpis: {
        totalLeads: 'إجمالي العملاء المحتملين',
        newLeads: 'العملاء الجدد',
        scheduledVisits: 'المعاينات المجدولة',
        completedVisits: 'المعاينات المكتملة',
        attendedClients: 'العملاء الذين حضروا المعاينة',
        noShowClients: 'العملاء الذين لم يحضروا',
        successfulDeals: 'الصفقات الناجحة',
        activeProperties: 'إجمالي العقارات النشطة',
        ownersRentingOut: 'ملاك يرغبون في الكراء',
      },
      charts: {
        acquisitionTitle: 'استقطاب العملاء المحتملين عبر الزمن',
        acquisitionSub: 'تطور عدد الاستفسارات اليومية خلال الفترة المختارة',
        visitsTitle: 'المواعيد والمعاينات العقارية',
        visitsSub: 'المعاينات المجدولة مقابل المنجزة أسبوعياً',
        attendanceTitle: 'نسبة الحضور مقابل الغياب',
        attendanceSub: 'تحليل التزام العملاء بمواعيد المعاينة',
        funnelTitle: 'مسار التحويل والمبيعات',
        funnelSub: 'معدل انتقال العملاء من الاستفسار إلى إتمام الصفقة',
        sourcesTitle: 'توزيع مصادر العملاء المحتملين',
        sourcesSub: 'نسبة مساهمة كل قناة في جلب العملاء',
        monthlyTitle: 'الأداء الشهري للوكالة',
        monthlySub: 'مقارنة بين العملاء الجدد والصفقات المغلقة شهرياً',
        attended: 'حضر المعاينة',
        absent: 'لم يحضر',
        scheduled: 'مجدولة',
        completed: 'مكتملة',
        leadsLabel: 'العملاء المحتملون',
        dealsLabel: 'الصفقات الناجحة',
      },
      widgets: {
        upcomingAppointments: 'المواعيد القادمة',
        latestLeads: 'أحدث العملاء المحتملين',
        recentActivity: 'نشاط فريق العمل الأخير',
        topProperties: 'أفضل العقارات أداءً',
        quickActions: 'إجراءات سريعة',
        importantNotifications: 'تنبيهات مهمة',
        newLeadBtn: 'إضافة عميل محتمل',
        newPropertyBtn: 'إضافة عقار جديد',
        newAppointmentBtn: 'جدولة معاينة',
        openReportsBtn: 'استعراض التقارير',
        viewsCount: 'مشاهدة',
        inquiriesCount: 'استفسار',
      },
    },
    leads: {
      title: 'إدارة العملاء المحتملين',
      subtitle: 'سجل منفصل ومنظم لراغبي الشراء وراغبي الكراء مع تصنيف الأولوية وتفاصيل الدفع والمساحة',
      addLead: 'إضافة عميل محتمل',
      editLead: 'تعديل بيانات العميل',
      deleteLead: 'حذف العميل',
      deleteConfirm: 'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.',
      emptyTitle: 'لا يوجد عملاء مطابقون لمعايير البحث',
      emptyDesc: 'جرب تغيير الفلاتر المختارة أو أضف عميلاً محتملاً جديداً للبدء.',
      tabs: {
        all: 'جميع العملاء',
        buyers: 'راغبون في الشراء',
        renters: 'راغبون في الكراء',
        sellers: 'ملاك يريدون البيع',
        landlordsRent: 'ملاك يرغبون في الكراء',
      },
      columns: {
        name: 'اسم العميل',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        source: 'مصدر العميل',
        contactMethod: 'التواصل المفضل',
        paymentMethod: 'طريقة الدفع',
        bedrooms: 'الغرف',
        deliveryStatus: 'حالة التسليم',
        desiredArea: 'المساحة المطلوبة',
        classification: 'التصنيف',
        score: 'تقييم العميل',
        property: 'العقار المهتم به',
        budget: 'الميزانية',
        propertyType: 'نوع العقار المطلوب',
        city: 'المدينة / المنطقة',
        employee: 'الموظف المسؤول',
        createdAt: 'تاريخ التسجيل',
        lastInteraction: 'آخر تفاعل',
        status: 'حالة العميل',
      },
      filters: {
        allStatuses: 'جميع الحالات',
        allSources: 'جميع المصادر',
        allEmployees: 'جميع الموظفين',
        allCities: 'جميع المدن المغربية',
        allClassifications: 'جميع التصنيفات',
        allScores: 'جميع التقييمات',
      },
      scoring: {
        title: 'مؤشر جاهزية وتقييم العميل',
        outOf: 'من 100',
        tiers: {
          high: 'أولوية قصوى',
          medium: 'جاهزية متوسطة',
          low: 'تفاعل منخفض',
        },
        factors: {
          classification: 'تصنيف الأولوية',
          financial: 'القدرة المالية / التفويض',
          timing: 'الجدية والآجال',
          visits: 'المعاينات والحضور',
          engagement: 'التواصل واكتمال الملف',
        },
      },
      bulk: {
        assignEmployee: 'تعيين لموظف',
        changeStatus: 'تغيير الحالة',
        exportSelected: 'تصدير المحدد',
        deleteSelected: 'حذف المحدد',
      },
      profile: {
        title: 'ملف العميل التفصيلي',
        personalInfo: 'المعلومات الشخصية',
        contactDetails: 'بيانات التواصل',
        preferences: 'تفضيلات العميل وملاحظات البحث',
        interestedProperty: 'العقار المهتم به',
        assignedEmployee: 'المستشار المسؤول',
        internalNotes: 'الملاحظات الداخلية',
        addNotePlaceholder: 'أضف ملاحظة داخلية حول مكالمة أو متطلبات العميل...',
        addNoteBtn: 'إضافة ملاحظة',
        scheduleFollowup: 'جدولة متابعة قادمة',
        followupDate: 'تاريخ المتابعة',
        saveFollowup: 'حفظ موعد المتابعة',
        appointmentHistory: 'سجل المواعيد والمعاينات',
        conversationHistory: 'سجل المحادثات',
        activityTimeline: 'الجدول الزمني لنشاط العميل',
        bookVisitBtn: 'جدولة معاينة',
        openChatBtn: 'فتح المحادثة',
      },
      form: {
        name: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        source: 'مصدر العميل',
        contactMethod: 'طريقة التواصل (واتساب / مكالمة)',
        paymentMethod: 'طريقة الدفع',
        bedrooms: 'عدد الغرف المطلوبة',
        deliveryStatus: 'جاهزية العقار',
        desiredArea: 'المساحة المطلوبة (م²)',
        classification: 'تصنيف العميل',
        propertyType: 'نوع العقار المطلوب',
        transactionType: 'نوع الطلب (شراء / كراء / بيع عقار)',
        budget: 'الميزانية التقديرية (د.م)',
        city: 'المدينة',
        district: 'الحي / المنطقة',
        interestedProperty: 'العقار المهتم به',
        assignedEmployee: 'الموظف المسؤول',
        status: 'الحالة',
        preferences: 'متطلبات وتفضيلات العميل',
        selectProperty: 'اختر عقاراً (اختياري)',
        intentTitle: 'تحديد صفة ونوع طلب العميل',
        intentBuy: 'زبون يرغب في شراء عقار',
        intentBuyDesc: 'يبحث عن عقار للشراء مع ميزانية وتمويل محددين',
        intentRent: 'زبون يرغب في كراء سكن',
        intentRentDesc: 'يبحث عن سكن أو مكتب للكراء الشهري',
        intentSell: 'مالك يرغب في بيع عقاره',
        intentSellDesc: 'صاحب عقار يعرض ممتلكاته للبيع عبر الوكالة',
        intentRentOut: 'مالك يرغب في كراء عقاره',
        intentRentOutDesc: 'صاحب عقار يعرض ممتلكاته للكراء الشهري',
        sectionClientInfo: 'البيانات الشخصية والتواصل',
        sectionRequestSpecs: 'مواصفات العقار المطلوب والميزانية',
        sectionOfferedProperty: 'مواصفات العقار المعروض والسعر المطلوب',
        sectionFollowup: 'المتابعة والمسؤول عن الملف',
        askingSalePrice: 'سعر البيع المطلوب (د.م)',
        askingRentPrice: 'سومة الكراء الشهرية المطلوبة (د.م)',
        offeredArea: 'مساحة العقار المعروض (م²)',
        offeredBedrooms: 'عدد الغرف بالعقار',
        validationRequired: 'هذا الحقل مطلوب',
        validationPhone: 'يرجى إدخال رقم هاتف مغربي أو دولي صحيح',
        validationBudget: 'يرجى إدخال قيمة صحيحة أكبر من 0',
      },
    },
    pipeline: {
      title: 'مسار المبيعات والكراء',
      subtitle: 'فصل كامل بين مسار صفقات الشراء ومسار صفقات الكراء مع أرقام واضحة وسحب وإفلات فوري',
      tabs: {
        all: 'المسار الشامل',
        sale: 'مسار الشراء (البيع)',
        rent: 'مسار الكراء',
      },
      stages: {
        new: 'عميل جديد',
        visit_scheduled: 'تمت جدولة المعاينة',
        visited: 'حضر المعاينة',
        no_show: 'لم يحضر المعاينة',
        follow_up: 'قيد التفاوض والمتابعة',
        closed_won: 'صفقة ناجحة',
        closed_lost: 'صفقة غير مكتملة',
      },
      indicators: {
        totalPipelineValue: 'إجمالي قيمة المسار النشط',
        conversionRate: 'معدل إغلاق الصفقات',
        visitAttendanceRate: 'نسبة حضور المعاينات',
        avgDealBudget: 'متوسط قيمة الطلب',
      },
      moveToStage: 'نقل إلى مرحلة',
      quickNote: 'ملاحظة سريعة',
      bookVisit: 'حجز معاينة',
      openProfile: 'فتح الملف',
      dragHint: 'اسحب البطاقة وأفلتها في المرحلة التالية أو اختر المرحلة من القائمة',
      emptyStage: 'لا يوجد عملاء في هذه المرحلة',
      smartFilter: {
        title: 'الفلتر الذكي للمسار',
        matchingCount: 'صفقة مطابقة',
        presets: {
          all: 'الكل',
          high_score: 'تقييم مرتفع (+80)',
          hot_vip: 'عملاء VIP وساخنون',
          cash_buyers: 'شراء نقدي',
          needs_followup: 'تحتاج متابعة عاجلة',
          closing_soon: 'قريبة من الإغلاق',
        },
        sortLabel: 'ترتيب البطاقات',
        sortOptions: {
          default: 'الترتيب الافتراضي',
          score_desc: 'الأعلى تقييماً أولاً',
          budget_desc: 'الأعلى ميزانية أولاً',
          recent: 'الأحدث تفاعلاً',
        },
      },
    },
    properties: {
      title: 'العقارات والمخزون العقاري',
      subtitle: 'إحصائيات واضحة لعدد العقارات مع فصل كامل بين عقارات البيع وعقارات الكراء',
      addProperty: 'إضافة عقار جديد',
      editProperty: 'تعديل بيانات العقار',
      deleteProperty: 'حذف العقار',
      deleteConfirm: 'هل أنت متأكد من حذف هذا العقار من المخزون؟',
      gridView: 'عرض شبكي',
      tableView: 'عرض جدولي',
      refPrefix: 'مرجع',
      bedrooms: 'غرف',
      bathrooms: 'حمامات',
      area: 'المساحة',
      views: 'المشاهدات',
      tabs: {
        all: 'جميع العقارات',
        sale: 'عقارات للبيع',
        rent: 'عقارات للكراء',
      },
      stats: {
        total: 'إجمالي العقارات',
        available: 'العقارات المتاحة',
        forSale: 'معروضة للبيع',
        forRent: 'معروضة للكراء',
        reserved: 'عقارات محجوزة',
        closed: 'مباعة / مؤجرة',
      },
      filters: {
        allTypes: 'جميع الأنواع',
        allTransactions: 'بيع وكراء',
        allStatuses: 'جميع الحالات',
        allCities: 'جميع المدن المغربية',
        maxPrice: 'الحد الأقصى للسعر',
      },
      details: {
        title: 'تفاصيل العقار',
        gallery: 'معرض الصور',
        description: 'الوصف التفصيلي',
        location: 'الموقع والعنوان',
        specifications: 'المواصفات والمساحة',
        ownerInfo: 'بيانات المالك',
        assignedEmployee: 'المستشار المسؤول',
        interestedLeads: 'العملاء المهتمون',
        relatedAppointments: 'المعاينات المرتبطة',
        internalNotes: 'ملاحظات الفريق',
        addNotePlaceholder: 'أضف ملاحظة حول المفاتيح، المعاينة، أو التفاوض مع المالك...',
        changeStatus: 'تغيير حالة التوفر',
        noInterestedLeads: 'لا يوجد عملاء مرتبطون بهذا العقار حالياً.',
        noAppointments: 'لا توجد مواعيد معاينة مجدولة لهذا العقار.',
      },
      form: {
        title: 'عنوان العقار',
        ref: 'الرقم المرجعي',
        type: 'نوع العقار',
        transactionType: 'نوع المعاملة',
        price: 'السعر (د.م)',
        city: 'المدينة',
        district: 'الحي / المنطقة',
        address: 'العنوان التفصيلي',
        area: 'المساحة (م²)',
        bedrooms: 'عدد الغرف',
        bathrooms: 'عدد الحمامات',
        status: 'حالة العقار',
        ownerSelect: 'اختيار من قائمة ملاك العقار',
        ownerName: 'اسم المالك',
        ownerPhone: 'هاتف المالك',
        assignedEmployee: 'المستشار المسؤول',
        description: 'وصف العقار والمميزات',
        images: 'صور العقار',
        uploadImageLabel: 'رفع صورة من الجهاز',
        selectPresetImages: 'أو اختيار صورة جاهزة من الأرشيف',
      },
    },
    owners: {
      title: 'ملاك العقارات وخصائصهم',
      subtitle: 'قاعدة بيانات ملاك العقارات والمستثمرين والمنعشين، نسب العمولة، وطرق التواصل والعقارات المسجلة باسمهم',
      addOwner: 'إضافة مالك عقار',
      editOwner: 'تعديل بيانات المالك',
      deleteOwner: 'حذف المالك',
      deleteConfirm: 'هل أنت متأكد من حذف ملف هذا المالك؟',
      stats: {
        totalOwners: 'إجمالي ملاك العقارات',
        totalPropertiesLinked: 'العقارات المرتبطة',
        ownersForSale: 'ملاك عقارات للبيع',
        ownersForRent: 'ملاك عقارات للكراء',
        investorsCount: 'المستثمرون والمنعشون',
      },
      columns: {
        name: 'اسم المالك / الشركة',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        city: 'المدينة',
        ownerType: 'صفة المالك',
        preferredContact: 'التواصل المفضل',
        propertiesCount: 'عدد العقارات',
        commissionRate: 'نسبة العمولة',
        nationalId: 'المرجع / البطاقة',
      },
      filters: {
        allTypes: 'جميع الصفات',
        allCities: 'جميع المدن المغربية',
      },
      profile: {
        title: 'ملف المالك وعقاراته',
        contactAndDetails: 'البيانات والخصائص',
        ownedProperties: 'العقارات المسجلة لهذا المالك',
        noProperties: 'لا توجد عقارات مرتبطة بهذا المالك حالياً.',
        notes: 'ملاحظات وشروط المالك',
      },
      form: {
        name: 'الاسم الكامل / اسم الشركة',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        city: 'المدينة',
        ownerType: 'صفة المالك',
        preferredContact: 'طريقة التواصل المفضلة',
        commissionRate: 'نسبة العمولة المتفق عليها (%)',
        nationalId: 'رقم البطاقة الوطنية / السجل التجاري',
        notes: 'شروط المالك وملاحظات المفاتيح والتفاوض',
      },
    },
    appointments: {
      title: 'المواعيد والمعاينات',
      subtitle: 'تنظيم جدول المعاينات بالألوان التوضيحية مع عرض كامل لبيانات العميل وتصنيفه وطريقة تواصله',
      newAppointment: 'إنشاء موعد جديد',
      editAppointment: 'تعديل الموعد',
      rescheduleAppointment: 'إعادة جدولة الموعد',
      cancelAppointment: 'إلغاء الموعد',
      cancelConfirm: 'هل تريد تأكيد إلغاء هذا الموعد؟',
      views: {
        table: 'جدول المواعيد',
        daily: 'الجدول اليومي',
        weekly: 'التقويم الأسبوعي',
        monthly: 'التقويم الشهري',
      },
      stats: {
        total: 'إجمالي المعاينات',
        upcoming: 'المعاينات القادمة',
        completed: 'المعاينات المكتملة',
        attended: 'العملاء الذين حضروا',
        noShow: 'العملاء الذين لم يحضروا',
      },
      columns: {
        client: 'العميل',
        clientInfo: 'تفاصيل العميل والميزانية',
        phone: 'الهاتف',
        property: 'العقار',
        day: 'اليوم',
        date: 'التاريخ',
        time: 'التوقيت',
        area: 'المساحة',
        city: 'المدينة',
        budget: 'الميزانية',
        employee: 'الموظف المسؤول',
        type: 'نوع الموعد',
        status: 'حالة المعاينة',
        notes: 'ملاحظات',
      },
      form: {
        lead: 'اختر العميل',
        property: 'اختر العقار',
        employee: 'الموظف المكلف',
        date: 'التاريخ',
        time: 'الساعة',
        type: 'نوع الموعد',
        status: 'حالة الموعد',
        notes: 'ملاحظات إضافية',
      },
      quickActions: {
        confirm: 'تأكيد',
        markAttended: 'حضر',
        markNoShow: 'لم يحضر',
        reschedule: 'إعادة جدولة',
        cancel: 'إلغاء',
      },
      agenda: {
        today: 'اليوم',
        workingHoursLabel: 'أوقات العمل',
        closedDayBanner: 'يوم عطلة — الوكالة مغلقة في هذا اليوم',
        closedDayHint: 'يمكنك تعديل أيام العمل أو تفعيل هذا اليوم من إعدادات ساعات العمل.',
        configureHoursBtn: 'تعديل ساعات العمل',
        outsideHours: 'خارج أوقات الدوام',
        breakPeriod: 'فترة استراحة / توقف',
        blockedSlot: 'ساعة مستبعدة (غير متاحة للحجز)',
        availableSlot: 'وقت متاح للمعاينة',
        bookAtTime: 'حجز موعد في هذا التوقيت',
        disableHour: 'استبعاد هذا الوقت',
        enableHour: 'إعادة فتح الوقت',
        openSlotsCount: 'ساعات متاحة',
        bookedCount: 'مواعيد محجوزة',
        blockedCount: 'أوقات مستبعدة',
        addForDay: 'موعد جديد',
        directWhatsapp: 'مراسلة فورية عبر واتساب',
        directCall: 'اتصال هاتفي مباشر',
        legendLabel: 'دليل الألوان:',
        morningPeriod: 'الفترة الصباحية',
        afternoonPeriod: 'بعد الزوال',
        eveningPeriod: 'المساء',
        jumpToNearestApt: 'أقرب يوم به موعد',
        noAptsTodayHint: 'لا توجد مواعيد محجوزة في هذا اليوم — الساعات المفتوحة جاهزة للحجز.',
      },
    },
    team: {
      title: 'إدارة فريق العمل',
      subtitle: 'متابعة أداء المستشارين العقاريين، إدارة الصلاحيات، وتوزيع العملاء والعقارات',
      addEmployee: 'إضافة موظف جديد',
      editEmployee: 'تعديل بيانات الموظف',
      activeAccount: 'حساب نشط',
      inactiveAccount: 'حساب موقوف',
      activate: 'تفعيل الحساب',
      deactivate: 'إيقاف الحساب',
      assignedLeadsCount: 'العملاء المعينون',
      scheduledVisitsCount: 'المعاينات المجدولة',
      completedVisitsCount: 'المعاينات المنجزة',
      attendanceRate: 'نسبة حضور العملاء',
      successfulDealsCount: 'الصفقات الناجحة',
      profile: {
        title: 'ملف الموظف ومؤشرات الأداء',
        contactInfo: 'معلومات الاتصال والمنصب',
        performance: 'مؤشرات الأداء الميداني',
        permissions: 'صلاحيات الوصول',
        recentActivities: 'سجل النشاط الأخير',
        assignedLeadsList: 'العملاء المعينون لهذا الموظف',
      },
      permissionsLabels: {
        manage_leads: 'إدارة العملاء المحتملين',
        manage_properties: 'إدارة العقارات والمخزون',
        manage_appointments: 'إدارة المواعيد والمعاينات',
        view_reports: 'الاطلاع على التقارير والتحليلات',
        manage_team: 'إدارة فريق العمل',
        manage_settings: 'تعديل إعدادات الوكالة',
        export_data: 'تصدير البيانات والتقارير',
      },
      form: {
        name: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني المهني',
        jobTitle: 'المسمى الوظيفي',
        role: 'الدور والصلاحية',
        active: 'تفعيل الحساب مباشرة',
      },
    },
    conversations: {
      title: 'المحادثات والتواصل',
      subtitle: 'صندوق الوارد الموحد لرسائل العملاء عبر قنوات التواصل المختلفة',
      integrationBanner: 'واجهة جاهزة للربط مع واجهات برمجة التطبيقات (WhatsApp Business / Meta). الرسائل الحالية للعرض التوضيحي فقط.',
      unreadOnly: 'غير المقروءة فقط',
      allChannels: 'جميع القنوات',
      markAsRead: 'تحديد كمقروء',
      replyPlaceholder: 'اكتب ردك للعميل هنا...',
      send: 'إرسال',
      customerPanel: 'معلومات العميل والسياق',
      interestedProperty: 'العقار المهتم به',
      leadStatus: 'حالة العميل',
      assignedEmployee: 'المستشار المسؤول',
      internalNotes: 'ملاحظات سريعة',
      openFullProfile: 'فتح الملف الكامل للعميل',
      bookVisit: 'جدولة معاينة',
      noConversationSelected: 'اختر محادثة من القائمة لعرض التفاصيل',
    },
    notifications: {
      title: 'مركز الإشعارات',
      subtitle: 'تنبيهات فورية حول العملاء الجدد، المواعيد القادمة، تحديثات العقارات ونشاط الفريق',
      unreadCount: 'إشعارات غير مقروءة',
      markAllRead: 'تحديد الكل كمقروء',
      markRead: 'تحديد كمقروء',
      unreadOnly: 'غير المقروءة فقط',
      openRelated: 'الانتقال إلى التفاصيل',
      emptyTitle: 'لا توجد إشعارات مطابقة للتصفية الحالية',
    },
    ads: {
      title: 'تحليل الإعلانات والحملات التسويقية',
      subtitle: 'قياس فعالية الإنفاق الإعلاني، تكلفة العميل المحتمل، ومعدل التحويل إلى معاينات وصفقات',
      demoWarning: 'تنبيه مهم: جميع الأرقام والتكاليف الإعلانية المعروضة هنا هي بيانات تجريبية توضيحية إلى حين ربط حسابات Meta Ads و Google Ads الرسمية.',
      kpis: {
        totalSpend: 'إجمالي الإنفاق الإعلاني',
        totalLeads: 'العملاء الناتجون عن الإعلانات',
        cpl: 'تكلفة العميل الواحد (CPL)',
        qualifiedLeads: 'العملاء المؤهلون',
        appointments: 'المواعيد المحجوزة',
        costPerAppointment: 'تكلفة الموعد الواحد',
        visits: 'المعاينات المنفذة',
        attributedSales: 'الصفقات المنسوبة للحملات',
        conversionRate: 'معدل تحويل الحملات',
      },
      charts: {
        leadsByCampaign: 'العملاء حسب الحملة الإعلانية',
        leadsByPlatform: 'توزيع العملاء حسب المنصة',
        dailyTrends: 'التطور اليومي لاستقطاب العملاء',
        spendAndCpl: 'الإنفاق الإعلاني وتكلفة العميل',
      },
      table: {
        campaignName: 'اسم الحملة',
        platform: 'المنصة',
        budget: 'الميزانية المخصصة',
        spend: 'المبلغ المنفق',
        leads: 'العملاء',
        appointments: 'المواعيد',
        cpl: 'تكلفة العميل',
        status: 'حالة الحملة',
      },
      campaignStatuses: {
        active: 'نشطة',
        paused: 'متوقفة مؤقتاً',
        completed: 'مكتملة',
      },
    },
    reports: {
      title: 'التقارير والتحليلات المتقدمة',
      subtitle: 'تقارير تنفيذية شاملة جاهزة للاجتماعات الإدارية مع إمكانية التصدير إلى PDF',
      timeFilter: {
        label: 'الفترة الزمنية للتقارير',
        today: 'اليوم',
        thisWeek: 'هذا الأسبوع',
        thisMonth: 'هذا الشهر',
        thisYear: 'هذا العام',
        all: 'جميع الفترات',
        custom: 'فترة مخصصة',
        from: 'من تاريخ',
        to: 'إلى تاريخ',
      },
      tabs: {
        leads: 'تقارير العملاء',
        appointments: 'تقارير المواعيد',
        properties: 'تقارير العقارات',
        team: 'أداء الفريق',
        sales: 'تقارير المبيعات',
        ads: 'مصاريف الإعلانات',
      },
      leadsSection: {
        totalLeads: 'إجمالي العملاء المسجلين',
        newLeads: 'العملاء الجدد خلال الفترة',
        conversionRate: 'معدل التحويل الإجمالي',
        byPropertyType: 'توزيع العملاء حسب نوع العقار المطلوب',
        byDesiredCity: 'توزيع العملاء حسب المدن المطلوبة',
        buyersCount: 'راغبون في الشراء',
        rentersCount: 'راغبون في الكراء',
        ownersCount: 'ملاك عارضون (بيع / كراء)',
        ownersSellCount: 'ملاك عارضون للبيع',
        ownersRentOutCount: 'ملاك عارضون للكراء',
        noLeadsInPeriod: 'لا يوجد عملاء مسجلون خلال الفترة الزمنية المختارة.',
      },
      appointmentsSection: {
        total: 'إجمالي المواعيد',
        completed: 'المعاينات المكتملة',
        attendanceRate: 'نسبة الحضور',
        absenceRate: 'نسبة الغياب',
        closingRate: 'نسبة إغلاق الصفقات الناتجة عن المعاينات',
        outcomeBreakdown: 'نتائج المعاينات المكتملة والتحويل إلى صفقات',
        closedDealsFromVisits: 'معاينة حضرها العميل وأدت إلى صفقة ناجحة',
        attendedNoDeal: 'معاينة حضرها العميل ولم تؤد إلى صفقة',
        noShowLabel: 'معاينة انتهت بغياب العميل',
        pendingExcludedLabel: 'مواعيد قادمة / قيد الانتظار أو ملغاة (مستبعدة من النسب)',
        pendingExcludedNote: 'تُحتسب النسب بدقة انطلاقاً من المعاينات ذات النتيجة المكتملة فقط (حضور أو غياب)، ولا يُحتسب الموعد المستقبلي أو المعلق كناجح أو فاشل، دون تكرار احتساب نفس المعاينة.',
        noCompletedVisits: 'لا توجد معاينات بنتيجة مكتملة (حضور أو غياب) خلال هذه الفترة.',
      },
      propertiesSection: {
        available: 'عقارات متاحة',
        sold: 'عقارات مباعة',
        rented: 'عقارات مؤجرة',
        activeDemandCount: 'إجمالي طلبات العملاء',
        mostRequestedTypes: 'أنواع العقارات الأكثر طلباً من العملاء',
        mostRequestedTableTitle: 'تحليل المساحات والميزانيات حسب نوع العقار',
        mostRequestedArea: 'المساحة الأكثر طلباً',
        areaRange: 'نطاق المساحات المطلوبة',
        mostRequestedBudget: 'الميزانية الأكثر طلباً',
        budgetRange: 'نطاق الميزانية (د.م)',
        demandCount: 'عدد العملاء المهتمين',
        singleSample: 'بيانات محدودة (طلب واحد)',
        insufficientData: 'بيانات غير كافية',
        noDemandInPeriod: 'لا توجد طلبات عملاء كافية في هذه الفترة الزمنية لإنتاج تحليل دقيق.',
      },
      teamSection: {
        employee: 'الموظف',
        leadsHandled: 'العملاء',
        appointments: 'المعاينات',
        visitsCompleted: 'المعاينات المكتملة',
        attendanceRate: 'نسبة التحويل',
        successfulDeals: 'الصفقات الناجحة',
        lostDeals: 'الصفقات الضائعة',
        conversionRate: 'نسبة التحويل',
        financialPerformance: 'الأداء المالي',
        resetOverrides: 'استعادة القيم المحسوبة',
        editMetricsHint: 'الإحصائيات المرتبطة بالسجلات الفعلية محسوبة تلقائياً؛ يمكنك تعديل الأداء المالي المعتمد وحفظه يدوياً عند الحاجة.',
        manualOverrideBadge: 'معدل يدوياً',
        autoComputedBadge: 'محسوب من السجلات',
        financialOverrideLabel: 'تسوية الأداء المالي (د.م)',
        monthlyTeamFinancial: 'الأداء المالي الشهري للفريق',
      },
      salesSection: {
        successfulTransactions: 'الصفقات المكتملة',
        totalRevenue: 'حجم المعاملات المحقق',
        monthlyPerformance: 'الأداء المالي الشهري',
        conversionRate: 'نسبة إغلاق المبيعات',
        monthlyLegendRevenue: 'الإيرادات المحققة (د.م)',
        monthlyLegendDeals: 'عدد الصفقات الناجحة',
        noClosedDealsInPeriod: 'لا توجد صفقات ناجحة مسجلة خلال هذه الفترة الزمنية.',
      },
      adsSection: {
        totalSpend: 'مجموع مصاريف الإعلانات',
        adLeads: 'العملاء الناتجون عن الإعلانات',
        cpl: 'تكلفة الحصول على عميل (CPL)',
        qualifiedLeads: 'العملاء المؤهلون',
        appointmentsGenerated: 'المعاينات المحجوزة من الإعلانات',
        crmAdLeads: 'عملاء الإعلانات المسجلون بالنظام',
        spendAndCplTitle: 'مقارنة مصاريف الإعلانات وتكلفة العميل المحتمل',
        campaignBreakdown: 'تفصيل أداء الحملات الإعلانية خلال الفترة',
        periodComparison: 'مقارنة الأداء مع الفترة السابقة',
        vsPreviousLabel: 'تغير تكلفة العميل مقارنة بالفترة السابقة',
        noAdDataInPeriod: 'لا توجد حملات أو مصاريف إعلانية مسجلة ضمن الفترة الزمنية المختارة.',
      },
    },
    settings: {
      title: 'إعدادات الوكالة',
      subtitle: 'إدارة بيانات الوكالة، تحكم مدير المنصة في الهوية البصرية، ساعات العمل، قواعد المواعيد، الصلاحيات والأمان',
      tabs: {
        agency: 'معلومات الوكالة',
        identity: 'الهوية البصرية (تحكم الإدارة)',
        hours: 'ساعات العمل',
        appointments: 'إعدادات المواعيد',
        notifications: 'إعدادات الإشعارات',
        localization: 'اللغة والمنطقة',
        permissions: 'صلاحيات الفريق',
        security: 'الحساب والأمان',
      },
      agencyForm: {
        name: 'اسم الوكالة العقارية',
        tagline: 'الشعار الوصفي للوكالة',
        phone: 'رقم الهاتف الرسمي',
        email: 'البريد الإلكتروني للوكالة',
        address: 'العنوان الكامل',
        city: 'المدينة',
        website: 'الموقع الإلكتروني',
        description: 'نبذة عن نشاط الوكالة',
        saveSuccess: 'تم حفظ إعدادات الوكالة بنجاح',
      },
      identityForm: {
        adminControlNotice: 'إدارة الهوية البصرية تخضع لتحكم مدير المنصة / مالك النظام: يمكنك تحديد الألوان والشعار لكل وكالة بشكل مستقل من هنا.',
        colorPresets: 'قوالب ألوان متناسقة جاهزة',
        primaryColor: 'اللون الأساسي للوكالة',
        secondaryColor: 'اللون الثانوي (لون التمييز)',
        logoUrl: 'شعار الوكالة',
        uploadLogo: 'تغيير الشعار',
        livePreview: 'معاينة فورية لهوية الوكالة',
        previewCardTitle: 'بطاقة معاينة بهوية الوكالة المخصصة',
        previewButton: 'زر إجراء رئيسي',
      },
      hoursForm: {
        day: 'اليوم',
        status: 'الحالة',
        open: 'وقت الفتح',
        close: 'وقت الإغلاق',
        breakTime: 'فترة الاستراحة',
        hasBreak: 'فترة استراحة منتصف اليوم',
        noBreak: 'دوام مستمر بدون استراحة',
        weeklySummary: 'ملخص الدوام الأسبوعي',
        activeDaysCount: 'أيام العمل النشطة',
        weeklyHoursTotal: 'إجمالي ساعات الاستقبال المتاحة',
        hoursUnit: 'ساعة',
        copyMonToAll: 'تطبيق توقيت الإثنين على كل الأيام المفتوحة',
        copiedToast: 'تم تعميم جدول الإثنين على جميع أيام العمل النشطة',
        hourlySlotsTitle: 'التحكم في ساعات اليوم (اضغط لإلغاء أو استرجاع أي ساعة)',
        hourlySlotsHint: 'يمكنك إزالة أي ساعة وسط اليوم (مثل وقت الغداء أو الاجتماعات) لتصبح غير متاحة في الأجندة.',
        slotOpen: 'متاح',
        slotBreak: 'استراحة',
        slotRemoved: 'محذوف',
        excludedPeriodsTitle: 'فترات متقطعة مستبعدة وسط اليوم',
        addExcludedPeriod: 'استبعاد فترة',
        periodStart: 'من',
        periodEnd: 'إلى',
        periodReason: 'السبب (اختياري)',
        periodReasonPlaceholder: 'مثال: صلاة الجمعة، اجتماع الفريق...',
        removePeriod: 'حذف الفترة',
        holidays: 'العطل الرسمية والأيام المغلقة',
        openLabel: 'مفتوح',
        closedLabel: 'عطلة',
        closedDayHint: 'مغلق — لا يتم استقبال الحجوزات في هذا اليوم',
        quickTemplatesLabel: 'قوالب سريعة للدوام:',
        presetStandard: 'دوام قياسي (09:00–18:30)',
        presetContinuous: 'دوام مستمر (08:30–17:00)',
        presetWeekdays: 'الإثنين–الجمعة فقط',
        presetAppliedToast: 'تم تحديث جدول العمل وفق القالب المختار',
        manageSlotsBtn: 'تخصيص الساعات',
        hideSlotsBtn: 'إخفاء الساعات',
        quickBreakPreset: 'استراحة سريعة:',
      },
      appointmentsForm: {
        duration: 'مدة المعاينة الافتراضية',
        minutes: 'دقيقة',
        bookingWindowStart: 'بداية ساعات الحجز المتاحة',
        bookingWindowEnd: 'نهاية ساعات الحجز المتاحة',
        autoConfirm: 'تأكيد المواعيد تلقائياً عند الحجز',
        rescheduleLimit: 'الحد الأدنى لإعادة الجدولة قبل الموعد',
        hoursBefore: 'ساعات قبل الموعد',
        visitReminders: 'إرسال تذكيرات آلية قبل موعد المعاينة',
      },
      notificationsForm: {
        newLead: 'تنبيهات العملاء المحتملين الجدد',
        appointments: 'تنبيهات إنشاء وتعديل المواعيد',
        attendance: 'تنبيهات الحضور وعدم الحضور للمعاينة',
        teamActivity: 'تنبيهات نشاط المستشارين والفريق',
        emailDigest: 'ملخص يومي عبر البريد الإلكتروني',
      },
      localizationForm: {
        language: 'لغة الواجهة الافتراضية',
        timezone: 'المنطقة الزمنية',
        dateFormat: 'صيغة التاريخ',
        currency: 'العملة المعتمدة',
        currencyNote: 'الدرهم المغربي (MAD) هو العملة المعتمدة في كافة التقارير والأسعار.',
      },
      securityForm: {
        accountInfo: 'بيانات الحساب النشط',
        changePassword: 'تغيير كلمة المرور',
        currentPassword: 'كلمة المرور الحالية',
        newPassword: 'كلمة المرور الجديدة',
        confirmPassword: 'تأكيد كلمة المرور الجديدة',
        updatePassword: 'تحديث كلمة المرور',
        passwordMismatch: 'كلمتا المرور غير متطابقتين',
        passwordUpdated: 'تم تحديث كلمة المرور بنجاح (عرض توضيحي)',
        twoFactor: 'تفعيل المصادقة الثنائية (2FA)',
        activeSessions: 'الجلسات النشطة',
        terminateSession: 'إنهاء الجلسة',
        currentSessionBadge: 'الجلسة الحالية',
      },
    },
    toasts: {
      saved: 'تم الحفظ بنجاح',
      leadAdded: 'تمت إضافة العميل المحتمل بنجاح',
      leadUpdated: 'تم تحديث بيانات العميل',
      leadDeleted: 'تم حذف العميل من السجل',
      propertyAdded: 'تمت إضافة العقار إلى المخزون',
      propertyUpdated: 'تم تحديث بيانات العقار',
      propertyDeleted: 'تم حذف العقار',
      ownerAdded: 'تمت إضافة مالك العقار بنجاح',
      ownerUpdated: 'تم تحديث بيانات مالك العقار',
      ownerDeleted: 'تم حذف ملف المالك',
      appointmentCreated: 'تم إنشاء الموعد بنجاح',
      appointmentUpdated: 'تم تحديث حالة الموعد',
      employeeAdded: 'تمت إضافة عضو الفريق بنجاح',
      employeeUpdated: 'تم تحديث ملف الموظف',
      messageSent: 'تم إرسال الرسالة',
      exported: 'تم تصدير الملف بنجاح',
      noteAdded: 'تمت إضافة الملاحظة الداخلية',
      statusUpdated: 'تم تحديث الحالة بنجاح',
    },
  },

  en: {
    app: {
      dir: 'ltr',
      demoBadge: 'Demo Workspace',
      platformAttribution: 'IBONDA Real Estate Platform',
      searchPlaceholder: 'Search prospects, listings, owners, ref #, or advisors...',
      noSearchResults: 'No matching records found.',
      logout: 'Sign Out',
      logoutConfirmTitle: 'Confirm Sign Out',
      logoutConfirmDesc: 'Are you sure you want to sign out of this workspace? (In demo mode, the workspace resets to default.)',
      logoutSuccess: 'Signed out successfully',
      collapseSidebar: 'Collapse navigation',
      expandSidebar: 'Expand navigation',
      notificationsShortcut: 'Notifications',
      profileMenu: 'Account menu',
      viewAll: 'View all',
      save: 'Save Changes',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      reset: 'Reset',
      apply: 'Apply',
      exportCsv: 'Export CSV',
      exportExcel: 'Export Excel',
      exportPdf: 'Export PDF',
      loading: 'Loading...',
      noData: 'No records available',
      actions: 'Actions',
      all: 'All',
      search: 'Search',
      filter: 'Filter',
      sortBy: 'Sort by',
      previous: 'Previous',
      next: 'Next',
      showing: 'Showing',
      of: 'of',
      items: 'records',
      currencyCode: 'MAD',
      sqm: 'm²',
      perMonth: '/ mo',
      requiredField: 'Please complete all required fields',
      selectedCount: 'Selected',
      clearSelection: 'Clear selection',
      demoDataNotice: 'Note: Figures displayed are demonstration data until connected to a live production database.',
    },
    nav: {
      overview: 'Executive Overview',
      leads: 'Leads & Prospects',
      pipeline: 'Deal Pipeline',
      properties: 'Property Portfolio',
      owners: 'Property Owners',
      appointments: 'Viewings & Calendar',
      team: 'Advisors & Team',
      conversations: 'Inbox',
      notifications: 'Alerts',
      ads: 'Ad Attribution',
      reports: 'Analytics & Reports',
      settings: 'Agency Settings',
    },
    navShortDesc: {
      overview: 'Daily brokerage KPIs, viewing activity, and closing performance',
      leads: 'Segmented buyer, tenant, seller, and landlord pipelines with qualification details',
      pipeline: 'Visual Kanban deal tracking split by sales and leasing',
      properties: 'Active portfolio management, inventory metrics, and listing status',
      owners: 'Landlord & seller directory, commission terms, and linked assets',
      appointments: 'Property viewing schedule, attendance tracking, and client briefs',
      team: 'Advisor performance, account controls, and role-based permissions',
      conversations: 'Centralized omnichannel client messaging workspace',
      notifications: 'Real-time updates on inquiries, viewings, and portfolio changes',
      ads: 'Paid acquisition spend, cost per lead, and closed-deal attribution',
      reports: 'Executive brokerage reports ready for management review and PDF export',
      settings: 'Brokerage profile, visual branding, operating hours, and security',
    },
    languages: {
      ar: 'العربية',
      en: 'English',
      fr: 'Français',
    },
    leadStatuses: {
      new: 'New Inquiry',
      visit_scheduled: 'Viewing Booked',
      visited: 'Viewing Completed',
      no_show: 'No-Show',
      follow_up: 'In Negotiation',
      closed_won: 'Deal Closed',
      not_interested: 'Disqualified',
      closed_lost: 'Lost Deal',
    },
    leadSources: {
      facebook_ads: 'Meta Ads (Facebook)',
      instagram_ads: 'Meta Ads (Instagram)',
      google_ads: 'Google Ads',
      whatsapp: 'WhatsApp Direct',
      website: 'Website Inquiry',
      referral: 'Client Referral',
      walk_in: 'Walk-in',
    },
    contactMethods: {
      whatsapp: 'WhatsApp',
      phone_call: 'Phone Call',
    },
    paymentMethods: {
      cash: 'Cash',
      credit: 'Mortgage Financing',
    },
    deliveryStatuses: {
      off_plan: 'Off-Plan',
      ready: 'Move-In Ready',
    },
    leadClassifications: {
      vip: 'VIP',
      hot: 'VIP',
      warm: 'Warm',
      cold: 'Cold',
    },
    ownerTypes: {
      individual: 'Private Owner',
      investor: 'Private Investor',
      developer: 'Real Estate Developer',
      company: 'Corporate Entity',
    },
    propertyTypes: {
      apartment: 'Apartment',
      villa: 'Villa',
      house: 'Townhouse / Riad',
      land: 'Land Plot',
      commercial: 'Retail / Commercial',
      office: 'Office Space',
      other: 'Mixed-Use Asset',
    },
    transactionTypes: {
      sale: 'Sale',
      rent: 'Lease',
      sell: 'Seller Mandate',
      rent_out: 'Lease Mandate',
    },
    propertyStatuses: {
      available: 'Available',
      reserved: 'Under Offer',
      sold: 'Sold',
      rented: 'Leased',
      unavailable: 'Off-Market',
    },
    appointmentStatuses: {
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      attended: 'Completed',
      no_show: 'No-Show',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled',
    },
    appointmentTypes: {
      in_person_visit: 'On-Site Viewing',
      office_meeting: 'Office Consultation',
      virtual_tour: 'Virtual Tour',
      contract_signing: 'Contract Signing',
    },
    employeeRoles: {
      agency_manager: 'Managing Director',
      sales_manager: 'Head of Sales',
      real_estate_advisor: 'Property Advisor',
      receptionist: 'Front Desk Coordinator',
      custom: 'Custom Role',
    },
    channels: {
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      facebook: 'Facebook',
      website: 'Web Chat',
      other: 'Other Channels',
    },
    notificationCategories: {
      new_lead: 'New Lead',
      new_appointment: 'Viewing Booked',
      upcoming_visit: 'Upcoming Viewing',
      appointment_confirmed: 'Viewing Confirmed',
      appointment_cancelled: 'Viewing Cancelled',
      client_no_show: 'Client No-Show',
      property_updated: 'Listing Updated',
      team_activity: 'Team Activity',
      admin_alert: 'Management Alert',
    },
    adPlatforms: {
      facebook_ads: 'Facebook Ads',
      instagram_ads: 'Instagram Ads',
      google_ads: 'Google Ads',
      other: 'Partner Portals',
    },
    days: {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    },
    overview: {
      title: 'Brokerage Performance Overview',
      subtitle: 'Executive snapshot of inbound pipeline, scheduled viewings, and closed transactions',
      dateFilters: {
        today: 'Today',
        last7: 'Last 7 Days',
        last30: 'Last 30 Days',
        thisMonth: 'Month to Date',
        custom: 'Custom Range',
      },
      fromDate: 'From',
      toDate: 'To',
      vsPrevPeriod: 'vs. prior period',
      kpis: {
        totalLeads: 'Total Leads',
        newLeads: 'New Inquiries',
        scheduledVisits: 'Scheduled Viewings',
        completedVisits: 'Completed Viewings',
        attendedClients: 'Attended Viewings',
        noShowClients: 'No-Show Viewings',
        successfulDeals: 'Closed Deals',
        activeProperties: 'Active Listings',
        ownersRentingOut: 'Landlord Listings',
      },
      charts: {
        acquisitionTitle: 'Lead Acquisition Trend',
        acquisitionSub: 'Daily inbound inquiry volume over the selected period',
        visitsTitle: 'Viewings Volume',
        visitsSub: 'Weekly scheduled vs. completed property viewings',
        attendanceTitle: 'Viewing Attendance Rate',
        attendanceSub: 'Client show rate vs. no-shows across completed bookings',
        funnelTitle: 'Conversion Funnel',
        funnelSub: 'Pipeline progression from inquiry to closing',
        sourcesTitle: 'Lead Sources Mix',
        sourcesSub: 'Inbound share by acquisition channel',
        monthlyTitle: 'Monthly Brokerage Velocity',
        monthlySub: 'Monthly comparison of new leads vs. closed deals',
        attended: 'Attended',
        absent: 'No-Show',
        scheduled: 'Scheduled',
        completed: 'Completed',
        leadsLabel: 'Leads',
        dealsLabel: 'Closed Deals',
      },
      widgets: {
        upcomingAppointments: 'Upcoming Viewings',
        latestLeads: 'Latest Inquiries',
        recentActivity: 'Recent Team Activity',
        topProperties: 'Top Performing Listings',
        quickActions: 'Quick Actions',
        importantNotifications: 'Priority Alerts',
        newLeadBtn: 'Add Prospect',
        newPropertyBtn: 'Add Listing',
        newAppointmentBtn: 'Book Viewing',
        openReportsBtn: 'View Reports',
        viewsCount: 'views',
        inquiriesCount: 'inquiries',
      },
    },
    leads: {
      title: 'Prospects & Leads',
      subtitle: 'Segmented views for buyers, tenants, sellers, and landlords with qualification and budget criteria',
      addLead: 'Add Prospect',
      editLead: 'Edit Prospect',
      deleteLead: 'Delete Prospect',
      deleteConfirm: 'Are you sure you want to permanently remove this prospect?',
      emptyTitle: 'No prospects match your current filters',
      emptyDesc: 'Adjust your search filters or create a new prospect record.',
      tabs: {
        all: 'All Prospects',
        buyers: 'Buyers',
        renters: 'Tenants',
        sellers: 'Sellers',
        landlordsRent: 'Landlords',
      },
      columns: {
        name: 'Prospect',
        phone: 'Phone',
        email: 'Email',
        source: 'Source',
        contactMethod: 'Channel',
        paymentMethod: 'Financing',
        bedrooms: 'Beds',
        deliveryStatus: 'Readiness',
        desiredArea: 'Target Area',
        classification: 'Priority',
        score: 'Lead Score',
        property: 'Target Listing',
        budget: 'Budget',
        propertyType: 'Asset Type',
        city: 'City / District',
        employee: 'Advisor',
        createdAt: 'Created',
        lastInteraction: 'Last Activity',
        status: 'Stage',
      },
      filters: {
        allStatuses: 'All Stages',
        allSources: 'All Sources',
        allEmployees: 'All Advisors',
        allCities: 'All Cities',
        allClassifications: 'All Priorities',
        allScores: 'All Scores',
      },
      scoring: {
        title: 'Lead Readiness Score',
        outOf: 'of 100',
        tiers: {
          high: 'High Intent',
          medium: 'Qualified',
          low: 'Low Activity',
        },
        factors: {
          classification: 'Priority Tier',
          financial: 'Financing / Mandate',
          timing: 'Timeline Urgency',
          visits: 'Viewing Momentum',
          engagement: 'Engagement & Profile',
        },
      },
      bulk: {
        assignEmployee: 'Assign Advisor',
        changeStatus: 'Update Stage',
        exportSelected: 'Export Selected',
        deleteSelected: 'Delete Selected',
      },
      profile: {
        title: 'Prospect Dossier',
        personalInfo: 'Client Details',
        contactDetails: 'Contact Information',
        preferences: 'Search Criteria & Brief',
        interestedProperty: 'Linked Listing',
        assignedEmployee: 'Assigned Advisor',
        internalNotes: 'Internal Notes',
        addNotePlaceholder: 'Log call summary, client feedback, or next step...',
        addNoteBtn: 'Save Note',
        scheduleFollowup: 'Next Follow-up',
        followupDate: 'Follow-up Date',
        saveFollowup: 'Save Follow-up',
        appointmentHistory: 'Viewing History',
        conversationHistory: 'Message Thread',
        activityTimeline: 'Activity Log',
        bookVisitBtn: 'Book Viewing',
        openChatBtn: 'Open Thread',
      },
      form: {
        name: 'Full Name',
        phone: 'Phone Number',
        email: 'Email Address',
        source: 'Lead Source',
        contactMethod: 'Preferred Contact Channel',
        paymentMethod: 'Financing Method',
        bedrooms: 'Bedrooms',
        deliveryStatus: 'Property Readiness',
        desiredArea: 'Desired Area (m²)',
        classification: 'Priority Tier',
        propertyType: 'Property Type',
        transactionType: 'Transaction Intent',
        budget: 'Budget (MAD)',
        city: 'City',
        district: 'District / Neighborhood',
        interestedProperty: 'Matched Listing',
        assignedEmployee: 'Assigned Advisor',
        status: 'Pipeline Stage',
        preferences: 'Requirements & Notes',
        selectProperty: 'Link a listing (optional)',
        intentTitle: 'Select Client Profile & Transaction Intent',
        intentBuy: 'Prospective Buyer',
        intentBuyDesc: 'Looking to purchase a residential or commercial property',
        intentRent: 'Prospective Tenant',
        intentRentDesc: 'Looking for a long-term residential or corporate lease',
        intentSell: 'Seller Mandate',
        intentSellDesc: 'Property owner looking to sell an asset',
        intentRentOut: 'Landlord Mandate',
        intentRentOutDesc: 'Property owner offering an asset for lease',
        sectionClientInfo: 'Contact & Qualification',
        sectionRequestSpecs: 'Search Requirements & Budget',
        sectionOfferedProperty: 'Asset Details & Asking Price',
        sectionFollowup: 'Assignment & Stage',
        askingSalePrice: 'Asking Sale Price (MAD)',
        askingRentPrice: 'Asking Monthly Rent (MAD)',
        offeredArea: 'Built / Plot Area (m²)',
        offeredBedrooms: 'Rooms',
        validationRequired: 'This field is required',
        validationPhone: 'Enter a valid phone number',
        validationBudget: 'Enter an amount greater than 0',
      },
    },
    pipeline: {
      title: 'Deal Pipeline',
      subtitle: 'Kanban stage management separated across sales and leasing mandates',
      tabs: {
        all: 'All Deals',
        sale: 'Sales Pipeline',
        rent: 'Leasing Pipeline',
      },
      stages: {
        new: 'New Inquiry',
        visit_scheduled: 'Viewing Booked',
        visited: 'Viewing Done',
        no_show: 'No-Show',
        follow_up: 'Negotiation',
        closed_won: 'Closed Won',
        closed_lost: 'Closed Lost',
      },
      indicators: {
        totalPipelineValue: 'Active Pipeline Volume',
        conversionRate: 'Win Rate',
        visitAttendanceRate: 'Show Rate',
        avgDealBudget: 'Avg. Deal Size',
      },
      moveToStage: 'Move to stage',
      quickNote: 'Quick Note',
      bookVisit: 'Book Viewing',
      openProfile: 'Open Dossier',
      dragHint: 'Drag deal cards across columns or use the stage selector on each card',
      emptyStage: 'No deals in this stage',
      smartFilter: {
        title: 'Smart Pipeline Filter',
        matchingCount: 'matching deals',
        presets: {
          all: 'All Deals',
          high_score: 'Top Score (80+)',
          hot_vip: 'VIP & Hot',
          cash_buyers: 'Cash Buyers',
          needs_followup: 'Needs Follow-up',
          closing_soon: 'Closing Soon',
        },
        sortLabel: 'Sort Cards',
        sortOptions: {
          default: 'Default Order',
          score_desc: 'Highest Score First',
          budget_desc: 'Highest Value First',
          recent: 'Most Recent Activity',
        },
      },
    },
    properties: {
      title: 'Property Portfolio',
      subtitle: 'Full brokerage inventory with dedicated views for Sales and Leasing listings',
      addProperty: 'Add Listing',
      editProperty: 'Edit Listing',
      deleteProperty: 'Delete Listing',
      deleteConfirm: 'Are you sure you want to remove this listing from the portfolio?',
      gridView: 'Grid View',
      tableView: 'Table View',
      refPrefix: 'REF',
      bedrooms: 'Beds',
      bathrooms: 'Baths',
      area: 'Area',
      views: 'Views',
      tabs: {
        all: 'All Listings',
        sale: 'For Sale',
        rent: 'For Lease',
      },
      stats: {
        total: 'Total Portfolio',
        available: 'Available',
        forSale: 'For Sale',
        forRent: 'For Lease',
        reserved: 'Under Offer',
        closed: 'Sold / Leased',
      },
      filters: {
        allTypes: 'All Asset Types',
        allTransactions: 'Sale & Lease',
        allStatuses: 'All Statuses',
        allCities: 'All Cities',
        maxPrice: 'Max Price',
      },
      details: {
        title: 'Listing Dossier',
        gallery: 'Media Gallery',
        description: 'Property Overview',
        location: 'Location & District',
        specifications: 'Key Specifications',
        ownerInfo: 'Owner / Mandate',
        assignedEmployee: 'Listing Advisor',
        interestedLeads: 'Matched Prospects',
        relatedAppointments: 'Scheduled Viewings',
        internalNotes: 'Advisor Notes',
        addNotePlaceholder: 'Add key access details, owner feedback, or pricing notes...',
        changeStatus: 'Listing Status',
        noInterestedLeads: 'No prospects linked to this listing yet.',
        noAppointments: 'No viewings scheduled for this listing yet.',
      },
      form: {
        title: 'Listing Headline',
        ref: 'Reference Code',
        type: 'Asset Type',
        transactionType: 'Mandate Type',
        price: 'Asking Price (MAD)',
        city: 'City',
        district: 'District',
        address: 'Street Address',
        area: 'Area (m²)',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        status: 'Listing Status',
        ownerSelect: 'Select Existing Owner',
        ownerName: 'Owner Name',
        ownerPhone: 'Owner Phone',
        assignedEmployee: 'Listing Advisor',
        description: 'Property Description',
        images: 'Listing Photos',
        uploadImageLabel: 'Upload from device',
        selectPresetImages: 'Or choose from brokerage gallery',
      },
    },
    owners: {
      title: 'Property Owners',
      subtitle: 'Directory of private landlords, investors, and developers with commission agreements',
      addOwner: 'Add Owner',
      editOwner: 'Edit Owner',
      deleteOwner: 'Delete Owner',
      deleteConfirm: 'Are you sure you want to delete this owner record?',
      stats: {
        totalOwners: 'Total Owners',
        totalPropertiesLinked: 'Linked Listings',
        ownersForSale: 'Sellers',
        ownersForRent: 'Landlords',
        investorsCount: 'Investors & Developers',
      },
      columns: {
        name: 'Owner / Entity',
        phone: 'Phone',
        email: 'Email',
        city: 'City',
        ownerType: 'Segment',
        preferredContact: 'Channel',
        propertiesCount: 'Listings',
        commissionRate: 'Commission',
        nationalId: 'ID / Reg #',
      },
      filters: {
        allTypes: 'All Segments',
        allCities: 'All Cities',
      },
      profile: {
        title: 'Owner Dossier',
        contactAndDetails: 'Contact & Mandate Terms',
        ownedProperties: 'Linked Portfolio',
        noProperties: 'No listings linked to this owner.',
        notes: 'Access & Mandate Notes',
      },
      form: {
        name: 'Full Name / Entity',
        phone: 'Phone Number',
        email: 'Email Address',
        city: 'City',
        ownerType: 'Owner Segment',
        preferredContact: 'Preferred Contact Channel',
        commissionRate: 'Agreed Commission (%)',
        nationalId: 'National ID / Trade Register',
        notes: 'Key Access & Mandate Terms',
      },
    },
    appointments: {
      title: 'Viewings & Calendar',
      subtitle: 'Real-time viewing schedule with client qualification, property briefs, and attendance controls',
      newAppointment: 'Book Viewing',
      editAppointment: 'Edit Viewing',
      rescheduleAppointment: 'Reschedule Viewing',
      cancelAppointment: 'Cancel Viewing',
      cancelConfirm: 'Are you sure you want to cancel this viewing?',
      views: {
        table: 'Schedule List',
        daily: 'Daily Agenda',
        weekly: 'Weekly Calendar',
        monthly: 'Monthly Calendar',
      },
      stats: {
        total: 'Total Bookings',
        upcoming: 'Upcoming Viewings',
        completed: 'Completed Viewings',
        attended: 'Show-Ups',
        noShow: 'No-Shows',
      },
      columns: {
        client: 'Client',
        clientInfo: 'Client Brief & Budget',
        phone: 'Phone',
        property: 'Listing',
        day: 'Day',
        date: 'Date',
        time: 'Time',
        area: 'Area',
        city: 'City',
        budget: 'Budget',
        employee: 'Advisor',
        type: 'Format',
        status: 'Outcome',
        notes: 'Notes',
      },
      form: {
        lead: 'Client',
        property: 'Listing',
        employee: 'Advisor',
        date: 'Date',
        time: 'Time',
        type: 'Meeting Format',
        status: 'Status',
        notes: 'Briefing Notes',
      },
      quickActions: {
        confirm: 'Confirm',
        markAttended: 'Attended',
        markNoShow: 'No-Show',
        reschedule: 'Reschedule',
        cancel: 'Cancel',
      },
      agenda: {
        today: 'Today',
        workingHoursLabel: 'Office Hours',
        closedDayBanner: 'Closed Day — Brokerage is closed',
        closedDayHint: 'You can enable this day or adjust hours in Agency Settings.',
        configureHoursBtn: 'Edit Hours',
        outsideHours: 'Outside operating hours',
        breakPeriod: 'Midday Break / Unavailable',
        blockedSlot: 'Blocked slot',
        availableSlot: 'Available slot',
        bookAtTime: 'Book this slot',
        disableHour: 'Block slot',
        enableHour: 'Reopen slot',
        openSlotsCount: 'Open slots',
        bookedCount: 'Booked',
        blockedCount: 'Blocked / Break',
        addForDay: 'Book',
        directWhatsapp: 'Message on WhatsApp',
        directCall: 'Call client',
        legendLabel: 'Color Guide:',
        morningPeriod: 'Morning',
        afternoonPeriod: 'Afternoon',
        eveningPeriod: 'Evening',
        jumpToNearestApt: 'Nearest Booked Day',
        noAptsTodayHint: 'No viewings scheduled on this day — open slots are ready to book.',
      },
    },
    team: {
      title: 'Advisors & Team',
      subtitle: 'Manage brokerage advisors, individual KPIs, account status, and permissions',
      addEmployee: 'Add Team Member',
      editEmployee: 'Edit Profile',
      activeAccount: 'Active',
      inactiveAccount: 'Inactive',
      activate: 'Activate Account',
      deactivate: 'Deactivate Account',
      assignedLeadsCount: 'Assigned Leads',
      scheduledVisitsCount: 'Upcoming Viewings',
      completedVisitsCount: 'Completed Viewings',
      attendanceRate: 'Show Rate',
      successfulDealsCount: 'Closed Deals',
      profile: {
        title: 'Advisor Profile & KPIs',
        contactInfo: 'Role & Contact',
        performance: 'Performance Summary',
        permissions: 'Access Controls',
        recentActivities: 'Activity Log',
        assignedLeadsList: 'Active Portfolio Leads',
      },
      permissionsLabels: {
        manage_leads: 'Manage Prospects',
        manage_properties: 'Manage Listings',
        manage_appointments: 'Manage Calendar',
        view_reports: 'Access Analytics',
        manage_team: 'Manage Team',
        manage_settings: 'Agency Settings',
        export_data: 'Export Reports',
      },
      form: {
        name: 'Full Name',
        phone: 'Phone Number',
        email: 'Corporate Email',
        jobTitle: 'Job Title',
        role: 'Access Role',
        active: 'Active immediately',
      },
    },
    conversations: {
      title: 'Client Inbox',
      subtitle: 'Unified omnichannel inbox for WhatsApp, Meta, and website inquiries',
      integrationBanner: 'Ready for official WhatsApp Business & Meta Cloud API integration. Sample threads shown below.',
      unreadOnly: 'Unread Only',
      allChannels: 'All Channels',
      markAsRead: 'Mark Read',
      replyPlaceholder: 'Write a reply to the client...',
      send: 'Send',
      customerPanel: 'Client Context',
      interestedProperty: 'Target Listing',
      leadStatus: 'Pipeline Stage',
      assignedEmployee: 'Assigned Advisor',
      internalNotes: 'Internal Notes',
      openFullProfile: 'Open Full Dossier',
      bookVisit: 'Book Viewing',
      noConversationSelected: 'Select a thread to view messages',
    },
    notifications: {
      title: 'Alerts & Activity',
      subtitle: 'Real-time alerts across inbound leads, viewings, listings, and team updates',
      unreadCount: 'Unread Alerts',
      markAllRead: 'Mark All Read',
      markRead: 'Mark Read',
      unreadOnly: 'Unread Only',
      openRelated: 'Open Record',
      emptyTitle: 'No alerts match your filter',
    },
    ads: {
      title: 'Ad Attribution & ROI',
      subtitle: 'Track campaign spend, cost per lead, viewing volume, and closed-deal attribution',
      demoWarning: 'Note: Campaign figures are demonstration metrics until Meta Ads and Google Ads accounts are connected.',
      kpis: {
        totalSpend: 'Total Ad Spend',
        totalLeads: 'Paid Leads',
        cpl: 'Cost Per Lead (CPL)',
        qualifiedLeads: 'Qualified Leads',
        appointments: 'Booked Viewings',
        costPerAppointment: 'Cost Per Viewing',
        visits: 'Completed Viewings',
        attributedSales: 'Closed Deals',
        conversionRate: 'Lead-to-Close Rate',
      },
      charts: {
        leadsByCampaign: 'Leads by Campaign',
        leadsByPlatform: 'Share by Platform',
        dailyTrends: 'Daily Lead Velocity',
        spendAndCpl: 'Spend vs. CPL Trend',
      },
      table: {
        campaignName: 'Campaign',
        platform: 'Channel',
        budget: 'Budget',
        spend: 'Spend',
        leads: 'Leads',
        appointments: 'Viewings',
        cpl: 'CPL',
        status: 'Status',
      },
      campaignStatuses: {
        active: 'Active',
        paused: 'Paused',
        completed: 'Completed',
      },
    },
    reports: {
      title: 'Analytics & Executive Reports',
      subtitle: 'Management-ready brokerage reports with unified date filtering and PDF export',
      timeFilter: {
        label: 'Reporting Period',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        thisYear: 'Year to Date',
        all: 'All Time',
        custom: 'Custom Range',
        from: 'From',
        to: 'To',
      },
      tabs: {
        leads: 'Prospect Analytics',
        appointments: 'Viewing Analytics',
        properties: 'Portfolio Demand',
        team: 'Advisor Scorecards',
        sales: 'Closing Performance',
        ads: 'Ad Spend & CPL',
      },
      leadsSection: {
        totalLeads: 'Total Prospects',
        newLeads: 'New Inquiries',
        conversionRate: 'Closing Rate',
        byPropertyType: 'Demand by Asset Type',
        byDesiredCity: 'Demand by City',
        buyersCount: 'Buyers',
        rentersCount: 'Tenants',
        ownersCount: 'Property Owners',
        ownersSellCount: 'Sellers',
        ownersRentOutCount: 'Landlords',
        noLeadsInPeriod: 'No prospects recorded in the selected period.',
      },
      appointmentsSection: {
        total: 'Total Bookings',
        completed: 'Completed Viewings',
        attendanceRate: 'Show Rate',
        absenceRate: 'No-Show Rate',
        closingRate: 'Viewing-to-Close Rate',
        outcomeBreakdown: 'Viewing Outcomes & Closing Impact',
        closedDealsFromVisits: 'Completed viewing resulting in closed deal',
        attendedNoDeal: 'Completed viewing without closing yet',
        noShowLabel: 'Client no-show',
        pendingExcludedLabel: 'Pending / upcoming / cancelled bookings (excluded from rates)',
        pendingExcludedNote: 'Rates are calculated strictly from finalized viewings (Completed or No-Show). Pending or cancelled entries never skew performance rates.',
        noCompletedVisits: 'No finalized viewings recorded during this period.',
      },
      propertiesSection: {
        available: 'Available',
        sold: 'Sold',
        rented: 'Leased',
        activeDemandCount: 'Active Demand',
        mostRequestedTypes: 'Top Requested Asset Types',
        mostRequestedTableTitle: 'Target Area & Budget Benchmarks by Asset Type',
        mostRequestedArea: 'Modal Area',
        areaRange: 'Area Range',
        mostRequestedBudget: 'Modal Budget',
        budgetRange: 'Budget Range (MAD)',
        demandCount: 'Inquiries',
        singleSample: 'Single inquiry sample',
        insufficientData: 'Insufficient data',
        noDemandInPeriod: 'Not enough demand records in this period to benchmark.',
      },
      teamSection: {
        employee: 'Advisor',
        leadsHandled: 'Leads',
        appointments: 'Bookings',
        visitsCompleted: 'Completed Viewings',
        attendanceRate: 'Win Rate',
        successfulDeals: 'Closed Deals',
        lostDeals: 'Lost Deals',
        conversionRate: 'Win Rate',
        financialPerformance: 'Gross Deal Volume',
        resetOverrides: 'Reset Overrides',
        editMetricsHint: 'CRM activity metrics are computed automatically; realized financial figures can be adjusted manually when needed.',
        manualOverrideBadge: 'Adjusted',
        autoComputedBadge: 'Auto-computed',
        financialOverrideLabel: 'Adjusted Volume (MAD)',
        monthlyTeamFinancial: 'Monthly Team Revenue',
      },
      salesSection: {
        successfulTransactions: 'Closed Transactions',
        totalRevenue: 'Gross Transaction Volume',
        monthlyPerformance: 'Monthly Revenue',
        conversionRate: 'Closing Rate',
        monthlyLegendRevenue: 'Volume (MAD)',
        monthlyLegendDeals: 'Closed Deals',
        noClosedDealsInPeriod: 'No closed transactions in the selected period.',
      },
      adsSection: {
        totalSpend: 'Total Ad Spend',
        adLeads: 'Paid Leads',
        cpl: 'Cost Per Lead (CPL)',
        qualifiedLeads: 'Qualified Leads',
        appointmentsGenerated: 'Booked Viewings',
        crmAdLeads: 'CRM Attributed Leads',
        spendAndCplTitle: 'Ad Spend vs. CPL',
        campaignBreakdown: 'Campaign Performance Ledger',
        periodComparison: 'Period Comparison',
        vsPreviousLabel: 'CPL change vs. prior period',
        noAdDataInPeriod: 'No campaign spend recorded in the selected period.',
      },
    },
    settings: {
      title: 'Agency Settings',
      subtitle: 'Brokerage profile, visual identity, operating hours, scheduling rules, and access control',
      tabs: {
        agency: 'Brokerage Profile',
        identity: 'Brand Identity (Admin)',
        hours: 'Operating Hours',
        appointments: 'Booking Rules',
        notifications: 'Alert Rules',
        localization: 'Language & Locale',
        permissions: 'Access Matrix',
        security: 'Security & Sessions',
      },
      agencyForm: {
        name: 'Brokerage Name',
        tagline: 'Tagline',
        phone: 'Office Phone',
        email: 'Corporate Email',
        address: 'Office Address',
        city: 'City',
        website: 'Website',
        description: 'Agency Overview',
        saveSuccess: 'Brokerage settings saved',
      },
      identityForm: {
        adminControlNotice: 'Platform Admin Branding: Manage the agency’s primary palette, accent colors, and corporate logo.',
        colorPresets: 'Curated Palette Presets',
        primaryColor: 'Primary Brand Color',
        secondaryColor: 'Action Accent Color',
        logoUrl: 'Agency Logo',
        uploadLogo: 'Upload Logo',
        livePreview: 'Live Branding Preview',
        previewCardTitle: 'Sample Branded Card',
        previewButton: 'Primary CTA',
      },
      hoursForm: {
        day: 'Day',
        status: 'Status',
        open: 'Opens',
        close: 'Closes',
        breakTime: 'Break',
        hasBreak: 'Midday Break',
        noBreak: 'Continuous Hours',
        weeklySummary: 'Weekly Capacity',
        activeDaysCount: 'Open Days',
        weeklyHoursTotal: 'Weekly Operating Hours',
        hoursUnit: 'hrs',
        copyMonToAll: 'Copy Monday hours to all open days',
        copiedToast: 'Monday hours applied across open days',
        hourlySlotsTitle: 'Hourly Slot Control (Click to block or reopen)',
        hourlySlotsHint: 'Disable specific hours (lunch, team briefings) to block them from client scheduling.',
        slotOpen: 'Open',
        slotBreak: 'Break',
        slotRemoved: 'Blocked',
        excludedPeriodsTitle: 'Custom Blocked Periods',
        addExcludedPeriod: 'Add Blocked Range',
        periodStart: 'From',
        periodEnd: 'To',
        periodReason: 'Reason (optional)',
        periodReasonPlaceholder: 'e.g., Weekly briefing...',
        removePeriod: 'Remove',
        holidays: 'Public Holidays & Closures',
        openLabel: 'Open',
        closedLabel: 'Closed',
        closedDayHint: 'Closed — no client viewings accepted on this day',
        quickTemplatesLabel: 'Quick Schedule Presets:',
        presetStandard: 'Standard Split (09:00–18:30)',
        presetContinuous: 'Continuous (08:30–17:00)',
        presetWeekdays: 'Mon–Fri Only',
        presetAppliedToast: 'Schedule preset applied successfully',
        manageSlotsBtn: 'Customize Hours',
        hideSlotsBtn: 'Hide Slots',
        quickBreakPreset: 'Quick break:',
      },
      appointmentsForm: {
        duration: 'Default Viewing Duration',
        minutes: 'mins',
        bookingWindowStart: 'First Booking Slot',
        bookingWindowEnd: 'Last Booking Slot',
        autoConfirm: 'Auto-confirm new viewings',
        rescheduleLimit: 'Minimum reschedule notice',
        hoursBefore: 'hours prior',
        visitReminders: 'Send automated viewing reminders',
      },
      notificationsForm: {
        newLead: 'New prospect alerts',
        appointments: 'Viewing schedule updates',
        attendance: 'Attendance & no-show alerts',
        teamActivity: 'Advisor activity feed',
        emailDigest: 'Daily executive email digest',
      },
      localizationForm: {
        language: 'Interface Language',
        timezone: 'Time Zone',
        dateFormat: 'Date Format',
        currency: 'Reporting Currency',
        currencyNote: 'Moroccan Dirham (MAD) is standardized across all valuations and reports.',
      },
      securityForm: {
        accountInfo: 'Active Session Profile',
        changePassword: 'Update Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        updatePassword: 'Save Password',
        passwordMismatch: 'Passwords do not match',
        passwordUpdated: 'Password updated (demo mode)',
        twoFactor: 'Two-Factor Authentication (2FA)',
        activeSessions: 'Active Sessions',
        terminateSession: 'Revoke',
        currentSessionBadge: 'Current Session',
      },
    },
    toasts: {
      saved: 'Changes saved',
      leadAdded: 'Prospect added to pipeline',
      leadUpdated: 'Prospect updated',
      leadDeleted: 'Prospect deleted',
      propertyAdded: 'Listing added to portfolio',
      propertyUpdated: 'Listing updated',
      propertyDeleted: 'Listing removed',
      ownerAdded: 'Owner added to directory',
      ownerUpdated: 'Owner record updated',
      ownerDeleted: 'Owner deleted',
      appointmentCreated: 'Viewing booked',
      appointmentUpdated: 'Viewing updated',
      employeeAdded: 'Team member added',
      employeeUpdated: 'Advisor profile updated',
      messageSent: 'Reply sent',
      exported: 'Export ready',
      noteAdded: 'Note saved',
      statusUpdated: 'Stage updated',
    },
  },

  fr: {
    app: {
      dir: 'ltr',
      demoBadge: 'Environnement Démo',
      platformAttribution: 'Plateforme IBONDA Immobilier',
      searchPlaceholder: 'Rechercher un prospect, bien, propriétaire, réf. ou conseiller...',
      noSearchResults: 'Aucun résultat trouvé.',
      logout: 'Déconnexion',
      logoutConfirmTitle: 'Confirmer la déconnexion',
      logoutConfirmDesc: 'Souhaitez-vous quitter votre espace agence ? (En mode démo, les données initiales seront restaurées.)',
      logoutSuccess: 'Déconnexion réussie',
      collapseSidebar: 'Réduire le menu',
      expandSidebar: 'Déployer le menu',
      notificationsShortcut: 'Notifications',
      profileMenu: 'Profil utilisateur',
      viewAll: 'Tout afficher',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      close: 'Fermer',
      confirm: 'Confirmer',
      reset: 'Réinitialiser',
      apply: 'Appliquer',
      exportCsv: 'Exporter CSV',
      exportExcel: 'Exporter Excel',
      exportPdf: 'Exporter PDF',
      loading: 'Chargement...',
      noData: 'Aucune donnée disponible',
      actions: 'Actions',
      all: 'Tous',
      search: 'Rechercher',
      filter: 'Filtrer',
      sortBy: 'Trier par',
      previous: 'Précédent',
      next: 'Suivant',
      showing: 'Affichage de',
      of: 'sur',
      items: 'dossiers',
      currencyCode: 'MAD',
      sqm: 'm²',
      perMonth: '/ mois',
      requiredField: 'Veuillez renseigner les champs obligatoires',
      selectedCount: 'Sélectionnés',
      clearSelection: 'Désélectionner',
      demoDataNotice: 'Remarque : Les indicateurs affichés correspondent à un jeu de données de démonstration.',
    },
    nav: {
      overview: 'Tableau de bord',
      leads: 'Prospects & Leads',
      pipeline: 'Pipeline commercial',
      properties: 'Portefeuille biens',
      owners: 'Propriétaires',
      appointments: 'Visites & Agenda',
      team: 'Équipe commerciale',
      conversations: 'Messagerie',
      notifications: 'Alertes',
      ads: 'Performance Ads',
      reports: 'Rapports & KPIs',
      settings: 'Paramètres',
    },
    navShortDesc: {
      overview: 'Pilotage quotidien de l’activité commerciale et des visites',
      leads: 'Gestion segmentée acquéreurs, locataires, vendeurs et bailleurs',
      pipeline: 'Suivi Kanban des opportunités de vente et de location',
      properties: 'Gestion du portefeuille immobilier, mandats et disponibilités',
      owners: 'Répertoire des propriétaires, barèmes de commission et mandats',
      appointments: 'Agenda des visites, suivi d’assiduité et fiches clients',
      team: 'Suivi des conseillers, performances et habilitations',
      conversations: 'Messagerie centralisée multicanal',
      notifications: 'Alertes en temps réel sur les leads, visites et biens',
      ads: 'Pilotage des budgets média, CPL et retours sur investissement',
      reports: 'Tableaux de bord exécutifs exportables en PDF',
      settings: 'Configuration agence, charte graphique, horaires et sécurité',
    },
    languages: {
      ar: 'العربية',
      en: 'English',
      fr: 'Français',
    },
    leadStatuses: {
      new: 'Nouveau lead',
      visit_scheduled: 'Visite planifiée',
      visited: 'Visite effectuée',
      no_show: 'Absence visite',
      follow_up: 'En négociation',
      closed_won: 'Affaire conclue',
      not_interested: 'Non qualifié',
      closed_lost: 'Opportunité perdue',
    },
    leadSources: {
      facebook_ads: 'Meta Ads (Facebook)',
      instagram_ads: 'Meta Ads (Instagram)',
      google_ads: 'Google Ads',
      whatsapp: 'WhatsApp Direct',
      website: 'Site web agence',
      referral: 'Recommandation',
      walk_in: 'Passage agence',
    },
    contactMethods: {
      whatsapp: 'WhatsApp',
      phone_call: 'Appel téléphonique',
    },
    paymentMethods: {
      cash: 'Fonds propres',
      credit: 'Financement bancaire',
    },
    deliveryStatuses: {
      off_plan: 'VEFA / Sur plan',
      ready: 'Livré / Clé en main',
    },
    leadClassifications: {
      vip: 'VIP',
      hot: 'VIP',
      warm: 'Tiède',
      cold: 'Froid',
    },
    ownerTypes: {
      individual: 'Particulier',
      investor: 'Investisseur',
      developer: 'Promoteur immobilier',
      company: 'Personne morale',
    },
    propertyTypes: {
      apartment: 'Appartement',
      villa: 'Villa',
      house: 'Maison / Riad',
      land: 'Terrain',
      commercial: 'Local commercial',
      office: 'Bureau',
      other: 'Autre actif',
    },
    transactionTypes: {
      sale: 'Vente',
      rent: 'Location',
      sell: 'Mandat vente',
      rent_out: 'Mise en location',
    },
    propertyStatuses: {
      available: 'Disponible',
      reserved: 'Sous offre',
      sold: 'Vendu',
      rented: 'Loué',
      unavailable: 'Retiré',
    },
    appointmentStatuses: {
      scheduled: 'Planifiée',
      confirmed: 'Confirmée',
      attended: 'Honorée',
      no_show: 'Absent',
      cancelled: 'Annulée',
      rescheduled: 'Reportée',
    },
    appointmentTypes: {
      in_person_visit: 'Visite sur site',
      office_meeting: 'RDV en agence',
      virtual_tour: 'Visite virtuelle',
      contract_signing: 'Signature compromis / bail',
    },
    employeeRoles: {
      agency_manager: 'Directeur d’agence',
      sales_manager: 'Directeur commercial',
      real_estate_advisor: 'Consultant immobilier',
      receptionist: 'Chargé d’accueil',
      custom: 'Profil personnalisé',
    },
    channels: {
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      facebook: 'Facebook',
      website: 'Chat web',
      other: 'Autres canaux',
    },
    notificationCategories: {
      new_lead: 'Nouveau lead',
      new_appointment: 'Visite créée',
      upcoming_visit: 'Visite à venir',
      appointment_confirmed: 'Visite confirmée',
      appointment_cancelled: 'Visite annulée',
      client_no_show: 'Absence client',
      property_updated: 'Bien actualisé',
      team_activity: 'Activité équipe',
      admin_alert: 'Note direction',
    },
    adPlatforms: {
      facebook_ads: 'Facebook Ads',
      instagram_ads: 'Instagram Ads',
      google_ads: 'Google Ads',
      other: 'Portails partenaires',
    },
    days: {
      mon: 'Lundi',
      tue: 'Mardi',
      wed: 'Mercredi',
      thu: 'Jeudi',
      fri: 'Vendredi',
      sat: 'Samedi',
      sun: 'Dimanche',
    },
    overview: {
      title: 'Pilotage de l’agence',
      subtitle: 'Synthèse exécutive des prospects, visites immobilières et transactions conclues',
      dateFilters: {
        today: 'Aujourd’hui',
        last7: '7 derniers jours',
        last30: '30 derniers jours',
        thisMonth: 'Mois en cours',
        custom: 'Période libre',
      },
      fromDate: 'Du',
      toDate: 'Au',
      vsPrevPeriod: 'vs période précédente',
      kpis: {
        totalLeads: 'Total prospects',
        newLeads: 'Nouveaux leads',
        scheduledVisits: 'Visites planifiées',
        completedVisits: 'Visites effectuées',
        attendedClients: 'Visites honorées',
        noShowClients: 'Absences visite',
        successfulDeals: 'Transactions conclues',
        activeProperties: 'Biens en portefeuille',
        ownersRentingOut: 'Bailleurs (Location)',
      },
      charts: {
        acquisitionTitle: 'Dynamique d’acquisition',
        acquisitionSub: 'Volume quotidien de nouveaux prospects sur la période',
        visitsTitle: 'Activité des visites',
        visitsSub: 'Visites planifiées vs effectuées par semaine',
        attendanceTitle: 'Taux d’assiduité aux visites',
        attendanceSub: 'Répartition entre visites honorées et absences',
        funnelTitle: 'Entonnoir commercial',
        funnelSub: 'Transformation des demandes jusqu’à la signature',
        sourcesTitle: 'Origine des prospects',
        sourcesSub: 'Part de chaque canal d’acquisition',
        monthlyTitle: 'Performance mensuelle',
        monthlySub: 'Évolution mensuelle des leads et des ventes',
        attended: 'Honorée',
        absent: 'Absent',
        scheduled: 'Planifiées',
        completed: 'Effectuées',
        leadsLabel: 'Prospects',
        dealsLabel: 'Transactions',
      },
      widgets: {
        upcomingAppointments: 'Prochaines visites',
        latestLeads: 'Derniers prospects',
        recentActivity: 'Journal de l’équipe',
        topProperties: 'Biens les plus demandés',
        quickActions: 'Actions rapides',
        importantNotifications: 'Alertes prioritaires',
        newLeadBtn: 'Nouveau prospect',
        newPropertyBtn: 'Nouveau bien',
        newAppointmentBtn: 'Planifier une visite',
        openReportsBtn: 'Consulter les rapports',
        viewsCount: 'vues',
        inquiriesCount: 'demandes',
      },
    },
    leads: {
      title: 'Portefeuille prospects',
      subtitle: 'Suivi dédié des acquéreurs, locataires, vendeurs et bailleurs avec critères de qualification',
      addLead: 'Ajouter un prospect',
      editLead: 'Modifier le dossier',
      deleteLead: 'Supprimer le dossier',
      deleteConfirm: 'Confirmez-vous la suppression définitive de ce prospect ?',
      emptyTitle: 'Aucun prospect ne correspond à ces critères',
      emptyDesc: 'Modifiez les filtres actifs ou créez une nouvelle fiche prospect.',
      tabs: {
        all: 'Tous les dossiers',
        buyers: 'Acquéreurs',
        renters: 'Locataires',
        sellers: 'Vendeurs',
        landlordsRent: 'Bailleurs',
      },
      columns: {
        name: 'Client',
        phone: 'Téléphone',
        email: 'E-mail',
        source: 'Canal',
        contactMethod: 'Contact',
        paymentMethod: 'Financement',
        bedrooms: 'Ch.',
        deliveryStatus: 'Disponibilité',
        desiredArea: 'Surface',
        classification: 'Priorité',
        score: 'Score prospect',
        property: 'Bien ciblé',
        budget: 'Budget',
        propertyType: 'Typologie',
        city: 'Ville / Quartier',
        employee: 'Conseiller',
        createdAt: 'Créé le',
        lastInteraction: 'Dernier suivi',
        status: 'Statut',
      },
      filters: {
        allStatuses: 'Tous les statuts',
        allSources: 'Tous les canaux',
        allEmployees: 'Tous les conseillers',
        allCities: 'Toutes les villes',
        allClassifications: 'Toutes priorités',
        allScores: 'Tous les scores',
      },
      scoring: {
        title: 'Indice de maturité du prospect',
        outOf: 'sur 100',
        tiers: {
          high: 'Forte intention',
          medium: 'Qualifié',
          low: 'À réactiver',
        },
        factors: {
          classification: 'Niveau de priorité',
          financial: 'Financement / Mandat',
          timing: 'Délai du projet',
          visits: 'Visites & assiduité',
          engagement: 'Échanges & dossier',
        },
      },
      bulk: {
        assignEmployee: 'Affecter un conseiller',
        changeStatus: 'Modifier le statut',
        exportSelected: 'Exporter la sélection',
        deleteSelected: 'Supprimer la sélection',
      },
      profile: {
        title: 'Fiche prospect',
        personalInfo: 'Coordonnées client',
        contactDetails: 'Contacts directs',
        preferences: 'Cahier des charges & Notes',
        interestedProperty: 'Bien associé',
        assignedEmployee: 'Conseiller en charge',
        internalNotes: 'Notes internes',
        addNotePlaceholder: 'Consigner un compte-rendu d’appel ou une exigence...',
        addNoteBtn: 'Ajouter la note',
        scheduleFollowup: 'Prochaine relance',
        followupDate: 'Date de relance',
        saveFollowup: 'Planifier la relance',
        appointmentHistory: 'Historique des visites',
        conversationHistory: 'Historique des échanges',
        activityTimeline: 'Chronologie du dossier',
        bookVisitBtn: 'Planifier une visite',
        openChatBtn: 'Ouvrir la discussion',
      },
      form: {
        name: 'Nom complet',
        phone: 'Téléphone',
        email: 'Adresse e-mail',
        source: 'Source d’acquisition',
        contactMethod: 'Canal privilégié',
        paymentMethod: 'Mode de financement',
        bedrooms: 'Nombre de chambres',
        deliveryStatus: 'Livraison',
        desiredArea: 'Surface recherchée (m²)',
        classification: 'Niveau de priorité',
        propertyType: 'Type de bien',
        transactionType: 'Nature du projet',
        budget: 'Budget (MAD)',
        city: 'Ville',
        district: 'Quartier',
        interestedProperty: 'Bien ciblé',
        assignedEmployee: 'Conseiller attribué',
        status: 'Étape commerciale',
        preferences: 'Critères & Observations',
        selectProperty: 'Associer un bien (optionnel)',
        intentTitle: 'Nature du mandat / projet client',
        intentBuy: 'Acquéreur (Achat)',
        intentBuyDesc: 'Client en recherche d’acquisition immobilière',
        intentRent: 'Locataire (Location)',
        intentRentDesc: 'Client en recherche de bail résidentiel ou professionnel',
        intentSell: 'Propriétaire vendeur',
        intentSellDesc: 'Propriétaire souhaitant confier un bien à la vente',
        intentRentOut: 'Propriétaire bailleur',
        intentRentOutDesc: 'Propriétaire proposant un bien à la location',
        sectionClientInfo: 'Identité & Coordonnées',
        sectionRequestSpecs: 'Critères de recherche & Budget',
        sectionOfferedProperty: 'Caractéristiques du bien & Prix souhaité',
        sectionFollowup: 'Attribution & Suivi',
        askingSalePrice: 'Prix de vente souhaité (MAD)',
        askingRentPrice: 'Loyer mensuel souhaité (MAD)',
        offeredArea: 'Surface du bien (m²)',
        offeredBedrooms: 'Nombre de pièces',
        validationRequired: 'Champ obligatoire',
        validationPhone: 'Veuillez saisir un numéro valide',
        validationBudget: 'Veuillez indiquer un montant positif',
      },
    },
    pipeline: {
      title: 'Pipeline commercial',
      subtitle: 'Suivi Kanban des opportunités séparé entre mandats de vente et de location',
      tabs: {
        all: 'Tout le pipeline',
        sale: 'Pipeline Vente',
        rent: 'Pipeline Location',
      },
      stages: {
        new: 'Nouveau lead',
        visit_scheduled: 'Visite planifiée',
        visited: 'Visite effectuée',
        no_show: 'Absence',
        follow_up: 'Négociation',
        closed_won: 'Affaire conclue',
        closed_lost: 'Perdu',
      },
      indicators: {
        totalPipelineValue: 'Volume du pipeline actif',
        conversionRate: 'Taux de transformation',
        visitAttendanceRate: 'Taux d’assiduité',
        avgDealBudget: 'Ticket moyen',
      },
      moveToStage: 'Déplacer vers',
      quickNote: 'Note rapide',
      bookVisit: 'Planifier visite',
      openProfile: 'Ouvrir fiche',
      dragHint: 'Glissez les cartes d’une colonne à l’autre ou sélectionnez l’étape sur la carte',
      emptyStage: 'Aucun dossier à cette étape',
      smartFilter: {
        title: 'Filtre intelligent du pipeline',
        matchingCount: 'dossiers correspondants',
        presets: {
          all: 'Tout afficher',
          high_score: 'Score élevé (80+)',
          hot_vip: 'VIP & Chauds',
          cash_buyers: 'Paiement comptant',
          needs_followup: 'Relance urgente',
          closing_soon: 'Proche conclusion',
        },
        sortLabel: 'Trier les cartes',
        sortOptions: {
          default: 'Ordre standard',
          score_desc: 'Meilleur score d’abord',
          budget_desc: 'Montant décroissant',
          recent: 'Activité récente',
        },
      },
    },
    properties: {
      title: 'Portefeuille immobilier',
      subtitle: 'Inventaire complet des actifs sous mandat avec séparation Vente / Location',
      addProperty: 'Ajouter un bien',
      editProperty: 'Modifier le bien',
      deleteProperty: 'Supprimer le bien',
      deleteConfirm: 'Souhaitez-vous retirer ce bien du portefeuille ?',
      gridView: 'Grille',
      tableView: 'Tableau',
      refPrefix: 'RÉF',
      bedrooms: 'Ch.',
      bathrooms: 'SdB',
      area: 'Surface',
      views: 'Vues',
      tabs: {
        all: 'Tous les biens',
        sale: 'À vendre',
        rent: 'À louer',
      },
      stats: {
        total: 'Total portefeuille',
        available: 'Disponibles',
        forSale: 'À vendre',
        forRent: 'À louer',
        reserved: 'Sous offre',
        closed: 'Vendus / Loués',
      },
      filters: {
        allTypes: 'Tous types',
        allTransactions: 'Vente & Location',
        allStatuses: 'Tous statuts',
        allCities: 'Toutes les villes',
        maxPrice: 'Budget max',
      },
      details: {
        title: 'Fiche du bien',
        gallery: 'Galerie photos',
        description: 'Descriptif commercial',
        location: 'Localisation',
        specifications: 'Caractéristiques techniques',
        ownerInfo: 'Propriétaire / Mandant',
        assignedEmployee: 'Conseiller responsable',
        interestedLeads: 'Acquéreurs / Locataires intéressés',
        relatedAppointments: 'Visites associées',
        internalNotes: 'Notes de mandat',
        addNotePlaceholder: 'Préciser les modalités de visite, clés ou marge de négociation...',
        changeStatus: 'Statut du mandat',
        noInterestedLeads: 'Aucun prospect associé à ce bien pour le moment.',
        noAppointments: 'Aucune visite programmée pour ce bien.',
      },
      form: {
        title: 'Intitulé du bien',
        ref: 'Référence mandat',
        type: 'Typologie',
        transactionType: 'Type de mandat',
        price: 'Prix affiché (MAD)',
        city: 'Ville',
        district: 'Quartier',
        address: 'Adresse exacte',
        area: 'Surface (m²)',
        bedrooms: 'Chambres',
        bathrooms: 'Salles de bain',
        status: 'Statut',
        ownerSelect: 'Propriétaire existant',
        ownerName: 'Nom du propriétaire',
        ownerPhone: 'Téléphone propriétaire',
        assignedEmployee: 'Conseiller en charge',
        description: 'Descriptif détaillé',
        images: 'Visuels du bien',
        uploadImageLabel: 'Importer depuis l’appareil',
        selectPresetImages: 'Ou sélectionner dans la médiathèque',
      },
    },
    owners: {
      title: 'Propriétaires & Mandants',
      subtitle: 'Base des propriétaires privés, investisseurs et promoteurs avec suivi des honoraires',
      addOwner: 'Ajouter un propriétaire',
      editOwner: 'Modifier la fiche',
      deleteOwner: 'Supprimer le propriétaire',
      deleteConfirm: 'Confirmez-vous la suppression de ce propriétaire ?',
      stats: {
        totalOwners: 'Total mandants',
        totalPropertiesLinked: 'Biens sous mandat',
        ownersForSale: 'Vendeurs',
        ownersForRent: 'Bailleurs',
        investorsCount: 'Investisseurs & Promoteurs',
      },
      columns: {
        name: 'Propriétaire / Société',
        phone: 'Téléphone',
        email: 'E-mail',
        city: 'Ville',
        ownerType: 'Profil',
        preferredContact: 'Canal',
        propertiesCount: 'Biens',
        commissionRate: 'Honoraires',
        nationalId: 'CIN / RC',
      },
      filters: {
        allTypes: 'Tous les profils',
        allCities: 'Toutes les villes',
      },
      profile: {
        title: 'Dossier propriétaire',
        contactAndDetails: 'Coordonnées & Conditions',
        ownedProperties: 'Biens confiés',
        noProperties: 'Aucun bien rattaché à ce mandant.',
        notes: 'Conditions & Accès clés',
      },
      form: {
        name: 'Nom complet / Raison sociale',
        phone: 'Téléphone',
        email: 'E-mail',
        city: 'Ville',
        ownerType: 'Catégorie',
        preferredContact: 'Canal privilégié',
        commissionRate: 'Taux d’honoraires (%)',
        nationalId: 'CIN / Registre de commerce',
        notes: 'Conditions du mandat et accès',
      },
    },
    appointments: {
      title: 'Visites & Agenda',
      subtitle: 'Planning opérationnel avec qualification client, suivi de présence et actions rapides',
      newAppointment: 'Planifier une visite',
      editAppointment: 'Modifier la visite',
      rescheduleAppointment: 'Replanifier',
      cancelAppointment: 'Annuler la visite',
      cancelConfirm: 'Confirmez-vous l’annulation de cette visite ?',
      views: {
        table: 'Liste des visites',
        daily: 'Agenda du jour',
        weekly: 'Vue semaine',
        monthly: 'Vue mois',
      },
      stats: {
        total: 'Total visites',
        upcoming: 'À venir',
        completed: 'Effectuées',
        attended: 'Honorées',
        noShow: 'Absences',
      },
      columns: {
        client: 'Client',
        clientInfo: 'Profil & Budget',
        phone: 'Téléphone',
        property: 'Bien visité',
        day: 'Jour',
        date: 'Date',
        time: 'Heure',
        area: 'Surface',
        city: 'Ville',
        budget: 'Budget',
        employee: 'Conseiller',
        type: 'Format',
        status: 'Statut',
        notes: 'Notes',
      },
      form: {
        lead: 'Client',
        property: 'Bien immobilier',
        employee: 'Conseiller',
        date: 'Date',
        time: 'Heure',
        type: 'Format du rendez-vous',
        status: 'Statut',
        notes: 'Notes préparatoires',
      },
      quickActions: {
        confirm: 'Confirmer',
        markAttended: 'Honorée',
        markNoShow: 'Absent',
        reschedule: 'Reporter',
        cancel: 'Annuler',
      },
      agenda: {
        today: 'Aujourd’hui',
        workingHoursLabel: 'Horaires',
        closedDayBanner: 'Jour fermé — Agence fermée',
        closedDayHint: 'Activez ce jour ou ajustez vos plages horaires dans les paramètres.',
        configureHoursBtn: 'Régler les horaires',
        outsideHours: 'Hors horaires d’ouverture',
        breakPeriod: 'Pause méridienne / Indisponible',
        blockedSlot: 'Créneau bloqué',
        availableSlot: 'Créneau libre',
        bookAtTime: 'Réserver ce créneau',
        disableHour: 'Bloquer l’heure',
        enableHour: 'Libérer l’heure',
        openSlotsCount: 'Créneaux libres',
        bookedCount: 'Réservés',
        blockedCount: 'Bloqués / Pause',
        addForDay: 'Planifier',
        directWhatsapp: 'Contacter sur WhatsApp',
        directCall: 'Appeler le client',
        legendLabel: 'Légende :',
        morningPeriod: 'Matinée',
        afternoonPeriod: 'Après-midi',
        eveningPeriod: 'Fin de journée',
        jumpToNearestApt: 'Jour avec RDV',
        noAptsTodayHint: 'Aucun rendez-vous prévu ce jour — les créneaux ouverts sont disponibles.',
      },
    },
    team: {
      title: 'Équipe commerciale',
      subtitle: 'Suivi individuel des conseillers, résultats commerciaux et droits d’accès',
      addEmployee: 'Nouveau membre',
      editEmployee: 'Modifier la fiche',
      activeAccount: 'Actif',
      inactiveAccount: 'Suspendu',
      activate: 'Activer le compte',
      deactivate: 'Suspendre le compte',
      assignedLeadsCount: 'Prospects suivis',
      scheduledVisitsCount: 'Visites à venir',
      completedVisitsCount: 'Visites réalisées',
      attendanceRate: 'Taux d’assiduité',
      successfulDealsCount: 'Affaires conclues',
      profile: {
        title: 'Fiche & Performance conseiller',
        contactInfo: 'Poste & Coordonnées',
        performance: 'Indicateurs clés',
        permissions: 'Habilitations',
        recentActivities: 'Journal d’activité',
        assignedLeadsList: 'Portefeuille prospects',
      },
      permissionsLabels: {
        manage_leads: 'Gérer les prospects',
        manage_properties: 'Gérer le portefeuille biens',
        manage_appointments: 'Gérer l’agenda',
        view_reports: 'Accéder aux rapports',
        manage_team: 'Gérer l’équipe',
        manage_settings: 'Paramètres agence',
        export_data: 'Exporter les données',
      },
      form: {
        name: 'Nom complet',
        phone: 'Téléphone',
        email: 'E-mail professionnel',
        jobTitle: 'Fonction',
        role: 'Rôle système',
        active: 'Compte actif dès la création',
      },
    },
    conversations: {
      title: 'Messagerie client',
      subtitle: 'Boîte de réception unifiée WhatsApp, réseaux sociaux et site web',
      integrationBanner: 'Prêt pour connexion API WhatsApp Business & Meta Cloud. Conversations de démonstration affichées.',
      unreadOnly: 'Non lus uniquement',
      allChannels: 'Tous les canaux',
      markAsRead: 'Marquer lu',
      replyPlaceholder: 'Rédiger votre message au client...',
      send: 'Envoyer',
      customerPanel: 'Contexte client',
      interestedProperty: 'Bien ciblé',
      leadStatus: 'Étape pipeline',
      assignedEmployee: 'Conseiller dédié',
      internalNotes: 'Mémo interne',
      openFullProfile: 'Ouvrir le dossier complet',
      bookVisit: 'Planifier une visite',
      noConversationSelected: 'Sélectionnez une conversation pour afficher les échanges',
    },
    notifications: {
      title: 'Centre d’alertes',
      subtitle: 'Suivi en temps réel des leads entrants, visites planifiées et mises à jour de mandats',
      unreadCount: 'Alertes non lues',
      markAllRead: 'Tout marquer lu',
      markRead: 'Marquer lu',
      unreadOnly: 'Non lues uniquement',
      openRelated: 'Voir le dossier',
      emptyTitle: 'Aucune alerte à afficher',
    },
    ads: {
      title: 'Performance Ads & ROI',
      subtitle: 'Pilotage des budgets d’acquisition, coût par lead et ventes attribuées',
      demoWarning: 'Remarque : Les métriques média affichées sont des données de démonstration avant connexion Meta Ads et Google Ads.',
      kpis: {
        totalSpend: 'Investissement média',
        totalLeads: 'Leads générés',
        cpl: 'Coût par lead (CPL)',
        qualifiedLeads: 'Leads qualifiés',
        appointments: 'Visites générées',
        costPerAppointment: 'Coût par visite',
        visits: 'Visites honorées',
        attributedSales: 'Ventes attribuées',
        conversionRate: 'Taux de transformation',
      },
      charts: {
        leadsByCampaign: 'Leads par campagne',
        leadsByPlatform: 'Répartition par régie',
        dailyTrends: 'Tendance quotidienne des leads',
        spendAndCpl: 'Dépenses vs CPL',
      },
      table: {
        campaignName: 'Campagne',
        platform: 'Régie',
        budget: 'Budget alloué',
        spend: 'Dépensé',
        leads: 'Leads',
        appointments: 'Visites',
        cpl: 'CPL',
        status: 'Statut',
      },
      campaignStatuses: {
        active: 'Active',
        paused: 'En pause',
        completed: 'Clôturée',
      },
    },
    reports: {
      title: 'Rapports & Décisionnel',
      subtitle: 'Rapports de direction prêts pour comité de suivi et exportables en PDF',
      timeFilter: {
        label: 'Période d’analyse',
        today: 'Aujourd’hui',
        thisWeek: 'Cette semaine',
        thisMonth: 'Ce mois-ci',
        thisYear: 'Année en cours',
        all: 'Tout l’historique',
        custom: 'Période libre',
        from: 'Du',
        to: 'Au',
      },
      tabs: {
        leads: 'Analyse prospects',
        appointments: 'Analyse visites',
        properties: 'Demande & Biens',
        team: 'Tableau équipe',
        sales: 'Ventes & Clôtures',
        ads: 'Acquisition média',
      },
      leadsSection: {
        totalLeads: 'Total prospects',
        newLeads: 'Nouveaux leads',
        conversionRate: 'Taux de conclusion',
        byPropertyType: 'Demande par typologie de bien',
        byDesiredCity: 'Demande par ville',
        buyersCount: 'Acquéreurs',
        rentersCount: 'Locataires',
        ownersCount: 'Propriétaires (Vente / Location)',
        ownersSellCount: 'Vendeurs',
        ownersRentOutCount: 'Bailleurs',
        noLeadsInPeriod: 'Aucun prospect enregistré sur la période sélectionnée.',
      },
      appointmentsSection: {
        total: 'Total rendez-vous',
        completed: 'Visites clôturées',
        attendanceRate: 'Taux d’assiduité',
        absenceRate: 'Taux d’absence',
        closingRate: 'Taux de transformation post-visite',
        outcomeBreakdown: 'Bilan des visites et impact commercial',
        closedDealsFromVisits: 'Visite honorée suivie d’une conclusion',
        attendedNoDeal: 'Visite honorée sans conclusion à ce jour',
        noShowLabel: 'Absence du client au rendez-vous',
        pendingExcludedLabel: 'Visites à venir / en attente / annulées (hors calcul)',
        pendingExcludedNote: 'Les taux sont calculés exclusivement sur les visites clôturées (Honorée ou Absent), sans aucune distorsion liée aux créneaux futurs.',
        noCompletedVisits: 'Aucune visite clôturée sur cette période.',
      },
      propertiesSection: {
        available: 'Disponibles',
        sold: 'Vendus',
        rented: 'Loués',
        activeDemandCount: 'Demandes actives',
        mostRequestedTypes: 'Typologies les plus recherchées',
        mostRequestedTableTitle: 'Analyse des surfaces et budgets cibles par typologie',
        mostRequestedArea: 'Surface médiane / demandée',
        areaRange: 'Fourchette de surface',
        mostRequestedBudget: 'Budget le plus fréquent',
        budgetRange: 'Fourchette budgétaire (MAD)',
        demandCount: 'Demandes',
        singleSample: 'Échantillon unique (1 demande)',
        insufficientData: 'Données insuffisantes',
        noDemandInPeriod: 'Volume de demandes insuffisant sur cette période.',
      },
      teamSection: {
        employee: 'Conseiller',
        leadsHandled: 'Leads',
        appointments: 'RDV',
        visitsCompleted: 'Visites honorées',
        attendanceRate: 'Taux de gain',
        successfulDeals: 'Ventes conclues',
        lostDeals: 'Perdues',
        conversionRate: 'Taux de gain',
        financialPerformance: 'Chiffre d’affaires généré',
        resetOverrides: 'Rétablir le calcul auto',
        editMetricsHint: 'Les compteurs opérationnels sont issus des dossiers CRM ; seul le montant financier ajusté peut être modifié manuellement.',
        manualOverrideBadge: 'Ajusté',
        autoComputedBadge: 'Calcul auto',
        financialOverrideLabel: 'Montant financier ajusté (MAD)',
        monthlyTeamFinancial: 'Performance financière mensuelle',
      },
      salesSection: {
        successfulTransactions: 'Transactions conclues',
        totalRevenue: 'Volume d’affaires réalisé',
        monthlyPerformance: 'Revenu mensuel',
        conversionRate: 'Taux de transformation',
        monthlyLegendRevenue: 'Volume (MAD)',
        monthlyLegendDeals: 'Affaires conclues',
        noClosedDealsInPeriod: 'Aucune transaction conclue sur cette période.',
      },
      adsSection: {
        totalSpend: 'Budget investi',
        adLeads: 'Leads média',
        cpl: 'Coût par lead (CPL)',
        qualifiedLeads: 'Leads qualifiés',
        appointmentsGenerated: 'Visites générées',
        crmAdLeads: 'Leads attribués dans le CRM',
        spendAndCplTitle: 'Investissement vs CPL',
        campaignBreakdown: 'Détail des campagnes sur la période',
        periodComparison: 'Évolution vs période précédente',
        vsPreviousLabel: 'Variation du CPL vs période précédente',
        noAdDataInPeriod: 'Aucune dépense publicitaire enregistrée sur cette période.',
      },
    },
    settings: {
      title: 'Paramètres de l’agence',
      subtitle: 'Fiche agence, charte visuelle, horaires d’ouverture, règles de visite et accès',
      tabs: {
        agency: 'Fiche agence',
        identity: 'Charte graphique (Admin)',
        hours: 'Horaires d’ouverture',
        appointments: 'Règles de visite',
        notifications: 'Alertes',
        localization: 'Langue & Devise',
        permissions: 'Matrice des droits',
        security: 'Sécurité & Sessions',
      },
      agencyForm: {
        name: 'Raison sociale / Nom de l’agence',
        tagline: 'Accroche commerciale',
        phone: 'Téléphone agence',
        email: 'E-mail officiel',
        address: 'Adresse du siège',
        city: 'Ville',
        website: 'Site web',
        description: 'Présentation de l’agence',
        saveSuccess: 'Paramètres enregistrés avec succès',
      },
      identityForm: {
        adminControlNotice: 'Administration plateforme : personnalisez la palette principale, la couleur d’action et le logo officiel de l’agence.',
        colorPresets: 'Palettes harmonisées',
        primaryColor: 'Couleur principale',
        secondaryColor: 'Couleur des actions',
        logoUrl: 'Logo de l’agence',
        uploadLogo: 'Importer un logo',
        livePreview: 'Aperçu en temps réel',
        previewCardTitle: 'Carte d’aperçu aux couleurs de l’agence',
        previewButton: 'Bouton d’action',
      },
      hoursForm: {
        day: 'Jour',
        status: 'Ouverture',
        open: 'Ouverture',
        close: 'Fermeture',
        breakTime: 'Pause',
        hasBreak: 'Pause déjeuner',
        noBreak: 'Journée continue',
        weeklySummary: 'Capacité hebdomadaire',
        activeDaysCount: 'Jours ouvrés',
        weeklyHoursTotal: 'Amplitude hebdomadaire',
        hoursUnit: 'h',
        copyMonToAll: 'Appliquer l’horaire du lundi aux jours ouverts',
        copiedToast: 'Horaires appliqués aux jours ouverts',
        hourlySlotsTitle: 'Gestion par tranche horaire (cliquez pour bloquer ou rouvrir)',
        hourlySlotsHint: 'Bloquez certaines heures (déjeuner, réunion) pour empêcher toute prise de rendez-vous.',
        slotOpen: 'Ouvert',
        slotBreak: 'Pause',
        slotRemoved: 'Bloqué',
        excludedPeriodsTitle: 'Plages horaires neutralisées',
        addExcludedPeriod: 'Ajouter une plage',
        periodStart: 'De',
        periodEnd: 'À',
        periodReason: 'Motif (optionnel)',
        periodReasonPlaceholder: 'Ex. : Point hebdomadaire...',
        removePeriod: 'Supprimer',
        holidays: 'Jours fériés & Fermetures',
        openLabel: 'Ouvert',
        closedLabel: 'Fermé',
        closedDayHint: 'Fermé — aucune visite planifiée ce jour',
        quickTemplatesLabel: 'Modèles rapides :',
        presetStandard: 'Classique (09:00–18:30)',
        presetContinuous: 'Journée continue (08:30–17:00)',
        presetWeekdays: 'Lun–Ven uniquement',
        presetAppliedToast: 'Modèle horaire appliqué avec succès',
        manageSlotsBtn: 'Personnaliser',
        hideSlotsBtn: 'Masquer',
        quickBreakPreset: 'Pause rapide :',
      },
      appointmentsForm: {
        duration: 'Durée standard d’une visite',
        minutes: 'min',
        bookingWindowStart: 'Première visite',
        bookingWindowEnd: 'Dernière visite',
        autoConfirm: 'Confirmation automatique des rendez-vous',
        rescheduleLimit: 'Préavis minimum de report',
        hoursBefore: 'heures avant',
        visitReminders: 'Rappels automatiques avant visite',
      },
      notificationsForm: {
        newLead: 'Alertes nouveaux prospects',
        appointments: 'Création et modification de visites',
        attendance: 'Suivi présence et absences',
        teamActivity: 'Activité commerciale de l’équipe',
        emailDigest: 'Synthèse quotidienne par e-mail',
      },
      localizationForm: {
        language: 'Langue de l’interface',
        timezone: 'Fuseau horaire',
        dateFormat: 'Format de date',
        currency: 'Devise',
        currencyNote: 'Le Dirham marocain (MAD) est utilisé par défaut pour l’ensemble des prix et rapports.',
      },
      securityForm: {
        accountInfo: 'Session en cours',
        changePassword: 'Modifier le mot de passe',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        updatePassword: 'Mettre à jour',
        passwordMismatch: 'Les mots de passe ne correspondent pas',
        passwordUpdated: 'Mot de passe actualisé (mode démo)',
        twoFactor: 'Double authentification (2FA)',
        activeSessions: 'Appareils connectés',
        terminateSession: 'Révoquer',
        currentSessionBadge: 'Session active',
      },
    },
    toasts: {
      saved: 'Modifications enregistrées',
      leadAdded: 'Prospect ajouté au pipeline',
      leadUpdated: 'Dossier prospect mis à jour',
      leadDeleted: 'Prospect supprimé',
      propertyAdded: 'Bien ajouté au portefeuille',
      propertyUpdated: 'Fiche bien mise à jour',
      propertyDeleted: 'Bien retiré',
      ownerAdded: 'Propriétaire enregistré',
      ownerUpdated: 'Fiche propriétaire mise à jour',
      ownerDeleted: 'Propriétaire supprimé',
      appointmentCreated: 'Visite planifiée',
      appointmentUpdated: 'Visite mise à jour',
      employeeAdded: 'Collaborateur ajouté',
      employeeUpdated: 'Profil actualisé',
      messageSent: 'Réponse envoyée',
      exported: 'Export généré',
      noteAdded: 'Note enregistrée',
      statusUpdated: 'Statut mis à jour',
    },
  },
};

export function formatMAD(amount: number, lang: Language): string {
  const formatted = new Intl.NumberFormat(lang === 'fr' ? 'fr-MA' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${translations[lang].app.currencyCode}`;
}

export function formatNumber(num: number, lang: Language): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-MA' : 'en-US').format(num);
}

export function formatShortDate(isoOrDate: string, lang: Language): string {
  if (!isoOrDate) return '—';
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return isoOrDate;
  const locale = lang === 'ar' ? 'ar-MA-u-nu-latn' : lang === 'fr' ? 'fr-MA' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
