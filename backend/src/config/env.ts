import dotenv from "dotenv";

dotenv.config();

function getEnvVar(key: string, required: true): string;
function getEnvVar(key: string, required: false, defaultValue: string): string;
function getEnvVar(
  key: string,
  required: boolean,
  defaultValue?: string,
): string {
  const value = process.env[key];
  if (!value) {
    if (required) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue!;
  }
  return value;
}

export const env = {
  DATABASE_URL: getEnvVar("DATABASE_URL", true),
  JWT_SECRET: getEnvVar("JWT_SECRET", true),
  PORT: parseInt(getEnvVar("PORT", false, "3001"), 10),
  NODE_ENV: getEnvVar("NODE_ENV", false, "development"),
  CORS_ORIGIN: getEnvVar("CORS_ORIGIN", false, "http://localhost:3000"),
  MAX_FILE_SIZE: parseInt(getEnvVar("MAX_FILE_SIZE", false, "5242880"), 10),
} as const;
