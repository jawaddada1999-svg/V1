import React, { useState } from 'react';
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
          <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
            {renderSection()}
          </main>

          <footer className="px-6 py-3 border-t border-[#E3EAE5] bg-white/80 text-[11px] text-[#64748B] flex flex-wrap items-center justify-between gap-2 no-print">
            <span>{t.app.demoDataNotice}</span>
            <span>{t.app.platformAttribution}</span>
          </footer>
        </div>
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

export default function App() {
  return (
    <AgencyProvider>
      <DashboardShell />
    </AgencyProvider>
  );
}
