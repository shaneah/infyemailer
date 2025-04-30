import { Router } from 'express';
import { randomInt } from 'crypto';
import { isClientAuthenticated, authorize } from '../helpers/auth-helpers';

// Initialize router
const router = Router();

/**
 * Get performance metrics
 * Returns key email performance metrics with comparison to previous period
 */
router.get('/api/email-performance/metrics', isClientAuthenticated, (req, res) => {
  // Extract query parameters
  const timeframe = req.query.timeframe as string || '7days';
  const campaignId = req.query.campaign as string || 'all';
  
  console.log(`Processing metrics request with timeframe=${timeframe}, campaign=${campaignId}`);
  
  // Generate different data based on timeframe and campaign
  let openRateValue = 24.8;
  let clickRateValue = 3.6;
  let bounceRateValue = 1.2;
  let conversionRateValue = 1.2;
  
  // Apply timeframe-based variations
  if (timeframe === 'today') {
    openRateValue = 22.5;
    clickRateValue = 3.1;
    bounceRateValue = 1.1;
    conversionRateValue = 0.9;
  } else if (timeframe === 'yesterday') {
    openRateValue = 23.4;
    clickRateValue = 3.3;
    bounceRateValue = 1.0;
    conversionRateValue = 1.0;
  } else if (timeframe === '30days') {
    openRateValue = 25.7;
    clickRateValue = 3.9;
    bounceRateValue = 0.9;
    conversionRateValue = 1.4;
  } else if (timeframe === '90days') {
    openRateValue = 26.1;
    clickRateValue = 4.1;
    bounceRateValue = 0.8;
    conversionRateValue = 1.5;
  }
  
  // Apply campaign-based variations if a specific campaign is selected
  if (campaignId !== 'all') {
    const campaignIdNum = parseInt(campaignId);
    // Simple algorithm to generate predictable but different values for each campaign
    const modifier = (campaignIdNum % 5) * 0.5;
    openRateValue = Math.min(35, openRateValue + modifier);
    clickRateValue = Math.min(7, clickRateValue + (modifier / 2));
    bounceRateValue = Math.max(0.5, bounceRateValue - (modifier / 10));
    conversionRateValue = Math.min(3, conversionRateValue + (modifier / 4));
  }
  
  // Calculate total sends, opens, and clicks based on the values above
  const totalSent = Math.floor(10000 + (parseInt(campaignId) !== NaN ? parseInt(campaignId) * 1000 : 0));
  const totalOpens = Math.floor(totalSent * (openRateValue / 100));
  const totalClicks = Math.floor(totalSent * (clickRateValue / 100));
  const unsubscribes = Math.floor(totalSent * 0.0009);
  
  // In a real implementation, this would pull from the database
  // For now, we'll generate data that responds to the filters
  const metrics = {
    openRate: { 
      value: openRateValue, 
      industryAvg: 21.5,
      trend: openRateValue > 21.5 ? 'up' : 'down',
      trendValue: Math.abs(openRateValue - 21.5).toFixed(1) + '%'
    },
    clickRate: { 
      value: clickRateValue, 
      industryAvg: 2.7,
      trend: clickRateValue > 2.7 ? 'up' : 'down',
      trendValue: Math.abs(clickRateValue - 2.7).toFixed(1) + '%'
    },
    conversionRate: {
      value: conversionRateValue,
      goal: 1.5,
      trend: conversionRateValue >= 1.5 ? 'up' : 'down',
      trendValue: Math.abs(conversionRateValue - 1.5).toFixed(1) + '%'
    },
    bounceRate: { 
      value: bounceRateValue, 
      industryAvg: 1.2,
      trend: bounceRateValue < 1.2 ? 'up' : 'down',
      trendValue: Math.abs(bounceRateValue - 1.2).toFixed(1) + '%'
    },
    totalSent,
    totalOpens,
    totalClicks,
    unsubscribes
  };
  
  res.json(metrics);
});

/**
 * Get time series data for charts
 * Returns data for weekly performance and monthly trends charts
 */
