import React, { useState } from 'react';
import { FocalPerson, FocalStatus } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  EyeOff,
  Edit, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  Copy,
  Key,
  Check,
  RefreshCw,
  Clock,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sha256, generateStrongPassword, validatePasswordStrength } from '../utils/security';

interface FocalTabProps {
  focalPersons: FocalPerson[];
  onAddFocal: (focal: Omit<FocalPerson, 'id' | 'avatarInitials'>) => void;
  onEditFocal: (focal: FocalPerson) => void;
  onDeleteFocal: (id: string) => void;
  programsList: { id: string; name: string }[];
}

export default function FocalTab({ 
  focalPersons, 
  onAddFocal, 
  onEditFocal, 
  onDeleteFocal,
  programsList
}: FocalTabProps) {
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFocal, setEditingFocal] = useState<FocalPerson | null>(null);

  // Sorting State
  const [sortField, setSortField] = useState<keyof FocalPerson | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Dynamic Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Add/Edit Form state
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FocalStatus>('Active');
  const [assignedProgram, setAssignedProgram] = useState('');
  
  // Credentials Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Reset password state for edit mode
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Error/Alert banner states
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const openAddModal = () => {
    setEditingFocal(null);
    setName('');
    setPosition('');
    setContact('');
    setEmail('');
    setStatus('Active');
    setAssignedProgram(programsList[0]?.name || '');
    
    // Credentials init
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsResettingPassword(false);
    setFormError(null);
    
    setIsModalOpen(true);
  };

  const openEditModal = (focal: FocalPerson) => {
    setEditingFocal(focal);
    setName(focal.name);
    setPosition(focal.position);
    setContact(focal.contact);
    setEmail(focal.email);
    setStatus(focal.status);
    setAssignedProgram(focal.programName || '');
    
    // Credentials init
    setUsername(focal.username || '');
    setPassword('');
    setConfirmPassword('');
    
    setIsResettingPassword(false);
    setResetPassword('');
    setResetConfirmPassword('');
    setShowResetPassword(false);
    setFormError(null);
    
    setIsModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const pwd = generateStrongPassword();
    if (editingFocal) {
      setResetPassword(pwd);
      setResetConfirmPassword(pwd);
      setShowResetPassword(true);
    } else {
      setPassword(pwd);
      setConfirmPassword(pwd);
      setShowPassword(true);
      setShowConfirmPassword(true);
    }
    triggerToast('Generated a strong random password! Keep it safe.');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validate Username uniqueness
    const usernameClean = username.trim().toLowerCase();
    if (!usernameClean) {
      setFormError('Username is required.');
      return;
    }

    if (usernameClean === 'admin_official') {
      setFormError('This username is reserved for system administration.');
      return;
    }

    const isUsernameTaken = focalPersons.some(f => 
      f.username?.toLowerCase() === usernameClean && 
      (!editingFocal || f.id !== editingFocal.id)
    );

    if (isUsernameTaken) {
      setFormError(`The username "${usernameClean}" is already assigned to another focal officer.`);
      return;
    }

    // 2. Validate password constraints (for ADD, or for EDIT with Reset Password enabled)
    if (!editingFocal) {
      if (!password) {
        setFormError('Password is required for new accounts.');
        return;
      }
      const strengthEval = validatePasswordStrength(password);
      if (strengthEval.strength === 'Weak') {
        setFormError('The password is too weak. Please meet the security parameters below.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords and Password Confirmation must match.');
        return;
      }
    } else {
      if (isResettingPassword) {
        if (!resetPassword) {
          setFormError('Please specify a new password or disable the Reset option.');
          return;
        }
        const strengthEval = validatePasswordStrength(resetPassword);
        if (strengthEval.strength === 'Weak') {
          setFormError('The new reset password is too weak.');
          return;
        }
        if (resetPassword !== resetConfirmPassword) {
          setFormError('Reset passwords do not match.');
          return;
        }
      }
    }

    // Process Add or Edit
    if (editingFocal) {
      // If deactivating, confirm
      const becameInactive = status === 'Inactive' && editingFocal.status !== 'Inactive';
      if (becameInactive && !window.confirm(`Are you sure you want to DEACTIVATE ${name}'s account? They will lose all portal access immediately.`)) {
        return;
      }

      onEditFocal({
        ...editingFocal,
        name,
        position,
        contact,
        email,
        status,
        programName: assignedProgram,
        username: usernameClean,
        ...(isResettingPassword ? { passwordHash: sha256(resetPassword) } : {})
      });
      triggerToast(`Focal officer "${name}" profile and credentials updated successfully.`);
    } else {
      onAddFocal({
        name,
        position,
        contact,
        email,
        status,
        programName: assignedProgram,
        username: usernameClean,
        passwordHash: sha256(password)
      });
      triggerToast(`Account created for ${name} successfully! Credentials can now be issued.`);
    }
    setIsModalOpen(false);
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username);
    triggerToast('Username copied to clipboard!');
  };

  // Filter logic
  const filteredFocalPersons = focalPersons.filter(focal => {
    const matchesSearch = 
      focal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (focal.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      focal.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (focal.programName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'All Status' || 
      focal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedFocalPersons = [...filteredFocalPersons].sort((a, b) => {
    if (!sortField) return 0;
    
    let valA = '';
    let valB = '';
    
    if (sortField === 'programName') {
      valA = a.programName || '';
      valB = b.programName || '';
    } else {
      valA = (a[sortField] || '').toString();
      valB = (b[sortField] || '').toString();
    }
    
    return sortDirection === 'asc' 
      ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
      : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Pagination calculation
  const totalItems = sortedFocalPersons.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFocal = sortedFocalPersons.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof FocalPerson) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Status Styling Helpers
  const getStatusStyle = (st: FocalStatus) => {
    switch (st) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getInitialsBgColor = (initials: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-emerald-100 text-emerald-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-amber-100 text-amber-700',
      'bg-indigo-100 text-indigo-700'
    ];
    const charCodeSum = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
    return colors[charCodeSum % colors.length];
  };

  // Stats Counters
  const totalFocalCount = focalPersons.length;
  const activeFocalCount = focalPersons.filter(f => f.status === 'Active').length;
  const onLeaveFocalCount = focalPersons.filter(f => f.status === 'On Leave').length;

  const activePasswordStrength = !editingFocal ? validatePasswordStrength(password) : validatePasswordStrength(resetPassword);

  return (
    <div className="space-y-6">
      {/* Toast feedback notifier */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl z-[150] flex items-center gap-2 font-bold text-xs border border-slate-800"
          >
            <Check className="w-4 h-4 text-green-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Focal Person Registries & Security Accounts</h1>
          <p className="text-xs text-on-surface-variant mt-1">MSWDO Head controls account provisioning, password management, and system access.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg shadow-sm hover:bg-primary-hover active:scale-95 transition-all cursor-pointer text-xs"
          id="addFocalButton"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Focal Account</span>
        </button>
      </div>

      {/* Minimalist Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Search Bar */}
        <div className="relative w-full md:w-80 group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search name, username, program..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
          />
        </div>

        {/* Right Side: Options and resets */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="All Status">All Accounts</option>
            <option value="Active">Active accounts</option>
            <option value="On Leave">On Leave accounts</option>
            <option value="Inactive">Inactive accounts</option>
          </select>

          {/* Static Filter Icon Indicator */}
          <div className="bg-slate-50 text-on-surface-variant p-2.5 rounded-lg border border-outline-variant flex items-center justify-center" title="Filter controls active">
            <Filter className="w-4 h-4 text-on-surface-variant" />
          </div>

          {/* Reset Filters Button */}
          {(searchTerm !== '' || statusFilter !== 'All Status' || sortField !== 'name' || sortDirection !== 'asc') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All Status');
                setSortField('name');
                setSortDirection('asc');
                setCurrentPage(1);
              }}
              className="bg-surface text-error p-2 rounded-lg border border-outline-variant hover:bg-rose-50 hover:border-rose-100 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Redesigned Minimal Compact Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse table-auto text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 font-bold text-[11px] text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Full Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('username')}
                  className="px-4 py-3 font-bold text-[11px] text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Username</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('programName')}
                  className="px-4 py-3 font-bold text-[11px] text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors animate-pulse"
                >
                  <div className="flex items-center gap-1">
                    <span>Assigned Program(s)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('position')}
                  className="px-4 py-3 font-bold text-[11px] text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Position</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Account Status</th>
                <th className="px-4 py-3 font-bold text-[11px] text-slate-500 uppercase tracking-wider text-center">Last Login</th>
                <th className="px-4 py-3 font-bold text-[11px] text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {paginatedFocal.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant font-medium">
                    No focal personnel matched your active filters.
                  </td>
                </tr>
              ) : (
                paginatedFocal.map((focal) => (
                  <tr 
                    key={focal.id} 
                    className="odd:bg-white even:bg-slate-50/20 hover:bg-slate-50 transition-colors group text-xs"
                  >
                    {/* Name */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm flex-shrink-0 ${getInitialsBgColor(focal.avatarInitials)}`}>
                          {focal.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[12px]">{focal.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold tracking-wider">ID: {focal.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-primary">
                      {focal.username ? (
                        <div className="flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded border border-primary/10 w-fit">
                          <span>{focal.username}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(focal.username || '');
                              triggerToast('Username copied!');
                            }}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                            title="Copy Username"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">no account</span>
                      )}
                    </td>

                    {/* Assigned programs */}
                    <td className="px-4 py-3.5">
                      {focal.programName ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {focal.programName.split(',').map((prog, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9.5px] font-bold border border-slate-200/60 tracking-wide">
                              {prog.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-outline rounded text-[9.5px] font-bold italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-600">
                      {focal.position}
                    </td>

                    {/* Account status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-[9.5px] font-bold border uppercase tracking-wider ${getStatusStyle(focal.status)}`}>
                        {focal.status}
                      </span>
                    </td>

                    {/* Last Login log */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center text-[10px] font-bold text-slate-500">
                      {focal.lastLogin ? (
                        <div className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{focal.lastLogin}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Never logged in</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditModal(focal)}
                          className="p-1.5 hover:bg-slate-100 text-secondary rounded-lg transition-colors cursor-pointer" 
                          title="Edit Profile & Account Credentials"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you absolutely sure you want to delete focal officer registry for "${focal.name}"? This removes all account access.`)) {
                              onDeleteFocal(focal.id);
                              triggerToast(`Deleted ${focal.name} from the directory.`);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-error rounded-lg transition-colors cursor-pointer" 
                          title="Delete Personnel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-body-md text-body-md text-on-surface-variant font-medium">
              Showing {paginatedFocal.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} Focal Persons
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-bold">Rows:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-outline-variant rounded-lg px-2 py-1 text-xs font-bold text-on-surface outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent transition-all focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm focus:outline-none ${
                    currentPage === idx + 1 
                      ? 'bg-primary text-on-primary' 
                      : 'hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent transition-all focus:outline-none"
            >
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      {/* Personnel Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex justify-between items-center">
          <div>
            <p className="font-body-md text-body-md text-on-surface-variant font-semibold">Total Personnel</p>
            <h3 className="font-display-lg text-display-lg text-primary font-bold mt-1">{totalFocalCount}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="p-2.5 bg-primary-fixed-dim rounded-lg text-on-primary-fixed-variant shadow-sm">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-0.5 mt-2">
              <TrendingUp className="w-3 h-3" /> +12% vs LY
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex justify-between items-center">
          <div>
            <p className="font-body-md text-body-md text-on-surface-variant font-semibold">Active Accounts</p>
            <h3 className="font-display-lg text-display-lg text-secondary font-bold mt-1">{activeFocalCount}</h3>
          </div>
          <div className="p-2.5 bg-secondary-fixed-dim rounded-lg text-on-secondary-fixed-variant shadow-sm">
            <ShieldCheck className="w-5 h-5 text-secondary" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex justify-between items-center">
          <div>
            <p className="font-body-md text-body-md text-on-surface-variant font-semibold">On Leave Accounts</p>
            <h3 className="font-display-lg text-display-lg text-error font-bold mt-1">
              {String(onLeaveFocalCount).padStart(2, '0')}
            </h3>
          </div>
          <div className="p-2.5 bg-error-container/20 rounded-lg text-on-error-container shadow-sm">
            <AlertCircle className="w-5 h-5 text-error" />
          </div>
        </div>
      </div>

      {/* Provisioning / Edit Account Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-8"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low flex-shrink-0">
                <h3 className="font-bold text-sm text-primary flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <span>{editingFocal ? 'Edit Account & Details' : 'Provision Focal Account'}</span>
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white rounded-full transition-colors focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5 text-outline" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="flex flex-col overflow-hidden">
                <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] md:max-h-[500px]">
                  
                  {formError && (
                    <div className="bg-red-50 text-error text-xs p-3 rounded-lg border border-red-200 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* SECTION 1: Personal Information */}
                  <div>
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-outline-variant pb-1 mb-3">1. Personal Information</h4>
                    
                    <div className="space-y-3">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="focalName">Full Name</label>
                        <input 
                          id="focalName"
                          className="w-full p-2.5 text-xs rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                          placeholder="Elena Mendoza"
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      {/* Position */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="focalPosition">Position</label>
                        <input 
                          id="focalPosition"
                          className="w-full p-2.5 text-xs rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                          placeholder="Senior Social Worker"
                          required
                          type="text"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                        />
                      </div>

                      {/* Assigned Program */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="focalProgram">Assigned Program</label>
                        <select 
                          id="focalProgram"
                          className="w-full p-2.5 text-xs rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                          value={assignedProgram}
                          onChange={(e) => setAssignedProgram(e.target.value)}
                        >
                          <option value="">No Program Assigned</option>
                          {programsList.map(prog => (
                            <option key={prog.id} value={prog.name}>{prog.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Contact */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="focalContact">Contact Number</label>
                          <input 
                            id="focalContact"
                            className="w-full p-2.5 text-xs rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                            placeholder="+63 912 345 6789"
                            required
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="focalEmail">Email Address</label>
                          <input 
                            id="focalEmail"
                            className="w-full p-2.5 text-xs rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                            placeholder="e.mendoza@mswdo.gov.ph"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Active Status</label>
                        <div className="flex gap-4 pt-1">
                          {['Active', 'On Leave', 'Inactive'].map((st) => (
                            <label key={st} className="flex items-center gap-1.5 cursor-pointer select-none text-on-surface font-medium text-xs">
                              <input 
                                type="radio" 
                                name="focal_status" 
                                checked={status === st}
                                onChange={() => setStatus(st as FocalStatus)}
                                className="w-3.5 h-3.5 accent-primary"
                              />
                              <span>{st}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Account Information */}
                  <div className="pt-2">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-outline-variant pb-1 mb-3">2. Account Credentials</h4>
                    
                    <div className="space-y-3">
                      {/* Username */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="username">Login Username</label>
                        <div className="relative">
                          <input 
                            id="username"
                            className="w-full p-2.5 pr-10 text-xs rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-mono font-bold"
                            placeholder="e.g. elena_mendoza"
                            required
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          />
                          <button
                            type="button"
                            onClick={handleCopyUsername}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Copy Username"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Credentials Input Forms (Add Mode) */}
                      {!editingFocal ? (
                        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-outline-variant/60">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Set Account Password</span>
                            <button
                              type="button"
                              onClick={handleGeneratePassword}
                              className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 rounded px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Generate Strong Password</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500" htmlFor="password">Password</label>
                              <div className="relative">
                                <input 
                                  id="password"
                                  className="w-full p-2 text-xs rounded border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-white text-on-surface font-bold"
                                  required
                                  type={showPassword ? 'text' : 'password'}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500" htmlFor="confirmPassword">Confirm Password</label>
                              <div className="relative">
                                <input 
                                  id="confirmPassword"
                                  className="w-full p-2 text-xs rounded border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-white text-on-surface font-bold"
                                  required
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Password Strength display */}
                          {password && (
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                <span>Password Security strength:</span>
                                <span className={
                                  activePasswordStrength.strength === 'Strong' ? 'text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100' :
                                  activePasswordStrength.strength === 'Medium' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100' :
                                  'text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100'
                                }>
                                  {activePasswordStrength.strength}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-full flex overflow-hidden gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={`h-full flex-1 transition-all ${
                                      i < activePasswordStrength.score 
                                        ? activePasswordStrength.strength === 'Strong' ? 'bg-green-500' 
                                          : activePasswordStrength.strength === 'Medium' ? 'bg-amber-500' 
                                          : 'bg-red-500'
                                        : 'bg-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              {activePasswordStrength.feedback.length > 0 && (
                                <ul className="text-[10px] text-slate-400 pl-1 list-disc list-inside space-y-0.5 font-medium">
                                  {activePasswordStrength.feedback.map((fb, idx) => (
                                    <li key={idx}>{fb}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {password && confirmPassword && (
                            <div className="text-[10px] font-bold">
                              {password === confirmPassword ? (
                                <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</span>
                              ) : (
                                <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Passwords do not match yet</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Edit Mode - Reset Password Toggle Drawer */
                        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-outline-variant/60">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isResettingPassword} 
                                onChange={(e) => setIsResettingPassword(e.target.checked)} 
                                className="w-3.5 h-3.5 accent-primary"
                              />
                              <span>Reset user account password?</span>
                            </label>
                            {isResettingPassword && (
                              <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 rounded px-2.5 py-1 flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Generate Password</span>
                              </button>
                            )}
                          </div>

                          {isResettingPassword && (
                            <div className="space-y-3 pt-2 border-t border-slate-200 animate-fadeIn">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500" htmlFor="resetPassword">New Password</label>
                                  <div className="relative">
                                    <input 
                                      id="resetPassword"
                                      className="w-full p-2 text-xs rounded border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-white text-on-surface font-bold"
                                      required={isResettingPassword}
                                      type={showResetPassword ? 'text' : 'password'}
                                      value={resetPassword}
                                      onChange={(e) => setResetPassword(e.target.value)}
                                      placeholder="••••••••"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowResetPassword(!showResetPassword)}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 animate-pulse"
                                    >
                                      {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500" htmlFor="resetConfirm">Confirm New Password</label>
                                  <input 
                                    id="resetConfirm"
                                    className="w-full p-2 text-xs rounded border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-white text-on-surface font-bold"
                                    required={isResettingPassword}
                                    type={showResetPassword ? 'text' : 'password'}
                                    value={resetConfirmPassword}
                                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                  />
                                </div>
                              </div>

                              {/* Strength indicator */}
                              {resetPassword && (
                                <div className="space-y-1 pt-1 text-[10px]">
                                  <div className="flex justify-between items-center font-bold text-slate-500">
                                    <span>Reset Password Strength:</span>
                                    <span className={
                                      activePasswordStrength.strength === 'Strong' ? 'text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100' :
                                      activePasswordStrength.strength === 'Medium' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100' :
                                      'text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100'
                                    }>
                                      {activePasswordStrength.strength}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-200 rounded-full flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`h-full flex-1 transition-all ${
                                          i < activePasswordStrength.score 
                                            ? activePasswordStrength.strength === 'Strong' ? 'bg-green-500' 
                                              : activePasswordStrength.strength === 'Medium' ? 'bg-amber-500' 
                                              : 'bg-red-500'
                                            : 'bg-slate-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {resetPassword && resetConfirmPassword && (
                                <div className="text-[10px] font-bold">
                                  {resetPassword === resetConfirmPassword ? (
                                    <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</span>
                                  ) : (
                                    <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Passwords do not match yet</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="p-5 bg-surface-container-low border-t border-outline-variant flex gap-4 flex-shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 font-bold text-slate-500 hover:bg-white rounded-lg transition-all border border-outline-variant text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:opacity-90 transition-all active:scale-95 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{editingFocal ? 'Apply Changes' : 'Confirm Provisioning'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
