import 'dotenv/config';

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'PORT',
  'CLIENT_URL',
] as const;

type EnvVar = typeof requiredEnvVars[number];

function loadEnv(): Record<EnvVar, string> {
  const missing: string[] = [];
  const env = {} as Record<EnvVar, string>;

  for (const key of requiredEnvVars) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      env[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return env;
}

export const env = loadEnv();