router.get('/api/email-performance/charts', isClientAuthenticated, (req, res) => {
  // Extract query parameters
  const timeframe = req.query.timeframe as string || '7days';
  const campaignId = req.query.campaign as string || 'all';
  
  console.log(`Processing charts request with timeframe=${timeframe}, campaign=${campaignId}`);
  
  // Define base data structure
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [...Array(24).keys()].map(h => h.toString().padStart(2, '0'));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const countries = ['US', 'UK', 'UAE', 'Germany', 'Australia', 'Japan', 'Canada', 'Others'];
  const emailClients = ['Gmail', 'Apple Mail', 'Outlook', 'Yahoo', 'Other'];
  const deviceTypes = ['Desktop', 'Mobile', 'Tablet'];
  
  // Seed for somewhat stable yet varying random values
  const campaignSeed = parseInt(campaignId) || 0;
  let timeframeSeed = 1; // Default for 7days
  
  // Set timeframe seed for consistent random values
  if (timeframe === 'today') timeframeSeed = 2;
  else if (timeframe === 'yesterday') timeframeSeed = 3;
  else if (timeframe === '30days') timeframeSeed = 4;
  else if (timeframe === '90days') timeframeSeed = 5;
  
  // Time series data variations based on timeframe
  const weekly = days.map((day, index) => {
    // Generate stable random data that differs by timeframe and campaign
    const baseSeed = (index + 1) * timeframeSeed * (campaignSeed > 0 ? campaignSeed : 1);
    const variance = Math.sin(baseSeed) * 0.5 + 0.5; // Value between 0 and 1
    
    return {
      day,
      opens: Math.floor(100 + variance * 400),
      clicks: Math.floor(20 + variance * 130),
      conversions: Math.floor(5 + variance * 25)
    };
  });
  
  // Device breakdown varies slightly by campaign and timeframe
  const deviceBreakdown = [
    { name: 'Desktop', value: Math.floor(30 + ((campaignSeed + timeframeSeed) % 5) * 5) },
    { name: 'Mobile', value: Math.floor(40 + ((campaignSeed * timeframeSeed) % 3) * 5) }
  ];
  // Calculate tablet to make sure the sum is 100%
  const tabletValue = 100 - deviceBreakdown[0].value - deviceBreakdown[1].value;
  deviceBreakdown.push({ name: 'Tablet', value: tabletValue });
  
  // Email client distribution
  const clientDistribution = emailClients.map((client, index) => {
    const baseFactor = (index + 1) * (campaignSeed || 1) * timeframeSeed;
    let value = 0;
    
    if (client === 'Gmail') value = 35 + (baseFactor % 10);
    else if (client === 'Apple Mail') value = 25 + (baseFactor % 8);
    else if (client === 'Outlook') value = 20 + (baseFactor % 6);
    else if (client === 'Yahoo') value = 10 + (baseFactor % 4);
    else value = 10 - ((baseFactor % 8) / 2); // Other - ensure it's reasonably small
    
    return { name: client, value };
  });
  
  // Subject line performance - different by timeframe
  const subjectLinePerformance = [
    { type: 'Question', rate: 26 + (timeframeSeed % 4) },
    { type: 'Announcement', rate: 24 + (timeframeSeed % 5) },
    { type: 'How-to', rate: 22 + ((timeframeSeed + 1) % 3) },
    { type: 'Offer', rate: 28 + ((timeframeSeed + 2) % 4) },
    { type: 'Urgent', rate: 30 + (timeframeSeed % 6) }
  ];
  
  // Campaign comparison - different by timeframe
  const campaignComparison = [
    { name: 'Newsletter', open: 24 + (timeframeSeed % 5), click: 3.2 + (timeframeSeed % 2), conversion: 0.8 + (timeframeSeed % 1) },
    { name: 'Promotion', open: 28 + ((timeframeSeed + 1) % 6), click: 4.1 + ((timeframeSeed + 1) % 2), conversion: 1.2 + ((timeframeSeed + 1) % 1) },
    { name: 'Announcement', open: 26 + ((timeframeSeed + 2) % 4), click: 3.6 + ((timeframeSeed + 2) % 2), conversion: 0.9 + ((timeframeSeed + 2) % 1) },
    { name: 'Onboarding', open: 32 + ((timeframeSeed + 3) % 7), click: 5.2 + ((timeframeSeed + 3) % 3), conversion: 1.5 + ((timeframeSeed + 3) % 1) }
  ];
  
  // Engagement over time
  const oneWeekData = days.map((day, i) => {
    const base = (i + 1) * (timeframeSeed + campaignSeed);
    return {
      date: day,
      open: 20 + (base % 15),
      click: 3 + (base % 4),
      conversion: 0.8 + ((base % 10) / 10)
    };
  });
  
  const engagementByTimeOfDay = hours.map(hour => {
    const hourNum = parseInt(hour);
    let factor = 1;
    
    // Apply a normal distribution for the time of day (peak at 9-10 AM and 7-8 PM)
    if (hourNum >= 8 && hourNum <= 11) factor = 3; // Morning peak
    else if (hourNum >= 18 && hourNum <= 21) factor = 2.5; // Evening peak
    else if (hourNum >= 0 && hourNum <= 5) factor = 0.5; // Low at night
    
    return {
      hour: `${hour}:00`,
      opens: Math.floor(20 * factor + ((hourNum * timeframeSeed) % 40)) // Base value * factor + some variance
    };
  });
  
  // Geographic distribution
  const geoDistribution = countries.map((country, index) => {
    const baseValue = 5 + (index * 5);
    return {
      country,
      opens: baseValue + ((index + timeframeSeed + campaignSeed) % 15) * 2
    };
  });
  
  // Build the response object
  const response = {
    weeklyPerformance: weekly,
    deviceBreakdown,
    emailClientDistribution: clientDistribution,
    campaignComparison,
    subjectLinePerformance,
    engagementOverTime: oneWeekData,
    engagementByTimeOfDay,
    geographicalDistribution: geoDistribution,
    // Additional data that would be included
    clickDistribution: [
      { link: 'Main CTA', clicks: 42 + (timeframeSeed % 10) },
      { link: 'Product Link', clicks: 28 + (timeframeSeed % 8) },
      { link: 'Learn More', clicks: 18 + (timeframeSeed % 6) },
      { link: 'Unsubscribe', clicks: 4 + (timeframeSeed % 2) }
    ],
    deviceOverTime: months.map((month, i) => ({
      month,
      desktop: 40 + ((i + timeframeSeed) % 10),
      mobile: 45 + ((i + timeframeSeed + 1) % 12),
      tablet: 15 + ((i + timeframeSeed + 2) % 8)
    })),
    sendTimeEffectiveness: days.map(day => ({
      day,
      morning: 28 + ((days.indexOf(day) + timeframeSeed) % 8),
      afternoon: 24 + ((days.indexOf(day) + timeframeSeed + 1) % 7),
      evening: 30 + ((days.indexOf(day) + timeframeSeed + 2) % 9)
    })),
    subscriberEngagementSegments: [
      { segment: 'Highly Engaged', value: 15 + (timeframeSeed % 5), count: 1200 + (timeframeSeed * 100) },
      { segment: 'Active', value: 35 + (timeframeSeed % 7), count: 3200 + (timeframeSeed * 200) },
      { segment: 'Occasional', value: 30 + (timeframeSeed % 6), count: 2800 + (timeframeSeed * 150) },
      { segment: 'At Risk', value: 12 + (timeframeSeed % 4), count: 950 + (timeframeSeed * 50) },
      { segment: 'Inactive', value: 8 + (timeframeSeed % 3), count: 650 + (timeframeSeed * 40) }
    ]
  };
  
  res.json(response);
});

