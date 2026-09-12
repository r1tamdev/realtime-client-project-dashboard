import { AppError } from './appError';

export function getRequiredParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string {
  const value = params[key];

  if (!value || Array.isArray(value)) {
    throw new AppError(400, `Missing or invalid parameter: ${key}`);
  }

  return value;
}