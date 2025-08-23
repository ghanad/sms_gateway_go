import express from 'express';
import request from 'supertest';
import { adminRouter } from '../src/admin/routes';
import { prisma } from '../src/db/client';

const app = express();
app.use(express.json());
app.use('/admin/providers', adminRouter);

describe('provider priority validation', () => {
    beforeEach(() => {
      jest.spyOn(prisma.sms_providers, 'create').mockResolvedValue({ id: '1', priority: 50, basic_password_ciphertext: '' } as any);
      jest.spyOn(prisma.sms_providers, 'update').mockResolvedValue({ id: '1', priority: 50, basic_password_ciphertext: '' } as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('requires priority on create', async () => {
      const res = await request(app).post('/admin/providers').send({ name: 'p' });
      expect(res.status).toBe(400);
      expect(prisma.sms_providers.create).not.toHaveBeenCalled();
    });

    it('rejects out-of-range priority on create', async () => {
      const res = await request(app).post('/admin/providers').send({ priority: 200 });
      expect(res.status).toBe(400);
      expect(prisma.sms_providers.create).not.toHaveBeenCalled();
    });

    it('creates with valid priority', async () => {
      const res = await request(app).post('/admin/providers').send({ priority: 50 });
      expect(res.status).toBe(200);
      expect(res.body.priority).toBe(50);
    });

    it('rejects out-of-range priority on update', async () => {
      const res = await request(app).patch('/admin/providers/1').send({ priority: -1 });
      expect(res.status).toBe(400);
      expect(prisma.sms_providers.update).not.toHaveBeenCalled();
    });

    it('updates when priority omitted', async () => {
      const res = await request(app).patch('/admin/providers/1').send({ name: 'x' });
      expect(res.status).toBe(200);
    });
});
