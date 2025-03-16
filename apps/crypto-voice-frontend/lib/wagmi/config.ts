import { env } from '@/env';
import { polygon } from 'viem/chains';
import { http } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { CHAINS } from './chains';

export const config = getDefaultConfig({
  appName: 'codefunded',
  appDescription: 'codefunded - AI-powered crypto assistant',
  appUrl: 'https://codefunded.com',
  ssr: true,
  projectId: env.NEXT_PUBLIC_PROJECT_ID ?? '',
  chains: CHAINS as any,
  transports: {
    [polygon.id]: http(),
  },
});