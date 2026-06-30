import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Search, Bell, Landmark, User, ShieldAlert, FileText } from 'lucide-react';
import { 
  FocalPerson, 
  Program, 
  AllocationHistory, 
  ActiveTab 
} from './types';
import { 
  INITIAL_FOCAL_PERSONS, 
  INITIAL_PROGRAMS, 
  INITIAL_ALLOCATION_HISTORY 
} from './data';

import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import DashboardTab from './components/DashboardTab';
import FocalTab from './components/FocalTab';
import ProgramTab from './components/ProgramTab';
import BudgetTab from './components/BudgetTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import ReportModal from './components/ReportModal';
import NotificationsDropdown, { SystemNotification } from './components/NotificationsDropdown';

// Helper to keep programs and focalPersons in perfect bidirectional sync
const syncFocalAndPrograms = (
  updatedPrograms: Program[],
  updatedFocals: FocalPerson[]
): { programs: Program[]; focalPersons: FocalPerson[] } => {
  // We treat program.focalIds as the primary source of truth for assignments.
  // 1. For each focal person, find which programs they are assigned to
  const nextFocals = updatedFocals.map(focal => {
    const assignedProgs = updatedPrograms.filter(p => p.focalIds?.includes(focal.id));
    const progNames = assignedProgs.map(p => p.name).join(', ');
    return {
      ...focal,
      programName: progNames || 'No Program Assigned'
    };
  });

  // 2. For each program, recompute focalName, focalId, and focalInitials based on its focalIds
  const nextPrograms = updatedPrograms.map(prog => {
    const assignedFocals = nextFocals.filter(f => prog.focalIds?.includes(f.id));
    const focalName = assignedFocals.map(f => f.name).join(', ') || 'Unassigned';
    const focalId = assignedFocals[0]?.id || '';
    
    // Create combined initials (first letter of first and last name, joined together for multiple focals)
    const focalInitials = assignedFocals.map(f => {
      const parts = f.name.trim().split(/\s+/);
      const first = parts[0]?.[0] || '';
      const last = parts[parts.length - 1]?.[0] || '';
      return (first + last).toUpperCase();
    }).join(', ') || 'UA';

    return {
      ...prog,
      focalName,
      focalId,
      focalInitials
    };
  });

  return { programs: nextPrograms, focalPersons: nextFocals };
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState({
    name: 'Catherine Jade',
    email: 'catherinejade.original@wvsu.edu.ph',
    municipality: 'Iloilo City, Philippines',
    profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  });

  // Report Modal Visibility state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Core Persisted/Shared State engine
  const [focalPersons, setFocalPersons] = useState<FocalPerson[]>(INITIAL_FOCAL_PERSONS);
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [allocationHistory, setAllocationHistory] = useState<AllocationHistory[]>(INITIAL_ALLOCATION_HISTORY);

  // Notifications state engine
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'init-01',
      title: 'AICS Program nearing exhaustion',
      description: 'System Warning: AICS Program is at 92% budget utilization.',
      timestamp: '5 mins ago',
      read: false,
      type: 'warning'
    },
    {
      id: 'init-02',
      title: '4Ps Program critical alert',
      description: 'System Warning: Pantawid Pamilya (4Ps) is at 81% budget utilization.',
      timestamp: '30 mins ago',
      read: false,
      type: 'warning'
    },
    {
      id: 'init-03',
      title: 'New Focal Assignment',
      description: 'Julian Santos has been set active as Senior Citizens Head.',
      timestamp: '2 hours ago',
      read: true,
      type: 'focal'
    }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const addSystemNotification = (title: string, description: string, type: SystemNotification['type']) => {
    const formattedTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      timestamp: `Today, ${formattedTime}`,
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // State mutation operations - FOCAL PERSONS
  const handleAddFocal = (newFocal: Omit<FocalPerson, 'id' | 'avatarInitials'>) => {
    const nextNum = Math.max(...focalPersons.map(f => parseInt(f.id.split('-').pop() || '0')), 0) + 1;
    const newId = `MSW-2024-${String(nextNum).padStart(3, '0')}`;
    
    // First, split and get initials of focal person
    const parts = newFocal.name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    const initials = (first + last).toUpperCase();

    const created: FocalPerson = {
      ...newFocal,
      id: newId,
      avatarInitials: initials
    };

    // Update programs' focalIds list based on the new focal person's programName assignment
    const updatedPrograms = programs.map(p => {
      if (p.name === created.programName) {
        return { ...p, focalIds: Array.from(new Set([...(p.focalIds || []), created.id])) };
      } else {
        return { ...p, focalIds: (p.focalIds || []).filter(id => id !== created.id) };
      }
    });

    const { programs: nextPrograms, focalPersons: nextFocals } = syncFocalAndPrograms(updatedPrograms, [created, ...focalPersons]);
    setPrograms(nextPrograms);
    setFocalPersons(nextFocals);

    showToast(`Registered focal personnel: ${newFocal.name}`);
    addSystemNotification(
      'New Focal Registered',
      `Registered focal officer ${newFocal.name} for ${newFocal.programName || 'unassigned program'}.`,
      'focal'
    );
  };

  const handleEditFocal = (updated: FocalPerson) => {
    // Update programs' focalIds list based on the updated focal person's programName assignment
    const updatedPrograms = programs.map(p => {
      if (p.name === updated.programName) {
        return { ...p, focalIds: Array.from(new Set([...(p.focalIds || []), updated.id])) };
      } else {
        return { ...p, focalIds: (p.focalIds || []).filter(id => id !== updated.id) };
      }
    });

    const updatedFocals = focalPersons.map(f => f.id === updated.id ? updated : f);
    const { programs: nextPrograms, focalPersons: nextFocals } = syncFocalAndPrograms(updatedPrograms, updatedFocals);
    setPrograms(nextPrograms);
    setFocalPersons(nextFocals);

    showToast(`Updated profile of ${updated.name}`);
    addSystemNotification(
      'Focal Officer Updated',
      `Updated focal registry details for ${updated.name}.`,
      'focal'
    );
  };

  const handleDeleteFocal = (id: string) => {
    const target = focalPersons.find(f => f.id === id);
    if (!target) return;

    // Remove this focal ID from all programs' focalIds
    const updatedPrograms = programs.map(p => ({
      ...p,
      focalIds: (p.focalIds || []).filter(fid => fid !== id)
    }));

    const updatedFocals = focalPersons.filter(f => f.id !== id);
    const { programs: nextPrograms, focalPersons: nextFocals } = syncFocalAndPrograms(updatedPrograms, updatedFocals);
    setPrograms(nextPrograms);
    setFocalPersons(nextFocals);

    showToast(`Removed personnel registry: ${target.name}`);
    addSystemNotification(
      'Focal Officer Decommissioned',
      `Removed focal registry entry for ${target.name}.`,
      'focal'
    );
  };

  // State mutation operations - PROGRAMS
  const handleAddProgram = (newProg: Omit<Program, 'id' | 'focalInitials'>) => {
    const nextId = `prog-${String(programs.length + 1).padStart(2, '0')}`;

    const created: Program = {
      ...newProg,
      id: nextId,
      focalInitials: '', // sync will calculate
      budgetStatus: 'On Track',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const { programs: nextPrograms, focalPersons: nextFocals } = syncFocalAndPrograms([created, ...programs], focalPersons);
    setPrograms(nextPrograms);
    setFocalPersons(nextFocals);

    showToast(`Activated municipal program: ${newProg.name}`);
    addSystemNotification(
      'New Program Activated',
      `Municipal program "${newProg.name}" has been launched under sector "${newProg.category || 'N/A'}".`,
      'program'
    );
  };

  const handleEditProgram = (updated: Program) => {
    const updatedWithTime = {
      ...updated,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const { programs: nextPrograms, focalPersons: nextFocals } = syncFocalAndPrograms(
      programs.map(p => p.id === updated.id ? updatedWithTime : p),
      focalPersons
    );
    setPrograms(nextPrograms);
    setFocalPersons(nextFocals);

    showToast(`Modified program targets: ${updated.name}`);
    addSystemNotification(
      'Program Details Modified',
      `Parameters and targets for "${updated.name}" have been modified.`,
      'program'
    );

    const rate = updated.budget > 0 ? (updated.utilizedAmount / updated.budget) * 100 : 0;
    if (rate >= 80) {
      addSystemNotification(
        'Critical Budget Warning',
        `Warning: "${updated.name}" utilization is at ${Math.round(rate)}%, nearing exhaustion.`,
        'warning'
      );
    }
  };

  const handleDeleteProgram = (id: string) => {
    const target = programs.find(p => p.id === id);
    if (!target) return;

    setPrograms(programs.filter(p => p.id !== id));
    showToast(`Decommissioned program: ${target.name}`);
    addSystemNotification(
      'Program Decommissioned',
      `Social program "${target.name}" has been disabled/decommissioned.`,
      'program'
    );
  };

  // State mutation operations - BUDGET ALLOCATION & AUDIT LOGS TRIGGER
  const handleAllocateBudget = (programId: string, amount: number, reason: string) => {
    const target = programs.find(p => p.id === programId);
    if (!target) return;

    const previousBudget = target.budget;
    const newBudget = target.budget + amount;

    // Proportional utilized value bump to maintain simulation realistic data ratios
    const utilizationFactor = 0.55; 
    const additionalUtilized = Math.round(amount * utilizationFactor);
    const newUtilized = Math.min(target.utilizedAmount + additionalUtilized, newBudget);

    // 1. Update program budget
    setPrograms(programs.map(p => p.id === programId ? {
      ...p,
      budget: newBudget,
      utilizedAmount: newUtilized
    } : p));

    // 2. Add allocation audit history record
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    const formattedTimestamp = new Date().toLocaleString('en-US', dateOptions);

    const auditId = `hist-${Date.now()}`;
    const auditRecord: AllocationHistory = {
      id: auditId,
      timestamp: formattedTimestamp,
      programName: target.name,
      previousBudget,
      newBudget,
      amountChanged: amount,
      reason,
      performedBy: profile.name, // Active Head Officer name in simulation
      role: 'Admin'
    };

    setAllocationHistory([auditRecord, ...allocationHistory]);
    showToast(`Allocated ₱${amount.toLocaleString()} to ${target.name}! Audit entry logged.`);

    // Add budget allocation notifications
    addSystemNotification(
      amount >= 0 ? 'Budget Allocated' : 'Budget Readjusted',
      `Changed budget of "${target.name}" by ₱${amount.toLocaleString()}. Reason: ${reason}`,
      amount >= 0 ? 'budget_alloc' : 'budget_edit'
    );

    const nextUtilRate = newBudget > 0 ? (newUtilized / newBudget) * 100 : 0;
    if (nextUtilRate >= 80) {
      addSystemNotification(
        'Critical Budget Warning',
        `Warning: "${target.name}" utilization is now at ${Math.round(nextUtilRate)}%, nearing exhaustion.`,
        'warning'
      );
    }

    // Auto-scroll/shift the user to History view to observe their reallocation manifest dynamically!
    setTimeout(() => {
      setActiveTab('history');
    }, 1200);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Active page component matching
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab 
            programs={programs} 
            allocationHistory={allocationHistory}
            focalPersons={focalPersons}
            setActiveTab={setActiveTab}
            onReviewFundsAlertClick={() => {
              setActiveTab('budget');
              showToast('Analyzing active program cash reserves...');
            }}
            onOpenAuditTool={() => {
              setActiveTab('history');
              showToast('Audit log review mode.');
            }}
            onRequestSupplement={() => {
              setActiveTab('budget');
              showToast('Select a program to allocate supplemental funds.');
            }}
          />
        );
      case 'focal':
        return (
          <FocalTab 
            focalPersons={focalPersons}
            onAddFocal={handleAddFocal}
            onEditFocal={handleEditFocal}
            onDeleteFocal={handleDeleteFocal}
            programsList={programs.map(p => ({ id: p.id, name: p.name }))}
          />
        );
      case 'program':
        return (
          <ProgramTab 
            programs={programs}
            focalPersons={focalPersons}
            allocationHistory={allocationHistory}
            onAddProgram={handleAddProgram}
            onEditProgram={handleEditProgram}
            onDeleteProgram={handleDeleteProgram}
          />
        );
      case 'budget':
        return (
          <BudgetTab 
            programs={programs}
            onAllocateBudget={handleAllocateBudget}
            allocationHistory={allocationHistory}
            profile={profile}
          />
        );
      case 'history':
        return <HistoryTab allocationHistory={allocationHistory} profile={profile} />;
      case 'settings':
        return <SettingsTab profile={profile} onProfileChange={setProfile} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'MSWDO Executive Dashboard';
      case 'focal': return 'Focal Management';
      case 'program': return 'Program Management';
      case 'budget': return 'Budget Management';
      case 'history': return 'Allocation History';
      case 'settings': return 'Account Settings';
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      {/* Dynamic Toast Alert Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2 border border-outline-variant font-bold text-xs"
          >
            <Landmark className="w-4 h-4 text-secondary-container" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Drawer Component (Responsive) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileSidebarOpen} 
        setIsOpen={setIsMobileSidebarOpen} 
        onLogout={() => {
          setIsAuthenticated(false);
          setActiveTab('dashboard');
          showToast('Signed out of MSWDO Head Portal.');
        }}
        profile={profile}
      />

      {/* Main Content Dashboard Frame */}
      <main className="flex-1 ml-0 lg:ml-[280px] h-screen overflow-y-auto bg-surface-bright flex flex-col">
        {/* Top App Bar Header */}
        <header className="sticky top-0 w-full z-20 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-tertiary-container flex justify-between items-center px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden hover:bg-surface-container-low rounded-full p-2 cursor-pointer transition-all active:scale-95 focus:outline-none"
              aria-label="Toggle Navigation menu"
            >
              <Menu className="w-5 h-5 text-primary" />
            </button>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">{getPageTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Premium Global Report Generation Button */}
            <button 
              onClick={() => {
                setIsReportModalOpen(true);
                showToast('Preparing report generation tool...');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-on-primary rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer focus:outline-none"
              title="Generate & Export Reports (PDF, Excel, CSV)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Generate Report</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-surface-container-low rounded-full relative focus:outline-none transition-colors group cursor-pointer"
                title="System Notifications"
              >
                <Bell className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white font-extrabold rounded-full flex items-center justify-center text-[9px] ring-2 ring-white">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <NotificationsDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
                notifications={notifications} 
                onMarkRead={(id) => {
                  setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                }} 
                onMarkAllRead={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  showToast('Marked all notifications as read.');
                }}
                onNavigateToTab={(tab) => {
                  setActiveTab(tab);
                  setIsNotificationsOpen(false);
                }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="hidden md:block font-bold text-xs text-primary bg-primary-fixed px-3.5 py-1.5 rounded-full">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <div 
                onClick={() => setActiveTab('settings')}
                className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 shadow-sm cursor-pointer select-none active:scale-95 transition-transform"
                title={`Logged in as ${profile.name}`}
              >
                <img 
                  className="w-full h-full object-cover" 
                  src={profile.profilePic} 
                  alt={profile.name} 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Canvas Area */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          {renderActiveTab()}
        </div>
      </main>

      {/* Global Comprehensive Report Generation Modal */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        programs={programs} 
        allocationHistory={allocationHistory} 
        adminName={profile.name} 
      />
    </div>
  );
}
