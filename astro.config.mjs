import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      dsn: process.env.PUBLIC_GLITCHTIP_DSN ?? '',
      release: 'minimatch-fast',
      environment: 'production',
      tracesSampleRate: 0.01,
      sourceMapsUploadOptions: { telemetry: false },
    }),
  ],
  site: 'https://minimatch-fast.686f6c61.dev',
  build: {
    assets: '_assets'
  }
});
