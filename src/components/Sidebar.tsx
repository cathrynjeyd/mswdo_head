import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  LayoutDashboard, 
  Contact, 
  ClipboardList, 
  Wallet, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck 
} from 'lucide-react';
import { ActiveTab, UserSession } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
  session: UserSession;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen, 
  onLogout,
  session
}: SidebarProps) {
  
  const isFocal = session.role === 'focal';

  const navItems = isFocal ? [
    { id: 'dashboard', label: 'Focal Dashboard', icon: LayoutDashboard },
    { id: 'program', label: 'My Assigned Programs', icon: ClipboardList },
    { id: 'history', label: 'My Program Ledger', icon: History },
  ] as const : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'focal', label: 'Focal Management', icon: Contact },
    { id: 'program', label: 'Program Management', icon: ClipboardList },
    { id: 'budget', label: 'Budget Management', icon: Wallet },
    { id: 'history', label: 'Allocation History', icon: History },
  ] as const;

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close mobile menu if open
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4 overflow-y-auto no-scrollbar">
      {/* Brand Logo Header */}
      <div className="mb-8 px-2 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-sm">
          <Building2 className="text-white w-5 h-5" />
        </div>
        <div>
          <span className="font-headline-md text-headline-md font-bold text-primary block leading-none">MSWDO</span>
          <span className="text-[10px] font-label-md text-on-surface-variant uppercase tracking-widest block mt-0.5">
            {isFocal ? 'Focal Portal' : 'Head Portal'}
          </span>
        </div>
      </div>

      {/* User Card */}
      <div className="mb-6 p-4 bg-surface-container rounded-xl flex items-center gap-3 border border-outline-variant/30 flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 shadow-sm flex-shrink-0 bg-slate-100 flex items-center justify-center font-bold text-primary">
          {session.profilePic ? (
            <img 
              className="w-full h-full object-cover" 
              alt="User avatar"
              referrerPolicy="no-referrer"
              src={session.profilePic} 
            />
          ) : (
            session.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="overflow-hidden">
          <p className="font-label-md text-on-surface font-bold text-sm truncate">{session.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">
              {isFocal ? (session.position || 'Focal Officer') : 'Verified Head'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 mb-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => handleNavClick(item.id as ActiveTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium group ${
                isActive 
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
              }`} />
              <span className="font-body-md text-body-md">{item.label}</span>
            </button>
          );
        })}

        <button
          id="nav-item-settings"
          onClick={() => handleNavClick('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium group ${
            activeTab === 'settings' 
              ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <Settings className={`w-5 h-5 transition-transform group-hover:scale-105 ${
            activeTab === 'settings' ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
          }`} />
          <span className="font-body-md text-body-md">Account Settings</span>
        </button>
      </nav>

      {/* Sign Out Button */}
      <div className="mt-auto pt-4 border-t border-outline-variant/50 flex-shrink-0">
        <button
          id="logout-button"
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-error hover:bg-error-container/20 rounded-lg transition-colors font-semibold group"
        >
          <LogOut className="w-5 h-5 text-error transition-transform group-hover:-translate-x-0.5" />
          <span className="font-body-md text-body-md">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Sliding Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            
            {/* Sliding Drawer */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-lg z-50 lg:hidden"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-surface-container-high rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-outline" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
