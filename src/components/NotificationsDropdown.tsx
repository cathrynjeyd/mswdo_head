import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  TrendingUp, 
  UserPlus, 
  FolderPlus, 
  Info, 
  Clock, 
  X,
  XCircle
} from 'lucide-react';

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'budget_alloc' | 'budget_edit' | 'warning' | 'focal' | 'program';
}

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateToTab?: (tab: 'dashboard' | 'focal' | 'program' | 'budget' | 'history') => void;
}

export default function NotificationsDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateToTab
}: NotificationsDropdownProps) {
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'budget_alloc':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        );
      case 'budget_edit':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'focal':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'program':
        return (
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center">
            <FolderPlus className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleNotificationClick = (item: SystemNotification) => {
    onMarkRead(item.id);
    
    // Auto-navigate to appropriate tabs for actionability!
    if (onNavigateToTab) {
      if (item.type === 'budget_alloc' || item.type === 'budget_edit') {
        onNavigateToTab('history');
      } else if (item.type === 'warning') {
        onNavigateToTab('budget');
      } else if (item.type === 'focal') {
        onNavigateToTab('focal');
      } else if (item.type === 'program') {
        onNavigateToTab('program');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay to catch clicks and close */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-32px)] bg-white dark:bg-surface-dim rounded-2xl shadow-2xl border border-outline-variant dark:border-tertiary-container z-50 overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-on-surface">System Alerts & Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      onMarkAllRead();
                    }}
                    className="p-1.5 hover:bg-white dark:hover:bg-surface rounded-full transition-colors text-primary hover:text-primary-hover flex items-center gap-1 font-bold text-xs"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-1 text-on-surface-variant hover:bg-white dark:hover:bg-surface rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 max-h-[380px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <div className="p-3 bg-surface-container-low rounded-full text-outline">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-on-surface">No alerts logged</p>
                  <p className="text-xs text-on-surface-variant">The MSWDO system is operating normally without issues.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-container-low transition-colors text-left relative ${
                      !item.read ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className={`text-xs text-on-surface truncate ${!item.read ? 'font-extrabold' : 'font-semibold'}`}>
                          {item.title}
                        </p>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 self-center" />
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium mt-1 leading-normal">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-on-surface-variant font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-outline-variant bg-surface-container-low text-center">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Logged System Events (24-Hour Buffer)
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
