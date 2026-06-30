import { motion } from 'motion/react';
import { 
  Briefcase, 
  Wallet, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Contact,
  Clock,
  ArrowRight
} from 'lucide-react';
import { FocalPerson, Program, AllocationHistory } from '../types';

interface FocalDashboardTabProps {
  focal?: FocalPerson;
  programs: Program[];
  history: AllocationHistory[];
  onNavigate: (tab: any) => void;
}

export default function FocalDashboardTab({ 
  focal, 
  programs, 
  history, 
  onNavigate 
}: FocalDashboardTabProps) {
  
  // Calculations
  const totalBudget = programs.reduce((sum, p) => sum + p.budget, 0);
  const totalUtilized = programs.reduce((sum, p) => sum + p.utilizedAmount, 0);
  const utilizationRate = totalBudget > 0 ? (totalUtilized / totalBudget) * 100 : 0;
  const totalBeneficiaries = programs.reduce((sum, p) => sum + p.beneficiariesCount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover p-6 md:p-8 text-white shadow-md">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Focal Person Portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back, {focal?.name}!</h1>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed font-medium">
              You are signed in as the focal officer for {programs.length} active social programs in our municipality. Use this portal to track allocations, monitor utilization rates, and review target beneficiary statistics.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg text-white">
              {focal?.avatarInitials}
            </div>
            <div>
              <p className="font-bold text-sm leading-none">{focal?.position}</p>
              <p className="text-xs text-white/70 mt-1">{focal?.email}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-secondary-container mt-1.5">ID: {focal?.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Programs */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Assigned Programs</p>
            <p className="text-2xl font-bold mt-0.5">{programs.length}</p>
          </div>
        </div>

        {/* Managed Budget */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Managed Budget</p>
            <p className="text-2xl font-bold mt-0.5">₱{totalBudget.toLocaleString()}</p>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Overall Utilization</p>
            <p className="text-2xl font-bold mt-0.5">{Math.round(utilizationRate)}%</p>
          </div>
        </div>

        {/* Total Beneficiaries */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Total Beneficiaries</p>
            <p className="text-2xl font-bold mt-0.5">{totalBeneficiaries.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Programs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">Your Active Programs</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Review targets and utilization thresholds</p>
            </div>
            <button 
              onClick={() => onNavigate('program')}
              className="text-xs text-secondary hover:text-secondary-hover font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {programs.length === 0 ? (
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
                <Briefcase className="w-8 h-8 mx-auto text-outline mb-2" />
                <p className="text-sm font-bold">No Programs Assigned</p>
                <p className="text-xs mt-1">Please contact the MSWDO Head for program assignments.</p>
              </div>
            ) : (
              programs.map((program) => {
                const util = program.budget > 0 ? (program.utilizedAmount / program.budget) * 100 : 0;
                let colorClass = 'bg-emerald-500';
                if (util >= 90) colorClass = 'bg-red-500 animate-pulse';
                else if (util >= 75) colorClass = 'bg-amber-500';

                return (
                  <div key={program.id} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded mb-1.5 uppercase tracking-wider">
                          {program.category || 'Municipal Program'}
                        </span>
                        <h3 className="font-bold text-sm text-on-surface leading-snug">{program.name}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{program.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          program.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                          program.status === 'Reviewing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {program.status}
                        </span>
                        <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Updated: {program.updatedAt || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                        <span>Utilization</span>
                        <span className={util >= 90 ? 'text-error' : util >= 75 ? 'text-amber-600' : 'text-emerald-600'}>
                          ₱{program.utilizedAmount.toLocaleString()} / ₱{program.budget.toLocaleString()} ({Math.round(util)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${colorClass}`} style={{ width: `${Math.min(util, 100)}%` }} />
                      </div>
                    </div>

                    {/* Beneficiaries Target */}
                    <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Beneficiaries Assisted:</span>
                      <span className="font-bold text-on-surface bg-slate-100 px-2 py-0.5 rounded">{program.beneficiariesCount.toLocaleString()} individuals</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Ledger / Account Details */}
        <div className="space-y-6">
          {/* Account Profile Card */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm space-y-4">
            <h3 className="text-sm uppercase tracking-wider font-bold text-primary">Your Focal Profile</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-outline-variant/30">
                <span className="text-on-surface-variant font-medium">Employee ID:</span>
                <span className="font-bold text-on-surface">{focal?.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/30">
                <span className="text-on-surface-variant font-medium">Primary Position:</span>
                <span className="font-bold text-on-surface">{focal?.position}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/30">
                <span className="text-on-surface-variant font-medium">Email Address:</span>
                <span className="font-bold text-on-surface truncate max-w-[150px]">{focal?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/30">
                <span className="text-on-surface-variant font-medium">Contact Number:</span>
                <span className="font-bold text-on-surface">{focal?.contact}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/30">
                <span className="text-on-surface-variant font-medium">Account Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 uppercase tracking-wider text-[10px]">
                  {focal?.status}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-on-surface-variant font-medium">Username:</span>
                <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                  {focal?.username || 'unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Ledger Card */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-wider font-bold text-primary">Recent Transactions</h3>
              <button 
                onClick={() => onNavigate('history')}
                className="text-xs text-secondary hover:text-secondary-hover font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-6 text-on-surface-variant text-xs">
                  <Clock className="w-5 h-5 mx-auto text-outline mb-1.5" />
                  <p className="font-medium">No recent adjustments logged.</p>
                </div>
              ) : (
                history.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-outline-variant text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-on-surface truncate max-w-[120px]">{item.programName}</span>
                      <span className={item.amountChanged >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.amountChanged >= 0 ? '+' : ''}₱{item.amountChanged.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed text-[11px] line-clamp-2">{item.reason}</p>
                    <div className="flex justify-between text-[10px] text-outline pt-1 border-t border-slate-200">
                      <span>By {item.performedBy}</span>
                      <span>{item.timestamp.split(',')[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
