import { useState } from 'react';
import { Program, ActiveTab, AllocationHistory, FocalPerson } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  UserCheck, 
  PieChart as PieChartIcon, 
  AlertTriangle, 
  Eye, 
  Lightbulb, 
  Wallet, 
  Activity, 
  ShieldAlert, 
  Info,
  ChevronRight,
  ArrowUpRight,
  BellRing,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardTabProps {
  programs: Program[];
  allocationHistory?: AllocationHistory[];
  focalPersons?: FocalPerson[];
  setActiveTab: (tab: ActiveTab) => void;
  onReviewFundsAlertClick?: () => void;
  onOpenAuditTool?: () => void;
  onRequestSupplement?: () => void;
}

export default function DashboardTab({ 
  programs, 
  allocationHistory = [],
  focalPersons = [],
  setActiveTab, 
  onReviewFundsAlertClick,
  onOpenAuditTool,
  onRequestSupplement
}: DashboardTabProps) {

  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // --- Dynamic calculations from the program data ---
  const totalBudget = programs.reduce((sum, p) => sum + p.budget, 0);
  const totalUtilized = programs.reduce((sum, p) => sum + p.utilizedAmount, 0);
  const globalUtilizationRate = totalBudget > 0 ? Math.round((totalUtilized / totalBudget) * 100) : 0;
  const totalBeneficiaries = programs.reduce((sum, p) => sum + p.beneficiariesCount, 0);

  // 1. Program with highest beneficiaries
  const highestBeneficiariesProgram = programs.reduce(
    (max, p) => p.beneficiariesCount > max.beneficiariesCount ? p : max, 
    programs[0] || { name: 'AICS', beneficiariesCount: 0 }
  );

  // 2. Program with highest utilization rate
  const programsWithRates = programs.map(p => ({
    ...p,
    rate: p.budget > 0 ? Math.round((p.utilizedAmount / p.budget) * 100) : 0
  }));
  const highestUtilizedProgram = programsWithRates.reduce(
    (max, p) => p.rate > max.rate ? p : max, 
    { name: 'N/A', rate: 0, budget: 0, utilizedAmount: 0 }
  );

  // 3. Program with largest remaining budget
  const largestRemainingProgram = programs.map(p => ({
    ...p,
    remaining: p.budget - p.utilizedAmount
  })).reduce(
    (max, p) => p.remaining > max.remaining ? p : max, 
    { name: 'N/A', remaining: 0 }
  );

  // 4. Programs requiring immediate funding (utilization > 80% or remaining below 20%)
  const immediateFundingPrograms = programsWithRates.filter(p => p.rate >= 80);

  // 5. Programs with low utilization (< 40% and not completed)
  const lowUtilizationPrograms = programsWithRates.filter(p => p.rate < 40 && p.status !== 'Completed');

  const formatCurrency = (val: number) => {
    return '₱' + val.toLocaleString('en-US');
  };

  // --- Chart 1: Beneficiary Distribution by Program ---
  // Categories: AICS, Solo Parent, Senior Citizen, PWD, Other
  const getCategorizedBeneficiaryData = () => {
    let aicsSum = 0;
    let soloParentSum = 0;
    let seniorCitizenSum = 0;
    let pwdSum = 0;
    let otherSum = 0;

    programs.forEach(p => {
      const nameLower = p.name.toLowerCase();
      const catLower = (p.category || '').toLowerCase();
      
      if (nameLower.includes('aics') || catLower.includes('crisis') || catLower.includes('intervention')) {
        aicsSum += p.beneficiariesCount;
      } else if (nameLower.includes('solo') || catLower.includes('solo')) {
        soloParentSum += p.beneficiariesCount;
      } else if (nameLower.includes('senior') || nameLower.includes('elderly') || catLower.includes('senior') || catLower.includes('elderly')) {
        seniorCitizenSum += p.beneficiariesCount;
      } else if (nameLower.includes('pwd') || nameLower.includes('disable') || catLower.includes('pwd')) {
        pwdSum += p.beneficiariesCount;
      } else {
        otherSum += p.beneficiariesCount;
      }
    });

    return [
      { name: 'AICS', value: aicsSum || 4500 },
      { name: 'Solo Parent', value: soloParentSum || 1800 },
      { name: 'Senior Citizen', value: seniorCitizenSum || 3200 },
      { name: 'PWD', value: pwdSum || 2100 },
      { name: 'Other Services', value: otherSum || 1200 }
    ].filter(item => item.value > 0);
  };

  const pieData = getCategorizedBeneficiaryData();
  const PIE_COLORS = ['#00355f', '#1c639c', '#009688', '#8b5cf6', '#ef4444'];

  // --- Chart 2: Grouped Bar Chart: Allocated Budget vs Budget Spent per Month ---
  const monthsList = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Year factor simulates historic variations in budget size
  const yearMultiplier = selectedYear === '2024' ? 0.81 : selectedYear === '2025' ? 0.92 : 1.0;
  
  const monthlyUtilizationData = monthsList.map((month, idx) => {
    // Proportional distributions reflecting realistic peaks
    const distributionWeights = [0.06, 0.07, 0.08, 0.09, 0.11, 0.12, 0.08, 0.07, 0.08, 0.08, 0.09, 0.07];
    const spentWeights = [0.04, 0.05, 0.07, 0.08, 0.10, 0.11, 0.07, 0.06, 0.07, 0.08, 0.11, 0.12];
    
    const allocated = Math.round(totalBudget * distributionWeights[idx] * yearMultiplier);
    
    // Future months in the current simulation year have 0 actual expenditure
    const isFutureMonth = selectedYear === '2026' && idx > 5;
    const spent = isFutureMonth 
      ? 0 
      : Math.round(totalUtilized * spentWeights[idx] * yearMultiplier);

    return {
      month,
      'Allocated Budget': allocated,
      'Budget Spent': spent
    };
  });

  // --- Recommendations Engine (derived from real-time data states) ---
  const getDynamicRecommendations = () => {
    const list = [];
    
    // 1. Funding Action (Exceeding 80% utilization)
    if (immediateFundingPrograms.length > 0) {
      const prog = immediateFundingPrograms[0];
      list.push({
        type: 'funding',
        title: 'Funding Injection Advised',
        description: `"${prog.name}" has depleted ${prog.rate}% of its ₱${prog.budget.toLocaleString()} budget. Reallocate surplus immediately to prevent service disruption.`,
        badgeColor: 'bg-error-container text-error border-error/20',
        actionLabel: 'Disburse Funds',
        action: () => setActiveTab('budget')
      });
    } else {
      list.push({
        type: 'funding',
        title: 'Healthy Budget Velocities',
        description: 'All municipal social services are currently operating well within their initial quarterly funding buffers.',
        badgeColor: 'bg-green-100 text-green-800 border-green-200',
        actionLabel: 'Review Budgets',
        action: () => setActiveTab('budget')
      });
    }

    // 2. Spending Efficiency (Low utilization < 40%)
    if (lowUtilizationPrograms.length > 0) {
      const prog = lowUtilizationPrograms[0];
      list.push({
        type: 'efficiency',
        title: 'Spending Drag Detected',
        description: `"${prog.name}" shows lower-than-expected spending velocity at ${prog.rate}% utilization. Conduct an administrative roadblock audit.`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        actionLabel: 'Audit Records',
        action: () => setActiveTab('history')
      });
    } else {
      list.push({
        type: 'efficiency',
        title: 'Active Capital Deployment',
        description: 'No spending drag or stagnant programs detected. All programs are maintaining expected capital deployment ratios.',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        actionLabel: 'Audit Logs',
        action: () => setActiveTab('history')
      });
    }

    // 3. Reallocation Opportunity
    if (largestRemainingProgram.remaining > 500000 && immediateFundingPrograms.length > 0) {
      list.push({
        type: 'reallocation',
        title: 'Optimal Fund Shifting',
        description: `Reallocate a portion of the ₱${largestRemainingProgram.remaining.toLocaleString()} surplus in "${largestRemainingProgram.name}" to cover "${immediateFundingPrograms[0].name}".`,
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        actionLabel: 'Reallocate Capital',
        action: () => setActiveTab('budget')
      });
    } else {
      list.push({
        type: 'demand',
        title: 'Sector Demographic Analysis',
        description: `The "${highestBeneficiariesProgram.name}" serves ${highestBeneficiariesProgram.beneficiariesCount.toLocaleString()} total citizens. Map new registrations to refine upcoming allocations.`,
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        actionLabel: 'Verify Focal Persons',
        action: () => setActiveTab('focal')
      });
    }

    return list;
  };

  const dynamicRecommendations = getDynamicRecommendations();

  // --- Dynamic System Alerts ---
  const getDynamicAlerts = () => {
    const list = [];

    // 1. Add alert for depletion
    programsWithRates.forEach(p => {
      if (p.rate >= 90) {
        list.push({
          id: `alert-deplete-${p.id}`,
          type: 'critical',
          text: `CRITICAL: "${p.name}" has exhausted ${p.rate}% of funds. Only ${formatCurrency(p.budget - p.utilizedAmount)} remains.`,
          time: 'Active System Alert'
        });
      } else if (p.rate >= 80) {
        list.push({
          id: `alert-warn-${p.id}`,
          type: 'warning',
          text: `WARNING: "${p.name}" budget is nearing depletion (${p.rate}% utilized).`,
          time: 'Active Warning'
        });
      }
    });

    // 2. Add recent audit allocation events
    if (allocationHistory && allocationHistory.length > 0) {
      allocationHistory.slice(0, 3).forEach(hist => {
        list.push({
          id: hist.id,
          type: 'info',
          text: `CAPITAL ADJUSTMENT: ₱${Math.abs(hist.amountChanged).toLocaleString()} was ${hist.amountChanged >= 0 ? 'allocated' : 'retrieved'} for "${hist.programName}" by ${hist.performedBy}.`,
          time: hist.timestamp
        });
      });
    }

    // 3. Add focal persons additions
    if (focalPersons && focalPersons.length > 0) {
      focalPersons.slice(0, 2).forEach(f => {
        list.push({
          id: `alert-focal-${f.id}`,
          type: 'focal',
          text: `FOCAL REGISTRY: ${f.name} is verified active as ${f.position} of ${f.programName || 'Unassigned'}.`,
          time: 'Verified Registry'
        });
      });
    }

    return list.slice(0, 5); // display top 5 most critical/recent events
  };

  const systemAlerts = getDynamicAlerts();

  return (
    <div className="space-y-8">
      {/* Dashboard Summary Panel */}
      <motion.section 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-primary p-8 text-on-primary shadow-xl border border-primary-container"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 p-2.5 rounded-lg block">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </span>
            <h3 className="font-headline-md text-headline-md font-bold">MSWDO Decision Support DSS</h3>
          </div>
          <p className="font-body-lg text-body-lg leading-relaxed text-white/90 font-medium">
            Dynamic Simulation Diagnostic: <span className="font-bold underline decoration-secondary decoration-2">{highestBeneficiariesProgram.name}</span> serves the largest client share with <span className="font-bold">{highestBeneficiariesProgram.beneficiariesCount.toLocaleString()}</span> registered beneficiaries. 
            The program with the highest budget pressure is <span className="font-bold underline decoration-secondary decoration-2">{highestUtilizedProgram.name}</span> at <span className="font-bold">{highestUtilizedProgram.rate}% utilization</span>, while <span className="font-bold underline decoration-secondary decoration-2">{largestRemainingProgram.name}</span> holds the largest rest-of-year cash surplus of <span className="font-bold">{formatCurrency(largestRemainingProgram.remaining)}</span>. The global municipal utilization rate stands at <span className="font-bold">{globalUtilizationRate}%</span> across all divisions.
          </p>
        </div>
      </motion.section>

      {/* DSS Summary Cards - Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Program Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">Top Demand</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Highest Beneficiaries</p>
          <h4 className="font-headline-sm text-headline-sm text-primary mb-2 font-bold truncate" title={highestBeneficiariesProgram.name}>
            {highestBeneficiariesProgram.name.split(' ')[0]}
          </h4>
          <p className="text-body-md text-body-md text-on-surface-variant font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" /> {highestBeneficiariesProgram.beneficiariesCount.toLocaleString()} Served
          </p>
        </div>

        {/* Budget Utilization Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-secondary/10 text-secondary p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 rounded-md">Pressure Limit</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Highest Utilization</p>
          <div className="flex items-baseline gap-2 mb-2">
            <h4 className="font-headline-sm text-headline-sm text-secondary font-bold">{highestUtilizedProgram.rate}%</h4>
            <span className="text-[10px] font-extrabold text-error bg-error/10 px-2 py-0.5 rounded uppercase max-w-[120px] truncate" title={highestUtilizedProgram.name}>
              {highestUtilizedProgram.name.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-bold">Allocated funds active drain</p>
        </div>

        {/* Total Count Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-100 text-purple-600 p-2.5 rounded-xl">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">Registry</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Beneficiaries</p>
          <h4 className="font-headline-sm text-headline-sm text-on-background font-bold mb-2">{totalBeneficiaries.toLocaleString()}</h4>
          <p className="text-xs text-on-surface-variant font-bold">Citizens served across city sectors</p>
        </div>

        {/* Global Utilization Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-teal-100 text-teal-600 p-2.5 rounded-xl">
              <PieChartIcon className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">Sovereignty</span>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Budget Deployment</p>
          <h4 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">{globalUtilizationRate}%</h4>
          <p className="text-xs text-on-surface-variant font-medium">
            {formatCurrency(totalUtilized)} used of {formatCurrency(totalBudget)}
          </p>
        </div>

        {/* Needs Immediate Funding dynamic alerts rows */}
        {immediateFundingPrograms.length > 0 ? (
          <div className="lg:col-span-2 bg-error-container/20 p-6 rounded-2xl border border-error/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-error mb-2">
                <AlertTriangle className="w-5 h-5 fill-error/10" />
                <span className="font-label-md text-[10px] uppercase tracking-wider font-bold">Needs Immediate Funding</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-error-container font-bold">
                {immediateFundingPrograms[0].name}
              </h4>
              <p className="text-body-md text-body-md text-on-error-container/80 mt-1 font-semibold">
                Critical utilization alert: {immediateFundingPrograms[0].rate}% depleted.
              </p>
            </div>
            <button 
              onClick={onReviewFundsAlertClick}
              className="px-5 py-2.5 bg-error text-on-error rounded-full font-bold text-xs shadow-md hover:bg-error/90 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              Review Funds
            </button>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-green-50 p-6 rounded-2xl border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-label-md text-[10px] uppercase tracking-wider font-bold">All Budgets Sufficient</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-green-900 font-bold">Adequate Funding</h4>
              <p className="text-body-md text-body-md text-green-800/80 mt-1 font-semibold">No active programs are currently exceeding safety limits.</p>
            </div>
            <button 
              onClick={() => setActiveTab('budget')}
              className="px-5 py-2.5 bg-green-600 text-white rounded-full font-bold text-xs shadow-md hover:bg-green-700 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              Manage Budgets
            </button>
          </div>
        )}

        {/* Program Under Review dynamic card */}
        {lowUtilizationPrograms.length > 0 ? (
          <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                <Eye className="w-5 h-5 text-on-surface-variant" />
                <span className="font-label-md text-[10px] uppercase tracking-wider font-bold">Program Under Review</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {lowUtilizationPrograms[0].name}
              </h4>
              <p className="text-body-md text-body-md text-on-surface-variant mt-1 font-semibold">
                Alert: Lower-than-expected budget utilization ({lowUtilizationPrograms[0].rate}%).
              </p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Unused Balance</p>
              <p className="font-bold text-primary text-base">
                {formatCurrency(lowUtilizationPrograms[0].budget - lowUtilizationPrograms[0].utilizedAmount)}
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                <Eye className="w-5 h-5 text-on-surface-variant" />
                <span className="font-label-md text-[10px] uppercase tracking-wider font-bold">Surplus Review</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {largestRemainingProgram.name}
              </h4>
              <p className="text-body-md text-body-md text-on-surface-variant mt-1 font-semibold">
                Maximum surplus cash ready for emergency deployment.
              </p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Available Surplus</p>
              <p className="font-bold text-primary text-base">{formatCurrency(largestRemainingProgram.remaining)}</p>
            </div>
          </div>
        )}
      </section>

      {/* Budget Analysis Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Doughnut Chart: Beneficiary Distribution */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Beneficiary Distribution by Program</h3>
                <p className="text-body-md text-body-md text-on-surface-variant font-semibold">Active client segmentation maps</p>
              </div>
              <PieChartIcon className="w-5 h-5 text-on-surface-variant" />
            </div>

            <div className="h-64 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} Beneficiaries`, 'Volume']} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              {/* Abs center stats */}
              <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Total Active</span>
                <span className="text-lg font-extrabold text-on-surface leading-none">{totalBeneficiaries.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grouped Bar Chart: Monthly Budget Comparison */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Monthly Budget Utilization</h3>
                <p className="text-body-md text-body-md text-on-surface-variant font-medium">Comparison of Allocated Budget vs Spent</p>
              </div>
              
              {/* Year Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-surface border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <select 
                  className="bg-transparent border-none outline-none focus:ring-0 font-bold cursor-pointer text-on-surface"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2026">2026 (Current)</option>
                  <option value="2025">2025 (Historic)</option>
                  <option value="2024">2024 (Historic)</option>
                </select>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyUtilizationData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                    tick={{ fill: '#475569', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val) => [formatCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Bar 
                    dataKey="Allocated Budget" 
                    fill="#00355f" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="Budget Spent" 
                    fill="#1c639c" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </section>

      {/* Recommendations Section */}
      <section>
        <div className="flex items-center gap-2.5 mb-6">
          <Lightbulb className="w-5 h-5 text-primary animate-bounce" />
          <h3 className="font-headline-sm text-headline-sm font-bold">Decision Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dynamicRecommendations.map((rec, index) => (
            <div 
              key={index} 
              className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary shadow-sm hover:scale-[1.01] transition-transform duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${rec.badgeColor}`}>
                    {rec.type === 'funding' ? 'Funding Action' : rec.type === 'efficiency' ? 'Efficiency Audit' : 'Realloc / Demand'}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-on-surface mb-2">{rec.title}</h5>
                <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                  {rec.description}
                </p>
              </div>
              <button 
                onClick={rec.action}
                className="mt-5 text-primary font-bold text-xs flex items-center gap-1 hover:underline self-start focus:outline-none cursor-pointer"
              >
                {rec.actionLabel} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Alerts List */}
      <section className="bg-surface-container-highest/20 rounded-3xl p-6 border border-outline-variant">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            <h3 className="font-headline-sm text-headline-sm font-bold">System Alerts</h3>
          </div>
          <span className="font-label-md text-xs text-on-surface-variant font-bold uppercase">Dynamic Alerts Stream</span>
        </div>
        <div className="space-y-3">
          {systemAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:border-primary/40 transition-colors ${
                alert.type === 'critical' ? 'border-red-200 hover:border-red-300 bg-red-50/20' : 
                alert.type === 'warning' ? 'border-amber-200 hover:border-amber-300' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                alert.type === 'critical' ? 'bg-red-100 text-red-600 animate-pulse' : 
                alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                alert.type === 'focal' ? 'bg-purple-100 text-purple-600' : 'bg-primary/10 text-primary'
              }`}>
                {alert.type === 'critical' ? <ShieldAlert className="w-5 h-5" /> : 
                 alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                 alert.type === 'focal' ? <Users className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface text-xs md:text-sm leading-normal">
                  {alert.text}
                </p>
                <p className="text-[10px] text-on-surface-variant font-extrabold mt-0.5 uppercase tracking-wider">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
