import { ZodSchema } from 'zod';

/**
 * Validate input data against a Zod schema
 * 
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated data or error object
 */
export function validateSchema<T>(schema: ZodSchema, data: unknown): T | { error: string } {
  try {
    const validatedData = schema.parse(data);
    return validatedData as T;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Validation failed' };
  }
}