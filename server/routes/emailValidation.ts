import { Request, Response, Router } from 'express';
import { EmailValidationService } from '../services/emailValidation';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const router = Router();

/**
 * Validate a single email address
 * POST /api/email-validation/single
 */
router.post('/single', async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email('Please enter a valid email address')
  });

  try {
    const validatedData = schema.parse(req.body);
    const result = await EmailValidationService.validateSingleEmail(validatedData.email);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error('Email validation error:', error);
    res.status(500).json({ error: 'Failed to validate email' });
  }
});

/**
 * Check the health of an email address (MX records, syntax, etc.)
 * POST /api/email-validation/health-check
 */
router.post('/health-check', async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().min(1, 'Email is required')
  });

  try {
    const validatedData = schema.parse(req.body);
    const result = await EmailValidationService.checkEmailHealth(validatedData.email);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error('Email health check error:', error);
    res.status(500).json({ error: 'Failed to check email health' });
  }
});

/**
 * Validate a batch of emails
 * POST /api/email-validation/batch
 */
router.post('/batch', async (req: Request, res: Response) => {
  const schema = z.object({
    emails: z.array(z.string()).min(1, 'At least one email is required')
  });

  try {
    const validatedData = schema.parse(req.body);
    const result = await EmailValidationService.validateEmailBatch(validatedData.emails);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error('Batch email validation error:', error);
    res.status(500).json({ error: 'Failed to validate emails' });
  }
});

/**
 * Analyze a batch of emails with detailed reports
 * POST /api/email-validation/analyze-bulk
 */
router.post('/analyze-bulk', async (req: Request, res: Response) => {
  const schema = z.object({
    emails: z.array(z.string()).min(1, 'At least one email is required')
  });

  try {
    const validatedData = schema.parse(req.body);
    const result = await EmailValidationService.analyzeBulkEmails(validatedData.emails);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error('Bulk email analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze emails' });
  }
});

/**
 * Get validation credits information
 * GET /api/email-validation/credits
 */
router.get('/credits', async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch from a database
    // For now, returning a fixed value
    res.json({
      available: 8181,
      used: 1819,
      total: 10000
    });
  } catch (error) {
    console.error('Credits retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve credits information' });
  }
});

/**
 * Purchase additional validation credits
 * POST /api/email-validation/purchase-credits
 */
router.post('/purchase-credits', async (req: Request, res: Response) => {
  const schema = z.object({
    amount: z.number().min(100, 'Minimum purchase is 100 credits')
  });

  try {
    const validatedData = schema.parse(req.body);
    // In a real implementation, this would update the database and process payment
    res.json({
      success: true,
      newBalance: 8181 + validatedData.amount,
      transaction: {
        id: `TRANS-${Date.now()}`,
        amount: validatedData.amount,
        date: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error('Credit purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase credits' });
  }
});

export const registerEmailValidationRoutes = (app: any) => {
  app.use('/api/email-validation', router);
};

export default router;