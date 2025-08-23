import { SmsProvider } from './types';

export class ProviderRegistry {
  private providers: Record<string, SmsProvider> = {};

  register(p: SmsProvider) {
    this.providers[p.type] = p;
  }

  get(type: string): SmsProvider | undefined {
    return this.providers[type];
  }
}

export const providerRegistry = new ProviderRegistry();