/**
 * Get realtime events
 * Returns recent subscriber activity
 */
router.get('/api/email-performance/realtime', isClientAuthenticated, (req, res) => {
  const eventTypes = ['open', 'click', 'unsubscribe'];
  const times = ['2 mins ago', '5 mins ago', '12 mins ago', '18 mins ago', '23 mins ago', '37 mins ago'];
  const campaigns = ['Monthly Newsletter', 'Product Launch', 'Spring Promotion', 'Customer Survey'];
  const locations = ['New York, US', 'London, UK', 'San Francisco, US', 'Tokyo, JP', 'Sydney, AU'];
  const devices = ['iPhone', 'Android', 'Mac', 'Windows', 'iPad'];
  const emails = [
    'j****@example.com',
    't****@company.co',
    'm****@client.org',
    's****@domain.net',
    'c****@business.com'
  ];
  
  // Generate 5-10 events
  const count = randomInt(5, 10);
  const events = [];
  
  for (let i = 0; i < count; i++) {
    const type = eventTypes[randomInt(0, eventTypes.length)];
    
    const event = {
      time: times[randomInt(0, times.length)],
      type,
      campaign: campaigns[randomInt(0, campaigns.length)],
      email: emails[randomInt(0, emails.length)],
      location: locations[randomInt(0, locations.length)],
      device: devices[randomInt(0, devices.length)]
    };
    
    events.push(event);
  }
  
  res.json(events);
});

/**
 * Get top performers
 * Returns best performing subject lines, campaigns, and templates
 */
