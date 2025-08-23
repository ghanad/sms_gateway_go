import express from 'express';
import { env } from './config';
import { adminRouter } from './admin/routes';
import { startConsumer } from './consumer/rabbitConsumer';

const app = express();
app.use(express.json());
app.use('/admin/providers', adminRouter);

app.listen(parseInt(env.SERVER_PORT), () => {
  console.log(`server listening on ${env.SERVER_PORT}`);
});

startConsumer(env.AMQP_URL).catch(err => {
  console.error('consumer error', err);
});
