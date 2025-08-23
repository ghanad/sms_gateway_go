export interface ProviderConfig {
  id: string;
  name: string;
  type: string;
  is_enabled: boolean;
  base_url: string;
  endpoint_path: string;
  auth_type: 'basic'|'apikey'|'bearer'|'none';
  basic_username?: string;
  basic_password_ciphertext?: string;
  default_sender?: string | null;
  extra_headers_json?: Record<string,string> | null;
  timeout_ms: number;
  retries: number;
  retry_backoff_ms: number;
  balance_endpoint_path?: string;
  balance_method?: string;
  balance_timeout_ms?: number;
  updated_at?: Date;
}

export interface SendRequest {
  providerId: string;
  sender: string;
  message: string;
  recipients: string[];
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface SendResult {
  ok: boolean;
  providerMessageId?: string | string[];
  httpStatus?: number;
  raw?: any;
  errorCode?: string;
  errorMessage?: string;
  retryable?: boolean;
}

export interface BalanceResult {
  ok: boolean;
  balance?: number;
  unit?: string;
  raw?: any;
  error?: string;
}

export interface SmsProvider {
  type: 'magfa' | string;
  send(req: SendRequest, cfg: ProviderConfig): Promise<SendResult>;
  getBalance?(cfg: ProviderConfig): Promise<BalanceResult>;
}
