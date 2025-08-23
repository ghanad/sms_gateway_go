import fs from 'fs';
import path from 'path';
import nock from 'nock';
import request from 'supertest';

describe('admin providers read-only', () => {
  const configDir = path.join(process.cwd(), 'config');
  beforeAll(() => {
    process.env.USE_CONFIG_PROVIDERS = 'true';
    process.env.MAGFA_USERNAME_DOMAIN = 'user/domain';
    process.env.MAGFA_PASSWORD = 'pass';
    process.env.PROVIDER_KMS_KEY = '0'.repeat(64);
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.AMQP_URL = 'amqp://localhost';
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, 'providers.yaml'), `providers:\n- id: magfa\n  type: magfa\n  is_enabled: true\n  base_url: https://sms.magfa.com\n  send:\n    endpoint_path: /send\n  balance:\n    endpoint_path: /bal\n  auth:\n    type: basic\n    username: \${MAGFA_USERNAME_DOMAIN}\n    password_env: MAGFA_PASSWORD\n`);
  });
  afterAll(() => {
    fs.rmSync(path.join(configDir, 'providers.yaml'), { force: true });
  });

  it('lists providers and checks balance', async () => {
    const { app } = await import('../src/app');
    const res = await request(app).get('/admin/providers');
    expect(res.body[0].id).toBe('magfa');
    nock('https://sms.magfa.com').get('/bal').reply(200, { balance: 10 });
    const bal = await request(app).get('/admin/providers/magfa/balance');
    expect(bal.body.ok).toBe(true);
    expect(bal.body.balance).toBe(10);
  });
});
