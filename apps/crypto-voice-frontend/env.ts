import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    server: {

    },
    client: {
        NEXT_PUBLIC_API_URL: z.string().url(),
        NEXT_PUBLIC_SENTRY_PROJECT_NAME: z.string().optional(),
        NEXT_PUBLIC_SENTRY_ORG: z.string().optional(),
        NEXT_PUBLIC_APP_ENV: z.enum(['local', 'dev', 'prod']).default('local'),
        NEXT_PUBLIC_PROJECT_ID: z.string().optional(),
        NEXT_PUBLIC_BICONOMY_API_KEY: z.string().optional(),
        NEXT_PUBLIC_BICONOMY_BUNDLER_URL: z.string().optional(),
        NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: z.string().optional(),
        NEXT_PUBLIC_WEB3AUTH_VERIFIER: z.string().optional(),
        NEXT_PUBLIC_WEB3AUTH_NETWORK: z.string().optional(),
        NEXT_PUBLIC_WEB3AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
    },
    runtimeEnv: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_SENTRY_PROJECT_NAME: process.env.NEXT_PUBLIC_SENTRY_PROJECT_NAME,
        NEXT_PUBLIC_SENTRY_ORG: process.env.NEXT_PUBLIC_SENTRY_ORG,
        NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
        NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
        NEXT_PUBLIC_BICONOMY_API_KEY: process.env.NEXT_PUBLIC_BICONOMY_API_KEY,
        NEXT_PUBLIC_BICONOMY_BUNDLER_URL: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
        NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
        NEXT_PUBLIC_WEB3AUTH_VERIFIER: process.env.NEXT_PUBLIC_WEB3AUTH_VERIFIER,
        NEXT_PUBLIC_WEB3AUTH_NETWORK: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
        NEXT_PUBLIC_WEB3AUTH_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_GOOGLE_CLIENT_ID,
    }
});