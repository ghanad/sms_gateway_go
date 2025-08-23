import express from 'express';
import { prisma } from '../db/client';
import { encrypt, maskSecret } from '../crypto';
import { providerRegistry } from '../providers';
import { providerStore } from '../providers/configStore';
import { useConfigProviders } from '../config';
import { Counter } from 'prom-client';

export const adminRouter = express.Router();

if (useConfigProviders) {
  const balanceChecks = new Counter({ name: 'provider_balance_checks_total', help: 'Total provider balance checks', labelNames: ['provider'] });
  const balanceFailures = new Counter({ name: 'provider_balance_failures_total', help: 'Provider balance failures', labelNames: ['provider'] });

  adminRouter.get('/', (_req, res) => {
    const items = providerStore.list();
    res.json(items.map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      is_enabled: i.is_enabled,
      base_url: i.base_url,
      hasBalance: !!i.balance_endpoint_path,
      updatedAt: i.updated_at
    })));
  });

  adminRouter.get('/:id/balance', async (req, res) => {
    const id = req.params.id;
    const cfg = providerStore.getByIdOrName(id);
    if (!cfg) return res.status(404).send();
    if (!cfg.balance_endpoint_path) return res.json({ ok: false, error: 'NOT_SUPPORTED' });
    const provider = providerRegistry.get(cfg.type);
    if (!provider || !provider.getBalance) return res.json({ ok: false, error: 'NOT_SUPPORTED' });
    balanceChecks.inc({ provider: cfg.id });
    try {
      const result = await provider.getBalance(cfg);
      if (!result.ok) balanceFailures.inc({ provider: cfg.id });
      res.json(result);
    } catch (err) {
      balanceFailures.inc({ provider: cfg.id });
      res.json({ ok: false, error: 'ERROR' });
    }
  });

  adminRouter.post('*', (_req, res) => res.status(501).send());
  adminRouter.patch('*', (_req, res) => res.status(501).send());
  adminRouter.delete('*', (_req, res) => res.status(501).send());
  adminRouter.post('/:id/test', (_req, res) => res.status(501).send());
} else {
  const { prisma } = require('../db/client');

  adminRouter.post('/', async (req, res) => {
    const data = req.body;
    if (data.basic_password) {
      data.basic_password_ciphertext = encrypt(data.basic_password);
      delete data.basic_password;
    }
    const created = await prisma.sms_providers.create({ data });
    res.json({ ...created, basic_password_ciphertext: maskSecret(created.basic_password_ciphertext) });
  });

  adminRouter.get('/', async (_req, res) => {
    const items = await prisma.sms_providers.findMany();
    res.json(items.map((i: any) => ({ ...i, basic_password_ciphertext: maskSecret(i.basic_password_ciphertext) }))); 
  });

  adminRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    const item = await prisma.sms_providers.findUnique({ where: { id } });
    if (!item) return res.status(404).send();
    res.json({ ...item, basic_password_ciphertext: maskSecret(item.basic_password_ciphertext) });
  });

  adminRouter.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    if (data.basic_password) {
      data.basic_password_ciphertext = encrypt(data.basic_password);
      delete data.basic_password;
    }
    const updated = await prisma.sms_providers.update({ where: { id }, data });
    res.json({ ...updated, basic_password_ciphertext: maskSecret(updated.basic_password_ciphertext) });
  });

  adminRouter.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const updated = await prisma.sms_providers.update({ where: { id }, data: { is_enabled: false } });
    res.json(updated);
  });

  adminRouter.post('/:id/test', async (req, res) => {
    const id = req.params.id;
    const provider = await prisma.sms_providers.findUnique({ where: { id } });
    if (!provider) return res.status(404).send();
    // dry run only
    res.json({ ok: true });
  });
}

