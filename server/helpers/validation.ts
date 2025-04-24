import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Validates data against a Zod schema and returns either the validated data or an error object
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns Either the validated data or an object with an error message
 */
export function validateSchema<T>(schema: ZodSchema, data: unknown): T | { error: string } {
  try {
    return schema.parse(data) as T;
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: fromZodError(error).message };
    }
    return { error: 'Invalid data format' };
  }
}