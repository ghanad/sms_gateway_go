import express from 'express';
import { adminRouter } from './admin/routes';

export const app = express();
app.use(express.json());
app.use('/admin/providers', adminRouter);
