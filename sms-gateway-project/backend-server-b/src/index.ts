import { env } from './config';
import { startConsumer } from './consumer/rabbitConsumer';
import { app } from './app';

app.listen(parseInt(env.SERVER_PORT), () => {
  console.log(`server listening on ${env.SERVER_PORT}`);
});

startConsumer(env.AMQP_URL).catch(err => {
  console.error('consumer error', err);
});
