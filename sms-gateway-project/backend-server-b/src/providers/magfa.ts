import axios from 'axios';
import { SmsProvider, SendRequest, SendResult, ProviderConfig, BalanceResult } from './types';
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

  async getBalance(cfg: ProviderConfig): Promise<BalanceResult> {
    if (!cfg.balance_endpoint_path) {
      return { ok: false, error: 'NOT_SUPPORTED' };
    }
    const url = cfg.base_url + cfg.balance_endpoint_path;
    const password = cfg.basic_password_ciphertext ? decrypt(cfg.basic_password_ciphertext) : '';
    const auth = { username: cfg.basic_username || '', password };
    const method = (cfg.balance_method || 'GET') as any;
    try {
      const resp = await axios.request({
        url,
        method,
        auth,
        headers: { Accept: 'application/json' },
        timeout: cfg.balance_timeout_ms || 5000,
        proxy: false,
      });
      const raw = resp.data;
      let balance: number | undefined;
      if (typeof raw === 'object') {
        if (typeof raw.balance === 'number') balance = raw.balance;
        else if (typeof raw.credit === 'number') balance = raw.credit;
        else {
          const firstNum = Object.values(raw).find(v => typeof v === 'number');
          if (typeof firstNum === 'number') balance = firstNum;
        }
      } else if (typeof raw === 'string') {
        const m = raw.match(/[-+]?[0-9]*\.?[0-9]+/);
        if (m) balance = parseFloat(m[0]);
      }
      return { ok: true, balance, raw };
    } catch (err: any) {
      return { ok: false, error: err.message, raw: err.response?.data };
    }
  }
}
