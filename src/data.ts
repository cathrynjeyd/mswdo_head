import { FocalPerson, Program, AllocationHistory } from './types';

export const INITIAL_FOCAL_PERSONS: FocalPerson[] = [
  {
    id: 'MSW-2024-001',
    name: 'Elena Mendoza',
    position: 'Senior Social Worker',
    contact: '+63 912 345 6789',
    email: 'e.mendoza@mswdo.gov.ph',
    status: 'Active',
    avatarInitials: 'EM',
    programName: 'Pantawid Pamilya (4Ps)'
  },
  {
    id: 'MSW-2024-002',
    name: 'Roberto Bautista',
    position: 'Disaster Focal',
    contact: '+63 923 888 1111',
    email: 'r.bautista@mswdo.gov.ph',
    status: 'Active',
    avatarInitials: 'RB',
    programName: 'Disaster Relief'
  },
  {
    id: 'MSW-2024-005',
    name: 'Sofia Castro',
    position: 'Community Organizer',
    contact: '+63 945 222 3344',
    email: 's.castro@mswdo.gov.ph',
    status: 'On Leave',
    avatarInitials: 'SC',
    programName: 'PWD Assistance'
  },
  {
    id: 'MSW-2024-009',
    name: 'Julian Santos',
    position: 'Senior Citizens Head',
    contact: '+63 918 555 9090',
    email: 'j.santos@mswdo.gov.ph',
    status: 'Active',
    avatarInitials: 'JS',
    programName: 'Senior Citizens Welfare'
  },
  {
    id: 'MSW-2024-003',
    name: 'Maria Santos',
    position: 'Social Worker II',
    contact: '+63 915 222 4545',
    email: 'm.santos@mswdo.gov.ph',
    status: 'Active',
    avatarInitials: 'MS',
    programName: 'AICS Program'
  },
  {
    id: 'MSW-2024-004',
    name: 'Juan Dela Cruz',
    position: 'Administrative Assistant',
    contact: '+63 917 555 1234',
    email: 'j.delacruz@mswdo.gov.ph',
    status: 'Active',
    avatarInitials: 'JD',
    programName: 'Solo Parent Program'
  }
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-01',
    name: 'Senior Citizens Welfare',
    description: 'Pension and social programs for elderly citizens.',
    focalName: 'Julian Santos, Elena Mendoza',
    focalId: 'MSW-2024-009',
    focalInitials: 'JS, EM',
    focalIds: ['MSW-2024-009', 'MSW-2024-001'],
    budget: 8000000,
    utilizedAmount: 5200000,
    status: 'Reviewing',
    iconName: 'elderly',
    category: 'Senior Citizen',
    budgetStatus: 'On Track',
    beneficiariesCount: 3500,
    createdAt: 'Jan 10, 2024',
    updatedAt: 'Jun 25, 2026'
  },
  {
    id: 'prog-02',
    name: 'Pantawid Pamilya (4Ps)',
    description: 'Conditional cash transfer and maternal health support.',
    focalName: 'Elena Mendoza',
    focalId: 'MSW-2024-001',
    focalInitials: 'EM',
    focalIds: ['MSW-2024-001'],
    budget: 12000000,
    utilizedAmount: 9800000,
    status: 'Active',
    iconName: 'family_restroom',
    category: '4Ps Program',
    budgetStatus: 'Critical',
    beneficiariesCount: 5400,
    createdAt: 'Jan 15, 2024',
    updatedAt: 'Jun 28, 2026'
  },
  {
    id: 'prog-03',
    name: 'PWD Assistance',
    description: 'Support for Persons with Disabilities and livelihood.',
    focalName: 'Sofia Castro, Maria Santos',
    focalId: 'MSW-2024-005',
    focalInitials: 'SC, MS',
    focalIds: ['MSW-2024-005', 'MSW-2024-003'],
    budget: 2500000,
    utilizedAmount: 1100000,
    status: 'Active',
    iconName: 'accessible',
    category: 'PWD',
    budgetStatus: 'On Track',
    beneficiariesCount: 1800,
    createdAt: 'Jan 20, 2024',
    updatedAt: 'Jun 14, 2026'
  },
  {
    id: 'prog-04',
    name: 'Disaster Relief',
    description: 'Emergency assistance and relief operations during calamities.',
    focalName: 'Roberto Bautista',
    focalId: 'MSW-2024-002',
    focalInitials: 'RB',
    focalIds: ['MSW-2024-002'],
    budget: 2000000,
    utilizedAmount: 560000, // 560,000 from budget screen
    status: 'Active',
    iconName: 'emergency_home',
    category: 'Emergency Response',
    budgetStatus: 'Stable',
    beneficiariesCount: 1200,
    createdAt: 'Feb 02, 2024',
    updatedAt: 'Jun 29, 2026'
  },
  {
    id: 'prog-05',
    name: 'AICS Program',
    description: 'Crisis intervention for individuals and families in extremely difficult circumstances.',
    focalName: 'Maria Santos',
    focalId: 'MSW-2024-003',
    focalInitials: 'MS',
    focalIds: ['MSW-2024-003'],
    budget: 4500000,
    utilizedAmount: 4140000, // 92% utilization
    status: 'Active',
    iconName: 'health_and_safety',
    category: 'Crisis Intervention',
    budgetStatus: 'Critical',
    beneficiariesCount: 4200,
    createdAt: 'Feb 10, 2024',
    updatedAt: 'Jun 29, 2026'
  },
  {
    id: 'prog-06',
    name: 'Solo Parent Program',
    description: 'Support and benefits for single heads of families.',
    focalName: 'Juan Dela Cruz',
    focalId: 'MSW-2024-004',
    focalInitials: 'JD',
    focalIds: ['MSW-2024-004'],
    budget: 2200000,
    utilizedAmount: 990000, // 45% utilization
    status: 'Active',
    iconName: 'person',
    category: 'Solo Parent',
    budgetStatus: 'Stable',
    beneficiariesCount: 2150,
    createdAt: 'Mar 01, 2024',
    updatedAt: 'Jun 20, 2026'
  }
];

