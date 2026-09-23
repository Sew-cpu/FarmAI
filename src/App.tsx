import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AnimalsView } from './components/AnimalsView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { ScheduleView } from './components/ScheduleView';
import { BarnsView } from './components/BarnsView';
import { InventoryView } from './components/InventoryView';
import { HealthLogsView } from './components/HealthLogsView';
import { ReportsView } from './components/ReportsView';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';

function MainApp() {
  const { activeTab } = useFarm();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'animals' && <AnimalsView />}
          {activeTab === 'ai-advisor' && <AiAdvisorView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'barns' && <BarnsView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'health-logs' && <HealthLogsView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <FarmProvider>
      <MainApp />
    </FarmProvider>
  );
}
