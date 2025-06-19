import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { securityEvents } from '../../shared/schema';

export interface SecurityEvent {
  id?: number;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  source?: string;
  metadata?: any;
  created_at?: Date;
}

export class SecurityEventService {
  static async logEvent(event: Omit<SecurityEvent, 'id' | 'created_at'>) {
    const [inserted] = await db
      .insert(securityEvents)
      .values({ ...event, createdAt: new Date() })
      .returning();
    return inserted;
  }

  static async getRecentEvents(limit = 20, severity?: string) {
    let query = db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt));
    if (severity) {
      query = query.where(eq(securityEvents.severity, severity));
    }
    const results = await query;
    return results.slice(0, limit);
  }
} 