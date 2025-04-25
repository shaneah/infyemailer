import { Router } from 'express';
import { randomInt } from 'crypto';
import { isAuthenticated } from '../helpers/auth-helpers';

// Initialize router
const router = Router();

/**
 * Get performance metrics
 * Returns key email performance metrics with comparison to previous period
 */
router.get('/api/email-performance/metrics', isAuthenticated, (req, res) => {
  // In a real implementation, this would pull from the database
  // For now, we'll generate realistic data
  const metrics = {
    openRate: { 
      value: 24.8, 
      change: 2.5 
    },
    clickRate: { 
      value: 3.6, 
      change: 1.2 
    },
    bounceRate: { 
      value: 1.2, 
      change: -0.3 
    },
    unsubscribeRate: { 
      value: 0.2, 
      change: -0.1 
    },
    deliverability: { 
      value: 98.8, 
      change: 0.5 
    }
  };
  
  res.json(metrics);
});

/**
 * Get time series data for charts
 * Returns data for weekly performance and monthly trends charts
 */
router.get('/api/email-performance/charts', isAuthenticated, (req, res) => {
  // Generate weekly performance data
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const weeklyPerformance = days.map(day => ({
    day,
    opens: randomInt(100, 500),
    clicks: randomInt(20, 150),
    unsubscribes: randomInt(0, 10)
  }));
  
  // Generate monthly trends data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const monthlyTrends = months.map(month => ({
    month,
    campaigns: randomInt(2, 10),
    opens: randomInt(500, 5000),
    engagementScore: randomInt(60, 95)
  }));
  
  res.json({
    weeklyPerformance,
    monthlyTrends
  });
});

/**
 * Get realtime events
 * Returns recent subscriber activity
 */
router.get('/api/email-performance/realtime', isAuthenticated, (req, res) => {
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
router.get('/api/email-performance/top-performers', isAuthenticated, (req, res) => {
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
router.get('/api/audience/overview', isAuthenticated, (req, res) => {
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
router.get('/api/campaigns/metrics', isAuthenticated, (req, res) => {
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