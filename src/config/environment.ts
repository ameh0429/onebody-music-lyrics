import type { SequelizeOptions } from 'sequelize-typescript';
import { models } from '../database/models';

export function validateEnvironment(env: Record<string, unknown>) {
  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET']) {
    if (typeof env[key] !== 'string' || !(env[key] as string).trim())
      throw new Error(`Missing required environment variable: ${key}`);
  }
  if ((env.JWT_SECRET as string).length < 32)
    throw new Error('JWT_SECRET must contain at least 32 characters');
  for (const key of ['PORT', 'DB_PORT']) {
    if (
      env[key] !== undefined &&
      (!/^\d+$/.test(String(env[key])) || Number(env[key]) < 1 || Number(env[key]) > 65535)
    )
      throw new Error(`${key} must be an integer from 1 to 65535`);
  }
  if (env.JWT_EXPIRES_IN !== undefined && !/^\d+(ms|s|m|h|d|w|y)$/.test(String(env.JWT_EXPIRES_IN)))
    throw new Error('JWT_EXPIRES_IN must be a duration such as 1h or 7d');
  return env;
}

export function databaseOptions(env: Record<string, unknown>): SequelizeOptions {
  return {
    dialect: 'postgres',
    host: String(env.DB_HOST),
    port: Number(env.DB_PORT || 5432),
    database: String(env.DB_NAME),
    username: String(env.DB_USER),
    password: String(env.DB_PASSWORD),
    models,
    logging: false,
  };
}
