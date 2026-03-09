import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  visitorPrivacyPrompt: string;
  surveyPrivacyPrompt: string;
  visitorConsentLabel: string;
  surveyConsentLabel: string;
}

export interface VisitorLog {
  id: string;
  name: string;
  sex: 'Male' | 'Female' | 'Prefer not to say';
  sectorClassification: string;
  sectorOtherSpecify?: string;
  purpose: string;
  service: string;
  // Incoming Letter fields
  letterSubject?: string;
  letterFrom?: string;
  letterProject?: string;
  letterProjectOther?: string;
  letterStatus?: 'Received' | 'Processed' | 'Pending' | 'Forwarded' | 'Archived';
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

const defaultVisitorPrivacy = `By signing this logbook, I voluntarily provide my personal information to {officeName} for the purpose of recording office visits and improving public service delivery.

**Information Collected:** Name, contact details, purpose of visit, service availed, and satisfaction feedback.

**Purpose:** The data will be used solely for visitor tracking, service performance evaluation, and compliance with Quality Management System (QMS) requirements.

**Retention:** Records will be retained in accordance with the office's records disposition schedule and applicable government regulations.

**Rights:** You have the right to access, correct, and request deletion of your personal data, subject to applicable laws. For concerns, contact our Data Protection Officer at {email}.

**Security:** All data is protected with appropriate organizational, physical, and technical security measures.

I understand and agree to the collection, processing, and storage of my personal information as described above.`;

const defaultSurveyPrivacy = `By participating in this satisfaction survey, I voluntarily provide my feedback to {officeName} for the purpose of improving public service delivery.

**Information Collected:** Service availed, satisfaction ratings, and optional comments.

**Purpose:** The data will be used solely for service performance evaluation and compliance with Quality Management System (QMS) requirements.

**Anonymity:** Survey responses are anonymous and cannot be traced back to individual respondents.

**Security:** All data is protected with appropriate organizational, physical, and technical security measures.`;

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
  visitorPrivacyPrompt: defaultVisitorPrivacy,
  surveyPrivacyPrompt: defaultSurveyPrivacy,
  visitorConsentLabel: 'I have read, understood, and agree to the collection and processing of my personal data in accordance with RA 10173.',
  surveyConsentLabel: 'I have read, understood, and agree to the collection and processing of my feedback in accordance with RA 10173.',
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
  const letterProjects = ['DigiGov', 'ILCDB', 'PNPKI', 'Cybersecurity', 'FreeWifi4All', 'Other'];
  const letterStatuses: Array<'Received' | 'Processed' | 'Pending' | 'Forwarded' | 'Archived'> = ['Received', 'Processed', 'Pending', 'Forwarded', 'Archived'];
  const letterSubjects = ['Request for Technical Assistance', 'Invitation to Workshop', 'Compliance Report Submission', 'Project Status Update', 'Budget Allocation Request', 'Personnel Deployment'];
  const letterFromAgencies = ['DICT Region IV', 'DILG Central Office', 'DOF Bureau of Treasury', 'DBM Regional Office', 'DOST-ASTI', 'NPC', 'DENR Provincial Office', 'DepEd Division Office'];

  for (let i = 0; i < 48; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    d.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
    const sexOptions: Array<'Male' | 'Female' | 'Prefer not to say'> = ['Male', 'Female', 'Prefer not to say'];
    const sectorOptions = ['Student', 'Employed/Working', 'Government Employee', 'Private Sector', 'Senior Citizen', 'Youth', 'Women', 'PWD', 'Solo Parent'];
    const isIncomingLetter = i % 6 === 0; // ~8 incoming letter entries
    const project = letterProjects[Math.floor(Math.random() * letterProjects.length)];
    logs.push({
      id: `v${i}`,
      name: names[i % names.length],
      sex: sexOptions[Math.floor(Math.random() * sexOptions.length)],
      sectorClassification: sectorOptions[Math.floor(Math.random() * sectorOptions.length)],
      purpose: isIncomingLetter ? 'Incoming Letter' : 'Transaction',
      service: isIncomingLetter ? 'Incoming Letter' : defaultServices[Math.floor(Math.random() * defaultServices.length)],
      ...(isIncomingLetter ? {
        letterSubject: letterSubjects[Math.floor(Math.random() * letterSubjects.length)],
        letterFrom: letterFromAgencies[Math.floor(Math.random() * letterFromAgencies.length)],
        letterProject: project,
        letterProjectOther: project === 'Other' ? 'Special Project X' : undefined,
        letterStatus: letterStatuses[Math.floor(Math.random() * letterStatuses.length)],
      } : {}),
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
  surveyParameters: string[];
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
  addService: (s: string) => void;
  updateService: (oldS: string, newS: string) => void;
  deleteService: (s: string) => void;
  addSurveyParameter: (p: string) => void;
  updateSurveyParameter: (oldP: string, newP: string) => void;
  deleteSurveyParameter: (p: string) => void;
  users: User[];
  addUser: (u: User) => void;
  updateUser: (id: string, updates: Partial<Pick<User, 'fullName'>>) => void;
  userPasswords: Record<string, string>;
  resetPassword: (username: string, newPassword: string) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const visitors = generateMockVisitors();
  const surveys = generateMockSurveys(visitors);

  const defaultPurposes = ['Transaction', 'Inquiry', 'Follow-up', 'Complaint', 'Incoming Letter', 'Others'];

  const defaultSurveyParameters = [
    'Responsiveness',
    'Reliability',
    'Access & Facilities',
    'Communication',
    'Costs',
    'Integrity',
    'Assurance',
    'Outcome',
  ];

  const defaultUsers: User[] = [
    { id: 'u1', username: 'admin', role: 'super_admin', fullName: 'System Administrator' },
    { id: 'u2', username: 'staff', role: 'semi_admin', fullName: 'Staff User' },
  ];

  const defaultPasswords: Record<string, string> = {
    admin: 'admin123',
    staff: 'staff123',
  };

  return {
    profile: defaultProfile,
    services: defaultServices,
    purposes: defaultPurposes,
    surveyParameters: defaultSurveyParameters,
    users: defaultUsers,
    userPasswords: defaultPasswords,
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
    addService: (sv) => set((s) => ({ services: [...s.services, sv] })),
    updateService: (oldS, newS) => set((s) => ({ services: s.services.map((x) => (x === oldS ? newS : x)) })),
    deleteService: (sv) => set((s) => ({ services: s.services.filter((x) => x !== sv) })),
    addSurveyParameter: (p) => set((s) => ({ surveyParameters: [...s.surveyParameters, p] })),
    updateSurveyParameter: (oldP, newP) => set((s) => ({ surveyParameters: s.surveyParameters.map((x) => (x === oldP ? newP : x)) })),
    deleteSurveyParameter: (p) => set((s) => ({ surveyParameters: s.surveyParameters.filter((x) => x !== p) })),
    addUser: (u) => set((s) => ({
      users: [...s.users, u],
      userPasswords: { ...s.userPasswords, [u.username]: `${u.username}123` },
    })),
    updateUser: (id, updates) => set((s) => ({
      users: s.users.map((u) => u.id === id ? { ...u, ...updates } : u),
      currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
    })),
    resetPassword: (username, newPassword) => set((s) => ({
      userPasswords: { ...s.userPasswords, [username]: newPassword },
    })),
    login: (username, password) => {
      const { users, userPasswords } = get();
      const user = users.find((u) => u.username === username);
      if (user && userPasswords[username] === password) {
        set({ currentUser: user, isAuthenticated: true });
        return true;
      }
      return false;
    },
    logout: () => set({ currentUser: null, isAuthenticated: false }),
  };
});
