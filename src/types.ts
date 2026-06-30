export type FocalStatus = 'Active' | 'On Leave' | 'Inactive';

export interface FocalPerson {
  id: string;
  name: string;
  position: string;
  contact: string;
  email: string;
  status: FocalStatus;
  avatarInitials: string;
  programName?: string; // Cache program name
}

export type ProgramStatus = 'Active' | 'Reviewing' | 'On Hold' | 'Completed';

export interface Program {
  id: string;
  name: string;
  description: string;
  focalName: string;
  focalId: string;
  focalInitials: string;
  focalIds: string[]; // Support multiple focal person IDs
  budget: number;
  utilizedAmount: number; // calculated as budget * utilization / 100 or stored directly
  status: ProgramStatus;
  iconName?: string; // for Budget Management icon mapping
  category?: string;
  budgetStatus?: 'On Track' | 'Critical' | 'Stable';
  beneficiariesCount: number;
  createdAt?: string; // Timestamp when program was created
  updatedAt?: string; // Timestamp when program was last modified
}

export interface AllocationHistory {
  id: string;
  timestamp: string;
  programName: string;
  previousBudget: number;
  newBudget: number;
  amountChanged: number;
  reason: string;
  performedBy: string;
  role: string;
}

export type ActiveTab = 'dashboard' | 'focal' | 'program' | 'budget' | 'history' | 'settings';