export const INITIAL_ALLOCATION_HISTORY: AllocationHistory[] = [
  {
    id: 'hist-01',
    timestamp: 'Oct 24, 2023, 09:14 AM',
    programName: 'Senior Citizens Welfare',
    previousBudget: 5950000,
    newBudget: 8000000,
    amountChanged: 2050000,
    reason: 'Supplemental budget for senior citizens assistance program expansion.',
    performedBy: 'Jane Doe',
    role: 'Admin'
  },
  {
    id: 'hist-02',
    timestamp: 'Oct 22, 2023, 02:45 PM',
    programName: 'AICS Program',
    previousBudget: 5000000,
    newBudget: 4500000,
    amountChanged: -500000,
    reason: 'Reallocation to Emergency Disaster Relief',
    performedBy: 'Robert Santos',
    role: 'Analyst'
  },
  {
    id: 'hist-03',
    timestamp: 'Oct 20, 2023, 10:30 AM',
    programName: 'Day Care Services',
    previousBudget: 2200000,
    newBudget: 2350000,
    amountChanged: 150000,
    reason: 'Equipment upgrade for Barangay centers',
    performedBy: 'Maria Clara',
    role: 'Focal'
  },
  {
    id: 'hist-04',
    timestamp: 'Oct 18, 2023, 04:12 PM',
    programName: 'PWD Support',
    previousBudget: 3400000,
    newBudget: 3400000,
    amountChanged: 0,
    reason: 'Internal program coding adjustment',
    performedBy: 'Jane Doe',
    role: 'Admin'
  },
  {
    id: 'hist-05',
    timestamp: 'Oct 15, 2023, 11:05 AM',
    programName: 'Disaster Relief',
    previousBudget: 8000000,
    newBudget: 1050000,
    amountChanged: 2500000,
    reason: 'Emergency calamity fund release (Typhoon)',
    performedBy: 'Admin Sys',
    role: 'System'
  }
];
