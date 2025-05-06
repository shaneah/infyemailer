import { Router } from 'express';
import { storage } from '../dbStorage';

const router = Router();

// Endpoint to fetch email performance metrics
router.get('/metrics', async (req, res) => {
  try {
    // Sample metrics data following the structure of ClientEmailPerformanceV3
    const metricsData = {
      openRate: { 
        value: 24.8, 
        change: 3.2, 
        sparklineData: [18, 22, 19, 23, 25, 21, 24.8] 
      },
      clickRate: { 
        value: 3.6, 
        change: 0.9, 
        sparklineData: [2.5, 3.1, 2.8, 3.2, 3.5, 3.3, 3.6] 
      },
      conversionRate: { 
        value: 1.2, 
        change: 0.3, 
        sparklineData: [0.8, 1.0, 0.9, 1.1, 1.3, 1.1, 1.2] 
      },
      bounceRate: { 
        value: 0.8, 
        change: -0.4, 
        sparklineData: [1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.8] 
      },
      totalSent: { 
        value: 42857, 
        change: 2500, 
        sparklineData: [39000, 40000, 41500, 42000, 43000, 42500, 42857] 
      },
      totalOpens: { 
        value: 10628, 
        change: 1200, 
        sparklineData: [8500, 9000, 9500, 10000, 10400, 10500, 10628] 
      },
      totalClicks: { 
        value: 1543, 
        change: 320, 
        sparklineData: [1100, 1200, 1300, 1400, 1450, 1500, 1543] 
      },
      revenue: { 
        value: 32580, 
        change: 4250, 
        sparklineData: [25000, 27000, 28500, 30000, 31500, 32000, 32580] 
      }
    };

    res.json(metricsData);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch campaign performance data
router.get('/campaigns', async (req, res) => {
  try {
    // Sample campaign data
    const campaignsData = {
      campaigns: [
        { name: 'Monthly Newsletter', opens: 28.5, clicks: 4.8, conversions: 1.2, total: 12500 },
        { name: 'Product Launch', opens: 32.7, clicks: 7.2, conversions: 2.1, total: 8750 },
        { name: 'Holiday Special', opens: 25.3, clicks: 5.1, conversions: 1.4, total: 10200 },
        { name: 'Customer Feedback', opens: 22.8, clicks: 3.6, conversions: 0.8, total: 5800 }
      ]
    };

    res.json(campaignsData);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch charts data (device breakdown, timeline, etc.)
router.get('/charts', async (req, res) => {
  try {
    // Sample charts data
    const chartsData = {
      deviceBreakdown: [
        { name: 'Desktop', value: 45 },
        { name: 'Mobile', value: 40 },
        { name: 'Tablet', value: 15 }
      ],
      weeklyPerformance: [
        { date: 'Apr 1', emails: 3500, opens: 875, clicks: 168, conversions: 42 },
        { date: 'Apr 8', emails: 4200, opens: 1092, clicks: 210, conversions: 55 },
        { date: 'Apr 15', emails: 3800, opens: 988, clicks: 190, conversions: 49 },
        { date: 'Apr 22', emails: 4500, opens: 1215, clicks: 234, conversions: 63 },
        { date: 'Apr 29', emails: 5100, opens: 1428, clicks: 275, conversions: 77 },
        { date: 'May 6', emails: 4800, opens: 1344, clicks: 259, conversions: 72 }
      ],
      clickDistribution: [
        { link: 'Primary CTA', clicks: 350 },
        { link: 'Secondary Link', clicks: 210 },
        { link: 'Learn More', clicks: 180 },
        { link: 'Help Link', clicks: 90 },
        { link: 'Footer', clicks: 75 }
      ],
      emailClientDistribution: [
        { name: 'Gmail', value: 45 },
        { name: 'Outlook', value: 28 },
        { name: 'Apple Mail', value: 15 },
        { name: 'Yahoo', value: 8 },
        { name: 'Other', value: 4 }
      ]
    };

    res.json(chartsData);
  } catch (error) {
    console.error('Error fetching charts data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch real-time activity data
router.get('/realtime', async (req, res) => {
  try {
    // Sample real-time activity data
    const realtimeData = [
      { time: '2 mins ago', type: 'open', email: 'john.doe@example.com', user: 'John Doe' },
      { time: '5 mins ago', type: 'click', email: 'jane.smith@example.com', user: 'Jane Smith' },
      { time: '8 mins ago', type: 'open', email: 'mark.wilson@example.com', user: 'Mark Wilson' },
      { time: '12 mins ago', type: 'conversion', email: 'alice.brown@example.com', user: 'Alice Brown' },
      { time: '23 mins ago', type: 'open', email: 'robert.jones@example.com', user: 'Robert Jones' },
      { time: '25 mins ago', type: 'click', email: 'sarah.miller@example.com', user: 'Sarah Miller' },
      { time: '30 mins ago', type: 'open', email: 'david.clark@example.com', user: 'David Clark' },
      { time: '35 mins ago', type: 'open', email: 'lisa.anderson@example.com', user: 'Lisa Anderson' },
      { time: '42 mins ago', type: 'click', email: 'michael.white@example.com', user: 'Michael White' },
      { time: '45 mins ago', type: 'conversion', email: 'emma.taylor@example.com', user: 'Emma Taylor' }
    ];

    res.json(realtimeData);
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;