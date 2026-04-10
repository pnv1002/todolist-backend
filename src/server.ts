import './config/env'; // phải load trước tất cả các import khác

import app from './app';
import { initDB } from './db';
import { env } from './config/env';

async function start() {
  await initDB();
  console.log('Database initialized');
  app.listen(env.PORT, () =>
    console.log(`[${env.NODE_ENV}] Server running on http://localhost:${env.PORT}`)
  );
}

start().catch(console.error);
