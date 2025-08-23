import { z } from 'zod';

export const providerBaseSchema = z.object({
  name: z.string().min(3).regex(/^[a-z0-9_-]+$/),
  type: z.enum(['magfa']),
  is_enabled: z.boolean().default(true),
  base_url: z.string().url(),
  endpoint_path: z.string().startsWith('/'),
  auth_type: z.enum(['basic','apikey','bearer','none']),
  default_sender: z.string().optional(),
  timeout_ms: z.number().int().positive().max(60000).default(10000),
  retries: z.number().int().min(0).max(5).default(2),
  retry_backoff_ms: z.number().int().min(0).max(60000).default(500),
  extra_headers_json: z.record(z.string(), z.string()).default({})
});

export const magfaAuthSchema = z.object({
  basic_username: z.string().regex(/^[^/]+\/.+$/, 'Use USERNAME/DOMAIN'),
  basic_password: z.string().min(1).optional()
});

export const providerCreateSchema = providerBaseSchema.and(magfaAuthSchema.extend({
  basic_password: z.string().min(1)
}));

export const providerUpdateSchema = providerBaseSchema.partial().and(magfaAuthSchema);

export type ProviderBase = z.infer<typeof providerBaseSchema> & z.infer<typeof magfaAuthSchema>;
