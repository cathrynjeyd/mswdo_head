import React, { useState } from 'react';
import { Program, AllocationHistory } from '../types';
import { 
  PlusCircle, 
  ShoppingCart, 
  Wallet, 
  Info, 
  Filter, 
  Download, 
  X, 
  Calendar, 
  CheckCircle, 
  Sparkles,
  ChevronDown,
  ClipboardList,
  TrendingUp,
  FileText,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BudgetTabProps {
  programs: Program[];
  allocationHistory: AllocationHistory[];
  profile: { name: string; email: string; municipality: string; profilePic: string; };
  onAllocateBudget: (programId: string, amount: number, reason: string) => void;
}

export default function BudgetTab({ programs, allocationHistory, profile, onAllocateBudget }: BudgetTabProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || 'prog-01');
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  // Allocation Form States
  const [targetProgramId, setTargetProgramId] = useState(programs[0]?.id || '');
  const [allocationAmount, setAllocationAmount] = useState<number>(500000);
  const [allocationReason, setAllocationReason] = useState('');

  // Filtering States
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  // Report Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFullHistoryModalOpen, setIsFullHistoryModalOpen] = useState(false);

  // History Report Configuration
  const [histReportProg, setHistReportProg] = useState('All');
  const [histReportYear, setHistReportYear] = useState('All');
  const [histReportStart, setHistReportStart] = useState('');
  const [histReportEnd, setHistReportEnd] = useState('');

  const formatCurrency = (val: number) => '₱' + val.toLocaleString('en-US');

  const getProgramHealth = (prog: Program) => {
    const rate = prog.budget > 0 ? (prog.utilizedAmount / prog.budget) * 100 : 0;
    if (rate >= 90) return 'Critical';
    if (rate >= 70) return 'Warning';
    return 'Healthy';
  };

  // 1. Filtered Programs List
  const filteredPrograms = programs.filter(prog => {
    if (filterProgram !== 'All' && prog.name !== filterProgram) return false;
    
    const health = getProgramHealth(prog);
    if (filterStatus !== 'All' && health !== filterStatus) return false;

    const dateStr = prog.updatedAt || prog.createdAt || 'Jan 01, 2024';
    const date = new Date(dateStr);
    
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('en-US', { month: 'short' });
      
      if (filterYear !== 'All' && year !== filterYear) return false;
      if (filterMonth !== 'All' && month !== filterMonth) return false;

      if (filterStartDate && date < new Date(filterStartDate)) return false;
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
    }
    return true;
  });

  // Dynamically compute budget states from FILTERED programs
  const totalBudget = filteredPrograms.reduce((sum, p) => sum + p.budget, 0);
  const totalUtilized = filteredPrograms.reduce((sum, p) => sum + p.utilizedAmount, 0);
  const remainingBalance = totalBudget - totalUtilized;
  const utilizationRate = totalBudget > 0 ? Math.round((totalUtilized / totalBudget) * 100) : 0;

  const currentSelectedProgram = filteredPrograms.find(p => p.id === selectedProgramId) || filteredPrograms[0] || programs[0];

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProgramId || allocationAmount <= 0) return;
    onAllocateBudget(targetProgramId, allocationAmount, allocationReason || 'Routine budget realignment');
    setIsAllocationModalOpen(false);
    setAllocationReason('');
    setAllocationAmount(500000);
  };

  // Dynamic timeline entries from allocationHistory
  const getTimelineEntries = (programName: string) => {
    const entries = allocationHistory.filter(h => h.programName === programName);
    if (entries.length > 0) {
      return entries.map(h => ({
        date: h.timestamp.split(',')[0],
        amount: h.amountChanged,
        type: h.amountChanged >= 0 ? 'funded' : 'disbursed',
        title: h.reason,
        detail: `Handled by ${h.performedBy}`
      }));
    }
    // Fallback static history to ensure seamless visual rendering if no dynamic history
    if (programName.includes('Senior')) {
      return [
        { date: 'Oct 12, 2023', amount: -450000, type: 'disbursed', title: 'Social Pension Disbursement', detail: '150 Beneficiaries' },
        { date: 'Sep 28, 2023', amount: -120000, type: 'disbursed', title: 'Medical Assistance Fund', detail: '42 Beneficiaries' },
        { date: 'Aug 15, 2023', amount: -85000, type: 'disbursed', title: 'Centenarian Incentive Grant', detail: '1 Beneficiary' },
        { date: 'Jul 30, 2023', amount: 2000000, type: 'funded', title: 'Q3 Budget Top-up', detail: 'Gov. Allocation' },
      ];
    } else if (programName.includes('4Ps') || programName.includes('Pantawid')) {
      return [
        { date: 'Oct 24, 2023', amount: -1850000, type: 'disbursed', title: 'Bi-monthly Cash Transfer', detail: '942 Household Units' },
        { date: 'Sep 10, 2023', amount: -220000, type: 'disbursed', title: 'Maternal Nutrition Package', detail: '110 Mothers' },
        { date: 'Aug 05, 2023', amount: -380000, type: 'disbursed', title: 'Educational Subsidies', detail: '450 Scholars' },
        { date: 'Jun 15, 2023', amount: 4000000, type: 'funded', title: 'FY Mid-Year Allocation', detail: 'National Treasury' },
      ];
    } else {
      return [
        { date: 'Oct 22, 2023', amount: -500000, type: 'disbursed', title: 'Emergency Assistance', detail: 'Crisis Relief support' },
        { date: 'Aug 12, 2023', amount: 1500000, type: 'funded', title: 'Budget Allocation Injection', detail: 'Internal allocation' },
      ];
    }
  };

  // Filter List values helper
  const uniqueProgramNames = Array.from(new Set(programs.map(p => p.name)));
  const uniqueYears = Array.from(new Set(programs.map(p => new Date(p.updatedAt || p.createdAt || '2024').getFullYear().toString())));
  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Exports for Current Filtered Budget Report
  const downloadBudgetCSV = () => {
    let csv = `MSWDO MUNICIPAL BUDGET UTILIZATION REPORT\r\n`;
    csv += `Municipal Social Welfare and Development Office\r\n`;
    csv += `Date Generated,${new Date().toLocaleString('en-US')}\r\n`;
    csv += `Generated By,${profile.name} (MSWDO Head Officer)\r\n\r\n`;
    csv += `FILTERS APPLIED: Program: ${filterProgram} | Status: ${filterStatus} | Year: ${filterYear} | Month: ${filterMonth}\r\n\r\n`;
    csv += `PROGRAM SUMMARY:\r\n`;
    csv += `ID,Program Name,Total Budget,Utilized Amount,Remaining Balance,Utilization Rate,Health Status\r\n`;
    filteredPrograms.forEach(p => {
      const remaining = p.budget - p.utilizedAmount;
      const rate = p.budget > 0 ? Math.round((p.utilizedAmount / p.budget) * 100) : 0;
      csv += `"${p.id}","${p.name}",${p.budget},${p.utilizedAmount},${remaining},${rate}%,"${getProgramHealth(p)}"\r\n`;
    });
    csv += `\r\nSUMMARY STATISTICS:\r\n`;
    csv += `Total Annual Appropriation,${totalBudget}\r\n`;
    csv += `Total Utilized,${totalUtilized}\r\n`;
    csv += `Remaining Balance,${remainingBalance}\r\n`;
    csv += `Overall Utilization Rate,${utilizationRate}%\r\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MSWDO_Budget_Report_${Date.now()}.csv`;
    link.click();
  };

  const downloadBudgetExcel = () => {
    let html = `<html><head><style>table{border-collapse:collapse;}td,th{border:1px solid #cbd5e1;padding:6px;}th{background-color:#f1f5f9;font-weight:bold;}</style></head><body>`;
    html += `<h3>MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT OFFICE (MSWDO)</h3>`;
    html += `<p><b>Budget Utilization Report</b> - Generated: ${new Date().toLocaleString()}</p>`;
    html += `<p>Generated By: ${profile.name} • Applied Filters: Program: ${filterProgram} | Status: ${filterStatus}</p><table>`;
    html += `<tr><th>ID</th><th>Program Name</th><th>Total Budget</th><th>Utilized</th><th>Remaining</th><th>Util %</th><th>Health</th></tr>`;
    filteredPrograms.forEach(p => {
      const remaining = p.budget - p.utilizedAmount;
      const rate = p.budget > 0 ? Math.round((p.utilizedAmount / p.budget) * 100) : 0;
      html += `<tr><td>${p.id}</td><td><b>${p.name}</b></td><td>₱${p.budget.toLocaleString()}</td><td>₱${p.utilizedAmount.toLocaleString()}</td><td>₱${remaining.toLocaleString()}</td><td>${rate}%</td><td>${getProgramHealth(p)}</td></tr>`;
    });
    html += `<tr><td colspan="2"><b>Totals</b></td><td><b>₱${totalBudget.toLocaleString()}</b></td><td><b>₱${totalUtilized.toLocaleString()}</b></td><td><b>₱${remainingBalance.toLocaleString()}</b></td><td><b>${utilizationRate}%</b></td><td></td></tr>`;
    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MSWDO_Budget_Report_${Date.now()}.xls`;
    link.click();
  };

  const printBudgetReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html><head><style>body{font-family:sans-serif;color:#1e293b;padding:30px;}table{width:100%;border-collapse:collapse;margin:20px 0;}th{background:#f1f5f9;padding:10px;text-align:left;border-bottom:2px solid #cbd5e1;font-size:11px;}td{padding:10px;border-bottom:1px solid #e2e8f0;font-size:11px;}.right{text-align:right;}.bold{font-weight:bold;}.badge{padding:3px 8px;border-radius:99px;font-size:9px;font-weight:bold;border:1px solid;}.badge-Critical{background:#fef2f2;color:#b91c1c;border-color:#fca5a5;}.badge-Warning{background:#fffbeb;color:#b45309;border-color:#fcd34d;}.badge-Healthy{background:#f0fdf4;color:#15803d;border-color:#86efac;}</style></head>
      <body>
        <h2>Municipal Social Welfare and Development Office (MSWDO)</h2>
        <p><b>Report Title:</b> Budget Utilization Report • <b>Date:</b> ${new Date().toLocaleString()}</p>
        <p><b>Generated By:</b> ${profile.name} • <b>Applied Filters:</b> Program: ${filterProgram}, Status: ${filterStatus}, Year: ${filterYear}, Month: ${filterMonth}</p>
        <hr/>
        <h3>Summary Statistics</h3>
        <p><b>Total Budget:</b> ${formatCurrency(totalBudget)} | <b>Utilized:</b> ${formatCurrency(totalUtilized)} (${utilizationRate}%) | <b>Remaining Balance:</b> ${formatCurrency(remainingBalance)}</p>
        
        <h3>Program Summary</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Program Name</th><th class="right">Total Budget</th><th class="right">Utilized</th><th class="right">Remaining</th><th class="right">Util %</th><th>Health</th></tr>
          </thead>
          <tbody>
            ${filteredPrograms.map(p => `
              <tr>
                <td>${p.id}</td>
                <td class="bold">${p.name}</td>
                <td class="right bold">₱${p.budget.toLocaleString()}</td>
                <td class="right">₱${p.utilizedAmount.toLocaleString()}</td>
                <td class="right">₱${(p.budget - p.utilizedAmount).toLocaleString()}</td>
                <td class="right">${p.budget > 0 ? Math.round((p.utilizedAmount / p.budget) * 100) : 0}%</td>
                <td><span class="badge badge-${getProgramHealth(p)}">${getProgramHealth(p)}</span></td>
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

  // 2. Filtered Allocation History for Full History Report
  const filteredHistoryReport = allocationHistory.filter(h => {
    if (histReportProg !== 'All' && h.programName !== histReportProg) return false;
    const date = new Date(h.timestamp);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear().toString();
      if (histReportYear !== 'All' && year !== histReportYear) return false;
      if (histReportStart && date < new Date(histReportStart)) return false;
      if (histReportEnd) {
        const end = new Date(histReportEnd);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
    }
    return true;
  });

  const downloadHistoryCSV = () => {
    let csv = `MSWDO BUDGET ALLOCATION HISTORY REPORT\r\n`;
    csv += `Date Generated,${new Date().toLocaleString('en-US')}\r\n`;
    csv += `Generated By,${profile.name}\r\n\r\n`;
    csv += `Transaction ID,Timestamp,Program Name,Action,Previous Budget,New Budget,Amount Changed,Reason,Performed By\r\n`;
    filteredHistoryReport.forEach(h => {
      csv += `"${h.id}","${h.timestamp}","${h.programName}","${h.amountChanged >= 0 ? 'Allocation' : 'Adjustment'}",${h.previousBudget},${h.newBudget},${h.amountChanged},"${h.reason}","${h.performedBy}"\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MSWDO_Allocation_History_${Date.now()}.csv`;
    link.click();
  };

  const downloadHistoryExcel = () => {
    let html = `<html><head><style>table{border-collapse:collapse;}td,th{border:1px solid #cbd5e1;padding:6px;}</style></head><body>`;
    html += `<h3>MSWDO ALLOCATION HISTORY REPORT</h3><p>Generated: ${new Date().toLocaleString()}</p><table>`;
    html += `<tr><th>ID</th><th>Timestamp</th><th>Program</th><th>Prev Budget</th><th>New Budget</th><th>Change</th><th>By</th><th>Reason</th></tr>`;
    filteredHistoryReport.forEach(h => {
      html += `<tr><td>${h.id}</td><td>${h.timestamp}</td><td><b>${h.programName}</b></td><td>₱${h.previousBudget.toLocaleString()}</td><td>₱${h.newBudget.toLocaleString()}</td><td>₱${h.amountChanged.toLocaleString()}</td><td>${h.performedBy}</td><td>${h.reason}</td></tr>`;
    });
    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MSWDO_Allocation_History_${Date.now()}.xls`;
    link.click();
  };

  const printHistoryReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html><head><style>body{font-family:sans-serif;padding:30px;color:#1e293b;}table{width:100%;border-collapse:collapse;margin-top:20px;}th{background:#f1f5f9;padding:8px;text-align:left;border-bottom:2px solid #cbd5e1;font-size:10px;}td{padding:8px;border-bottom:1px solid #e2e8f0;font-size:10px;}.right{text-align:right;}</style></head>
      <body>
        <h2>MSWDO Budget Allocation History Ledger</h2>
        <p>Generated: ${new Date().toLocaleString()} by ${profile.name}</p>
        <p>Filters: Program: ${histReportProg} | Year: ${histReportYear}</p>
        <hr/>
        <table>
          <thead>
            <tr><th>Date/Time</th><th>Program</th><th class="right">Previous Budget</th><th class="right">New Budget</th><th class="right">Change</th><th>By</th><th>Reason</th></tr>
          </thead>
          <tbody>
            ${filteredHistoryReport.map(h => `
              <tr>
                <td>${h.timestamp}</td>
                <td><b>${h.programName}</b></td>
                <td class="right">₱${h.previousBudget.toLocaleString()}</td>
                <td class="right">₱${h.newBudget.toLocaleString()}</td>
                <td class="right" style="color: ${h.amountChanged >= 0 ? '#15803d' : '#b91c1c'}">₱${h.amountChanged.toLocaleString()}</td>
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
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-primary text-white rounded-[1.5rem] p-8 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none bg-gradient-to-l from-white/20 to-transparent"></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/70">Total Appropriation (Filtered)</p>
            <h3 className="text-3xl md:text-4xl font-extrabold mt-2">{formatCurrency(totalBudget)}.00</h3>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-6">
            <div>
              <p className="text-xs text-white/60 mb-1.5 font-semibold">Utilization Rate</p>
              <div className="flex items-center gap-2.5">
                <div className="w-32 h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${utilizationRate}%` }} transition={{ duration: 0.8 }} className="bg-white h-full" />
                </div>
                <span className="font-bold text-sm">{utilizationRate}%</span>
              </div>
            </div>
            <button onClick={() => { setTargetProgramId(programs[0]?.id || ''); setIsAllocationModalOpen(true); }} className="bg-white text-primary px-5 py-2.5 rounded-full font-bold text-xs hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-1.5 shadow-md">
              <PlusCircle className="w-4 h-4" />
              <span>Allocate Budget</span>
            </button>
          </div>
        </div>

        {/* Total Utilized Card */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-rose-50 text-error rounded-xl flex items-center justify-center mb-4 border border-rose-200">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Utilized</p>
            <h4 className="text-2xl font-black text-on-surface mt-1">{formatCurrency(totalUtilized)}</h4>
          </div>
          <p className="text-[11px] text-on-surface-variant font-bold flex items-center gap-1.5 mt-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Updates dynamically from data</span>
          </p>
        </div>

        {/* Remaining Balance Card */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-4 border border-green-200">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Remaining Balance</p>
            <h4 className="text-2xl font-black text-on-surface mt-1">{formatCurrency(remainingBalance)}</h4>
          </div>
          <p className="text-[11px] text-green-700 font-bold flex items-center gap-1.5 mt-4">
            <CheckCircle className="w-4 h-4" />
            <span>Durable reserve levels</span>
          </p>
        </div>
      </div>

      {/* Main Table section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-headline-md text-on-surface font-bold text-lg">Program Budget Allocation</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">Filter, search, or review active appropriation accounts</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsFiltersVisible(!isFiltersVisible)} className={`p-2.5 border rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${isFiltersVisible ? 'bg-primary/5 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-slate-50'}`}>
              <Filter className="w-4 h-4" />
              <span>{isFiltersVisible ? 'Hide Filters' : 'Filter Records'}</span>
            </button>
            <button onClick={() => setIsExportModalOpen(true)} className="p-2.5 bg-white border border-outline-variant text-on-surface-variant rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Dynamic filter panel */}
        <AnimatePresence>
          {isFiltersVisible && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm overflow-hidden space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant">Program</label>
                  <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} className="w-full p-2.5 text-xs rounded-lg border border-outline-variant bg-slate-50 font-bold outline-none">
                    <option value="All">All Programs</option>
                    {uniqueProgramNames.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant">Health Status</label>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full p-2.5 text-xs rounded-lg border border-outline-variant bg-slate-50 font-bold outline-none">
                    <option value="All">All Statuses</option>
                    <option value="Healthy">Healthy (&lt;70%)</option>
                    <option value="Warning">Warning (70%-89%)</option>
                    <option value="Critical">Critical (&ge;90%)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant">Year</label>
                  <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full p-2.5 text-xs rounded-lg border border-outline-variant bg-slate-50 font-bold outline-none">
                    <option value="All">All Years</option>
                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant">Month</label>
                  <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full p-2.5 text-xs rounded-lg border border-outline-variant bg-slate-50 font-bold outline-none">
                    <option value="All">All Months</option>
                    {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant">Start Date</label>
                  <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-outline-variant bg-slate-50 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant">End Date</label>
                  <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-outline-variant bg-slate-50 outline-none" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => { setFilterProgram('All'); setFilterStatus('All'); setFilterYear('All'); setFilterMonth('All'); setFilterStartDate(''); setFilterEndDate(''); }} className="px-3 py-1.5 text-[11px] text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors border border-outline-variant">
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Program Cards & History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Program Table (Col span 2) */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant w-[42%]">Program Name</th>
                      <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-right w-[18%]">Budget</th>
                      <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-right w-[16%]">Utilized</th>
                      <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-right w-[14%]">Remaining</th>
                      <th className="px-4 py-3 font-bold uppercase text-[11px] text-on-surface-variant text-center w-[10%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {filteredPrograms.map((prog) => {
                      const isSelected = selectedProgramId === prog.id;
                      const remaining = prog.budget - prog.utilizedAmount;
                      const health = getProgramHealth(prog);
                      return (
                        <tr key={prog.id} onClick={() => setSelectedProgramId(prog.id)} className={`transition-all cursor-pointer select-none group text-xs ${isSelected ? 'bg-secondary-container/15 border-l-4 border-l-primary' : 'odd:bg-white even:bg-slate-50/20 hover:bg-slate-50'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isSelected ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-primary'}`}>
                                <ClipboardList className="w-3.5 h-3.5" />
                              </span>
                              <span className="font-bold text-on-surface text-[12.5px]">{prog.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-on-surface tabular-nums">{formatCurrency(prog.budget)}</td>
                          <td className="px-4 py-3 text-right text-on-surface-variant font-semibold tabular-nums">{formatCurrency(prog.utilizedAmount)}</td>
                          <td className="px-4 py-3 text-right text-secondary font-bold tabular-nums">{formatCurrency(remaining)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${health === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : health === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                {health}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPrograms.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant font-medium">
                          No budget records found matching active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar (Timeline History) */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-outline-variant flex flex-col justify-between h-full relative min-h-[380px]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-headline-sm text-on-surface font-bold">Usage History</h4>
                  <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">
                    {currentSelectedProgram ? currentSelectedProgram.name : 'All Programs'}
                  </p>
                </div>
              </div>

              {/* Timeline List */}
              <div className="space-y-5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                {getTimelineEntries(currentSelectedProgram?.name || '').map((entry, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-primary-container/30 pb-4 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-container border-4 border-white shadow-sm"></div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{entry.date}</span>
                      <span className={`text-xs font-black ${entry.amount < 0 ? 'text-error' : 'text-green-700'}`}>
                        {entry.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(entry.amount))}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-on-surface">{entry.title}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{entry.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setIsFullHistoryModalOpen(true)} className="mt-6 w-full py-3 border border-dashed border-primary/40 text-primary font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span>Generate Full History Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Health Analysis Summary Section */}
      <div className="bg-surface-container-low rounded-[1.5rem] p-6 md:p-8 border border-outline-variant flex flex-col md:flex-row items-start md:items-center gap-8">
        <div className="flex-shrink-0 relative w-36 h-36 mx-auto md:mx-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-200 stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <motion.path initial={{ strokeDasharray: '0, 100' }} animate={{ strokeDasharray: `${utilizationRate}, 100` }} transition={{ duration: 1 }} className="text-primary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeLinecap="round" strokeWidth="3" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-primary">{utilizationRate}%</span>
            <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest mt-0.5">Spent</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h4 className="font-headline-sm text-on-surface font-bold text-sm tracking-wide uppercase text-slate-500">Program Health Metrics</h4>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
              {filteredPrograms.length} Programs Analyzed
            </span>
          </div>
          
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {filteredPrograms.map(prog => {
              const uRate = prog.budget > 0 ? Math.round((prog.utilizedAmount / prog.budget) * 100) : 0;
              const health = getProgramHealth(prog);
              const remainingVal = prog.budget - prog.utilizedAmount;
              let explanation = '';
              let recommendation = '';
              
              if (health === 'Critical') {
                explanation = `Critical reserve levels. Remaining funds are extremely low.`;
                recommendation = `Immediate funding top-up or program disbursement freeze required.`;
              } else if (health === 'Warning') {
                explanation = `Moderate spend acceleration. Reaching caution threshold soon.`;
                recommendation = `Restrict auxiliary spending and monitor subsequent claims.`;
              } else {
                explanation = `Healthy operational pace. Spend velocity is within optimal parameters.`;
                recommendation = `Continue regular social service operations without interruption.`;
              }

              return (
                <div key={prog.id} className="p-3.5 rounded-xl border border-outline-variant bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-[12.5px]">{prog.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border ${health === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : health === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {health} ({uRate}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-medium leading-normal">
                      {explanation} <span className="font-bold text-primary">{recommendation}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 sm:border-l sm:border-slate-200 sm:pl-4">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase block tracking-wider">Remaining</span>
                    <span className="text-[12.5px] font-extrabold text-secondary tabular-nums block">{formatCurrency(remainingVal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. CURRENT FILTERED BUDGET EXPORT PREVIEW MODAL */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-primary">Budget Report Preview & Export</h3>
                  <p className="text-xs text-on-surface-variant">Review official document layout prior to generating final file</p>
                </div>
                <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-outline" /></button>
              </div>

              {/* Preview Canvas */}
              <div className="flex-1 p-8 overflow-y-auto bg-slate-100/50">
                <div className="bg-white shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto rounded-xl space-y-6 text-xs text-slate-700" id="budget-report-print-area">
                  <div className="flex items-center gap-4 border-b pb-4 border-primary">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">M</div>
                    <div>
                      <h4 className="font-extrabold text-sm uppercase text-primary">Municipal Social Welfare and Development Office</h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Municipal Government of Iloilo • Philippines</p>
                    </div>
                  </div>

                  <div className="text-center py-2 bg-slate-50 rounded-lg">
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-widest block">Budget Utilization Report</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Generated: {new Date().toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50/55 p-3 rounded-lg border border-slate-100">
                    <div>
                      <p><b>Report Title:</b> Budget Utilization Summary</p>
                      <p><b>Prepared By:</b> {profile.name} (MSWDO Officer)</p>
                    </div>
                    <div>
                      <p><b>Filters:</b> Program: {filterProgram} | Status: {filterStatus}</p>
                      <p><b>Timeline:</b> Year: {filterYear} | Month: {filterMonth}</p>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-100">
                        <th className="p-2 font-bold">ID</th>
                        <th className="p-2 font-bold">Program Name</th>
                        <th className="p-2 font-bold text-right">Budget</th>
                        <th className="p-2 font-bold text-right">Utilized</th>
                        <th className="p-2 font-bold text-right">Remaining</th>
                        <th className="p-2 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrograms.map(p => (
                        <tr key={p.id} className="border-b border-slate-100">
                          <td className="p-2 font-mono">{p.id}</td>
                          <td className="p-2 font-bold">{p.name}</td>
                          <td className="p-2 text-right">₱{p.budget.toLocaleString()}</td>
                          <td className="p-2 text-right">₱{p.utilizedAmount.toLocaleString()}</td>
                          <td className="p-2 text-right">₱{(p.budget - p.utilizedAmount).toLocaleString()}</td>
                          <td className="p-2 text-center">
                            <span className="text-[10px] font-bold uppercase">{getProgramHealth(p)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Budget</span>
                      <span className="font-extrabold text-sm text-slate-800">₱{totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Utilized</span>
                      <span className="font-extrabold text-sm text-slate-800">₱{totalUtilized.toLocaleString()} ({utilizationRate}%)</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Remaining</span>
                      <span className="font-extrabold text-sm text-slate-800">₱{remainingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-slate-50 border-t border-outline-variant flex gap-4">
                <button onClick={() => setIsExportModalOpen(false)} className="px-5 py-3 border rounded-xl font-bold text-xs bg-white text-on-surface-variant">Close</button>
                <div className="flex-1"></div>
                <button onClick={downloadBudgetCSV} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4" /> CSV</button>
                <button onClick={downloadBudgetExcel} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4" /> Excel</button>
                <button onClick={printBudgetReport} className="px-5 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/95 transition-colors flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print / PDF</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. GENERATE FULL HISTORY REPORT PREVIEW & FILTER CONFIG MODAL */}
      <AnimatePresence>
        {isFullHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-primary">Allocation History Report Builder</h3>
                  <p className="text-xs text-on-surface-variant">Configure report filters and preview ledger logs</p>
                </div>
                <button onClick={() => setIsFullHistoryModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-outline" /></button>
              </div>

              {/* Interactive controls in Modal */}
              <div className="p-6 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Program</label>
                  <select value={histReportProg} onChange={e => setHistReportProg(e.target.value)} className="w-full p-2 text-xs border rounded bg-white">
                    <option value="All">All Programs</option>
                    {uniqueProgramNames.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Year</label>
                  <select value={histReportYear} onChange={e => setHistReportYear(e.target.value)} className="w-full p-2 text-xs border rounded bg-white">
                    <option value="All">All Years</option>
                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Start Date</label>
                  <input type="date" value={histReportStart} onChange={e => setHistReportStart(e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">End Date</label>
                  <input type="date" value={histReportEnd} onChange={e => setHistReportEnd(e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white" />
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="flex-1 p-8 overflow-y-auto bg-slate-100/50">
                <div className="bg-white shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto rounded-xl space-y-6 text-xs text-slate-700">
                  <div className="flex items-center gap-4 border-b pb-4 border-primary">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">M</div>
                    <div>
                      <h4 className="font-extrabold text-sm uppercase text-primary">Municipal Social Welfare and Development Office</h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Budget Allocation Audit Trail Ledger</p>
                    </div>
                  </div>

                  <div className="text-center py-2 bg-slate-50 rounded-lg">
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-widest block">Audit History Ledger Log</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Generated: {new Date().toLocaleString()} • By {profile.name}</span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-100">
                        <th className="p-2 font-bold">Date & Time</th>
                        <th className="p-2 font-bold">Program</th>
                        <th className="p-2 font-bold text-right">Prev Budget</th>
                        <th className="p-2 font-bold text-right">New Budget</th>
                        <th className="p-2 font-bold text-right">Change</th>
                        <th className="p-2 font-bold">Details & Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryReport.map(h => (
                        <tr key={h.id} className="border-b border-slate-100">
                          <td className="p-2 whitespace-nowrap">{h.timestamp}</td>
                          <td className="p-2 font-bold">{h.programName}</td>
                          <td className="p-2 text-right">₱{h.previousBudget.toLocaleString()}</td>
                          <td className="p-2 text-right font-bold">₱{h.newBudget.toLocaleString()}</td>
                          <td className="p-2 text-right font-bold" style={{ color: h.amountChanged >= 0 ? '#15803d' : '#b91c1c' }}>
                            {h.amountChanged >= 0 ? '+' : ''}₱{h.amountChanged.toLocaleString()}
                          </td>
                          <td className="p-2 max-w-xs truncate" title={h.reason}>{h.reason}</td>
                        </tr>
                      ))}
                      {filteredHistoryReport.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-2 text-center text-slate-400 py-6 italic">No history log entries match selection filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-slate-50 border-t border-outline-variant flex gap-4">
                <button onClick={() => setIsFullHistoryModalOpen(false)} className="px-5 py-3 border rounded-xl font-bold text-xs bg-white text-on-surface-variant">Close</button>
                <div className="flex-1"></div>
                <button onClick={downloadHistoryCSV} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4" /> CSV</button>
                <button onClick={downloadHistoryExcel} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-1.5"><FileText className="w-4 h-4" /> Excel</button>
                <button onClick={printHistoryReport} className="px-5 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/95 transition-colors flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print / PDF</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Allocation Modal Form Overlay */}
      <AnimatePresence>
        {isAllocationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="p-8 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-md text-primary font-bold">New Budget Allocation</h3>
                <button onClick={() => setIsAllocationModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors focus:outline-none"><X className="w-5 h-5 text-outline" /></button>
              </div>

              <form onSubmit={handleAllocateSubmit}>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider block text-on-surface-variant">Select Target Program</label>
                    <select value={targetProgramId} onChange={e => setTargetProgramId(e.target.value)} className="w-full p-4 rounded-xl border border-outline-variant bg-slate-50 text-on-surface font-bold">
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider block text-on-surface-variant">Allocation Amount (₱)</label>
                    <input className="w-full p-4 rounded-xl border border-outline-variant bg-slate-50 font-extrabold text-xl text-on-surface" placeholder="e.g. 500,000" type="number" min={1000} value={allocationAmount} onChange={e => setAllocationAmount(Number(e.target.value))} required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider block text-on-surface-variant">Reason / Purpose</label>
                    <textarea className="w-full p-4 rounded-xl border border-outline-variant bg-slate-50 text-on-surface font-medium" placeholder="Describe the purpose or policy supplemental reason..." rows={3} value={allocationReason} onChange={e => setAllocationReason(e.target.value)} required></textarea>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-4 border-t border-outline-variant">
                  <button type="button" className="flex-1 py-4 font-bold text-on-surface-variant hover:bg-white rounded-xl border transition-all" onClick={() => setIsAllocationModalOpen(false)}>Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">Confirm Allocation</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export { BudgetTab };
