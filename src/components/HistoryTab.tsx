import React, { useState } from 'react';
import { AllocationHistory } from '../types';
import { 
  Filter, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  User,
  ArrowUpDown,
  X,
  Eye,
  FileText,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryTabProps {
  allocationHistory: AllocationHistory[];
  profile: { name: string; email: string; municipality: string; profilePic: string; };
}

export default function HistoryTab({ allocationHistory, profile }: HistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState<keyof AllocationHistory | null>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Detail state
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AllocationHistory | null>(null);

  // Export report modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return '₱' + val.toLocaleString('en-US');
  };

  const formatChangedAmount = (val: number) => {
    if (val === 0) return '₱0';
    const sign = val > 0 ? '+' : '-';
    return `${sign}${formatCurrency(Math.abs(val))}`;
  };

  // 1. Fully Integrated Multi-faceted Filtering Logic
  const filteredHistory = allocationHistory.filter(item => {
    // Search filter
    const matchesSearch = 
      item.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Program filter
    const matchesProgram = programFilter === 'All' || item.programName === programFilter;

    // Action Type filter
    const isAddition = item.amountChanged >= 0;
    const matchesAction = 
      actionFilter === 'All' || 
      (actionFilter === 'Allocation' && isAddition) || 
      (actionFilter === 'Adjustment' && !isAddition);

    // Date calculations
    const date = new Date(item.timestamp);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear().toString();
      if (yearFilter !== 'All' && year !== yearFilter) return false;

      if (startDateFilter && date < new Date(startDateFilter)) return false;
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
    }

    return matchesSearch && matchesProgram && matchesAction;
  });

  // Unique program names for filtering dropdown
  const uniquePrograms = Array.from(new Set(allocationHistory.map(h => h.programName)));
  const uniqueYears = Array.from(new Set(allocationHistory.map(h => new Date(h.timestamp).getFullYear().toString()))).filter(y => y !== 'NaN');

  // Sorting Logic
  const sortedHistory = [...filteredHistory].sort((a, b) => {
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

  // Pagination
  const totalItems = sortedHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = sortedHistory.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof AllocationHistory) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Statistics summaries
  const totalTransactionsCount = filteredHistory.length;
  const peakMonth = 'October'; // Representative derived value
  const majorAdjustmentsCount = filteredHistory.filter(h => Math.abs(h.amountChanged) >= 500000).length;

  // EXPORT OPERATIONS
  const downloadCSV = () => {
    let csv = `MSWDO ALLOCATION HISTORY REPORT\r\n`;
    csv += `Municipal Social Welfare and Development Office\r\n`;
    csv += `Date Generated,${new Date().toLocaleString('en-US')}\r\n`;
    csv += `Generated By,${profile.name} (MSWDO Head Officer)\r\n\r\n`;
    csv += `FILTERS APPLIED: Program: ${programFilter} | Action: ${actionFilter} | Year: ${yearFilter}\r\n\r\n`;
    csv += `Date,Program,Action,Previous Budget,New Budget,Amount Changed,Reason,Performed By,Role\r\n`;
    
    filteredHistory.forEach(h => {
      const isAddition = h.amountChanged >= 0;
      csv += `"${h.timestamp}","${h.programName}","${isAddition ? 'Allocation' : 'Readjustment'}",${h.previousBudget},${h.newBudget},${h.amountChanged},"${h.reason}","${h.performedBy}","${h.role}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MSWDO_Allocation_History_${Date.now()}.csv`;
    link.click();
  };

  const downloadExcel = () => {
    let html = `<html><head><style>table{border-collapse:collapse;}td,th{border:1px solid #cbd5e1;padding:6px;font-family:sans-serif;}th{background:#f1f5f9;font-weight:bold;}</style></head><body>`;
    html += `<h3>MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT OFFICE (MSWDO)</h3>`;
    html += `<p><b>Budget Allocation History Log</b> - Generated: ${new Date().toLocaleString()}</p>`;
    html += `<p>Generated By: ${profile.name} • Applied Filters: Program: ${programFilter} | Action: ${actionFilter}</p><table>`;
    html += `<tr><th>Date</th><th>Program Name</th><th>Action</th><th>Previous Budget</th><th>New Budget</th><th>Change</th><th>Performed By</th><th>Reason</th></tr>`;
    
    filteredHistory.forEach(h => {
      const isAddition = h.amountChanged >= 0;
      html += `<tr><td>${h.timestamp}</td><td><b>${h.programName}</b></td><td>${isAddition ? 'Allocation' : 'Readjustment'}</td><td>₱${h.previousBudget.toLocaleString()}</td><td>₱${h.newBudget.toLocaleString()}</td><td style="color:${isAddition ? '#15803d' : '#b91c1c'}">₱${h.amountChanged.toLocaleString()}</td><td>${h.performedBy}</td><td>${h.reason}</td></tr>`;
    });
    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MSWDO_Allocation_History_${Date.now()}.xls`;
    link.click();
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html><head><style>body{font-family:sans-serif;color:#1e293b;padding:35px;}table{width:100%;border-collapse:collapse;margin:20px 0;}th{background:#f1f5f9;padding:10px;text-align:left;border-bottom:2px solid #cbd5e1;font-size:11px;}td{padding:10px;border-bottom:1px solid #e2e8f0;font-size:11px;}.right{text-align:right;}.bold{font-weight:bold;}.text-green{color:#15803d;font-weight:bold;}.text-red{color:#b91c1c;font-weight:bold;}</style></head>
      <body>
        <h2>Municipal Social Welfare and Development Office (MSWDO)</h2>
        <p><b>Report Title:</b> Budget Allocation History Ledger • <b>Date Generated:</b> ${new Date().toLocaleString()}</p>
        <p><b>Generated By:</b> ${profile.name} • <b>Applied Filters:</b> Program: ${programFilter}, Action: ${actionFilter}, Year: ${yearFilter}</p>
        <hr/>
        <table>
          <thead>
            <tr><th>Date/Time</th><th>Program</th><th>Action</th><th class="right">Previous Budget</th><th class="right">New Budget</th><th class="right">Change</th><th>By</th><th>Reason</th></tr>
          </thead>
          <tbody>
            ${filteredHistory.map(h => `
              <tr>
                <td>${h.timestamp}</td>
                <td class="bold">${h.programName}</td>
                <td>${h.amountChanged >= 0 ? 'Allocation' : 'Adjustment'}</td>
                <td class="right">₱${h.previousBudget.toLocaleString()}</td>
                <td class="right bold">₱${h.newBudget.toLocaleString()}</td>
                <td class="right ${h.amountChanged >= 0 ? 'text-green' : 'text-red'}">₱${h.amountChanged.toLocaleString()}</td>
                <td>${h.performedBy}</td>
                <td>${h.reason}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search audit ledger by program, administrator, ID, or purpose..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-on-surface-variant text-xs font-bold">🔍</span>
        </div>
        
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className={`p-2.5 border rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold ${isFiltersVisible ? 'bg-primary/5 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>{isFiltersVisible ? 'Hide Filters' : 'Filter Ledger'}</span>
          </button>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="p-2.5 bg-white border border-outline-variant text-on-surface-variant rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Modern Filter panel */}
      <AnimatePresence>
        {isFiltersVisible && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm overflow-hidden space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant">Program</label>
                <select value={programFilter} onChange={e => { setProgramFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2.5 text-xs rounded-lg border border-outline-variant bg-slate-50 font-bold outline-none">
                  <option value="All">All Programs</option>
                  {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant">Action Type</label>
                <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2.5 text-xs rounded-lg border border-outline-variant bg-slate-50 font-bold outline-none">
                  <option value="All">All Actions</option>
                  <option value="Allocation">Funded / Allocations</option>
                  <option value="Adjustment">Readjustments / Disbursements</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant">Year</label>
                <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2.5 text-xs rounded-lg border border-outline-variant bg-slate-50 font-bold outline-none">
                  <option value="All">All Years</option>
                  {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant">Start Date</label>
                <input type="date" value={startDateFilter} onChange={e => { setStartDateFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2 text-xs rounded-lg border border-outline-variant bg-slate-50 outline-none font-bold text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant">End Date</label>
                <input type="date" value={endDateFilter} onChange={e => { setEndDateFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2 text-xs rounded-lg border border-outline-variant bg-slate-50 outline-none font-bold text-slate-700" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => { setProgramFilter('All'); setActionFilter('All'); setYearFilter('All'); setStartDateFilter(''); setEndDateFilter(''); }} className="px-3 py-1.5 text-[11px] text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors border border-outline-variant">
                Reset Filter Panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Transactions (Filtered)</span>
            <span className="text-3xl font-extrabold text-on-surface mt-2 block">{totalTransactionsCount}</span>
          </div>
          <span className="text-[10px] text-primary font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Full history tracked
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Major Adjustments (&ge;₱500k)</span>
            <span className="text-3xl font-extrabold text-amber-700 mt-2 block">{majorAdjustmentsCount}</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold mt-2">Requires senior review</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Audit Security Health</span>
            <span className="text-3xl font-extrabold text-green-700 mt-2 block">100%</span>
          </div>
          <span className="text-[10px] text-green-700 font-bold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified by MSWDO
          </span>
        </div>
      </div>

      {/* Redesigned, Minimalist, Compact Table Section */}
      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse table-auto text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-outline-variant z-10">
              <tr>
                <th onClick={() => handleSort('timestamp')} className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant cursor-pointer select-none hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Date / Time</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th onClick={() => handleSort('programName')} className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant cursor-pointer select-none hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Program</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-center w-[120px]">Action</th>
                <th onClick={() => handleSort('previousBudget')} className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-right cursor-pointer select-none hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    <span>Previous Budget</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th onClick={() => handleSort('newBudget')} className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-right cursor-pointer select-none hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    <span>New Budget</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th onClick={() => handleSort('amountChanged')} className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-right cursor-pointer select-none hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount Changed</span>
                    <ArrowUpDown className="w-3 h-3 text-outline" />
                  </div>
                </th>
                <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant">Updated By</th>
                <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {paginatedHistory.map((item) => {
                const isAddition = item.amountChanged >= 0;
                return (
                  <tr key={item.id} className="odd:bg-white even:bg-slate-50/15 hover:bg-slate-50/70 transition-all">
                    <td className="px-4 py-2.5 font-medium text-slate-600 whitespace-nowrap">{item.timestamp}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-800">{item.programName}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${isAddition ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {isAddition ? 'Funded' : 'Readjusted'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-500 tabular-nums">{formatCurrency(item.previousBudget)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-800 tabular-nums">{formatCurrency(item.newBudget)}</td>
                    <td className={`px-4 py-2.5 text-right font-extrabold tabular-nums ${isAddition ? 'text-green-700' : 'text-rose-700'}`}>
                      {formatChangedAmount(item.amountChanged)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-primary flex items-center justify-center font-bold text-[8px] border border-primary/10">
                          {item.performedBy.split(' ').map(n => n[0]).join('')}
                        </span>
                        <span className="font-bold text-slate-700 text-xs">{item.performedBy}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => setSelectedHistoryItem(item)}
                        className="p-1 text-primary hover:bg-primary/5 rounded-lg transition-colors focus:outline-none"
                        title="View Full Ledger Details"
                      >
                        <Eye className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-on-surface-variant font-medium">
                    No history log entries matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Compact Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant gap-3">
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-500 font-bold">
              Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold">Rows:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-700 outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 border rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-6 h-6 rounded text-[10px] font-bold transition-colors ${
                    currentPage === idx + 1 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-slate-100 border text-slate-600'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. TRANSACTION LOGS EXPORT PREVIEW MODAL */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-primary">Export History Ledger Logs</h3>
                  <p className="text-xs text-on-surface-variant">Review complete compiled audit ledger before downloading</p>
                </div>
                <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-outline" /></button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-8 overflow-y-auto bg-slate-100/50">
                <div className="bg-white border p-8 max-w-3xl mx-auto rounded-xl space-y-6 text-xs text-slate-700">
                  <div className="flex items-center gap-4 border-b pb-4 border-primary">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">M</div>
                    <div>
                      <h4 className="font-extrabold text-sm uppercase text-primary">Municipal Social Welfare and Development Office</h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Audit logs and allocation ledger</p>
                    </div>
                  </div>

                  <div className="text-center py-2 bg-slate-50 rounded-lg">
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-widest block">Audit History Logs</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Generated: {new Date().toLocaleString()} • By {profile.name}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border text-[11px] space-y-1 text-slate-600">
                    <p><b>Filters:</b> Program Filter: {programFilter} | Action: {actionFilter} | Year: {yearFilter}</p>
                    <p><b>Records Matched:</b> {filteredHistory.length} ledger logs</p>
                  </div>

                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold">
                        <th className="p-2">Timestamp</th>
                        <th className="p-2">Program</th>
                        <th className="p-2">Action</th>
                        <th className="p-2 text-right">Previous</th>
                        <th className="p-2 text-right">New Budget</th>
                        <th className="p-2 text-right">Change</th>
                        <th className="p-2">Updated By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map(h => (
                        <tr key={h.id} className="border-b border-slate-100">
                          <td className="p-2">{h.timestamp}</td>
                          <td className="p-2 font-bold">{h.programName}</td>
                          <td className="p-2">{h.amountChanged >= 0 ? 'Allocation' : 'Disbursement'}</td>
                          <td className="p-2 text-right">₱{h.previousBudget.toLocaleString()}</td>
                          <td className="p-2 text-right font-bold">₱{h.newBudget.toLocaleString()}</td>
                          <td className="p-2 text-right font-bold" style={{ color: h.amountChanged >= 0 ? '#15803d' : '#b91c1c' }}>₱{h.amountChanged.toLocaleString()}</td>
                          <td className="p-2">{h.performedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-slate-50 border-t border-outline-variant flex gap-4">
                <button onClick={() => setIsExportModalOpen(false)} className="px-5 py-3 border rounded-xl font-bold text-xs bg-white text-on-surface-variant">Close</button>
                <div className="flex-1"></div>
                <button onClick={downloadCSV} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4" /> CSV</button>
                <button onClick={downloadExcel} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4" /> Excel</button>
                <button onClick={printReport} className="px-5 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/95 transition-colors flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print / PDF</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SPECIFIC TRANSACTION DETAILS MODAL */}
      <AnimatePresence>
        {selectedHistoryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="font-headline-md text-primary font-bold">Ledger Transaction Details</h3>
                  <p className="text-xs text-on-surface-variant">Transaction ID: {selectedHistoryItem.id}</p>
                </div>
                <button onClick={() => setSelectedHistoryItem(null)} className="p-2 hover:bg-white rounded-full transition-colors focus:outline-none"><X className="w-5 h-5 text-outline" /></button>
              </div>

              <div className="p-8 space-y-6 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Date & Time</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedHistoryItem.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Program Area</span>
                    <span className="font-bold text-slate-800 text-xs">{selectedHistoryItem.programName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Previous Budget</span>
                    <span className="font-bold text-slate-800">{formatCurrency(selectedHistoryItem.previousBudget)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Budget Shift</span>
                    <span className={`font-black ${selectedHistoryItem.amountChanged >= 0 ? 'text-green-700' : 'text-rose-700'}`}>
                      {selectedHistoryItem.amountChanged >= 0 ? '+' : ''}{formatCurrency(selectedHistoryItem.amountChanged)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">New Budget</span>
                    <span className="font-black text-slate-800">{formatCurrency(selectedHistoryItem.newBudget)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Reason & Modification Note</span>
                  <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200/60 font-medium leading-relaxed text-slate-800 italic">
                    "{selectedHistoryItem.reason || 'Routine municipal fund reallocation for program enhancement.'}"
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Authorized Officer Details</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary border">
                      {selectedHistoryItem.performedBy.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{selectedHistoryItem.performedBy}</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">{selectedHistoryItem.role || 'MSWDO Staff Officer'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-4 border-t border-outline-variant justify-end">
                <button className="px-5 py-3 bg-primary text-white font-bold rounded-xl shadow-lg transition-all text-xs" onClick={() => setSelectedHistoryItem(null)}>
                  Close Transaction View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