router.get('/api/email-performance/top-performers', isClientAuthenticated, (req, res) => {
  // Top subject lines
  const subjectLines = [
    { type: 'subject', name: 'Last Chance: 24 Hour Flash Sale', rate: 28.7, total: 872 },
    { type: 'subject', name: 'Your Exclusive April Deals Inside', rate: 26.5, total: 803 },
    { type: 'subject', name: 'Important: Updates to Your Account', rate: 25.9, total: 754 },
    { type: 'subject', name: '[Name], We Miss You! Come Back with 20% Off', rate: 23.8, total: 687 },
    { type: 'subject', name: 'New Collection Just Dropped: See It First', rate: 22.4, total: 642 }
  ];
  
  // Top campaigns
  const campaigns = [
    { type: 'campaign', name: 'Spring Collection Launch', rate: 32.5, total: 1284 },
    { type: 'campaign', name: 'Annual Customer Appreciation', rate: 29.8, total: 1105 },
    { type: 'campaign', name: 'VIP Early Access', rate: 27.9, total: 957 },
    { type: 'campaign', name: 'Loyalty Program Update', rate: 26.3, total: 846 },
    { type: 'campaign', name: 'Monthly Newsletter - March', rate: 24.7, total: 782 }
  ];
  
  // Top templates
  const templates = [
    { type: 'template', name: 'Minimalist Announcement', rate: 4.2, total: 386 },
    { type: 'template', name: 'Product Showcase', rate: 3.8, total: 322 },
    { type: 'template', name: 'Special Offer', rate: 3.5, total: 276 },
    { type: 'template', name: 'Newsletter Standard', rate: 3.2, total: 241 },
    { type: 'template', name: 'Event Invitation', rate: 2.9, total: 198 }
  ];
  
  res.json({
    subjects: subjectLines,
    campaigns,
    templates
  });
});

/**
 * Get audience overview
 * Returns subscriber statistics and demographics
 */
router.get('/api/audience/overview', isClientAuthenticated, (req, res) => {
  const total = 12450;
  const active = Math.floor(total * 0.82); // 82% active
  const newSubscribers = Math.floor(total * 0.05); // 5% new this month
  
  // Demographics
  const demographics = {
    age: [
      { label: '18-24', value: 12 },
      { label: '25-34', value: 35 },
      { label: '35-44', value: 28 },
      { label: '45-54', value: 15 },
      { label: '55+', value: 10 }
    ],
    gender: [
      { label: 'Female', value: 61 },
      { label: 'Male', value: 38 },
      { label: 'Other', value: 1 }
    ],
    location: [
      { label: 'United States', value: 68 },
      { label: 'Europe', value: 18 },
      { label: 'Asia', value: 8 },
      { label: 'Other', value: 6 }
    ]
  };
  
  // Engagement patterns
  const engagement = {
    frequency: [
      { label: 'Daily', value: 8 },
      { label: 'Weekly', value: 42 },
      { label: 'Monthly', value: 35 },
      { label: 'Rarely', value: 15 }
    ],
    timeOfDay: [
      { label: 'Morning', value: 31 },
      { label: 'Afternoon', value: 27 },
      { label: 'Evening', value: 35 },
      { label: 'Night', value: 7 }
    ]
  };
  
  res.json({
    total,
    active,
    new: newSubscribers,
    demographics,
    engagement
  });
});

/**
 * Get campaign metrics
 * Returns detailed performance data for all campaigns
 */
router.get('/api/campaigns/metrics', isClientAuthenticated, (req, res) => {
  const campaigns = [
    {
      id: 1,
      name: "Monthly Newsletter",
      sentDate: "2025-03-15",
      recipients: 2430,
      opens: 603,
      openRate: 24.8,
      clicks: 87,
      clickRate: 3.6,
      bounces: 29,
      unsubscribes: 8
    },
    {
      id: 2,
      name: "Spring Collection Launch",
      sentDate: "2025-04-02",
      recipients: 3250,
      opens: 984,
      openRate: 30.3,
      clicks: 157,
      clickRate: 4.8,
      bounces: 36,
      unsubscribes: 12
    },
    {
      id: 3,
      name: "Special Offer - Limited Time",
      sentDate: "2025-03-28",
      recipients: 2850,
      opens: 742,
      openRate: 26.0,
      clicks: 129,
      clickRate: 4.5,
      bounces: 31,
      unsubscribes: 7
    },
    {
      id: 4,
      name: "Customer Feedback Survey",
      sentDate: "2025-02-10",
      recipients: 1850,
      opens: 416,
      openRate: 22.5,
      clicks: 78,
      clickRate: 4.2,
      bounces: 33,
      unsubscribes: 6
    },
    {
      id: 5,
      name: "Product Update Announcement",
      sentDate: "2025-03-05",
      recipients: 2120,
      opens: 487,
      openRate: 23.0,
      clicks: 65,
      clickRate: 3.1,
      bounces: 27,
      unsubscribes: 5
    },
    {
      id: 6,
      name: "Exclusive Member Benefits",
      sentDate: "2025-04-12",
      recipients: 1580,
      opens: 458,
      openRate: 29.0,
      clicks: 92,
      clickRate: 5.8,
      bounces: 18,
      unsubscribes: 4
    }
  ];
  
  res.json(campaigns);
});

export default router;