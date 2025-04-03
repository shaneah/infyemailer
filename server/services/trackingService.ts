import { 
  ClickEvent, 
  OpenEvent, 
  EngagementMetrics, 
  LinkTracking, 
  InsertClickEvent, 
  InsertOpenEvent, 
  InsertEngagementMetrics, 
  InsertLinkTracking 
} from '@shared/schema';
import { db } from '../db';
import { clickEvents, openEvents, engagementMetrics, linkTracking } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { UAParser } from 'ua-parser-js';

// Helper function to parse user agent details
function parseUserAgent(userAgent: string) {
  if (!userAgent) return {};
  
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name || ''} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || ''} ${result.os.version || ''}`.trim(),
    deviceType: result.device.type || 
               (result.device.model ? 'mobile' : 
               (result.os.name?.toLowerCase().includes('android') || 
                result.os.name?.toLowerCase().includes('ios') ? 'mobile' : 'desktop'))
  };
}

// Main tracking service functions
export const trackingService = {
  // Record a click event
  async recordClickEvent(data: Omit<InsertClickEvent, 'deviceType' | 'browser' | 'os'>): Promise<ClickEvent> {
    const { userAgent, ...clickData } = data;
    
    // Parse user agent if provided
    const userAgentData = userAgent ? parseUserAgent(userAgent) : {};
    
    // Insert the click event
    const [newClickEvent] = await db.insert(clickEvents).values({
      ...clickData,
      ...userAgentData,
      timestamp: new Date()
    }).returning();
    
    // Update link tracking stats if the URL exists
    if (data.url) {
      await this.updateLinkTrackingStats(data.campaignId, data.url, data.contactId);
    }
    
    // Update engagement metrics
    await this.updateEngagementMetrics(data.campaignId);
    
    return newClickEvent;
  },
  
  // Record an open event
  async recordOpenEvent(data: Omit<InsertOpenEvent, 'deviceType' | 'browser' | 'os'>): Promise<OpenEvent> {
    const { userAgent, ...openData } = data;
    
    // Parse user agent if provided
    const userAgentData = userAgent ? parseUserAgent(userAgent) : {};
    
    // Insert the open event
    const [newOpenEvent] = await db.insert(openEvents).values({
      ...openData,
      ...userAgentData,
      timestamp: new Date()
    }).returning();
    
    // Update engagement metrics
    await this.updateEngagementMetrics(data.campaignId);
    
    return newOpenEvent;
  },
  
  // Create or update link tracking URL
  async createTrackingLink(campaignId: number, originalUrl: string): Promise<LinkTracking> {
    // Check if the link already exists
    const existingLink = await db.select().from(linkTracking).where(
      and(
        eq(linkTracking.campaignId, campaignId),
        eq(linkTracking.originalUrl, originalUrl)
      )
    ).limit(1);
    
    if (existingLink.length > 0) {
      return existingLink[0];
    }
    
    // Generate a tracking URL (in a real system, this would be a unique token)
    const trackingToken = Buffer.from(`${campaignId}:${originalUrl}:${Date.now()}`).toString('base64').replace(/[=+/]/g, '');
    const trackingUrl = `/api/track/click/${trackingToken}`;
    
    // Create new tracking link
    const [newLink] = await db.insert(linkTracking).values({
      campaignId,
      originalUrl,
      trackingUrl,
      clickCount: 0,
      uniqueClickCount: 0
    }).returning();
    
    return newLink;
  },
  
  // Update link tracking stats
  async updateLinkTrackingStats(campaignId: number, originalUrl: string, contactId?: number): Promise<void> {
    // Find the link record
    const linkRecord = await db.select().from(linkTracking).where(
      and(
        eq(linkTracking.campaignId, campaignId),
        eq(linkTracking.originalUrl, originalUrl)
      )
    ).limit(1);
    
    if (linkRecord.length === 0) {
      // Create a new link tracking record if it doesn't exist
      await this.createTrackingLink(campaignId, originalUrl);
      return;
    }
    
    // Always increment total click count
    await db.update(linkTracking)
      .set({
        clickCount: sql`${linkTracking.clickCount} + 1`
      })
      .where(eq(linkTracking.id, linkRecord[0].id));
    
    // If we have a contact ID, check if this is a unique click
    if (contactId) {
      // Check if this contact has clicked this link before
      const previousClicks = await db.select().from(clickEvents).where(
        and(
          eq(clickEvents.campaignId, campaignId),
          eq(clickEvents.url, originalUrl),
          eq(clickEvents.contactId, contactId)
        )
      ).limit(2);
      
      // If this is the first click from this contact, increment unique clicks
      if (previousClicks.length <= 1) {
        await db.update(linkTracking)
          .set({
            uniqueClickCount: sql`${linkTracking.uniqueClickCount} + 1`
          })
          .where(eq(linkTracking.id, linkRecord[0].id));
      }
    }
  },
  
  // Update or create engagement metrics
  async updateEngagementMetrics(campaignId: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get existing metrics for today
    const existingMetrics = await db.select().from(engagementMetrics).where(
      and(
        eq(engagementMetrics.campaignId, campaignId),
        sql`DATE(${engagementMetrics.date}) = DATE(${today})`
      )
    ).limit(1);
    
    // Count total opens and unique opens
    const totalOpensResult = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(openEvents).where(eq(openEvents.campaignId, campaignId));
    
    const uniqueOpensResult = await db.select({
      count: sql<number>`COUNT(DISTINCT ${openEvents.contactId})`
    }).from(openEvents).where(
      and(
        eq(openEvents.campaignId, campaignId),
        sql`${openEvents.contactId} IS NOT NULL`
      )
    );
    
    // Count total clicks and unique clicks
    const totalClicksResult = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(clickEvents).where(eq(clickEvents.campaignId, campaignId));
    
    const uniqueClicksResult = await db.select({
      count: sql<number>`COUNT(DISTINCT ${clickEvents.contactId})`
    }).from(clickEvents).where(
      and(
        eq(clickEvents.campaignId, campaignId),
        sql`${clickEvents.contactId} IS NOT NULL`
      )
    );
    
    // Find most clicked link
    const mostClickedLinkResult = await db.select({
      url: clickEvents.url,
      count: sql<number>`COUNT(*)`
    })
    .from(clickEvents)
    .where(eq(clickEvents.campaignId, campaignId))
    .groupBy(clickEvents.url)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(1);
    
    // Find most active hour
    const mostActiveHourResult = await db.select({
      hour: sql<number>`EXTRACT(HOUR FROM ${openEvents.timestamp})`,
      count: sql<number>`COUNT(*)`
    })
    .from(openEvents)
    .where(eq(openEvents.campaignId, campaignId))
    .groupBy(sql`EXTRACT(HOUR FROM ${openEvents.timestamp})`)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(1);
    
    // Find most active device
    const mostActiveDeviceResult = await db.select({
      device: openEvents.deviceType,
      count: sql<number>`COUNT(*)`
    })
    .from(openEvents)
    .where(
      and(
        eq(openEvents.campaignId, campaignId),
        sql`${openEvents.deviceType} IS NOT NULL`
      )
    )
    .groupBy(openEvents.deviceType)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(1);
    
    // Extract values from results
    const totalOpens = totalOpensResult[0]?.count || 0;
    const uniqueOpens = uniqueOpensResult[0]?.count || 0;
    const totalClicks = totalClicksResult[0]?.count || 0;
    const uniqueClicks = uniqueClicksResult[0]?.count || 0;
    const mostClickedLink = mostClickedLinkResult[0]?.url;
    const mostActiveHour = mostActiveHourResult[0]?.hour;
    const mostActiveDevice = mostActiveDeviceResult[0]?.device;
    
    // Calculate click-through rate (as an integer percentage * 100)
    const clickThroughRate = uniqueOpens > 0 
      ? Math.round((uniqueClicks / uniqueOpens) * 10000) 
      : 0;
    
    // Calculate engagement score (simplified algorithm, customize as needed)
    const engagementScore = Math.min(
      Math.round(
        (clickThroughRate / 100) * 40 +  // 40% weight to CTR
        (uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 40 : 0) +  // 40% weight to unique clicks/opens
        (totalClicks > 0 ? Math.min(totalClicks / 10, 20) : 0)  // 20% weight to total clicks (capped)
      ),
      100
    );
    
    // Prepare metrics data
    const metricsData = {
      campaignId,
      date: today,
      totalOpens,
      uniqueOpens,
      totalClicks,
      uniqueClicks,
      clickThroughRate,
      // Placeholder for actual engagement time calculation
      averageEngagementTime: 60, // Default to 60 seconds
      engagementScore,
      mostClickedLink,
      mostActiveHour,
      mostActiveDevice
    };
    
    // Update or insert engagement metrics
    if (existingMetrics.length > 0) {
      await db.update(engagementMetrics)
        .set(metricsData)
        .where(eq(engagementMetrics.id, existingMetrics[0].id));
    } else {
      await db.insert(engagementMetrics).values(metricsData);
    }
  },
  
  // Get engagement metrics for a campaign
  async getEngagementMetrics(campaignId: number, days: number = 30): Promise<EngagementMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.select()
      .from(engagementMetrics)
      .where(
        and(
          eq(engagementMetrics.campaignId, campaignId),
          sql`${engagementMetrics.date} >= ${startDate}`
        )
      )
      .orderBy(engagementMetrics.date);
  },
  
  // Get all click events for a campaign
  async getClickEvents(campaignId: number, limit: number = 100): Promise<ClickEvent[]> {
    return await db.select()
      .from(clickEvents)
      .where(eq(clickEvents.campaignId, campaignId))
      .orderBy(desc(clickEvents.timestamp))
      .limit(limit);
  },
  
  // Get all open events for a campaign
  async getOpenEvents(campaignId: number, limit: number = 100): Promise<OpenEvent[]> {
    return await db.select()
      .from(openEvents)
      .where(eq(openEvents.campaignId, campaignId))
      .orderBy(desc(openEvents.timestamp))
      .limit(limit);
  },
  
  // Get tracking links for a campaign
  async getTrackingLinks(campaignId: number): Promise<LinkTracking[]> {
    return await db.select()
      .from(linkTracking)
      .where(eq(linkTracking.campaignId, campaignId))
      .orderBy(desc(linkTracking.clickCount));
  }
};