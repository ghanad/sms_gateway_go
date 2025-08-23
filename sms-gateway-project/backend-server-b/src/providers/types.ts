export interface ProviderConfig {
  id: string;
  name: string;
  type: string;
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

export interface SmsProvider {
  type: 'magfa' | string;
  send(req: SendRequest, cfg: ProviderConfig): Promise<SendResult>;
}
