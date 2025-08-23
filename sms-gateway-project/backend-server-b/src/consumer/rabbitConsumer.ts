import amqp, { ConsumeMessage } from 'amqplib';
import { prisma } from '../db/client';
import { providerRegistry } from '../providers';
import { SendRequest } from '../providers';

const QUEUE = 'sms.outbound';

export async function startConsumer(amqpUrl: string) {
  const conn = await amqp.connect(amqpUrl);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });

  ch.consume(QUEUE, async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    try {
      const job = JSON.parse(msg.content.toString());
      const providerCfg = await prisma.sms_providers.findFirst({ where: {
        OR: [{ id: job.provider_id }, { name: job.provider_id }],
        is_enabled: true
      }});
      if (!providerCfg) throw new Error('provider not found');
      const provider = providerRegistry.get(providerCfg.type);
      if (!provider) throw new Error('unsupported provider');
      const req: SendRequest = {
        providerId: providerCfg.id,
        sender: job.sender || providerCfg.default_sender,
        message: job.message,
        recipients: job.recipients,
        idempotencyKey: job.idempotency_key,
        metadata: job.metadata
      };
      const result = await provider.send(req, providerCfg);
      if (result.ok) {
        ch.ack(msg);
      } else if (result.retryable) {
        ch.nack(msg, false, true);
      } else {
        ch.reject(msg, false);
      }
    } catch (e) {
      ch.reject(msg, false);
    }
  });
}
