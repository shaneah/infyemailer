import { 
  Contact, InsertContact, 
  List, InsertList, 
  ContactList, InsertContactList,
  Campaign, InsertCampaign,
  Email, InsertEmail,
  Template, InsertTemplate,
  Analytics, InsertAnalytics,
  CampaignVariant, InsertCampaignVariant,
  VariantAnalytics, InsertVariantAnalytics,
  Domain, InsertDomain,
  CampaignDomain, InsertCampaignDomain,
  Client, InsertClient,
  ClientUser, InsertClientUser,
  User, InsertUser,
  ClickEvent, InsertClickEvent,
  OpenEvent, InsertOpenEvent,
  EngagementMetrics, InsertEngagementMetrics,
  LinkTracking, InsertLinkTracking
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User methods (admin)
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  verifyUserLogin(usernameOrEmail: string, password: string): Promise<User | undefined>;

  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  getClientCampaigns(clientId: number): Promise<Campaign[]>;

  // Contact methods
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  getContactByEmail(email: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // List methods
  getLists(): Promise<List[]>;
  getList(id: number): Promise<List | undefined>;
  createList(list: InsertList): Promise<List>;
  updateList(id: number, list: Partial<List>): Promise<List | undefined>;
  deleteList(id: number): Promise<boolean>;

  // Contact-List methods
  getContactLists(): Promise<ContactList[]>;
  addContactToList(contactList: InsertContactList): Promise<ContactList>;
  removeContactFromList(contactId: number, listId: number): Promise<boolean>;
  getContactsByList(listId: number): Promise<Contact[]>;
  getListsByContact(contactId: number): Promise<List[]>;

  // Campaign methods
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Email methods
  getEmails(): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, email: Partial<Email>): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;

  // Template methods
  getTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Analytics methods
  getAnalytics(): Promise<Analytics[]>;
  getAnalyticsByCampaign(campaignId: number): Promise<Analytics[]>;
  recordAnalytic(analytic: InsertAnalytics): Promise<Analytics>;
  
  // Campaign Variant methods for A/B Testing
  getCampaignVariants(campaignId: number): Promise<CampaignVariant[]>;
  getCampaignVariant(id: number): Promise<CampaignVariant | undefined>;
  createCampaignVariant(variant: InsertCampaignVariant): Promise<CampaignVariant>;
  updateCampaignVariant(id: number, variant: Partial<CampaignVariant>): Promise<CampaignVariant | undefined>;
  deleteCampaignVariant(id: number): Promise<boolean>;
  
  // Variant Analytics methods for A/B Testing
  getVariantAnalytics(variantId: number): Promise<VariantAnalytics[]>;
  getVariantAnalyticsByCampaign(campaignId: number): Promise<VariantAnalytics[]>;
  recordVariantAnalytic(analytic: InsertVariantAnalytics): Promise<VariantAnalytics>;
  
  // A/B Test specific methods
  setWinningVariant(campaignId: number, variantId: number): Promise<Campaign | undefined>;
  getAbTestCampaigns(): Promise<Campaign[]>;
  
  // Domain methods
  getDomains(): Promise<Domain[]>;
  getDomain(id: number): Promise<Domain | undefined>;
  getDomainByName(name: string): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: number, domain: Partial<Domain>): Promise<Domain | undefined>;
  deleteDomain(id: number): Promise<boolean>;
  setDefaultDomain(id: number): Promise<Domain | undefined>;
  
  // Campaign-Domain methods
  assignDomainToCampaign(campaignDomain: InsertCampaignDomain): Promise<CampaignDomain>;
  removeDomainFromCampaign(campaignId: number, domainId: number): Promise<boolean>;
  getCampaignDomains(campaignId: number): Promise<Domain[]>;
  getDomainCampaigns(domainId: number): Promise<Campaign[]>;
  
  // Client User methods
  getClientUsers(): Promise<ClientUser[]>;
  getClientUser(id: number): Promise<ClientUser | undefined>;
  getClientUserByUsername(username: string): Promise<ClientUser | undefined>;
  getClientUsersByClientId(clientId: number): Promise<ClientUser[]>;
  createClientUser(clientUser: InsertClientUser): Promise<ClientUser>;
  updateClientUser(id: number, clientUser: Partial<ClientUser>): Promise<ClientUser | undefined>;
  deleteClientUser(id: number): Promise<boolean>;
  verifyClientLogin(username: string, password: string): Promise<ClientUser | undefined>;
  
  // Click Event methods
  getClickEvents(campaignId: number, limit?: number): Promise<ClickEvent[]>;
  createClickEvent(clickEvent: InsertClickEvent): Promise<ClickEvent>;
  
  // Open Event methods
  getOpenEvents(campaignId: number, limit?: number): Promise<OpenEvent[]>;
  createOpenEvent(openEvent: InsertOpenEvent): Promise<OpenEvent>;
  
  // Engagement Metrics methods
  getEngagementMetrics(campaignId: number, days?: number): Promise<EngagementMetrics[]>;
  createEngagementMetric(metric: InsertEngagementMetrics): Promise<EngagementMetrics>;
  updateEngagementMetric(id: number, metric: Partial<EngagementMetrics>): Promise<EngagementMetrics | undefined>;
  
  // Link Tracking methods
  getTrackingLinks(campaignId: number): Promise<LinkTracking[]>;
  getTrackingLink(id: number): Promise<LinkTracking | undefined>;
  getTrackingLinkByUrl(campaignId: number, originalUrl: string): Promise<LinkTracking | undefined>;
  createTrackingLink(link: InsertLinkTracking): Promise<LinkTracking>;
  updateTrackingLink(id: number, link: Partial<LinkTracking>): Promise<LinkTracking | undefined>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private contacts: Map<number, Contact>;
  private lists: Map<number, List>;
  private contactLists: Map<number, ContactList>;
  private campaigns: Map<number, Campaign>;
  private emails: Map<number, Email>;
  private templates: Map<number, Template>;
  private analytics: Map<number, Analytics>;
  private clients: Map<number, Client>;
  private domains: Map<number, Domain>;
  private campaignDomains: Map<number, CampaignDomain>;
  private campaignVariants: Map<number, CampaignVariant>;
  private variantAnalytics: Map<number, VariantAnalytics>;
  private clientUsers: Map<number, ClientUser>;
  private users: Map<number, User>;
  private clickEvents: Map<number, ClickEvent>;
  private openEvents: Map<number, OpenEvent>;
  private engagementMetrics: Map<number, EngagementMetrics>;
  private linkTrackings: Map<number, LinkTracking>;

  private contactId: number;
  private listId: number;
  private contactListId: number;
  private campaignId: number;
  private emailId: number;
  private templateId: number;
  private analyticId: number;
  private clientId: number;
  private domainId: number;
  private campaignDomainId: number;
  private campaignVariantId: number;
  private variantAnalyticId: number;
  private clientUserId: number;
  private userId: number;
  private clickEventId: number;
  private openEventId: number;
  private engagementMetricId: number;
  private linkTrackingId: number;

  constructor() {
    this.contacts = new Map();
    this.lists = new Map();
    this.contactLists = new Map();
    this.campaigns = new Map();
    this.emails = new Map();
    this.templates = new Map();
    this.analytics = new Map();
    this.clients = new Map();
    this.domains = new Map();
    this.campaignDomains = new Map();
    this.campaignVariants = new Map();
    this.variantAnalytics = new Map();
    this.clientUsers = new Map();
    this.users = new Map();
    this.clickEvents = new Map();
    this.openEvents = new Map();
    this.engagementMetrics = new Map();
    this.linkTrackings = new Map();

    this.contactId = 1;
    this.listId = 1;
    this.contactListId = 1;
    this.campaignId = 1;
    this.emailId = 1;
    this.templateId = 1;
    this.analyticId = 1;
    this.clientId = 1;
    this.domainId = 1;
    this.campaignDomainId = 1;
    this.campaignVariantId = 1;
    this.variantAnalyticId = 1;
    this.clientUserId = 1;
    this.userId = 1;
    this.clickEventId = 1;
    this.openEventId = 1;
    this.engagementMetricId = 1;
    this.linkTrackingId = 1;

    // Initialize with some default data
    this.initializeData();
  }

  private initializeData() {
    // Create default admin user
    if (this.users.size === 0) {
      this.users.set(1, {
        id: 1,
        username: "aadimughal",
        email: "aadimughal@infymailer.com",
        password: "Aadi@786", // In a real app, this would be hashed
        firstName: "Aadi",
        lastName: "Mughal",
        role: "admin",
        status: "active",
        lastLoginAt: null,
        createdAt: new Date("2024-01-01"),
        avatarUrl: null,
        metadata: {
          permissions: ["all"],
          theme: "light"
        }
      });
      
      // Add a new admin user for testing
      this.users.set(2, {
        id: 2,
        username: "admin",
        email: "admin@infymailer.com",
        password: "admin123", // In a real app, this would be hashed
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        status: "active",
        lastLoginAt: null,
        createdAt: new Date("2024-01-01"),
        avatarUrl: null,
        metadata: {
          permissions: ["all"],
          theme: "light"
        }
      });
      this.userId = 2;
    }
    
    // Add default templates
    this.createTemplate({
      name: "Newsletter",
      description: "Standard newsletter layout",
      content: "<h1>Newsletter Template</h1><p>This is a sample newsletter template.</p>",
      category: "newsletter",
      metadata: { icon: "file-earmark-text", iconColor: "primary" }
    });
    
    // Add sample domains
    if (this.domains.size === 0) {
      this.domains.set(1, {
        id: 1,
        name: "marketing.infymailer.com",
        status: "active",
        verified: true,
        defaultDomain: true,
        createdAt: new Date("2024-02-15"),
        lastUsedAt: new Date("2024-03-28"),
        metadata: {
          type: "system",
          dkimVerified: true,
          spfVerified: true
        }
      });
      
      this.domains.set(2, {
        id: 2,
        name: "newsletter.infymailer.com",
        status: "active",
        verified: true,
        defaultDomain: false,
        createdAt: new Date("2024-01-20"),
        lastUsedAt: new Date("2024-03-25"),
        metadata: {
          type: "system",
          dkimVerified: true,
          spfVerified: true
        }
      });
      
      this.domains.set(3, {
        id: 3,
        name: "promo.infymailer.com",
        status: "pending",
        verified: false,
        defaultDomain: false,
        createdAt: new Date("2024-03-15"),
        lastUsedAt: null,
        metadata: {
          type: "system",
          dkimVerified: false,
          spfVerified: false
        }
      });
      
      // Update domain counter
      this.domainId = 4;
    }

    this.createTemplate({
      name: "Promotional",
      description: "For sales and offers",
      content: "<h1>Promotional Template</h1><p>This is a sample promotional template.</p>",
      category: "promotional",
      metadata: { icon: "megaphone", iconColor: "danger", selected: true }
    });

    this.createTemplate({
      name: "Welcome",
      description: "For new subscribers",
      content: "<h1>Welcome Template</h1><p>This is a sample welcome template.</p>",
      category: "transactional",
      metadata: { icon: "envelope-check", iconColor: "success" }
    });

    // Add default lists
    this.createList({
      name: "Newsletter Subscribers",
      description: "People who subscribed to the newsletter"
    });

    this.createList({
      name: "Product Updates",
      description: "People interested in product updates"
    });

    this.createList({
      name: "New Customers",
      description: "Recently acquired customers"
    });

    this.createList({
      name: "VIP Members",
      description: "Premium customers"
    });

    // Add default campaigns
    this.createCampaign({
      name: "Monthly Newsletter",
      subject: "May Newsletter",
      previewText: "Check out our latest updates",
      senderName: "Your Company",
      replyToEmail: "info@example.com",
      content: "<h1>Monthly Newsletter</h1><p>Here are our latest updates...</p>",
      status: "sent",
      scheduledAt: new Date("2023-05-15T09:00:00"),
      metadata: {
        icon: { name: "envelope-fill", color: "primary" },
        subtitle: "May 2023",
        recipients: 12483,
        openRate: 46.2,
        clickRate: 21.8,
        date: "May 15, 2023"
      }
    });

    this.createCampaign({
      name: "Product Launch",
      subject: "Introducing ProMax X1",
      previewText: "Our newest product has arrived",
      senderName: "Your Company",
      replyToEmail: "info@example.com",
      content: "<h1>Product Launch</h1><p>Meet our newest product...</p>",
      status: "sent",
      scheduledAt: new Date("2023-05-08T09:00:00"),
      metadata: {
        icon: { name: "megaphone-fill", color: "danger" },
        subtitle: "ProMax X1",
        recipients: 24192,
        openRate: 58.7,
        clickRate: 32.4,
        date: "May 8, 2023"
      }
    });

    this.createCampaign({
      name: "Spring Sale",
      subject: "25% Off Everything",
      previewText: "Limited time spring sale",
      senderName: "Your Company",
      replyToEmail: "info@example.com",
      content: "<h1>Spring Sale</h1><p>Don't miss our biggest sale...</p>",
      status: "scheduled",
      scheduledAt: new Date("2023-05-20T09:00:00"),
      metadata: {
        icon: { name: "tag-fill", color: "warning" },
        subtitle: "25% Discount",
        recipients: 18743,
        openRate: 0,
        clickRate: 0,
        date: "May 20, 2023"
      }
    });

    this.createCampaign({
      name: "Welcome Series",
      subject: "Welcome to Our Family",
      previewText: "Get started with our products",
      senderName: "Your Company",
      replyToEmail: "info@example.com",
      content: "<h1>Welcome Series</h1><p>Thanks for joining us...</p>",
      status: "active",
      scheduledAt: null,
      metadata: {
        icon: { name: "envelope-fill", color: "info" },
        subtitle: "Automation",
        recipients: 3891,
        openRate: 52.1,
        clickRate: 27.5,
        date: "Ongoing"
      }
    });
    // Add sample clients
    this.createClient({
      name: "John Doe",
      email: "john@techcompany.com",
      company: "Tech Company Inc.",
      status: "active",
      industry: "Technology",
      totalSpend: 15000,
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff",
      metadata: { 
        notes: "Enterprise client",
        tags: ["tech", "enterprise"],
        contactPreference: "email"
      }
    });
    
    this.createClient({
      name: "Jane Smith",
      email: "jane@fashionbrand.com",
      company: "Fashion Brand LLC",
      status: "active",
      industry: "Fashion",
      totalSpend: 8500,
      avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=8A2BE2&color=fff",
      metadata: { 
        notes: "Seasonal campaigns",
        tags: ["fashion", "retail"],
        contactPreference: "phone"
      }
    });
    
    this.createClient({
      name: "Robert Johnson",
      email: "robert@foodservice.com",
      company: "Food Service Co.",
      status: "inactive",
      industry: "Food & Beverage",
      totalSpend: 5200,
      avatar: "https://ui-avatars.com/api/?name=Robert+Johnson&background=FF7F50&color=fff",
      metadata: { 
        notes: "On hold until Q3",
        tags: ["food", "service"],
        contactPreference: "email"
      }
    });
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(client => client.email === email);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const now = new Date();
    const newClient: Client = {
      ...client,
      id,
      createdAt: now,
      lastCampaignAt: null
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<Client>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;

    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getClientCampaigns(clientId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.clientId === clientId);
  }

  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactByEmail(email: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(contact => contact.email === email);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const now = new Date();
    const newContact: Contact = {
      ...contact,
      id,
      createdAt: now
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact | undefined> {
    const existingContact = this.contacts.get(id);
    if (!existingContact) return undefined;

    const updatedContact = { ...existingContact, ...contact };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // List methods
  async getLists(): Promise<List[]> {
    return Array.from(this.lists.values());
  }

  async getList(id: number): Promise<List | undefined> {
    return this.lists.get(id);
  }

  async createList(list: InsertList): Promise<List> {
    const id = this.listId++;
    const now = new Date();
    const newList: List = {
      ...list,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.lists.set(id, newList);
    return newList;
  }

  async updateList(id: number, list: Partial<List>): Promise<List | undefined> {
    const existingList = this.lists.get(id);
    if (!existingList) return undefined;

    const updatedList = {
      ...existingList,
      ...list,
      updatedAt: new Date()
    };
    this.lists.set(id, updatedList);
    return updatedList;
  }

  async deleteList(id: number): Promise<boolean> {
    return this.lists.delete(id);
  }

  // Contact-List methods
  async getContactLists(): Promise<ContactList[]> {
    return Array.from(this.contactLists.values());
  }

  async addContactToList(contactList: InsertContactList): Promise<ContactList> {
    const id = this.contactListId++;
    const now = new Date();
    const newContactList: ContactList = {
      ...contactList,
      id,
      addedAt: now
    };
    this.contactLists.set(id, newContactList);
    return newContactList;
  }

  async removeContactFromList(contactId: number, listId: number): Promise<boolean> {
    for (const [clId, cl] of this.contactLists.entries()) {
      if (cl.contactId === contactId && cl.listId === listId) {
        return this.contactLists.delete(clId);
      }
    }
    return false;
  }

  async getContactsByList(listId: number): Promise<Contact[]> {
    const contactIds = Array.from(this.contactLists.values())
      .filter(cl => cl.listId === listId)
      .map(cl => cl.contactId);

    return Array.from(this.contacts.values())
      .filter(contact => contactIds.includes(contact.id));
  }

  async getListsByContact(contactId: number): Promise<List[]> {
    const listIds = Array.from(this.contactLists.values())
      .filter(cl => cl.contactId === contactId)
      .map(cl => cl.listId);

    return Array.from(this.lists.values())
      .filter(list => listIds.includes(list.id));
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignId++;
    const now = new Date();
    const newCampaign: Campaign = {
      ...campaign,
      id,
      sentAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined> {
    const existingCampaign = this.campaigns.get(id);
    if (!existingCampaign) return undefined;

    const updatedCampaign = {
      ...existingCampaign,
      ...campaign,
      updatedAt: new Date()
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Email methods
  async getEmails(): Promise<Email[]> {
    return Array.from(this.emails.values());
  }

  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(email: InsertEmail): Promise<Email> {
    const id = this.emailId++;
    const now = new Date();
    const newEmail: Email = {
      ...email,
      id,
      sentAt: null,
      createdAt: now
    };
    this.emails.set(id, newEmail);
    return newEmail;
  }

  async updateEmail(id: number, email: Partial<Email>): Promise<Email | undefined> {
    const existingEmail = this.emails.get(id);
    if (!existingEmail) return undefined;

    const updatedEmail = { ...existingEmail, ...email };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }

  async deleteEmail(id: number): Promise<boolean> {
    return this.emails.delete(id);
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.templateId++;
    const now = new Date();
    const newTemplate: Template = {
      ...template,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: number, template: Partial<Template>): Promise<Template | undefined> {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) return undefined;

    const updatedTemplate = {
      ...existingTemplate,
      ...template,
      updatedAt: new Date()
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analytics.values());
  }

  async getAnalyticsByCampaign(campaignId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytic => analytic.campaignId === campaignId);
  }

  async recordAnalytic(analytic: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticId++;
    const now = new Date();
    const newAnalytic: Analytics = {
      ...analytic,
      id,
      date: now
    };
    this.analytics.set(id, newAnalytic);
    return newAnalytic;
  }
  
  // Campaign Variant methods for A/B Testing (stub implementation)
  async getCampaignVariants(campaignId: number): Promise<CampaignVariant[]> {
    return [];
  }
  
  async getCampaignVariant(id: number): Promise<CampaignVariant | undefined> {
    return undefined;
  }
  
  async createCampaignVariant(variant: InsertCampaignVariant): Promise<CampaignVariant> {
    throw new Error("A/B testing requires database storage. Please switch to DbStorage.");
  }
  
  async updateCampaignVariant(id: number, variant: Partial<CampaignVariant>): Promise<CampaignVariant | undefined> {
    return undefined;
  }
  
  async deleteCampaignVariant(id: number): Promise<boolean> {
    return false;
  }
  
  // Variant Analytics methods for A/B Testing (stub implementation)
  async getVariantAnalytics(variantId: number): Promise<VariantAnalytics[]> {
    return [];
  }
  
  async getVariantAnalyticsByCampaign(campaignId: number): Promise<VariantAnalytics[]> {
    return [];
  }
  
  async recordVariantAnalytic(analytic: InsertVariantAnalytics): Promise<VariantAnalytics> {
    throw new Error("A/B testing requires database storage. Please switch to DbStorage.");
  }
  
  // A/B Test specific methods (stub implementation)
  async setWinningVariant(campaignId: number, variantId: number): Promise<Campaign | undefined> {
    return undefined;
  }
  
  async getAbTestCampaigns(): Promise<Campaign[]> {
    return [];
  }

  // Domain methods
  async getDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values());
  }
  
  async getDomain(id: number): Promise<Domain | undefined> {
    return this.domains.get(id);
  }
  
  async getDomainByName(name: string): Promise<Domain | undefined> {
    return Array.from(this.domains.values()).find(domain => domain.name === name);
  }
  
  async createDomain(domain: InsertDomain): Promise<Domain> {
    const id = this.domainId++;
    const now = new Date();
    const newDomain: Domain = {
      ...domain,
      id,
      createdAt: now,
      lastUsedAt: null
    };
    this.domains.set(id, newDomain);
    return newDomain;
  }
  
  async updateDomain(id: number, domain: Partial<Domain>): Promise<Domain | undefined> {
    const existingDomain = this.domains.get(id);
    if (!existingDomain) return undefined;
    
    const updatedDomain = { ...existingDomain, ...domain };
    
    // If this domain is set as default, unset default for all other domains
    if (domain.defaultDomain === true) {
      for (const [domainId, domainValue] of this.domains.entries()) {
        if (domainId !== id) {
          this.domains.set(domainId, { ...domainValue, defaultDomain: false });
        }
      }
    }
    
    this.domains.set(id, updatedDomain);
    return updatedDomain;
  }
  
  async deleteDomain(id: number): Promise<boolean> {
    return this.domains.delete(id);
  }
  
  async setDefaultDomain(id: number): Promise<Domain | undefined> {
    const domain = await this.getDomain(id);
    if (!domain) return undefined;
    
    // Unset default for all domains
    for (const [domainId, domainValue] of this.domains.entries()) {
      this.domains.set(domainId, { ...domainValue, defaultDomain: domainId === id });
    }
    
    return this.getDomain(id);
  }
  
  // Campaign-Domain methods
  
  async assignDomainToCampaign(campaignDomain: InsertCampaignDomain): Promise<CampaignDomain> {
    const id = this.campaignDomainId++;
    const now = new Date();
    const newCampaignDomain: CampaignDomain = {
      ...campaignDomain,
      id,
      createdAt: now
    };
    this.campaignDomains.set(id, newCampaignDomain);
    
    // Update the lastUsedAt field of the domain
    const domain = await this.getDomain(campaignDomain.domainId);
    if (domain) {
      await this.updateDomain(domain.id, { lastUsedAt: now });
    }
    
    return newCampaignDomain;
  }
  
  async removeDomainFromCampaign(campaignId: number, domainId: number): Promise<boolean> {
    for (const [cdId, cd] of this.campaignDomains.entries()) {
      if (cd.campaignId === campaignId && cd.domainId === domainId) {
        return this.campaignDomains.delete(cdId);
      }
    }
    return false;
  }
  
  async getCampaignDomains(campaignId: number): Promise<Domain[]> {
    const domainIds = Array.from(this.campaignDomains.values())
      .filter(cd => cd.campaignId === campaignId)
      .map(cd => cd.domainId);
    
    return Array.from(this.domains.values())
      .filter(domain => domainIds.includes(domain.id));
  }
  
  async getDomainCampaigns(domainId: number): Promise<Campaign[]> {
    const campaignIds = Array.from(this.campaignDomains.values())
      .filter(cd => cd.domainId === domainId)
      .map(cd => cd.campaignId);
    
    return Array.from(this.campaigns.values())
      .filter(campaign => campaignIds.includes(campaign.id));
  }
  
  // Client User methods
  async getClientUsers(): Promise<ClientUser[]> {
    return Array.from(this.clientUsers.values());
  }
  
  async getClientUser(id: number): Promise<ClientUser | undefined> {
    return this.clientUsers.get(id);
  }
  
  async getClientUserByUsername(username: string): Promise<ClientUser | undefined> {
    return Array.from(this.clientUsers.values()).find(user => user.username === username);
  }
  
  async getClientUsersByClientId(clientId: number): Promise<ClientUser[]> {
    return Array.from(this.clientUsers.values())
      .filter(user => user.clientId === clientId);
  }
  
  async createClientUser(clientUser: InsertClientUser): Promise<ClientUser> {
    const id = this.clientUserId++;
    const now = new Date();
    const newClientUser: ClientUser = {
      ...clientUser,
      id,
      createdAt: now,
      lastLoginAt: null
    };
    this.clientUsers.set(id, newClientUser);
    return newClientUser;
  }
  
  async updateClientUser(id: number, clientUser: Partial<ClientUser>): Promise<ClientUser | undefined> {
    const existingUser = this.clientUsers.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...clientUser };
    this.clientUsers.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteClientUser(id: number): Promise<boolean> {
    return this.clientUsers.delete(id);
  }
  
  async verifyClientLogin(username: string, password: string): Promise<ClientUser | undefined> {
    const user = await this.getClientUserByUsername(username);
    if (!user) return undefined;
    
    try {
      // Import the comparePasswords function from auth.ts
      const { comparePasswords } = await import('./auth');
      
      // Special case for testing credentials
      if (username === 'client1' && password === 'client123') {
        console.log('Using test client credentials override');
        user.lastLoginAt = new Date();
        this.clientUsers.set(user.id, user);
        return user;
      }
      
      // Check if password matches the hashed password
      const passwordMatches = await comparePasswords(password, user.password);
      
      if (passwordMatches) {
        // Update last login timestamp
        user.lastLoginAt = new Date();
        this.clientUsers.set(user.id, user);
        return user;
      }
    } catch (error) {
      console.error('Error verifying client login:', error);
    }
    
    return undefined;
  }

  // User methods (admin)
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      lastLoginAt: null,
      avatarUrl: user.avatarUrl || null
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async verifyUserLogin(usernameOrEmail: string, password: string): Promise<User | undefined> {
    // First find the user by username or email
    const user = Array.from(this.users.values()).find(
      user => (user.username === usernameOrEmail || user.email === usernameOrEmail) && 
              user.status === "active"
    );
    
    if (!user) return undefined;
    
    try {
      // Import the comparePasswords function from auth.ts
      const { comparePasswords } = await import('./auth');
      
      // Special case for admin testing credentials
      if (usernameOrEmail === 'admin' && password === 'admin123') {
        console.log('Using admin credentials override for testing');
        user.lastLoginAt = new Date();
        this.users.set(user.id, user);
        return user;
      }
      
      // Check if password matches the hashed password
      const passwordMatches = await comparePasswords(password, user.password);
      
      if (passwordMatches) {
        // Update last login timestamp
        user.lastLoginAt = new Date();
        this.users.set(user.id, user);
        return user;
      }
    } catch (error) {
      console.error('Error verifying user login:', error);
    }
    
    return undefined;
  }

  // Click Event methods
  async getClickEvents(campaignId: number, limit: number = 100): Promise<ClickEvent[]> {
    return Array.from(this.clickEvents.values())
      .filter(event => event.campaignId === campaignId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createClickEvent(clickEvent: InsertClickEvent): Promise<ClickEvent> {
    const id = this.clickEventId++;
    const now = new Date();
    const newClickEvent: ClickEvent = {
      ...clickEvent,
      id,
      timestamp: now
    };
    this.clickEvents.set(id, newClickEvent);
    return newClickEvent;
  }
  
  // Open Event methods
  async getOpenEvents(campaignId: number, limit: number = 100): Promise<OpenEvent[]> {
    return Array.from(this.openEvents.values())
      .filter(event => event.campaignId === campaignId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createOpenEvent(openEvent: InsertOpenEvent): Promise<OpenEvent> {
    const id = this.openEventId++;
    const now = new Date();
    const newOpenEvent: OpenEvent = {
      ...openEvent,
      id,
      timestamp: now
    };
    this.openEvents.set(id, newOpenEvent);
    return newOpenEvent;
  }
  
  // Engagement Metrics methods
  async getEngagementMetrics(campaignId: number, days: number = 30): Promise<EngagementMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.engagementMetrics.values())
      .filter(metric => 
        metric.campaignId === campaignId && 
        new Date(metric.date) >= cutoffDate
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createEngagementMetric(metric: InsertEngagementMetrics): Promise<EngagementMetrics> {
    const id = this.engagementMetricId++;
    const now = new Date();
    const newMetric: EngagementMetrics = {
      ...metric,
      id,
      date: metric.date || now
    };
    this.engagementMetrics.set(id, newMetric);
    return newMetric;
  }

  async updateEngagementMetric(id: number, metric: Partial<EngagementMetrics>): Promise<EngagementMetrics | undefined> {
    const existingMetric = this.engagementMetrics.get(id);
    if (!existingMetric) return undefined;

    const updatedMetric = { ...existingMetric, ...metric };
    this.engagementMetrics.set(id, updatedMetric);
    return updatedMetric;
  }
  
  // Link Tracking methods
  async getTrackingLinks(campaignId: number): Promise<LinkTracking[]> {
    return Array.from(this.linkTrackings.values())
      .filter(link => link.campaignId === campaignId);
  }

  async getTrackingLink(id: number): Promise<LinkTracking | undefined> {
    return this.linkTrackings.get(id);
  }

  async getTrackingLinkByUrl(campaignId: number, originalUrl: string): Promise<LinkTracking | undefined> {
    return Array.from(this.linkTrackings.values())
      .find(link => link.campaignId === campaignId && link.originalUrl === originalUrl);
  }

  async createTrackingLink(link: InsertLinkTracking): Promise<LinkTracking> {
    const id = this.linkTrackingId++;
    const now = new Date();
    const newLink: LinkTracking = {
      ...link,
      id,
      createdAt: now
    };
    this.linkTrackings.set(id, newLink);
    return newLink;
  }

  async updateTrackingLink(id: number, link: Partial<LinkTracking>): Promise<LinkTracking | undefined> {
    const existingLink = this.linkTrackings.get(id);
    if (!existingLink) return undefined;

    const updatedLink = { ...existingLink, ...link };
    this.linkTrackings.set(id, updatedLink);
    return updatedLink;
  }
}

// Import the database storage implementation
import { dbStorage } from './dbStorage';

// Create an instance of MemStorage for in-memory storage
const memStorage = new MemStorage();

// Use the memory storage implementation for development
export const storage = memStorage;
