import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { AnimalsView } from './components/AnimalsView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { MultiAgentView } from './components/MultiAgentView';
import { ScheduleView } from './components/ScheduleView';
import { BarnsView } from './components/BarnsView';
import { InventoryView } from './components/InventoryView';
import { HealthLogsView } from './components/HealthLogsView';
import { ReportsView } from './components/ReportsView';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';

function MainApp() {
  const { activeTab, setActiveTab } = useFarm();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleQuickAdd = () => {
    setActiveTab('animals');
    // AnimalsView will trigger modal via custom event or tab
    window.dispatchEvent(new CustomEvent('farmpro-open-add-animal'));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-16 lg:pb-0">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto items-start">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && <DashboardView onOpenAddAnimal={handleQuickAdd} />}
          {activeTab === 'animals' && <AnimalsView />}
          {activeTab === 'multi-agent' && <MultiAgentView />}
          {activeTab === 'ai-advisor' && <AiAdvisorView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'barns' && <BarnsView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'health-logs' && <HealthLogsView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <MobileBottomNav onQuickAddAnimal={handleQuickAdd} />

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <FarmProvider>
        <MainApp />
      </FarmProvider>
    </ToastProvider>
  );
}
