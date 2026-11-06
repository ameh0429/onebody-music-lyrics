import { createApp } from './app';

async function bootstrap() {
  const app = await createApp();
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}
bootstrap().catch(() => {
  console.error(
    'Application startup failed. Check required environment variables, PostgreSQL connectivity, and run npm run db:setup for a new database.',
  );
  process.exitCode = 1;
});
