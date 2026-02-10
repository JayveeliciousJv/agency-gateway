import { create } from 'zustand';

export interface AgencyProfile {
  agencyName: string;
  officeName: string;
  address: string;
  contactNumber: string;
  email: string;
  headOfOffice: string;
  headPosition: string;
  logoPath: string;
  secondaryLogoPath: string;
  footerText: string;
  reportSignatory: string;
  reportSignatoryPosition: string;
  systemTitle: string;
}

export interface VisitorLog {
  id: string;
  name: string;
  purpose: string;
  service: string;
  contactNumber: string;
  email: string;
  date: string;
  time: string;
}

export interface SurveyResponse {
  id: string;
  visitorId: string;
  service: string;
  responsiveness: number;
  reliability: number;
  accessFacilities: number;
  communication: number;
  costs: number;
  integrity: number;
  assurance: number;
  outcome: number;
  overallSatisfaction: number;
  comment: string;
  date: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'semi_admin';
  fullName: string;
}

const defaultProfile: AgencyProfile = {
  agencyName: 'Republic of the Philippines',
  officeName: 'City Government Office',
  address: '123 Government Ave, Metro Manila',
  contactNumber: '(02) 8888-1234',
  email: 'info@citygovernment.gov.ph',
  headOfOffice: 'Hon. Juan Dela Cruz',
  headPosition: 'City Mayor',
  logoPath: '',
  secondaryLogoPath: '',
  footerText: 'Serving the people with integrity and excellence.',
  reportSignatory: 'Maria Santos',
  reportSignatoryPosition: 'City Administrator',
  systemTitle: 'Office Visitor Logbook System',
};

const defaultServices = [
  'Business Permit Application',
  'Real Property Tax Payment',
  'Civil Registry Services',
  'Building Permit Application',
  'Community Tax Certificate',
  'Health Certificate',
  'Barangay Clearance',
  'Police Clearance',
  'Social Welfare Assistance',
  'General Inquiry',
];

function generateMockVisitors(): VisitorLog[] {
  const names = ['Ana Reyes', 'Jose Garcia', 'Maria Santos', 'Pedro Cruz', 'Rosa Mendoza', 'Carlos Rivera', 'Elena Torres', 'Miguel Bautista', 'Sofia Ramos', 'Luis Flores', 'Isabel Navarro', 'Roberto Aquino'];
  const logs: VisitorLog[] = [];
  for (let i = 0; i < 48; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    d.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
    logs.push({
      id: `v${i}`,
      name: names[i % names.length],
      purpose: 'Transaction',
      service: defaultServices[Math.floor(Math.random() * defaultServices.length)],
      contactNumber: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `visitor${i}@email.com`,
      date: d.toISOString().split('T')[0],
      time: d.toTimeString().slice(0, 5),
    });
  }
  return logs.sort((a, b) => b.date.localeCompare(a.date));
}

function generateMockSurveys(visitors: VisitorLog[]): SurveyResponse[] {
  return visitors.map((v, i) => ({
    id: `s${i}`,
    visitorId: v.id,
    service: v.service,
    responsiveness: 3 + Math.floor(Math.random() * 3),
    reliability: 3 + Math.floor(Math.random() * 3),
    accessFacilities: 3 + Math.floor(Math.random() * 3),
    communication: 3 + Math.floor(Math.random() * 3),
    costs: 3 + Math.floor(Math.random() * 3),
    integrity: 4 + Math.floor(Math.random() * 2),
    assurance: 3 + Math.floor(Math.random() * 3),
    outcome: 3 + Math.floor(Math.random() * 3),
    overallSatisfaction: 3 + Math.floor(Math.random() * 3),
    comment: '',
    date: v.date,
  }));
}

interface AppState {
  profile: AgencyProfile;
  services: string[];
  purposes: string[];
  visitors: VisitorLog[];
  surveys: SurveyResponse[];
  auditLogs: AuditEntry[];
  currentUser: User | null;
  isAuthenticated: boolean;
  setProfile: (p: Partial<AgencyProfile>) => void;
  addVisitor: (v: VisitorLog) => void;
  addSurvey: (s: SurveyResponse) => void;
  addAuditLog: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addPurpose: (p: string) => void;
  updatePurpose: (oldP: string, newP: string) => void;
  deletePurpose: (p: string) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const visitors = generateMockVisitors();
  const surveys = generateMockSurveys(visitors);

  const defaultPurposes = ['Transaction', 'Inquiry', 'Follow-up', 'Complaint', 'Others'];

  return {
    profile: defaultProfile,
    services: defaultServices,
    purposes: defaultPurposes,
    visitors,
    surveys,
    auditLogs: [],
    currentUser: null,
    isAuthenticated: false,
    setProfile: (p) =>
      set((s) => ({
        profile: { ...s.profile, ...p },
      })),
    addVisitor: (v) => set((s) => ({ visitors: [v, ...s.visitors] })),
    addSurvey: (s) => set((state) => ({ surveys: [s, ...state.surveys] })),
    addAuditLog: (entry) =>
      set((s) => ({
        auditLogs: [
          { ...entry, id: `a${Date.now()}`, timestamp: new Date().toISOString() },
          ...s.auditLogs,
        ],
      })),
    addPurpose: (p) => set((s) => ({ purposes: [...s.purposes, p] })),
    updatePurpose: (oldP, newP) => set((s) => ({ purposes: s.purposes.map((x) => (x === oldP ? newP : x)) })),
    deletePurpose: (p) => set((s) => ({ purposes: s.purposes.filter((x) => x !== p) })),
    login: (username, password) => {
      if (username === 'admin' && password === 'admin123') {
        set({
          currentUser: { id: 'u1', username: 'admin', role: 'super_admin', fullName: 'System Administrator' },
          isAuthenticated: true,
        });
        return true;
      }
      if (username === 'staff' && password === 'staff123') {
        set({
          currentUser: { id: 'u2', username: 'staff', role: 'semi_admin', fullName: 'Staff User' },
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    },
    logout: () => set({ currentUser: null, isAuthenticated: false }),
  };
});
