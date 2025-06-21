export interface User {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  surname?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  rights?: 'full_access' | 'limited_access';
  lastLogin?: string;
  createdAt?: string;
  parkId?: number;
  parkName?: string;
}

export interface Lantern {
  id: number;
  baseBrightness: number;
  activeBrightness: number;
  activeTime: number;
  status: 'working' | 'broken' | 'maintenance';
  parkId?: number;
  park?: Park;
  location?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  energyConsumption?: number;
  activationCount?: number;
}

export interface Park {
  id: number;
  name: string;
  location: string;
  area?: number;
  lanternsCount?: number;
  manager?: string;
  contact?: string;
  lanterns?: Lantern[];
}

export interface Company {
  id: number;
  name: string;
  contact: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Repairman {
  id: number;
  name: string;
  contact: string;
  companyId?: number;
  company?: Company;
  specialization?: string;
  rating?: number;
}

export interface Breakdown {
  id: number;
  lanternId: number;
  lantern?: Lantern;
  description: string;
  reportedAt: string;
  status: 'reported' | 'in_progress' | 'completed';
  repairmanId?: number;
  repairman?: Repairman;
  completedAt?: string;
  cost?: number;
}

export interface Renovation {
  id: number;
  lanternId: number;
  lantern?: Lantern;
  scheduledDate: string;
  completedDate?: string;
  status: 'planned' | 'in_progress' | 'completed';
  description?: string;
  cost?: number;
}

export interface Statistics {
  totalLanterns: number;
  activeLanterns: number;
  brokenLanterns: number;
  energySavings: number;
  totalEnergyConsumption: number;
  averageRepairTime: string;
  mostActivatedLanterns: Array<{
    id: number;
    activationCount: number;
  }>;
  lanternsNeedingRenovation: Array<{
    id: number;
    lastRenovationDate: string;
  }>;
  plannedRenovations: Array<{
    id: number;
    lanternId: number;
    date: string;
  }>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  surname: string;
  email: string;
  password: string;
  park_id?: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type Language = 'en' | 'uk';

export interface AppSettings {
  language: Language;
  theme: 'light' | 'dark';
  dateFormat: string;
  timeFormat: string;
}

// Mobile API Types
export interface MobileLanternStatus {
  id: number;
  status: string;
  active_brightness: number;
  base_brightness: number;
  park_id: number | null;
  last_response: string | null;
}

export interface MobileBreakdownNotification {
  id: number;
  lantern_id: number;
  date: string;
  description: string;
  is_resolved: boolean;
}

export interface MobileLanternControl {
  lantern_id: number;
  action: 'activate' | 'deactivate' | 'adjust_brightness';
  brightness?: number;
}

// IoT Types
export interface IoTLanternSettings {
  base_brightness: number;
  active_brightness: number;
  active_time: number;
}

export interface IoTLanternStatus {
  id: number;
  status: string;
  brightness: number;
  last_communication: string;
  battery_level?: number;
  temperature?: number;
}

export interface IoTFaultReport {
  lantern_id: number;
  fault_code: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
} 