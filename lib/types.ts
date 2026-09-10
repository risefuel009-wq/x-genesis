export type Company = {
  id: string;
  name: string;
  recruiter_commission: number;
  team_leader_commission: number;
  unit_manager_commission: number;
  guarantee_days: number;
  created_at: string;
};

export type Offer = {
  id: string;
  company_id: string;
  account_name: string;
  status: 'active' | 'hold';
  shift_type: string | null;
  location: string | null;
  accepts_students: boolean;
  min_age: number;
  max_age: number;
  language: string;
  min_language_level: string;
  salary: string | null;
  form_url: string | null;
  created_at: string;
  companies?: Company;
};

export type Candidate = {
  id: string;
  triple_name: string;
  phone: string;
  email: string | null;
  age: number | null;
  site: string;
  language: string;
  language_level: string | null;
  college: string | null;
  grad_status: string | null;
  military_status: string | null;
  applied_last_3_months: boolean;
  voice_url: string | null;
  voice_confirmed: boolean;
  created_at: string;
};

export type Application = {
  id: string;
  candidate_id: string;
  offer_id: string;
  stage: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
  notes: string | null;
  created_at: string;
  offers?: Offer;
  candidates?: Candidate;
};

export const LANGUAGES = ['English', 'Arabic', 'French', 'Spanish', 'German'] as const;
export const LEVELS = ['A1', 'A2', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C2'] as const;
export const GRAD_STATUS = ['undergrad', 'grad', 'gap_year', 'dropout'] as const;
export const MILITARY_STATUS = ['exempted', 'done', 'postponed', 'in_service'] as const;
export const STAGES = ['new', 'screening', 'interview', 'hired', 'rejected'] as const;

export type Language = (typeof LANGUAGES)[number];
export type Level = (typeof LEVELS)[number];
export type GradStatus = (typeof GRAD_STATUS)[number];
export type MilitaryStatus = (typeof MILITARY_STATUS)[number];
export type Stage = (typeof STAGES)[number];
