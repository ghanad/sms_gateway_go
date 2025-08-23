import { providerRegistry } from './registry';
import { MagfaProvider } from './magfa';

providerRegistry.register(new MagfaProvider());

export * from './types';
export { providerRegistry } from './registry';
