import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Check, 
  AlertCircle,
  Copy,
  UserCheck
} from 'lucide-react';
import { FocalPerson } from '../types';
import { sha256, validatePasswordStrength } from '../utils/security';

interface FocalSettingsTabProps {
  focal?: FocalPerson;
  onUpdateFocal: (updated: FocalPerson) => void;
}

export default function FocalSettingsTab({ focal, onUpdateFocal }: FocalSettingsTabProps) {
  const [name, setName] = useState(focal?.name || '');
  const [email, setEmail] = useState(focal?.email || '');
  const [contact, setContact] = useState(focal?.contact || '');
  const [username, setUsername] = useState(focal?.username || '');
  
  // Password Reset fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Alert/Toast states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!focal) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl text-center">
        <p className="text-on-surface-variant font-bold text-sm">No focal profile loaded.</p>
      </div>
    );
  }

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('Username is required', 'error');
      return;
    }
    
    const updatedFocal: FocalPerson = {
      ...focal,
      name,
      email,
      contact,
      username: username.trim().toLowerCase()
    };
    
    onUpdateFocal(updatedFocal);
    showToast('Your profile details have been saved successfully!', 'success');
  };

  const handleResetPassword = () => {
    // Validations
    if (!newPassword) {
      showToast('New password cannot be empty', 'error');
      return;
    }

    const strengthEval = validatePasswordStrength(newPassword);
    if (strengthEval.strength === 'Weak') {
      showToast('Password is too weak. Please meet the security requirements.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    const updatedFocal: FocalPerson = {
      ...focal,
      passwordHash: sha256(newPassword)
    };

    onUpdateFocal(updatedFocal);
    setShowConfirmModal(false);
    
    // Clear password inputs
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    showToast('Password reset successfully! Use your new credentials next time.', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const strength = newPassword ? validatePasswordStrength(newPassword) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Dynamic Toast Feedback banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-3 border shadow-sm font-bold text-xs ${
              toast.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Info Card */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            <span>Focal Officer Account Settings</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">Review or update your personal workspace configuration</p>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name (Contact Head to rename)</label>
            <input 
              type="text" 
              disabled 
              value={name}
              className="p-2.5 rounded-lg border border-outline-variant bg-slate-50 text-slate-500 text-xs font-bold outline-none cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">Username</label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 pl-3 pr-10 rounded-lg border border-outline-variant bg-surface text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                placeholder="focal_username"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(username);
                  showToast('Copied username to clipboard!', 'success');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Copy Username"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2.5 rounded-lg border border-outline-variant bg-surface text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.mendoza@mswdo.gov.ph"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">Contact Number</label>
            <input 
              type="text" 
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="p-2.5 rounded-lg border border-outline-variant bg-surface text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary"
              placeholder="+63 912 345 6789"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Program</label>
            <input 
              type="text" 
              disabled 
              value={focal?.programName || 'No program assigned'}
              className="p-2.5 rounded-lg border border-outline-variant bg-slate-50 text-slate-500 text-xs font-bold outline-none cursor-not-allowed"
            />
          </div>

          <div className="col-span-2 flex justify-end pt-2">
            <button 
              type="submit"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold shadow-sm hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>

      {/* Password Reset Card */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <span>Reset Account Password</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">Configure a high-strength password to guard your Focal Portal workspace</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-lg border border-outline-variant bg-surface text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-lg border border-outline-variant bg-surface text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Strength Indicator */}
          {newPassword && strength && (
            <div className="bg-slate-50 p-4 rounded-lg border border-outline-variant space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Password Strength:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  strength.strength === 'Strong' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  strength.strength === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {strength.strength}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full flex-1 transition-all ${
                      i < strength.score 
                        ? strength.strength === 'Strong' ? 'bg-emerald-500' 
                          : strength.strength === 'Medium' ? 'bg-amber-500' 
                          : 'bg-red-500'
                        : 'bg-slate-200'
                    }`} 
                  />
                ))}
              </div>

              {strength.feedback.length > 0 && (
                <div className="pt-1.5 space-y-1 text-slate-400 text-[11px] font-medium list-disc">
                  {strength.feedback.map((fb, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{fb}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Check Passwords Matching */}
          {newPassword && confirmPassword && (
            <div className="text-xs">
              {newPassword === confirmPassword ? (
                <p className="text-green-600 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> Passwords match!
                </p>
              ) : (
                <p className="text-error flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" /> Passwords do not match yet.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (!newPassword) {
                  showToast('Please specify a new password first.', 'error');
                  return;
                }
                const strengthEval = validatePasswordStrength(newPassword);
                if (strengthEval.strength === 'Weak') {
                  showToast('Password is too weak.', 'error');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  showToast('Passwords do not match.', 'error');
                  return;
                }
                setShowConfirmModal(true);
              }}
              className="px-5 py-2.5 bg-error text-white font-bold rounded-lg text-xs hover:bg-error/90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>Reset Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-outline-variant p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-50 text-error rounded-full flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Are you sure you want to change your password?</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  This action is irreversible. You will be logged out of other devices and will need to use your new password next time you authenticate.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 hover:bg-slate-50 text-slate-600 text-xs font-bold border border-outline-variant rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleResetPassword}
                className="px-4 py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 cursor-pointer"
              >
                Yes, Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
