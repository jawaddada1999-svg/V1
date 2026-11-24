import React, { useState } from 'react';
import { LayoutDashboard, Users, Building2, CalendarClock, MessageSquare } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import {
  AppointmentFormModal,
  LeadFormModal,
  OwnerFormModal,
  PropertyFormModal,
} from './components/modals/QuickModals';
import { AdsAnalyticsSection } from './components/sections/AdsAnalyticsSection';
import { AppointmentsSection } from './components/sections/AppointmentsSection';
import { ConversationsSection } from './components/sections/ConversationsSection';
import { LeadsSection } from './components/sections/LeadsSection';
import { NotificationsSection } from './components/sections/NotificationsSection';
import { OverviewSection } from './components/sections/OverviewSection';
import { OwnersSection } from './components/sections/OwnersSection';
import { PipelineSection } from './components/sections/PipelineSection';
import { PropertiesSection } from './components/sections/PropertiesSection';
import { ReportsSection } from './components/sections/ReportsSection';
import { SettingsSection } from './components/sections/SettingsSection';
import { TeamSection } from './components/sections/TeamSection';
import { ToastContainer } from './components/ui/DataPrimitives';
import { AgencyProvider, useAgency } from './context/AgencyContext';

const DashboardShell: React.FC = () => {
  const {
    t,
    activeSection,
    setActiveSection,
    language,
    toasts,
    dismissToast,
    quickModal,
    setQuickModal,
    preselectedLeadForApt,
    setPreselectedLeadForApt,
  } = useAgency();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'leads':
        return <LeadsSection />;
      case 'pipeline':
        return <PipelineSection />;
      case 'properties':
        return <PropertiesSection />;
      case 'owners':
        return <OwnersSection />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'team':
        return <TeamSection />;
      case 'conversations':
        return <ConversationsSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'ads':
        return <AdsAnalyticsSection />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div
      className="min-h-screen flex text-[#1F2937]"
      style={{ backgroundColor: 'var(--agency-sidebar)' }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <div className="flex-1 flex flex-col bg-[#F5F7F5] lg:rounded-ss-[26px] overflow-x-clip shadow-inner">
          <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 max-w-[1600px] w-full mx-auto">
            {renderSection()}
          </main>

          <footer className="px-6 py-3 border-t border-[#E3EAE5] bg-white/80 text-[11px] text-[#64748B] flex flex-wrap items-center justify-between gap-2 no-print">
            <span>{t.app.demoDataNotice}</span>
            <span>{t.app.platformAttribution}</span>
          </footer>
        </div>
        <nav className="mobile-app-nav lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-white/30 bg-white/90 backdrop-blur-xl shadow-[0_-8px_28px_-14px_rgba(18,53,43,0.25)]" aria-label="Primary navigation">
          {([
            {id:'overview',icon:LayoutDashboard,label:language==='ar'?'الرئيسية':language==='fr'?'Accueil':'Home'},
            {id:'leads',icon:Users,label:language==='ar'?'العملاء':language==='fr'?'Leads':'Leads'},
            {id:'properties',icon:Building2,label:language==='ar'?'العقارات':language==='fr'?'Biens':'Properties'},
            {id:'appointments',icon:CalendarClock,label:language==='ar'?'المواعيد':language==='fr'?'Visites':'Visits'},
            {id:'conversations',icon:MessageSquare,label:language==='ar'?'المحادثات':language==='fr'?'Messages':'Chat'},
          ] as {id:SectionId;icon:React.ComponentType<{className?:string}>;label:string}[]).map((item)=>{
            const Icon=item.icon;const active=activeSection===item.id;
            return <button key={item.id} type="button" onClick={()=>setActiveSection(item.id)} className={`flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-[10px] font-bold transition-colors ${active?'text-[#EA580C]':'text-slate-500'}`}><Icon className={`h-5 w-5 ${active?'stroke-[2.5]':'stroke-[1.8]'}`} /><span>{item.label}</span><span className={`h-1 w-5 rounded-full ${active?'bg-[#EA580C]':'bg-transparent'}`}/></button>
          })}
        </nav>
      </div>

      {/* Global Quick Creation Modals */}
      <LeadFormModal
        open={quickModal === 'lead'}
        onClose={() => setQuickModal(null)}
      />
      <PropertyFormModal
        open={quickModal === 'property'}
        onClose={() => setQuickModal(null)}
      />
      <AppointmentFormModal
        open={quickModal === 'appointment'}
        onClose={() => {
          setQuickModal(null);
          setPreselectedLeadForApt(null);
        }}
        defaultLeadId={preselectedLeadForApt}
      />
      <OwnerFormModal
        open={quickModal === 'owner'}
        onClose={() => setQuickModal(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-6 text-[#1F2937]"
        >
          <div className="max-w-md w-full bg-white border border-[#E3EAE5] rounded-2xl p-6 shadow-md space-y-4 text-center">
            <h1 className="text-lg font-extrabold text-[#1F2937]">
              حدث خطأ غير متوقع أثناء تحميل لوحة التحكم
            </h1>
            <p className="text-xs text-[#64748B] font-medium">
              قد يكون السبب بيانات قديمة محفوظة في المتصفح. يمكنك إعادة ضبط الجلسة لتشغيل اللوحة بشكل سليم.
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  window.localStorage.removeItem('ibonda_crm_state_v2');
                } catch {
                  // ignore
                }
                window.location.reload();
              }}
              className="btn-primary px-5 py-2.5 text-xs font-bold"
            >
              إعادة تحميل وتصفير البيانات المحلية
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <DashboardErrorBoundary>
      <AgencyProvider>
        <DashboardShell />
      </AgencyProvider>
    </DashboardErrorBoundary>
  );
}
