import { env } from '@/env';
import { polygon } from 'viem/chains';

const getChainsForEnvironment = () => {
  switch (env.NEXT_PUBLIC_APP_ENV) {
    case 'local':
      return [polygon];
    case 'dev':
      return [polygon];
    case 'prod':
    default:
      return [polygon];
  }
};

export const CHAINS = getChainsForEnvironment();