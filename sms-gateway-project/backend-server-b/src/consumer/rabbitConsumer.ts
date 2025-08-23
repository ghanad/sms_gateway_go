import amqp, { ConsumeMessage } from 'amqplib';
import { prisma } from '../db/client';
import { providerRegistry } from '../providers';
import { SendRequest, ProviderConfig } from '../providers';
import { providerStore } from '../providers/configStore';
import { useConfigProviders } from '../config';

const QUEUE = 'sms.outbound';

export async function startConsumer(amqpUrl: string) {
  const conn = await amqp.connect(amqpUrl);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });

  ch.consume(QUEUE, async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    try {
      const job = JSON.parse(msg.content.toString());
      let providerCfg: ProviderConfig | undefined;
      if (useConfigProviders) {
        providerCfg = providerStore.getByIdOrName(job.provider_id);
      } else {
        const dbCfg: any = await prisma.sms_providers.findFirst({ where: {
          OR: [{ id: job.provider_id }, { name: job.provider_id }],
          is_enabled: true
        }});
        if (dbCfg) {
          providerCfg = {
            id: dbCfg.id,
            name: dbCfg.name,
            type: dbCfg.type,
            is_enabled: dbCfg.is_enabled,
            base_url: dbCfg.base_url,
            endpoint_path: dbCfg.endpoint_path,
            auth_type: dbCfg.auth_type,
            basic_username: dbCfg.basic_username,
            basic_password_ciphertext: dbCfg.basic_password_ciphertext,
            default_sender: dbCfg.default_sender,
            extra_headers_json: dbCfg.extra_headers_json,
            timeout_ms: dbCfg.timeout_ms,
            retries: dbCfg.retries,
            retry_backoff_ms: dbCfg.retry_backoff_ms,
            updated_at: dbCfg.updated_at,
          };
        }
      }
      if (!providerCfg) throw new Error('provider not found');
      const provider = providerRegistry.get(providerCfg.type);
      if (!provider) throw new Error('unsupported provider');
      const req: SendRequest = {
        providerId: providerCfg.id,
        sender: job.sender || providerCfg.default_sender!,
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
