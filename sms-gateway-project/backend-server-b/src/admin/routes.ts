import express from 'express';
import { prisma } from '../db/client';
import { encrypt, decrypt, maskSecret } from '../crypto';
import { providerRegistry } from '../providers';

export const adminRouter = express.Router();

adminRouter.post('/', async (req, res) => {
  const data = req.body;
  if (data.basic_password) {
    data.basic_password_ciphertext = encrypt(data.basic_password);
    delete data.basic_password;
  }
  const created = await prisma.sms_providers.create({ data });
  res.json({ ...created, basic_password_ciphertext: maskSecret(created.basic_password_ciphertext) });
});

adminRouter.get('/', async (req, res) => {
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
