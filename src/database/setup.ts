import 'reflect-metadata';
import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { databaseOptions, validateEnvironment } from '../config/environment';

async function setup() {
  validateEnvironment(process.env);
  const db = new Sequelize(databaseOptions(process.env));
  try {
    await db.authenticate();
    // Explicit bootstrap only: create missing tables; never alter or drop existing data.
    await db.sync({ alter: false, force: false });
    console.log('Database tables initialized. Existing tables were not altered.');
  } finally {
    await db.close();
  }
}
setup().catch(() => {
  console.error(
    'Database setup failed. Check PostgreSQL connectivity, credentials and schema permissions.',
  );
  process.exitCode = 1;
});
