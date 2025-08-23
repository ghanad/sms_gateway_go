import fs from 'fs';
import path from 'path';
import { loadProvidersFromConfig } from '../src/providers/configStore';

describe('config loader', () => {
  const tmpDir = path.join(__dirname, 'tmpcfg');
  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('resolves env vars', () => {
    process.env.MAGFA_USERNAME_DOMAIN = 'user/domain';
    process.env.MAGFA_PASSWORD = 'pass';
    fs.writeFileSync(path.join(tmpDir, 'providers.yaml'), `providers:\n- id: magfa\n  type: magfa\n  is_enabled: true\n  base_url: https://sms.magfa.com\n  send:\n    endpoint_path: /send\n  auth:\n    type: basic\n    username: \${MAGFA_USERNAME_DOMAIN}\n    password_env: MAGFA_PASSWORD\n`);
    const providers = loadProvidersFromConfig(tmpDir);
    expect(providers[0].basic_username).toBe('user/domain');
  });

  it('fails when env missing', () => {
    fs.writeFileSync(path.join(tmpDir, 'providers.yaml'), `providers:\n- id: magfa\n  type: magfa\n  is_enabled: true\n  base_url: https://sms.magfa.com\n  send:\n    endpoint_path: /send\n  auth:\n    type: basic\n    username: \${MISSING}\n    password_env: NOPE\n`);
    expect(() => loadProvidersFromConfig(tmpDir)).toThrow();
  });
});
