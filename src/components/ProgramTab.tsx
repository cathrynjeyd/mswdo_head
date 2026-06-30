import React, { useState } from 'react';
import { Program, ProgramStatus, FocalPerson, AllocationHistory } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  Users, 
  Wallet, 
  TrendingUp, 
  Flag,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Mail,
  Phone,
  Activity,
  ChevronRight,
  Sparkles,
  Briefcase,
  Layers,
  History,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProgramTabProps {
  programs: Program[];
  focalPersons: FocalPerson[];
  allocationHistory: AllocationHistory[];
  onAddProgram: (program: Omit<Program, 'id' | 'focalInitials'>) => void;
  onEditProgram: (program: Program) => void;
  onDeleteProgram: (id: string) => void;
}

export default function ProgramTab({ 
  programs, 
  focalPersons, 
  allocationHistory,
  onAddProgram, 
  onEditProgram, 
  onDeleteProgram 
}: ProgramTabProps) {

  // Search/Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  // Details Modal State
  const [detailsProgram, setDetailsProgram] = useState<Program | null>(null);

  // Sorting State
  const [sortField, setSortField] = useState<keyof Program | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Dynamic Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFocalIds, setSelectedFocalIds] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(1000000);
  const [utilizedAmount, setUtilizedAmount] = useState<number>(500000);
  const [status, setStatus] = useState<ProgramStatus>('Active');
  const [category, setCategory] = useState('');
  const [beneficiariesCount, setBeneficiariesCount] = useState<number>(1200);

  const openAddModal = () => {
    setEditingProgram(null);
    setName('');
    setDescription('');
    setSelectedFocalIds(focalPersons[0]?.id ? [focalPersons[0].id] : []);
    setBudget(1000000);
    setUtilizedAmount(0);
    setStatus('Active');
    setCategory('Social Service');
    setBeneficiariesCount(1200);
    setIsModalOpen(true);
  };

  const openEditModal = (prog: Program) => {
    setEditingProgram(prog);
    setName(prog.name);
    setDescription(prog.description);
    
    // Support transition from old single ID to new list
    const initialFocals = prog.focalIds && prog.focalIds.length > 0 
      ? prog.focalIds 
      : (prog.focalId ? [prog.focalId] : []);
    setSelectedFocalIds(initialFocals);
    
    setBudget(prog.budget);
    setUtilizedAmount(prog.utilizedAmount);
    setStatus(prog.status);
    setCategory(prog.category || 'Social Service');
    setBeneficiariesCount(prog.beneficiariesCount || 1200);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gather focal officer names
    const assignedFocals = focalPersons.filter(f => selectedFocalIds.includes(f.id));
    const focalName = assignedFocals.map(f => f.name).join(', ') || 'Unassigned';
    const primaryFocalId = selectedFocalIds[0] || '';
    
    // Guard utilized amount
    const cleanUtilized = Math.min(utilizedAmount, budget);

    if (editingProgram) {
      onEditProgram({
        ...editingProgram,
        name,
        description,
        focalName,
        focalId: primaryFocalId,
        focalIds: selectedFocalIds,
        budget,
        utilizedAmount: cleanUtilized,
        status,
        category,
        beneficiariesCount
      });
    } else {
      onAddProgram({
        name,
        description,
        focalName,
        focalId: primaryFocalId,
        focalIds: selectedFocalIds,
        budget,
        utilizedAmount: cleanUtilized,
        status,
        category,
        beneficiariesCount
      });
    }
    setIsModalOpen(false);
  };

  // Filter Logic
  const filteredPrograms = programs.filter(prog => {
    const matchesSearch = 
      prog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.focalName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'All Status' || 
      prog.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting Logic
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (!sortField) return 0;
    
    const valA = a[sortField];
    const valB = b[sortField];
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
    
    const strA = (valA || '').toString();
    const strB = (valB || '').toString();
    
    return sortDirection === 'asc' 
      ? strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' })
      : strB.localeCompare(strA, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Pagination calculation
  const totalItems = sortedPrograms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = sortedPrograms.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Program) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Stats Calculations (Dynamic from live state)
  const activeProgramsCount = programs.filter(p => p.status === 'Active').length;
  const totalBudgetValue = programs.reduce((sum, p) => sum + p.budget, 0);
  const totalBeneficiariesCount = programs.reduce((sum, p) => sum + (p.beneficiariesCount || 0), 0);
  const pendingReviewsCount = programs.filter(p => p.status === 'Reviewing').length;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `₱${(val / 1000000).toFixed(2)}M`;
    }
    return `₱${val.toLocaleString('en-US')}`;
  };

  const formatCurrencyFull = (val: number) => {
    return `₱${val.toLocaleString('en-US')}`;
  };

  const getStatusColor = (progStatus: ProgramStatus) => {
    switch (progStatus) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'On Hold': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Program Directory</h2>
          <p className="font-body-md text-body-md text-on-surface-variant font-medium mt-1">Oversee and monitor key social welfare initiatives, beneficiaries, and assigned personnel.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/95 transition-all active:scale-95 shadow-md font-bold text-sm focus:outline-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Program</span>
        </button>
      </div>

      {/* Compact Bento-style Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">Active Programs</p>
            <p className="text-xl text-on-surface font-extrabold mt-0.5">
              {String(activeProgramsCount).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-lg bg-secondary-container/15 flex items-center justify-center text-secondary shadow-sm">
            <Wallet className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">Total Appropriation</p>
            <p className="text-xl text-on-surface font-extrabold mt-0.5">
              {formatCurrency(totalBudgetValue)}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 shadow-sm">
            <Users className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">Total Beneficiaries</p>
            <p className="text-xl text-on-surface font-extrabold mt-0.5">
              {totalBeneficiariesCount.toLocaleString('en-US')}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-lg bg-error-container/15 flex items-center justify-center text-error shadow-sm">
            <Flag className="w-5 h-5 text-error" />
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">Review Pipeline</p>
            <p className="text-xl text-on-surface font-extrabold mt-0.5">
              {String(pendingReviewsCount).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4.5 h-4.5" />
          <input 
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-outline-variant focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md text-xs text-on-surface" 
            placeholder="Search by program name, description, or focal officer..." 
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select 
            className="flex-1 lg:w-40 bg-surface border border-outline-variant rounded-lg px-2.5 py-2 font-body-md text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface cursor-pointer"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Reviewing</option>
            <option>On Hold</option>
            <option>Completed</option>
          </select>

          <select 
            className="flex-1 lg:w-52 bg-surface border border-outline-variant rounded-lg px-2.5 py-2 font-body-md text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface cursor-pointer"
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field as keyof Program);
              setSortDirection(direction as 'asc' | 'desc');
              setCurrentPage(1);
            }}
          >
            <option value="name-asc">Sort: Title (A–Z)</option>
            <option value="name-desc">Sort: Title (Z–A)</option>
            <option value="beneficiariesCount-desc">Sort: Beneficiaries (High-Low)</option>
            <option value="beneficiariesCount-asc">Sort: Beneficiaries (Low-High)</option>
            <option value="budget-desc">Sort: Budget (High-Low)</option>
            <option value="budget-asc">Sort: Budget (Low-High)</option>
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

      {/* Redesigned Compact Minimal Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold cursor-pointer select-none hover:bg-slate-100 transition-colors w-[22%]"
                >
                  <div className="flex items-center gap-1">
                    <span>Program Name</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold w-[18%]">Assigned Focal(s)</th>
                <th 
                  onClick={() => handleSort('beneficiariesCount')}
                  className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-right cursor-pointer select-none hover:bg-slate-100 transition-colors w-[12%]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Beneficiaries</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('budget')}
                  className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-right cursor-pointer select-none hover:bg-slate-100 transition-colors w-[12%]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Annual Budget</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-right w-[12%]">Utilized</th>
                <th className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-right w-[12%]">Remaining</th>
                <th className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-center w-[8%]">Status</th>
                <th className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-center w-[12%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {paginatedPrograms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-on-surface-variant font-medium text-xs">
                    No active programs matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedPrograms.map((prog) => {
                  const remaining = prog.budget - prog.utilizedAmount;
                  const utilRate = prog.budget > 0 ? Math.round((prog.utilizedAmount / prog.budget) * 100) : 0;
                  
                  // Get assigned focal person objects for this program
                  const assignedOfficers = focalPersons.filter(f => prog.focalIds?.includes(f.id));

                  return (
                    <tr 
                      key={prog.id} 
                      className="odd:bg-white even:bg-slate-50/30 hover:bg-slate-50 transition-colors group text-xs"
                    >
                      {/* Program Title & Category */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col max-w-[240px]">
                          <span className="font-bold text-on-surface text-[13px] hover:text-primary transition-colors cursor-pointer" onClick={() => setDetailsProgram(prog)}>
                            {prog.name}
                          </span>
                          <span className="text-[10px] text-primary font-bold mt-0.5 tracking-wider bg-primary/5 px-1.5 py-0.5 rounded self-start">
                            {prog.category || 'Welfare'}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Focals (Avatars + Stacked List) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {assignedOfficers.length === 0 ? (
                            <span className="text-[10px] text-on-surface-variant italic font-medium">Unassigned</span>
                          ) : (
                            <div className="flex flex-col gap-1 max-w-[170px]">
                              {/* Show first officer with photo or initials */}
                              <div className="flex items-center gap-1.5">
                                <div className="w-5.5 h-5.5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-primary border border-primary/10 overflow-hidden flex-shrink-0 shadow-sm">
                                  <span>{assignedOfficers[0].avatarInitials}</span>
                                </div>
                                <span className="font-bold text-on-surface truncate max-w-[130px]" title={prog.focalName}>
                                  {assignedOfficers[0].name}
                                </span>
                              </div>
                              {/* Extra officers count chip */}
                              {assignedOfficers.length > 1 && (
                                <span className="text-[9px] text-primary font-extrabold bg-primary-container/20 px-1.5 py-0.5 rounded-full self-start">
                                  + {assignedOfficers.length - 1} more officer{assignedOfficers.length > 2 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Beneficiaries Count */}
                      <td className="px-4 py-3 text-right font-semibold text-on-surface tabular-nums">
                        {(prog.beneficiariesCount || 0).toLocaleString()}
                      </td>

                      {/* Budget */}
                      <td className="px-4 py-3 text-right font-bold text-on-surface tabular-nums">
                        {formatCurrencyFull(prog.budget)}
                      </td>

                      {/* Budget Utilized */}
                      <td className="px-4 py-3 text-right tabular-nums">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-on-surface">{formatCurrencyFull(prog.utilizedAmount)}</span>
                          <span className="text-[9px] text-on-surface-variant font-bold mt-0.5 bg-outline-variant/30 px-1.5 py-0.2 rounded-full">
                            {utilRate}%
                          </span>
                        </div>
                      </td>

                      {/* Remaining Budget */}
                      <td className="px-4 py-3 text-right font-bold text-secondary tabular-nums">
                        {formatCurrencyFull(remaining)}
                      </td>

                      {/* Status Badges */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border ${getStatusColor(prog.status)}`}>
                            {prog.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => setDetailsProgram(prog)}
                            className="p-1.5 hover:bg-primary-container/20 text-primary hover:text-primary rounded-lg transition-colors focus:outline-none cursor-pointer" 
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => openEditModal(prog)}
                            className="p-1.5 hover:bg-secondary-container/25 text-secondary rounded-lg transition-colors focus:outline-none cursor-pointer" 
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDeleteProgram(prog.id)}
                            className="p-1.5 hover:bg-rose-50 text-error rounded-lg transition-colors focus:outline-none cursor-pointer" 
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-on-surface-variant font-medium">
              Showing {paginatedPrograms.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} Programs
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase">Rows:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-outline-variant rounded px-1.5 py-0.5 text-xs font-bold text-on-surface outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 border border-outline-variant rounded hover:bg-surface-container-high transition-all disabled:opacity-40 font-bold focus:outline-none cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-6 h-6 rounded font-bold text-[11px] focus:outline-none transition-colors cursor-pointer ${
                    currentPage === idx + 1 
                      ? 'bg-primary text-on-primary' 
                      : 'border border-outline-variant hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 border border-outline-variant rounded hover:bg-surface-container-high transition-all disabled:opacity-40 font-bold focus:outline-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card View (Visible only on small screens) */}
      <div className="md:hidden space-y-3 mt-4">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Programs List (Mobile View)</h3>
        {programs.map((p) => {
          const uRate = p.budget > 0 ? Math.round((p.utilizedAmount / p.budget) * 100) : 0;
          return (
            <div key={p.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-on-surface text-[13px]">{p.name}</h4>
                  <span className="text-[10px] text-primary font-bold mt-0.5 tracking-wider bg-primary/5 px-1.5 py-0.5 rounded inline-block">
                    {p.category || 'Welfare'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${getStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-on-surface-variant line-clamp-2 font-medium">{p.description}</p>
              
              <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2 rounded-lg border border-outline-variant/20 text-center">
                <div>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase">Budget</p>
                  <p className="font-bold text-on-surface mt-0.5 text-[11px]">{formatCurrency(p.budget)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase">Beneficiaries</p>
                  <p className="font-bold text-on-surface mt-0.5 text-[11px]">{(p.beneficiariesCount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase">Spent Rate</p>
                  <p className="font-bold text-on-surface mt-0.5 text-[11px]">{uRate}%</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => setDetailsProgram(p)}
                  className="flex-1 py-1.5 border border-primary/20 hover:bg-primary/5 text-primary rounded-lg text-[11px] font-bold transition-all focus:outline-none cursor-pointer"
                >
                  View Details
                </button>
                <button 
                  onClick={() => openEditModal(p)}
                  className="flex-1 py-1.5 border border-outline-variant hover:bg-surface-container-high rounded-lg text-[11px] font-bold transition-all text-on-surface focus:outline-none cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Dynamic Details Modal Component */}
      <AnimatePresence>
        {detailsProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm" id="details-modal">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Layers className="w-5 h-5 text-primary" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{detailsProgram.name}</h3>
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{detailsProgram.category || 'Municipal Sector'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDetailsProgram(null)}
                  className="p-1.5 hover:bg-white border border-outline-variant rounded-full transition-colors focus:outline-none cursor-pointer"
                >
                  <X className="w-4 h-4 text-outline" />
                </button>
              </div>

              {/* Scrollable Content Pane */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Description Banner */}
                <div className="bg-slate-50 border border-outline-variant/40 rounded-xl p-5">
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">Program Objectives & Mandate</h4>
                  <p className="text-xs text-on-surface font-medium leading-relaxed">{detailsProgram.description}</p>
                </div>

                {/* Grid stats parameters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-outline-variant/60 rounded-xl p-4 bg-white hover:shadow-sm transition-all text-center">
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">Target Beneficiaries</span>
                    <span className="text-lg font-extrabold text-on-surface block mt-1">{(detailsProgram.beneficiariesCount || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-secondary font-bold block mt-0.5">Municipal Registry</span>
                  </div>

                  <div className="border border-outline-variant/60 rounded-xl p-4 bg-white hover:shadow-sm transition-all text-center">
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">Annual Appropriation</span>
                    <span className="text-lg font-extrabold text-on-surface block mt-1">{formatCurrency(detailsProgram.budget)}</span>
                    <span className="text-[10px] text-primary font-bold block mt-0.5">Approved FY 2026</span>
                  </div>

                  <div className="border border-outline-variant/60 rounded-xl p-4 bg-white hover:shadow-sm transition-all text-center">
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">Utilized Amount</span>
                    <span className="text-lg font-extrabold text-on-surface block mt-1">{formatCurrency(detailsProgram.utilizedAmount)}</span>
                    <span className="text-[10px] text-error font-bold block mt-0.5">{Math.round((detailsProgram.utilizedAmount / detailsProgram.budget) * 100)}% Spent</span>
                  </div>

                  <div className="border border-outline-variant/60 rounded-xl p-4 bg-white hover:shadow-sm transition-all text-center">
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">Remaining Balance</span>
                    <span className="text-lg font-extrabold text-secondary block mt-1">{formatCurrency(detailsProgram.budget - detailsProgram.utilizedAmount)}</span>
                    <span className="text-[10px] text-green-700 font-bold block mt-0.5">Available Funds</span>
                  </div>
                </div>

                {/* Budget Utilization progress bar */}
                <div className="border border-outline-variant/60 rounded-xl p-5 bg-white space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-on-surface">Budget Utilization Velocity</span>
                    <span className="text-primary">{Math.round((detailsProgram.utilizedAmount / detailsProgram.budget) * 100)}% Spent Rate</span>
                  </div>
                  <div className="w-full h-3 bg-outline-variant/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        (detailsProgram.utilizedAmount / detailsProgram.budget) >= 0.85 ? 'bg-error' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.round((detailsProgram.utilizedAmount / detailsProgram.budget) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase">
                    <span>Allocated: {formatCurrencyFull(detailsProgram.budget)}</span>
                    <span>Remaining: {formatCurrencyFull(detailsProgram.budget - detailsProgram.utilizedAmount)}</span>
                  </div>
                </div>

                {/* Split columns for assigned focals profiles & logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: List of assigned focals with full profiles */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span>Assigned Focal Officers ({focalPersons.filter(f => detailsProgram.focalIds?.includes(f.id)).length})</span>
                    </h4>
                    
                    <div className="space-y-3">
                      {focalPersons.filter(f => detailsProgram.focalIds?.includes(f.id)).length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-outline-variant rounded-xl text-on-surface-variant italic font-medium text-xs">
                          No focal officers currently assigned.
                        </div>
                      ) : (
                        focalPersons.filter(f => detailsProgram.focalIds?.includes(f.id)).map(focal => (
                          <div key={focal.id} className="border border-outline-variant/60 rounded-xl p-4 bg-slate-50 flex items-start gap-3 hover:shadow-sm transition-all">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-extrabold text-primary border border-primary/20 overflow-hidden flex-shrink-0 shadow-sm">
                              <span>{focal.avatarInitials}</span>
                            </div>
                            <div className="flex-1 min-w-0 text-xs">
                              <p className="font-extrabold text-on-surface truncate text-sm">{focal.name}</p>
                              <p className="text-primary font-bold mt-0.5">{focal.position}</p>
                              
                              <div className="mt-3 space-y-1 text-on-surface-variant font-semibold text-[11px]">
                                <p className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span>{focal.contact}</span>
                                </p>
                                <p className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{focal.email}</span>
                                </p>
                              </div>

                              <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full mt-3 uppercase tracking-wider border ${
                                focal.status === 'Active' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}>
                                {focal.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Recent budget allocation history for this program */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" />
                      <span>Budget Allocation Ledger</span>
                    </h4>

                    <div className="border border-outline-variant/60 rounded-xl p-4 bg-slate-50 max-h-[300px] overflow-y-auto space-y-4">
                      {allocationHistory.filter(h => h.programName === detailsProgram.name).length === 0 ? (
                        <div className="text-center py-10 text-on-surface-variant italic font-semibold text-xs">
                          No budget adjustments registered.
                        </div>
                      ) : (
                        <div className="relative pl-3 border-l border-primary/20 space-y-4">
                          {allocationHistory
                            .filter(h => h.programName === detailsProgram.name)
                            .map((log) => {
                              const isAddition = log.amountChanged >= 0;
                              return (
                                <div key={log.id} className="relative pb-1">
                                  {/* Bullet point indicator */}
                                  <div className="absolute -left-[16.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
                                  
                                  <div className="text-xs">
                                    <div className="flex justify-between items-start">
                                      <span className="font-extrabold text-[10px] text-primary/70 uppercase">{log.timestamp.split(',')[0]}</span>
                                      <span className={`font-bold ${isAddition ? 'text-green-700' : 'text-error'}`}>
                                        {isAddition ? '+' : '-'}{formatCurrencyFull(Math.abs(log.amountChanged))}
                                      </span>
                                    </div>
                                    <p className="font-bold text-on-surface mt-0.5">{log.reason}</p>
                                    <p className="text-[10px] text-on-surface-variant font-medium mt-1">Performed by: {log.performedBy}</p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit trail timestamps */}
                <div className="border-t border-outline-variant/40 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-on-surface-variant font-bold uppercase tracking-wider gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-outline" />
                    <span>Registered Date: {detailsProgram.createdAt || 'Jan 10, 2024'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-outline" />
                    <span>Last Updated Ledger: {detailsProgram.updatedAt || 'Jun 28, 2026'}</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-outline-variant flex justify-end gap-3 flex-shrink-0">
                <button 
                  onClick={() => setDetailsProgram(null)}
                  className="px-5 py-2 border border-outline-variant bg-white text-on-surface-variant font-bold hover:bg-slate-50 transition-colors rounded-xl text-xs focus:outline-none cursor-pointer"
                >
                  Close View
                </button>
                <button 
                  onClick={() => { setDetailsProgram(null); openEditModal(detailsProgram); }}
                  className="px-5 py-2 bg-primary text-white font-bold hover:opacity-95 transition-all active:scale-95 rounded-xl text-xs shadow-md focus:outline-none cursor-pointer"
                >
                  Edit Program Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Program Overlay Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm" id="program-modal">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-sm text-sm text-primary font-bold">
                  {editingProgram ? 'Modify Program Parameters' : 'Register New Social Program'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white rounded-full transition-colors focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5 text-outline" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
                <div className="p-5 space-y-4 overflow-y-auto max-h-[50vh] text-xs">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-on-surface-variant block" htmlFor="progName">Program Title</label>
                    <input 
                      id="progName"
                      className="w-full p-2.5 rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                      placeholder="e.g. Pantawid Pamilya (4Ps)"
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-on-surface-variant block" htmlFor="progDesc">Description</label>
                    <textarea 
                      id="progDesc"
                      className="w-full p-2.5 rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                      placeholder="Describe the primary objectives of the program..."
                      required
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-on-surface-variant block" htmlFor="progCat">Sector / Category</label>
                    <input 
                      id="progCat"
                      className="w-full p-2.5 rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-semibold"
                      placeholder="e.g. Elderly Citizens, Emergency Response"
                      required
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  {/* Assigned Focal Person Multi Selection Widget */}
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase text-[10px] text-on-surface-variant block">Assigned Focal Officers (Check to select multiple)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-outline-variant rounded-lg p-3 bg-surface max-h-36 overflow-y-auto shadow-inner">
                      {focalPersons.map(focal => {
                        const isSelected = selectedFocalIds.includes(focal.id);
                        return (
                          <button
                            key={focal.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedFocalIds(selectedFocalIds.filter(id => id !== focal.id));
                              } else {
                                setSelectedFocalIds([...selectedFocalIds, focal.id]);
                              }
                            }}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all text-[11px] font-semibold cursor-pointer ${
                              isSelected 
                                ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                : 'border-outline-variant hover:bg-slate-50 text-on-surface'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                              isSelected ? 'bg-primary border-primary text-white' : 'border-outline'
                            }`}>
                              {isSelected && <span className="text-[9px] leading-none">✓</span>}
                            </div>
                            <div className="truncate flex-1">
                              <p className="font-extrabold truncate">{focal.name}</p>
                              <p className="text-[9px] text-on-surface-variant font-bold truncate">{focal.position}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget & Utilized */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[10px] text-on-surface-variant block" htmlFor="progBudget">Budget Amount (₱)</label>
                      <input 
                        id="progBudget"
                        className="w-full p-2.5 rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-extrabold"
                        required
                        type="number"
                        min={1000}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[10px] text-on-surface-variant block" htmlFor="progUtil">Utilized Amount (₱)</label>
                      <input 
                        id="progUtil"
                        className="w-full p-2.5 rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-extrabold"
                        required
                        type="number"
                        min={0}
                        max={budget}
                        value={utilizedAmount}
                        onChange={(e) => setUtilizedAmount(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Status & Beneficiaries */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[10px] text-on-surface-variant block" htmlFor="progStatus">Administrative Status</label>
                      <select 
                        id="progStatus"
                        className="w-full p-2.5 rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface cursor-pointer font-bold"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ProgramStatus)}
                      >
                        <option value="Active">Active</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[10px] text-on-surface-variant block" htmlFor="progBeneficiaries">Target Beneficiaries</label>
                      <input 
                        id="progBeneficiaries"
                        className="w-full p-2.5 rounded-lg border border-outline-variant focus:ring-1 focus:ring-primary focus:outline-none bg-surface text-on-surface font-extrabold"
                        required
                        type="number"
                        min={1}
                        value={beneficiariesCount}
                        onChange={(e) => setBeneficiariesCount(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-low border-t border-outline-variant flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 font-bold text-on-surface-variant hover:bg-white rounded-lg transition-all border border-outline-variant cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer text-xs"
                  >
                    {editingProgram ? 'Save Program Changes' : 'Launch New Program'}
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
export { ProgramTab };
