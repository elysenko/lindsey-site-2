/**
 * Typed contracts for the NestJS REST API served under `/api`.
 * These mirror the backend controllers/DTOs so the Angular service layer
 * is fully typed end-to-end.
 */

// ── Content ──────────────────────────────────────────────────────────────────
export interface ServiceOffering {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  outcomes: string[];
  deliverables: string[];
}

export interface Faq {
  question: string;
  answer: string;
  category: string;
  serviceSlug?: string;
}

export interface ServiceDetail extends ServiceOffering {
  faqs: Faq[];
}

// ── Team ─────────────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  credentials?: string | null;
  honorificPrefix?: string | null;
  bio: string;
  expertise: string[];
  affiliations?: string | null;
  headshotUrl?: string | null;
  linkedinUrl?: string | null;
  education?: string | null;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Insights ─────────────────────────────────────────────────────────────────
export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface InsightSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface InsightDetail {
  slug: string;
  title: string;
  body: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Admin insight record (draft + published)
export interface AdminInsight {
  id: string;
  slug: string;
  title: string;
  body: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInsightInput {
  title: string;
  body: string;
  slug?: string;
  status?: PostStatus;
}

export type UpdateInsightInput = Partial<CreateInsightInput>;

// ── Consultation / Lead funnel ───────────────────────────────────────────────
export interface CreateConsultationInput {
  fullName: string;
  organization?: string;
  email: string;
  phone?: string;
  serviceInterest?: string;
  challengeCategories: string[];
  situationDescription?: string;
}

export interface ConsultationResponse {
  briefToken: string;
}

// ── Brief ────────────────────────────────────────────────────────────────────
export interface SubmitBriefInput {
  mission?: string;
  vision?: string;
  differentiator?: string;
  brandStory?: string;
  audiences?: string;
  brandVoice?: string;
  successDefinition?: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'USER' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ── Admin leads ──────────────────────────────────────────────────────────────
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';
export type LeadSort = 'newest' | 'oldest';

export interface ListLeadsQuery {
  status?: LeadStatus;
  challenge?: string;
  sort?: LeadSort;
  page?: number;
  pageSize?: number;
}

export interface UpdateLeadInput {
  leadStatus?: LeadStatus;
  note?: string;
  briefEdits?: Partial<Record<
    | 'mission'
    | 'vision'
    | 'differentiator'
    | 'brandStory'
    | 'audiences'
    | 'brandVoice'
    | 'successDefinition',
    string
  >>;
}

// ── Settings ─────────────────────────────────────────────────────────────────
export interface SettingEntry {
  key: string;
  value: string | null;
  configured: boolean;
  [k: string]: unknown;
}

export interface UpdateSettingsInput {
  settings: { key: string; value: string }[];
}
