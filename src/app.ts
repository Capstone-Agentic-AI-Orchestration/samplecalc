import cors from 'cors';
import express from 'express';
import type { Express } from 'express';

export const SERVICE_NAME = 'samplecalc';

/** Origins allowed to call this API, from the comma-separated CORS_ORIGINS. */
function corsOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

export const app: Express = express();

app.use(cors({ origin: corsOrigins() }));
app.use(express.json());

// What Render polls, and how anything else knows the service is up.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
