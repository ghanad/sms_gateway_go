import nock from 'nock';
import { MagfaProvider } from '../src/providers/magfa';
import { encrypt } from '../src/crypto';
import { ProviderConfig } from '../src/providers/types';

describe('MagfaProvider', () => {
  const cfg: ProviderConfig = {
    id: '1',
    name: 'magfa',
    type: 'magfa',
    base_url: 'https://sms.magfa.com',
    endpoint_path: '/api/http/sms/v2/send',
    auth_type: 'basic',
    basic_username: 'user/domain',
    basic_password_ciphertext: encrypt('pass'),
    default_sender: null,
    extra_headers_json: null,
    timeout_ms: 1000,
    retries: 0,
    retry_backoff_ms: 0,
  };

  it('aligns array lengths', async () => {
    const provider = new MagfaProvider();
    const scope = nock('https://sms.magfa.com')
      .post('/api/http/sms/v2/send', (body: any) => {
        return body.senders.length === 2 && body.messages.length === 2;
      })
      .reply(200, { ids: ['1','2'] });

    const res = await provider.send({ providerId: '1', sender: 's', message: 'm', recipients: ['r1','r2'] }, cfg);
    expect(res.ok).toBe(true);
    scope.done();
  });

  it('sets basic auth header', async () => {
    const provider = new MagfaProvider();
    const scope = nock('https://sms.magfa.com')
      .matchHeader('authorization', val => !!val && val.startsWith('Basic '))
      .post('/api/http/sms/v2/send')
      .reply(200, {});
    await provider.send({ providerId: '1', sender: 's', message: 'm', recipients: ['r1'] }, cfg);
    scope.done();
  });

  it('marks retryable on 500', async () => {
    const provider = new MagfaProvider();
    const scope = nock('https://sms.magfa.com')
      .post('/api/http/sms/v2/send')
      .reply(500, {});
    const res = await provider.send({ providerId: '1', sender: 's', message: 'm', recipients: ['r1'] }, cfg);
    expect(res.retryable).toBe(true);
    scope.done();
  });
});
