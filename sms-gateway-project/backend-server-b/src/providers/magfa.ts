import axios from 'axios';
import { SmsProvider, SendRequest, SendResult, ProviderConfig } from './types';
import { decrypt } from '../crypto';

export class MagfaProvider implements SmsProvider {
  type: 'magfa' = 'magfa';

  async send(req: SendRequest, cfg: ProviderConfig): Promise<SendResult> {
    const url = cfg.base_url + cfg.endpoint_path;
    const password = cfg.basic_password_ciphertext ? decrypt(cfg.basic_password_ciphertext) : '';
    const auth = { username: cfg.basic_username || '', password };
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...(cfg.extra_headers_json || {})
    } as any;

    const recipients = req.recipients;
    const senders = recipients.length > 1 ? Array(recipients.length).fill(req.sender) : [req.sender];
    const messages = recipients.length > 1 ? Array(recipients.length).fill(req.message) : [req.message];

    try {
      const resp = await axios.post(url, {
        senders,
        messages,
        recipients,
      }, {
        auth,
        headers,
        timeout: cfg.timeout_ms,
        proxy: false,
      });
      return {
        ok: true,
        httpStatus: resp.status,
        raw: resp.data,
        providerMessageId: resp.data?.ids || resp.data?.id
      };
    } catch (err: any) {
      const status = err.response?.status;
      const retryable = status === 408 || status === 429 || (status >= 500 && status < 600);
      return {
        ok: false,
        httpStatus: status,
        errorMessage: err.message,
        retryable
      };
    }
  }
}
