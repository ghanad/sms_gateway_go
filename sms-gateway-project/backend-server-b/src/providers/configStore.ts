import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { encrypt } from '../crypto';
import { ProviderConfig } from './types';

const providerSchema = z.object({
  id: z.string(),
  type: z.string(),
  is_enabled: z.boolean(),
  base_url: z.string(),
  send: z.object({
    endpoint_path: z.string(),
    method: z.string().optional(),
    headers: z.record(z.string()).optional(),
    timeout_ms: z.number().optional(),
    retries: z.object({
      count: z.number().optional(),
      backoff_ms: z.number().optional(),
    }).optional(),
  }),
  balance: z.object({
    endpoint_path: z.string(),
    method: z.string().optional(),
    timeout_ms: z.number().optional(),
  }).optional(),
  auth: z.object({
    type: z.literal('basic'),
    username: z.string(),
    password_env: z.string(),
  }),
  defaults: z.object({
    sender: z.string(),
  }).optional(),
  extra_headers: z.record(z.string()).optional(),
});

const configSchema = z.object({ providers: z.array(providerSchema) });

function resolveEnv(str: string): string {
  return str.replace(/\$\{([^}]+)\}/g, (_, name) => {
    const val = process.env[name];
    if (val === undefined) throw new Error(`Missing env ${name}`);
    return val;
  });
}

export function loadProvidersFromConfig(dir = path.join(process.cwd(), 'config')): ProviderConfig[] {
  const yamlPath = path.join(dir, 'providers.yaml');
  const jsonPath = path.join(dir, 'providers.json');
  let filePath: string | undefined;
  if (fs.existsSync(yamlPath)) filePath = yamlPath;
  else if (fs.existsSync(jsonPath)) filePath = jsonPath;
  if (!filePath) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = filePath.endsWith('.yaml') ? yaml.load(raw) : JSON.parse(raw);
  const cfg = configSchema.parse(parsed as any);
  const mtime = fs.statSync(filePath).mtime;
  return cfg.providers.map((p): ProviderConfig => {
    const username = resolveEnv(p.auth.username);
    const pwd = process.env[p.auth.password_env];
    if (!pwd) throw new Error(`Missing env ${p.auth.password_env}`);
    const headers = { ...(p.send.headers || {}), ...(p.extra_headers || {}) };
    return {
      id: p.id,
      name: p.id,
      type: p.type,
      is_enabled: p.is_enabled,
      base_url: p.base_url,
      endpoint_path: p.send.endpoint_path,
      auth_type: p.auth.type,
      basic_username: username,
      basic_password_ciphertext: encrypt(pwd),
      default_sender: p.defaults?.sender || null,
      extra_headers_json: Object.keys(headers).length ? headers : null,
      timeout_ms: p.send.timeout_ms ?? 10000,
      retries: p.send.retries?.count ?? 0,
      retry_backoff_ms: p.send.retries?.backoff_ms ?? 0,
      balance_endpoint_path: p.balance?.endpoint_path,
      balance_method: p.balance?.method,
      balance_timeout_ms: p.balance?.timeout_ms,
      updated_at: mtime,
    };
  });
}

class ProviderStore {
  private providers: ProviderConfig[];
  constructor(providers: ProviderConfig[]) {
    this.providers = providers;
  }
  getByIdOrName(idOrName: string): ProviderConfig | undefined {
    return this.providers.find(p => p.id === idOrName || p.name === idOrName);
  }
  list(): ProviderConfig[] {
    return this.providers;
  }
}

export const providerStore = new ProviderStore(loadProvidersFromConfig());

