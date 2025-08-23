import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AMQP_URL: z.string().url(),
  PROVIDER_KMS_KEY: z.string().length(64),
  SERVER_PORT: z.string().default('8080'),
});

export const env = envSchema.parse(process.env);
