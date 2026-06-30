import React, { useState } from 'react';
import { FocalPerson, FocalStatus } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
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
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  const openAddModal = () => {
    setEditingFocal(null);
    setName('');
    setPosition('');
    setContact('');
    setEmail('');
    setStatus('Active');
    setAssignedProgram(programsList[0]?.name || '');
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
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFocal) {
      onEditFocal({
        ...editingFocal,
        name,
        position,
        contact,
        email,
        status,
        programName: assignedProgram
      });
    } else {
      onAddFocal({
        name,
        position,
        contact,
        email,
        status,
        programName: assignedProgram
      });
    }
    setIsModalOpen(false);
  };

  // Filter logic
  const filteredFocalPersons = focalPersons.filter(focal => {
    const matchesSearch = 
      focal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setCurrentPage(1);
  };

  // Dynamic statistics calculations
  const totalFocalCount = focalPersons.length;
  const activeFocalCount = focalPersons.filter(f => f.status === 'Active').length;
  const onLeaveFocalCount = focalPersons.filter(f => f.status === 'On Leave').length;

  const getInitialsBgColor = (initials: string) => {
    const firstChar = initials.charCodeAt(0) || 0;
    const secondChar = initials.charCodeAt(1) || 0;
    const score = (firstChar + secondChar) % 4;
    switch (score) {
      case 0: return 'bg-secondary-container text-on-secondary-container';
      case 1: return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 2: return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-primary-fixed text-on-primary-fixed';
    }
  };

  const getStatusStyle = (fStatus: FocalStatus) => {
    switch (fStatus) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Leave': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Personnel Directory</h2>
          <p className="font-body-md text-body-md text-on-surface-variant font-medium mt-1">Manage department focal persons and program assignments.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-on-primary px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-md font-bold focus:outline-none"
        >
          <Plus className="w-5 h-5" />
          <span className="font-label-md text-label-md">Add New Focal</span>
        </button>
      </div>

      {/* Filter & Search Card */}
      <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4.5 h-4.5" />
          <input 
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-outline-variant focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md text-xs text-on-surface" 
            placeholder="Search by name, program, or position..." 
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
            <option>On Leave</option>
            <option>Inactive</option>
          </select>

          <select 
            className="flex-1 lg:w-52 bg-surface border border-outline-variant rounded-lg px-2.5 py-2 font-body-md text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface cursor-pointer"
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field as keyof FocalPerson);
              setSortDirection(direction as 'asc' | 'desc');
              setCurrentPage(1);
            }}
          >
            <option value="name-asc">Sort: Name (A–Z)</option>
            <option value="name-desc">Sort: Name (Z–A)</option>
            <option value="position-asc">Sort: Position (A–Z)</option>
            <option value="position-desc">Sort: Position (Z–A)</option>
            <option value="programName-asc">Sort: Program (A–Z)</option>
            <option value="programName-desc">Sort: Program (Z–A)</option>
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

      {/* Table Component */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse table-auto text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Focal Name</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('position')}
                  className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Position</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('programName')}
                  className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Assigned Program(s)</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Contact Info</th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-center cursor-pointer select-none hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th className="px-4 py-3 font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {paginatedFocal.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant font-medium">
                    No focal personnel matched your active filters.
                  </td>
                </tr>
              ) : (
                paginatedFocal.map((focal) => (
                  <tr 
                    key={focal.id} 
                    className="odd:bg-white even:bg-slate-50/20 hover:bg-slate-50 transition-colors group text-xs"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm flex-shrink-0 ${getInitialsBgColor(focal.avatarInitials)}`}>
                          {focal.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-[12.5px]">{focal.name}</div>
                          <div className="text-[9px] text-on-surface-variant font-bold tracking-wider">ID: {focal.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-on-surface-variant">
                      {focal.position}
                    </td>
                    <td className="px-4 py-3">
                      {focal.programName ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {focal.programName.split(',').map((prog, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-primary/5 text-primary rounded text-[9.5px] font-bold border border-primary/10 tracking-wide">
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-on-surface flex items-center gap-1">
                        <Phone className="w-3 h-3 text-outline" /> {focal.contact}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-outline" /> {focal.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusStyle(focal.status)}`}>
                        {focal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditModal(focal)}
                          className="p-1.5 hover:bg-secondary-container/25 text-secondary rounded-lg transition-colors focus:outline-none cursor-pointer" 
                          title="Edit Profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteFocal(focal.id)}
                          className="p-1.5 hover:bg-rose-50 text-error rounded-lg transition-colors focus:outline-none cursor-pointer" 
                          title="Delete Profile"
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

      {/* Stats Summary Bento Grid at Bottom */}
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
            <p className="font-body-md text-body-md text-on-surface-variant font-semibold">Active Program Leads</p>
            <h3 className="font-display-lg text-display-lg text-secondary font-bold mt-1">{activeFocalCount}</h3>
          </div>
          <div className="p-2.5 bg-secondary-fixed-dim rounded-lg text-on-secondary-fixed-variant shadow-sm">
            <ShieldCheck className="w-5 h-5 text-secondary" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex justify-between items-center">
          <div>
            <p className="font-body-md text-body-md text-on-surface-variant font-semibold">On Leave Personnel</p>
            <h3 className="font-display-lg text-display-lg text-error font-bold mt-1">
              {String(onLeaveFocalCount).padStart(2, '0')}
            </h3>
          </div>
          <div className="p-2.5 bg-error-container/20 rounded-lg text-on-error-container shadow-sm">
            <AlertCircle className="w-5 h-5 text-error" />
          </div>
        </div>
      </div>

      {/* Add / Edit Focal Modal Overlay Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  {editingFocal ? 'Edit Focal Assignment' : 'Add New Focal Personnel'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white rounded-full transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5 text-outline" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
                <div className="p-6 space-y-4 overflow-y-auto max-h-[400px]">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="focalName">Full Name</label>
                    <input 
                      id="focalName"
                      className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface"
                      placeholder="e.g. Elena Mendoza"
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Position */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="focalPosition">Position</label>
                    <input 
                      id="focalPosition"
                      className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface"
                      placeholder="e.g. Senior Social Worker"
                      required
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>

                  {/* Program */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="focalProgram">Assigned Program</label>
                    <select 
                      id="focalProgram"
                      className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface"
                      value={assignedProgram}
                      onChange={(e) => setAssignedProgram(e.target.value)}
                    >
                      <option value="">No Program Assigned</option>
                      {programsList.map(prog => (
                        <option key={prog.id} value={prog.name}>{prog.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="focalContact">Contact Number</label>
                    <input 
                      id="focalContact"
                      className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface"
                      placeholder="e.g. +63 912 345 6789"
                      required
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="focalEmail">Email Address</label>
                    <input 
                      id="focalEmail"
                      className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface"
                      placeholder="e.g. e.mendoza@mswdo.gov.ph"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Administrative Status</label>
                    <div className="flex gap-4 pt-1">
                      {['Active', 'On Leave', 'Inactive'].map((st) => (
                        <label key={st} className="flex items-center gap-1.5 cursor-pointer select-none text-on-surface font-medium text-sm">
                          <input 
                            type="radio" 
                            name="focal_status" 
                            checked={status === st}
                            onChange={() => setStatus(st as FocalStatus)}
                            className="w-4 h-4 accent-primary"
                          />
                          {st}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-surface-container-low border-t border-outline-variant flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 font-bold text-on-surface-variant hover:bg-white rounded-lg transition-all border border-outline-variant"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:opacity-90 transition-all active:scale-95"
                  >
                    {editingFocal ? 'Update Assignment' : 'Confirm Registration'}
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
