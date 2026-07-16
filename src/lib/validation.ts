import { z } from 'zod';

// Shared primitives
const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');
const nonEmpty = (label: string) => z.string().trim().min(1, `${label} is required`);

// ── Consultation funnel ─────────────────────────────────────────────────────

export const consultationStep1Schema = z.object({
  fullName: nonEmpty('Full name'),
  organization: z.string().trim().optional(),
  email,
  phone: z.string().trim().optional(),
  serviceInterest: z.string().trim().optional(),
});

export const consultationStep2Schema = z.object({
  challengeCategories: z
    .array(z.string().trim().min(1))
    .min(1, 'Select at least one challenge category'),
  situationDescription: z.string().trim().optional(),
});

export const consultationSchema = consultationStep1Schema.merge(consultationStep2Schema);
export type ConsultationInput = z.infer<typeof consultationSchema>;

// ── Brand Intelligence Brief ────────────────────────────────────────────────

export const brandBriefSchema = z.object({
  mission: nonEmpty('Mission'),
  vision: nonEmpty('Vision'),
  differentiator: nonEmpty('Differentiator'),
  brandStory: nonEmpty('Brand story'),
  audiences: nonEmpty('Audiences'),
  brandVoice: nonEmpty('Brand voice'),
  successDefinition: nonEmpty('Definition of success'),
});
export type BrandBriefInput = z.infer<typeof brandBriefSchema>;

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type SignupInput = z.infer<typeof signupSchema>;

// ── Admin: leads ─────────────────────────────────────────────────────────────

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'] as const;
export const leadStatusEnum = z.enum(LEAD_STATUSES);

export const leadUpdateSchema = z
  .object({
    leadStatus: leadStatusEnum.optional(),
    note: z.string().trim().min(1).optional(),
    briefFields: z
      .object({
        mission: z.string().optional(),
        vision: z.string().optional(),
        differentiator: z.string().optional(),
        brandStory: z.string().optional(),
        audiences: z.string().optional(),
        brandVoice: z.string().optional(),
        successDefinition: z.string().optional(),
      })
      .partial()
      .optional(),
  })
  .refine((v) => v.leadStatus || v.note || (v.briefFields && Object.keys(v.briefFields).length > 0), {
    message: 'Provide at least one of: leadStatus, note, or briefFields',
  });
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

export const BRIEF_FIELDS = [
  'mission',
  'vision',
  'differentiator',
  'brandStory',
  'audiences',
  'brandVoice',
  'successDefinition',
] as const;
export type BriefField = (typeof BRIEF_FIELDS)[number];

// ── Admin: insights ──────────────────────────────────────────────────────────

export const POST_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
export const postStatusEnum = z.enum(POST_STATUSES);

export const MIN_INSIGHT_WORDS = 1500;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const insightCreateSchema = z.object({
  title: nonEmpty('Title'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen-separated')
    .optional(),
  body: z.string().refine((b) => wordCount(b) >= MIN_INSIGHT_WORDS, {
    message: `Body must be at least ${MIN_INSIGHT_WORDS} words`,
  }),
  status: postStatusEnum.default('DRAFT'),
});
export type InsightCreateInput = z.infer<typeof insightCreateSchema>;

export const insightUpdateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    body: z
      .string()
      .refine((b) => wordCount(b) >= MIN_INSIGHT_WORDS, {
        message: `Body must be at least ${MIN_INSIGHT_WORDS} words`,
      })
      .optional(),
    status: postStatusEnum.optional(),
  })
  .refine((v) => v.title || v.body || v.status, {
    message: 'Provide at least one field to update',
  });
export type InsightUpdateInput = z.infer<typeof insightUpdateSchema>;

// ── Admin: settings ──────────────────────────────────────────────────────────

export const settingsPatchSchema = z
  .array(
    z.object({
      key: z.string().trim().min(1),
      value: z.string(),
    }),
  )
  .min(1, 'Provide at least one setting');
export type SettingsPatchInput = z.infer<typeof settingsPatchSchema>;

/** Slugify a title for InsightsPost.slug generation. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
