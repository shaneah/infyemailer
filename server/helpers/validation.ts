import { z } from 'zod';

/**
 * Validates data against a Zod schema
 * 
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated data or error object
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> | { error: string } {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        error: error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', ') 
      };
    }
    return { error: 'Invalid data format' };
  }
}