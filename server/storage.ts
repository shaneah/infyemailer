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
  LinkTracking, InsertLinkTracking,
  ClientEmailCreditsHistory, InsertClientEmailCreditsHistory,
  SystemCredits, InsertSystemCredits,
  SystemCreditsHistory, InsertSystemCreditsHistory,
  AudiencePersona, InsertAudiencePersona,
  PersonaDemographic, InsertPersonaDemographic,
  PersonaBehavior, InsertPersonaBehavior,
  PersonaInsight, InsertPersonaInsight,
  AudienceSegment, InsertAudienceSegment,
  insertAudiencePersonaSchema,
  insertPersonaDemographicSchema,
  insertPersonaBehaviorSchema,
  insertPersonaInsightSchema,
  insertAudienceSegmentSchema
} from "@shared/schema";
import { ListPersistenceService } from './services/ListPersistenceService';
import { TemplatePersistenceService } from './services/TemplatePersistenceService';
import { CampaignPersistenceService } from './services/CampaignPersistenceService';
import { ContactPersistenceService } from './services/ContactPersistenceService';
import { DomainPersistenceService } from './services/DomainPersistenceService';
import { ClientPersistenceService } from './services/ClientPersistenceService';
import { EmailPersistenceService } from './services/EmailPersistenceService';

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
  
  // Client Email Credits methods
  updateClientEmailCredits(id: number, emailCredits: number): Promise<Client | undefined>;
  addClientEmailCredits(id: number, emailCredits: number): Promise<Client | undefined>;
  deductClientEmailCredits(id: number, emailCredits: number): Promise<Client | undefined>;
  getClientEmailCreditsHistory(
    clientId: number, 
    filters?: { 
      start_date?: string; 
      end_date?: string; 
      type?: 'add' | 'deduct' | 'set' | ''; 
      limit?: number;
    }
  ): Promise<ClientEmailCreditsHistory[]>;
  
  // System Credits methods
  getSystemCredits(): Promise<SystemCredits | undefined>;
  updateSystemCredits(amount: number, userId: number, reason?: string): Promise<SystemCredits | undefined>;
  addSystemCredits(amount: number, userId: number, reason?: string): Promise<{
    previousBalance: number;
    newBalance: number;
    history: SystemCreditsHistory;
  }>;
  deductSystemCredits(amount: number, userId: number, reason?: string): Promise<{
    previousBalance: number;
    newBalance: number;
    history: SystemCreditsHistory;
  }>;
  allocateClientCreditsFromSystem(clientId: number, amount: number, userId: number, reason?: string): Promise<{
    systemPreviousBalance: number;
    systemNewBalance: number;
    clientPreviousBalance: number;
    clientNewBalance: number;
    systemHistory: SystemCreditsHistory;
    clientHistory: ClientEmailCreditsHistory;
  }>;
  getSystemCreditsHistory(
    filters?: { 
      start_date?: string; 
      end_date?: string; 
      type?: 'add' | 'deduct' | 'allocate' | ''; 
      limit?: number;
    }
  ): Promise<SystemCreditsHistory[]>;

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
  getContactsClickEvents(contactIds: number[]): Promise<ClickEvent[]>;
  
  // Open Event methods
  getOpenEvents(campaignId: number, limit?: number): Promise<OpenEvent[]>;
  createOpenEvent(openEvent: InsertOpenEvent): Promise<OpenEvent>;
  getContactsOpenEvents(contactIds: number[]): Promise<OpenEvent[]>;
  
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
  
  // Audience Persona methods
  audiencePersonaSchema: typeof insertAudiencePersonaSchema;
  personaDemographicSchema: typeof insertPersonaDemographicSchema;
  personaBehaviorSchema: typeof insertPersonaBehaviorSchema;
  personaInsightSchema: typeof insertPersonaInsightSchema;
  audienceSegmentSchema: typeof insertAudienceSegmentSchema;
  
  getAudiencePersonas(clientId?: number): Promise<AudiencePersona[]>;
  getAudiencePersona(id: number): Promise<AudiencePersona | undefined>;
  createAudiencePersona(persona: InsertAudiencePersona): Promise<AudiencePersona>;
  updateAudiencePersona(id: number, persona: Partial<AudiencePersona>): Promise<AudiencePersona | undefined>;
  deleteAudiencePersona(id: number): Promise<boolean>;
  
  // Persona Demographics methods
  getPersonaDemographics(personaId: number): Promise<PersonaDemographic | undefined>;
  createPersonaDemographics(demographics: InsertPersonaDemographic): Promise<PersonaDemographic>;
  updatePersonaDemographics(id: number, demographics: Partial<PersonaDemographic>): Promise<PersonaDemographic | undefined>;
  
  // Persona Behaviors methods
  getPersonaBehaviors(personaId: number): Promise<PersonaBehavior | undefined>;
  createPersonaBehaviors(behaviors: InsertPersonaBehavior): Promise<PersonaBehavior>;
  updatePersonaBehaviors(id: number, behaviors: Partial<PersonaBehavior>): Promise<PersonaBehavior | undefined>;
  
  // Persona Insights methods
  getPersonaInsights(personaId: number): Promise<PersonaInsight[]>;
  createPersonaInsight(insight: InsertPersonaInsight): Promise<PersonaInsight>;
  deletePersonaInsight(id: number): Promise<boolean>;
  
  // Audience Segments methods
  getAudienceSegments(personaId?: number): Promise<AudienceSegment[]>;
  getPersonaSegments(personaId: number): Promise<AudienceSegment[]>;
  getAudienceSegment(id: number): Promise<AudienceSegment | undefined>;
  createAudienceSegment(segment: InsertAudienceSegment): Promise<AudienceSegment>;
  updateAudienceSegment(id: number, segment: Partial<AudienceSegment>): Promise<AudienceSegment | undefined>;
  deleteAudienceSegment(id: number): Promise<boolean>;
}

import session from 'express-session';
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);

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
  private audiencePersonas: Map<number, AudiencePersona>;
  private personaDemographics: Map<number, PersonaDemographic>;
  private personaBehaviors: Map<number, PersonaBehavior>;
  private personaInsights: Map<number, PersonaInsight>;
  private audienceSegments: Map<number, AudienceSegment>;
  private systemCredits: SystemCredits | undefined;
  private systemCreditsHistory: Map<number, SystemCreditsHistory>;
  private clientEmailCreditsHistory: Map<number, ClientEmailCreditsHistory>;
  public sessionStore: any; // Express session store

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
  private audiencePersonaId: number;
  private personaDemographicId: number;
  private personaBehaviorId: number;
  private personaInsightId: number;
  private audienceSegmentId: number;
  private systemCreditsHistoryId: number;
  private clientEmailCreditsHistoryId: number;

  // Schema validation objects
  public audiencePersonaSchema = insertAudiencePersonaSchema;
  public personaDemographicSchema = insertPersonaDemographicSchema;
  public personaBehaviorSchema = insertPersonaBehaviorSchema;
  public personaInsightSchema = insertPersonaInsightSchema;
  public audienceSegmentSchema = insertAudienceSegmentSchema;

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
    this.audiencePersonas = new Map();
    this.personaDemographics = new Map();
    this.personaBehaviors = new Map();
    this.personaInsights = new Map();
    this.audienceSegments = new Map();
    this.systemCreditsHistory = new Map();
    this.clientEmailCreditsHistory = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

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
    this.audiencePersonaId = 1;
    this.personaDemographicId = 1;
    this.personaBehaviorId = 1;
    this.personaInsightId = 1;
    this.audienceSegmentId = 1;
    this.systemCreditsHistoryId = 1;
    this.clientEmailCreditsHistoryId = 1;

    // Initialize with some default data
    this.initializeData();
    
    // Load saved data from files
    this.loadListsFromFile();         // Load lists first
    this.loadContactsFromFile();      // Load contacts before relationships
    this.loadContactListRelations();  // Load contact-list relationships
    this.loadTemplatesFromFile();
    this.loadCampaignsFromFile();
    this.loadDomainsFromFile();
    this.loadClientsFromFile();
    this.loadEmailsFromFile();
  }
  
  /**
   * Load templates from file storage
   */
  private async loadTemplatesFromFile() {
    try {
      // Load templates
      const savedTemplates = await TemplatePersistenceService.loadTemplatesFromFile();
      if (savedTemplates.size > 0) {
        // Replace in-memory templates with saved templates
        this.templates = savedTemplates;
        
        // Update templateId counter to be greater than any existing id
        this.templateId = TemplatePersistenceService.getNextId(savedTemplates);
        console.log(`Loaded ${savedTemplates.size} templates from file storage`);
      }
    } catch (error) {
      console.error('Failed to load templates from file storage:', error);
    }
  }
  
  /**
   * Load lists from file storage
   */
  private async loadListsFromFile() {
    try {
      // Load lists
      const savedLists = await ListPersistenceService.loadListsFromFile();
      if (savedLists.size > 0) {
        // Replace in-memory lists with saved lists
        this.lists = savedLists;
        
        // Update listId counter to be greater than any existing id
        this.listId = ListPersistenceService.getNextId(savedLists);
        console.log(`Loaded ${savedLists.size} lists from file storage`);
      }
    } catch (error) {
      console.error('Failed to load lists from file storage:', error);
    }
  }
  
  /**
   * Load contact-list relationships from file storage
   */
  private async loadContactListRelations() {
    try {
      // Load contact-list relationships
      const savedContactLists = await ListPersistenceService.loadContactListsFromFile();
      if (savedContactLists.size > 0) {
        // Replace in-memory contact-lists with saved contact-lists
        this.contactLists = savedContactLists;
        
        // Update contactListId counter to be greater than any existing id
        this.contactListId = ListPersistenceService.getNextId(savedContactLists);
        console.log(`Loaded ${savedContactLists.size} contact-list relationships from file storage`);
      }
    } catch (error) {
      console.error('Failed to load contact-list relationships from file storage:', error);
    }
  }
  
  /**
   * Load campaigns from file storage
   */
  private async loadCampaignsFromFile() {
    try {
      // Load campaigns
      const savedCampaigns = await CampaignPersistenceService.loadCampaignsFromFile();
      if (savedCampaigns.size > 0) {
        // Replace in-memory campaigns with saved campaigns
        this.campaigns = savedCampaigns;
        
        // Update campaignId counter to be greater than any existing id
        this.campaignId = CampaignPersistenceService.getNextId(savedCampaigns);
        console.log(`Loaded ${savedCampaigns.size} campaigns from file storage`);
      }
    } catch (error) {
      console.error('Failed to load campaigns from file storage:', error);
    }
  }
  
  /**
   * Load contacts from file storage
   */
  private async loadContactsFromFile() {
    try {
      // Load contacts
      const savedContacts = await ContactPersistenceService.loadContactsFromFile();
      if (savedContacts.size > 0) {
        // Replace in-memory contacts with saved contacts
        this.contacts = savedContacts;
        
        // Update contactId counter to be greater than any existing id
        this.contactId = ContactPersistenceService.getNextId(savedContacts);
        console.log(`Loaded ${savedContacts.size} contacts from file storage`);
      }
    } catch (error) {
      console.error('Failed to load contacts from file storage:', error);
    }
  }
  
  /**
   * Load domains from file storage
   */
  private async loadDomainsFromFile() {
    try {
      // Load domains
      const savedDomains = await DomainPersistenceService.loadDomainsFromFile();
      if (savedDomains.size > 0) {
        // Replace in-memory domains with saved domains
        this.domains = savedDomains;
        
        // Update domainId counter to be greater than any existing id
        this.domainId = DomainPersistenceService.getNextId(savedDomains);
        console.log(`Loaded ${savedDomains.size} domains from file storage`);
      }
    } catch (error) {
      console.error('Failed to load domains from file storage:', error);
    }
  }
  
  /**
   * Load clients from file storage
   */
  private async loadClientsFromFile() {
    try {
      // Load clients
      const savedClients = await ClientPersistenceService.loadClientsFromFile();
      if (savedClients.size > 0) {
        // Replace in-memory clients with saved clients
        this.clients = savedClients;
        
        // Update clientId counter to be greater than any existing id
        this.clientId = ClientPersistenceService.getNextId(savedClients);
        console.log(`Loaded ${savedClients.size} clients from file storage`);
      }
    } catch (error) {
      console.error('Failed to load clients from file storage:', error);
    }
  }
  
  /**
   * Load emails from file storage
   */
  private async loadEmailsFromFile() {
    try {
      // Load emails
      const savedEmails = await EmailPersistenceService.loadEmailsFromFile();
      if (savedEmails.size > 0) {
        // Replace in-memory emails with saved emails
        this.emails = savedEmails;
        
        // Update emailId counter to be greater than any existing id
        this.emailId = EmailPersistenceService.getNextId(savedEmails);
        console.log(`Loaded ${savedEmails.size} emails from file storage`);
      }
    } catch (error) {
      console.error('Failed to load emails from file storage:', error);
    }
  }

  private initializeData() {
    // Initialize system credits with starting balance of 100,000
    this.systemCredits = {
      id: 1,
      balance: 100000,
      updatedAt: new Date(),
      metadata: {
        lastUpdateReason: "Initial balance",
        lastUpdateBy: 1 // Admin user ID
      }
    };
    
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
    
    // Save clients to file for persistence
    await ClientPersistenceService.saveClientsToFile(this.clients);
    
    return newClient;
  }

  async updateClient(id: number, client: Partial<Client>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;

    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    
    // Save clients to file for persistence
    await ClientPersistenceService.saveClientsToFile(this.clients);
    
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = this.clients.delete(id);
    
    if (result) {
      // Save clients to file for persistence
      await ClientPersistenceService.saveClientsToFile(this.clients);
    }
    
    return result;
  }

  async getClientCampaigns(clientId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.clientId === clientId);
  }
  
  // Client Email Credits methods
  private clientEmailCreditsHistory: Map<number, ClientEmailCreditsHistory> = new Map();
  private lastCreditsHistoryId = 0;
  
  async updateClientEmailCredits(id: number, emailCredits: number): Promise<Client | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;
    
    // Create history record
    const historyId = ++this.lastCreditsHistoryId;
    const history: ClientEmailCreditsHistory = {
      id: historyId,
      clientId: id,
      amount: emailCredits - (client.emailCredits || 0),
      type: 'set',
      previousBalance: client.emailCredits || 0,
      newBalance: emailCredits,
      reason: 'Manual adjustment',
      createdAt: new Date(),
      metadata: { action: 'set', adminAction: true }
    };
    this.clientEmailCreditsHistory.set(historyId, history);
    
    // Update client record
    const updatedClient: Client = {
      ...client,
      emailCredits: emailCredits,
      lastCreditUpdateAt: new Date()
    };
    this.clients.set(id, updatedClient);
    
    return updatedClient;
  }
  
  async addClientEmailCredits(id: number, emailCredits: number): Promise<Client | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;
    
    const currentCredits = client.emailCredits || 0;
    const newBalance = currentCredits + emailCredits;
    
    // Create history record
    const historyId = ++this.lastCreditsHistoryId;
    const history: ClientEmailCreditsHistory = {
      id: historyId,
      clientId: id,
      amount: emailCredits,
      type: 'add',
      previousBalance: currentCredits,
      newBalance: newBalance,
      reason: 'Credits added',
      createdAt: new Date(),
      metadata: { action: 'add', adminAction: true }
    };
    this.clientEmailCreditsHistory.set(historyId, history);
    
    // Update client record
    const updatedClient: Client = {
      ...client,
      emailCredits: newBalance,
      emailCreditsPurchased: (client.emailCreditsPurchased || 0) + emailCredits,
      lastCreditUpdateAt: new Date()
    };
    this.clients.set(id, updatedClient);
    
    return updatedClient;
  }
  
  async deductClientEmailCredits(id: number, emailCredits: number): Promise<Client | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;
    
    const currentCredits = client.emailCredits || 0;
    
    // Check if client has enough credits
    if (currentCredits < emailCredits) {
      throw new Error('Insufficient email credits');
    }
    
    const newBalance = currentCredits - emailCredits;
    
    // Create history record
    const historyId = ++this.lastCreditsHistoryId;
    const history: ClientEmailCreditsHistory = {
      id: historyId,
      clientId: id,
      amount: emailCredits,
      type: 'deduct',
      previousBalance: currentCredits,
      newBalance: newBalance,
      reason: 'Credits used',
      createdAt: new Date(),
      metadata: { action: 'deduct', systemAction: true }
    };
    this.clientEmailCreditsHistory.set(historyId, history);
    
    // Update client record
    const updatedClient: Client = {
      ...client,
      emailCredits: newBalance,
      emailCreditsUsed: (client.emailCreditsUsed || 0) + emailCredits,
      lastCreditUpdateAt: new Date()
    };
    this.clients.set(id, updatedClient);
    
    return updatedClient;
  }
  
  async getClientEmailCreditsHistory(
    clientId: number,
    filters?: { 
      start_date?: string; 
      end_date?: string; 
      type?: 'add' | 'deduct' | 'set' | ''; 
      limit?: number;
    }
  ): Promise<ClientEmailCreditsHistory[]> {
    let results = Array.from(this.clientEmailCreditsHistory.values())
      .filter(history => history.clientId === clientId);
    
    // Apply filters if provided
    if (filters) {
      // Filter by start date
      if (filters.start_date) {
        const startDate = new Date(filters.start_date);
        results = results.filter(history => history.createdAt >= startDate);
      }
      
      // Filter by end date
      if (filters.end_date) {
        const endDate = new Date(filters.end_date);
        // Set time to end of day for inclusive filtering
        endDate.setHours(23, 59, 59, 999);
        results = results.filter(history => history.createdAt <= endDate);
      }
      
      // Filter by transaction type
      if (filters.type && filters.type !== '') {
        results = results.filter(history => history.type === filters.type);
      }
    }
    
    // Always sort by date (newest first)
    results = results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply limit if provided
    if (filters?.limit && filters.limit > 0) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  }
  
  // System Credits Methods
  async getSystemCredits(): Promise<SystemCredits | undefined> {
    return this.systemCredits;
  }
  
  async updateSystemCredits(amount: number, userId: number, reason?: string): Promise<SystemCredits | undefined> {
    if (!this.systemCredits) {
      return undefined;
    }
    
    const previousBalance = this.systemCredits.balance;
    
    // Create history record
    const historyId = ++this.systemCreditsHistoryId;
    const history: SystemCreditsHistory = {
      id: historyId,
      type: 'set',
      amount: amount - previousBalance,
      previousBalance,
      newBalance: amount,
      reason: reason || 'Manual adjustment',
      performedBy: userId,
      createdAt: new Date(),
      metadata: { 
        action: 'set',
        adminAction: true
      }
    };
    this.systemCreditsHistory.set(historyId, history);
    
    // Update system credits
    this.systemCredits = {
      ...this.systemCredits,
      balance: amount,
      updatedAt: new Date(),
      metadata: {
        ...this.systemCredits.metadata,
        lastUpdateReason: reason || 'Manual adjustment',
        lastUpdateBy: userId
      }
    };
    
    return this.systemCredits;
  }
  
  async addSystemCredits(amount: number, userId: number, reason?: string): Promise<{
    previousBalance: number;
    newBalance: number;
    history: SystemCreditsHistory;
  }> {
    if (!this.systemCredits) {
      throw new Error('System credits not initialized');
    }
    
    const previousBalance = this.systemCredits.balance;
    const newBalance = previousBalance + amount;
    
    // Create history record
    const historyId = ++this.systemCreditsHistoryId;
    const history: SystemCreditsHistory = {
      id: historyId,
      type: 'add',
      amount,
      previousBalance,
      newBalance,
      reason: reason || 'Credits added',
      performedBy: userId,
      createdAt: new Date(),
      metadata: { 
        action: 'add',
        adminAction: true
      }
    };
    this.systemCreditsHistory.set(historyId, history);
    
    // Update system credits
    this.systemCredits = {
      ...this.systemCredits,
      balance: newBalance,
      updatedAt: new Date(),
      metadata: {
        ...this.systemCredits.metadata,
        lastUpdateReason: reason || 'Credits added',
        lastUpdateBy: userId
      }
    };
    
    return {
      previousBalance,
      newBalance,
      history
    };
  }
  
  async deductSystemCredits(amount: number, userId: number, reason?: string): Promise<{
    previousBalance: number;
    newBalance: number;
    history: SystemCreditsHistory;
  }> {
    if (!this.systemCredits) {
      throw new Error('System credits not initialized');
    }
    
    const previousBalance = this.systemCredits.balance;
    
    // Check if sufficient balance available
    if (previousBalance < amount) {
      throw new Error(`Insufficient system credits. Available: ${previousBalance}, Requested: ${amount}`);
    }
    
    const newBalance = previousBalance - amount;
    
    // Create history record
    const historyId = ++this.systemCreditsHistoryId;
    const history: SystemCreditsHistory = {
      id: historyId,
      type: 'deduct',
      amount,
      previousBalance,
      newBalance,
      reason: reason || 'Credits deducted',
      performedBy: userId,
      createdAt: new Date(),
      metadata: { 
        action: 'deduct',
        adminAction: true
      }
    };
    this.systemCreditsHistory.set(historyId, history);
    
    // Update system credits
    this.systemCredits = {
      ...this.systemCredits,
      balance: newBalance,
      updatedAt: new Date(),
      metadata: {
        ...this.systemCredits.metadata,
        lastUpdateReason: reason || 'Credits deducted',
        lastUpdateBy: userId
      }
    };
    
    return {
      previousBalance,
      newBalance,
      history
    };
  }
  
  async getSystemCreditsHistory(
    filters?: { 
      start_date?: string; 
      end_date?: string; 
      type?: 'add' | 'deduct' | 'allocate' | ''; 
      limit?: number;
    }
  ): Promise<SystemCreditsHistory[]> {
    let results = Array.from(this.systemCreditsHistory.values());
    
    // Apply filters if provided
    if (filters) {
      // Filter by start date
      if (filters.start_date) {
        const startDate = new Date(filters.start_date);
        results = results.filter(history => history.createdAt >= startDate);
      }
      
      // Filter by end date
      if (filters.end_date) {
        const endDate = new Date(filters.end_date);
        // Set time to end of day for inclusive filtering
        endDate.setHours(23, 59, 59, 999);
        results = results.filter(history => history.createdAt <= endDate);
      }
      
      // Filter by transaction type
      if (filters.type && filters.type !== '') {
        results = results.filter(history => history.type === filters.type);
      }
    }
    
    // Always sort by date (newest first)
    results = results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply limit if provided
    if (filters?.limit && filters.limit > 0) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  }
  
  async allocateClientCreditsFromSystem(
    clientId: number, 
    amount: number, 
    userId: number, 
    reason?: string
  ): Promise<{
    systemPreviousBalance: number;
    systemNewBalance: number;
    clientPreviousBalance: number;
    clientNewBalance: number;
    systemHistory: SystemCreditsHistory;
    clientHistory: ClientEmailCreditsHistory;
  }> {
    // Get client
    const client = await this.getClient(clientId);
    if (!client) {
      throw new Error(`Client with ID ${clientId} not found`);
    }
    
    // Get current system credits
    if (!this.systemCredits) {
      throw new Error('System credits not initialized');
    }
    
    const systemPreviousBalance = this.systemCredits.balance;
    
    // Check if system has enough credits
    if (systemPreviousBalance < amount) {
      throw new Error(`Insufficient system credits. Available: ${systemPreviousBalance}, Requested: ${amount}`);
    }
    
    // Calculate new balances
    const systemNewBalance = systemPreviousBalance - amount;
    const clientPreviousBalance = client.emailCredits || 0;
    const clientNewBalance = clientPreviousBalance + amount;
    
    // Create system history record
    const systemHistoryId = ++this.systemCreditsHistoryId;
    const systemHistory: SystemCreditsHistory = {
      id: systemHistoryId,
      type: 'allocate',
      amount,
      previousBalance: systemPreviousBalance,
      newBalance: systemNewBalance,
      reason: reason || `Credits allocated to client ${client.name} (ID: ${clientId})`,
      performedBy: userId,
      createdAt: new Date(),
      metadata: { 
        action: 'allocate',
        adminAction: true,
        clientId,
        clientName: client.name
      }
    };
    this.systemCreditsHistory.set(systemHistoryId, systemHistory);
    
    // Create client history record
    const clientHistoryId = ++this.clientEmailCreditsHistoryId;
    const clientHistory: ClientEmailCreditsHistory = {
      id: clientHistoryId,
      clientId,
      type: 'add',
      amount,
      previousBalance: clientPreviousBalance,
      newBalance: clientNewBalance,
      reason: reason || 'Credits allocated from system',
      performedBy: userId,
      systemCreditsDeducted: amount,
      createdAt: new Date(),
      metadata: { 
        action: 'add',
        adminAction: true,
        fromSystem: true
      }
    };
    this.clientEmailCreditsHistory.set(clientHistoryId, clientHistory);
    
    // Update system credits
    this.systemCredits = {
      ...this.systemCredits,
      balance: systemNewBalance,
      updatedAt: new Date(),
      metadata: {
        ...this.systemCredits.metadata,
        lastUpdateReason: `Allocated ${amount} credits to client ${client.name}`,
        lastUpdateBy: userId
      }
    };
    
    // Update client credits
    const updatedClient: Client = {
      ...client,
      emailCredits: clientNewBalance,
      emailCreditsPurchased: (client.emailCreditsPurchased || 0) + amount,
      lastCreditUpdateAt: new Date()
    };
    this.clients.set(clientId, updatedClient);
    
    return {
      systemPreviousBalance,
      systemNewBalance,
      clientPreviousBalance,
      clientNewBalance,
      systemHistory,
      clientHistory
    };
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
    
    // Save contacts to file for persistence
    await ContactPersistenceService.saveContactsToFile(this.contacts);
    
    return newContact;
  }

  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact | undefined> {
    const existingContact = this.contacts.get(id);
    if (!existingContact) return undefined;

    const updatedContact = { ...existingContact, ...contact };
    this.contacts.set(id, updatedContact);
    
    // Save contacts to file for persistence
    await ContactPersistenceService.saveContactsToFile(this.contacts);
    
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = this.contacts.delete(id);
    
    if (result) {
      // Save contacts to file for persistence
      await ContactPersistenceService.saveContactsToFile(this.contacts);
    }
    
    return result;
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
    
    // Save lists to file for persistence
    await ListPersistenceService.saveListsToFile(this.lists);
    
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
    
    // Save lists to file for persistence
    await ListPersistenceService.saveListsToFile(this.lists);
    
    return updatedList;
  }

  async deleteList(id: number): Promise<boolean> {
    const result = this.lists.delete(id);
    
    if (result) {
      // Save lists to file for persistence
      await ListPersistenceService.saveListsToFile(this.lists);
      
      // Also remove all contact-list relationships for this list
      for (const [clId, cl] of this.contactLists.entries()) {
        if (cl.listId === id) {
          this.contactLists.delete(clId);
        }
      }
      
      // Save contact-list relationships to file for persistence
      await ListPersistenceService.saveContactListsToFile(this.contactLists);
    }
    
    return result;
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
    
    // Save contact-list relationships to file for persistence
    await ListPersistenceService.saveContactListsToFile(this.contactLists);
    
    return newContactList;
  }

  async removeContactFromList(contactId: number, listId: number): Promise<boolean> {
    let result = false;
    
    for (const [clId, cl] of this.contactLists.entries()) {
      if (cl.contactId === contactId && cl.listId === listId) {
        result = this.contactLists.delete(clId);
        
        if (result) {
          // Save contact-list relationships to file for persistence
          await ListPersistenceService.saveContactListsToFile(this.contactLists);
        }
        
        break;
      }
    }
    
    return result;
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
    
    // Save campaign directly to file for immediate persistence
    await CampaignPersistenceService.saveCampaignToFile(newCampaign, this.campaigns);
    
    console.log(`Campaign created: ${newCampaign.id} (${newCampaign.name}) - immediate file save completed`);
    
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
    
    // Save campaign directly to file for immediate persistence
    await CampaignPersistenceService.saveCampaignToFile(updatedCampaign, this.campaigns);
    
    console.log(`Campaign updated: ${updatedCampaign.id} (${updatedCampaign.name}) - immediate file save completed`);
    
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    // Get the campaign name before deletion for logging
    const campaign = this.campaigns.get(id);
    const campaignName = campaign ? campaign.name : 'unknown';
    
    const result = this.campaigns.delete(id);
    
    if (result) {
      // Save campaigns to file for persistence
      await CampaignPersistenceService.saveCampaignsToFile(this.campaigns);
      console.log(`Campaign deleted: ${id} (${campaignName}) - campaigns saved to file`);
    }
    
    return result;
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
    
    // Save emails to file for persistence
    await EmailPersistenceService.saveEmailsToFile(this.emails);
    
    return newEmail;
  }

  async updateEmail(id: number, email: Partial<Email>): Promise<Email | undefined> {
    const existingEmail = this.emails.get(id);
    if (!existingEmail) return undefined;

    const updatedEmail = { ...existingEmail, ...email };
    this.emails.set(id, updatedEmail);
    
    // Save emails to file for persistence
    await EmailPersistenceService.saveEmailsToFile(this.emails);
    
    return updatedEmail;
  }

  async deleteEmail(id: number): Promise<boolean> {
    const result = this.emails.delete(id);
    
    if (result) {
      // Save emails to file for persistence
      await EmailPersistenceService.saveEmailsToFile(this.emails);
    }
    
    return result;
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
    
    // Use the enhanced method to ensure immediate persistence to file
    await TemplatePersistenceService.saveTemplateToFile(newTemplate, this.templates);
    
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
    
    // Use the enhanced method to ensure immediate persistence to file
    await TemplatePersistenceService.saveTemplateToFile(updatedTemplate, this.templates);
    
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const result = this.templates.delete(id);
    
    // If deletion was successful, immediately save the updated templates to file
    if (result) {
      await TemplatePersistenceService.saveTemplatesToFile(this.templates);
      console.log(`Template ${id} deleted and template store saved to file`);
    }
    
    return result;
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
    
    // Save domains to file for persistence
    await DomainPersistenceService.saveDomainsToFile(this.domains);
    
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
    
    // Save domains to file for persistence
    await DomainPersistenceService.saveDomainsToFile(this.domains);
    
    return updatedDomain;
  }
  
  async deleteDomain(id: number): Promise<boolean> {
    const result = this.domains.delete(id);
    
    if (result) {
      // Save domains to file for persistence
      await DomainPersistenceService.saveDomainsToFile(this.domains);
    }
    
    return result;
  }
  
  async setDefaultDomain(id: number): Promise<Domain | undefined> {
    const domain = await this.getDomain(id);
    if (!domain) return undefined;
    
    // Unset default for all domains
    for (const [domainId, domainValue] of this.domains.entries()) {
      this.domains.set(domainId, { ...domainValue, defaultDomain: domainId === id });
    }
    
    // Save domains to file for persistence
    await DomainPersistenceService.saveDomainsToFile(this.domains);
    
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
  
  // AudiencePersona methods
  async getAudiencePersonas(clientId?: number): Promise<AudiencePersona[]> {
    let personas = Array.from(this.audiencePersonas.values());
    
    if (clientId) {
      personas = personas.filter(persona => persona.clientId === clientId);
    }
    
    return personas;
  }
  
  async getAudiencePersona(id: number): Promise<AudiencePersona | undefined> {
    return this.audiencePersonas.get(id);
  }
  
  async createAudiencePersona(persona: InsertAudiencePersona): Promise<AudiencePersona> {
    const id = this.audiencePersonaId++;
    const now = new Date();
    const newPersona: AudiencePersona = {
      ...persona,
      id,
      createdAt: now,
      updatedAt: now,
      status: persona.status || 'active',
      metadata: persona.metadata || {},
      traits: persona.traits || {}
    };
    
    this.audiencePersonas.set(id, newPersona);
    return newPersona;
  }
  
  async updateAudiencePersona(id: number, persona: Partial<AudiencePersona>): Promise<AudiencePersona | undefined> {
    const existingPersona = this.audiencePersonas.get(id);
    if (!existingPersona) return undefined;
    
    const updatedPersona = { 
      ...existingPersona, 
      ...persona,
      updatedAt: new Date()
    };
    
    this.audiencePersonas.set(id, updatedPersona);
    return updatedPersona;
  }
  
  async deleteAudiencePersona(id: number): Promise<boolean> {
    // First delete all related data
    const demographicsToDelete = Array.from(this.personaDemographics.values())
      .filter(item => item.personaId === id)
      .map(item => item.id);
      
    const behaviorsToDelete = Array.from(this.personaBehaviors.values())
      .filter(item => item.personaId === id)
      .map(item => item.id);
      
    const insightsToDelete = Array.from(this.personaInsights.values())
      .filter(item => item.personaId === id)
      .map(item => item.id);
      
    const segmentsToDelete = Array.from(this.audienceSegments.values())
      .filter(item => item.personaId === id)
      .map(item => item.id);
    
    // Delete all related items
    demographicsToDelete.forEach(itemId => this.personaDemographics.delete(itemId));
    behaviorsToDelete.forEach(itemId => this.personaBehaviors.delete(itemId));
    insightsToDelete.forEach(itemId => this.personaInsights.delete(itemId));
    segmentsToDelete.forEach(itemId => this.audienceSegments.delete(itemId));
    
    // Finally delete the persona
    return this.audiencePersonas.delete(id);
  }
  
  // Persona Demographics methods
  async getPersonaDemographics(personaId: number): Promise<PersonaDemographic | undefined> {
    return Array.from(this.personaDemographics.values())
      .find(demo => demo.personaId === personaId);
  }
  
  async createPersonaDemographics(demographics: InsertPersonaDemographic): Promise<PersonaDemographic> {
    const id = this.personaDemographicId++;
    const newDemographics: PersonaDemographic = {
      ...demographics,
      id,
      metadata: demographics.metadata || {}
    };
    
    this.personaDemographics.set(id, newDemographics);
    return newDemographics;
  }
  
  async updatePersonaDemographics(id: number, demographics: Partial<PersonaDemographic>): Promise<PersonaDemographic | undefined> {
    const existingDemographics = this.personaDemographics.get(id);
    if (!existingDemographics) return undefined;
    
    const updatedDemographics = { ...existingDemographics, ...demographics };
    this.personaDemographics.set(id, updatedDemographics);
    return updatedDemographics;
  }
  
  // Persona Behaviors methods
  async getPersonaBehaviors(personaId: number): Promise<PersonaBehavior | undefined> {
    return Array.from(this.personaBehaviors.values())
      .find(behavior => behavior.personaId === personaId);
  }
  
  async createPersonaBehaviors(behaviors: InsertPersonaBehavior): Promise<PersonaBehavior> {
    const id = this.personaBehaviorId++;
    const newBehaviors: PersonaBehavior = {
      ...behaviors,
      id,
      socialMediaUsage: behaviors.socialMediaUsage || {},
      interests: behaviors.interests || [],
      metadata: behaviors.metadata || {}
    };
    
    this.personaBehaviors.set(id, newBehaviors);
    return newBehaviors;
  }
  
  async updatePersonaBehaviors(id: number, behaviors: Partial<PersonaBehavior>): Promise<PersonaBehavior | undefined> {
    const existingBehaviors = this.personaBehaviors.get(id);
    if (!existingBehaviors) return undefined;
    
    const updatedBehaviors = { ...existingBehaviors, ...behaviors };
    this.personaBehaviors.set(id, updatedBehaviors);
    return updatedBehaviors;
  }
  
  // Persona Insights methods
  async getPersonaInsights(personaId: number): Promise<PersonaInsight[]> {
    return Array.from(this.personaInsights.values())
      .filter(insight => insight.personaId === personaId);
  }
  
  async createPersonaInsight(insight: InsertPersonaInsight): Promise<PersonaInsight> {
    const id = this.personaInsightId++;
    const now = new Date();
    const newInsight: PersonaInsight = {
      ...insight,
      id,
      createdAt: now,
      metadata: insight.metadata || {}
    };
    
    this.personaInsights.set(id, newInsight);
    return newInsight;
  }
  
  async updatePersonaInsight(id: number, insight: Partial<PersonaInsight>): Promise<PersonaInsight | undefined> {
    const existingInsight = this.personaInsights.get(id);
    if (!existingInsight) return undefined;
    
    const updatedInsight = { 
      ...existingInsight, 
      ...insight 
    };
    
    this.personaInsights.set(id, updatedInsight);
    return updatedInsight;
  }
  
  async deletePersonaInsight(id: number): Promise<boolean> {
    return this.personaInsights.delete(id);
  }
  
  // Audience Segments methods
  async getAudienceSegments(personaId?: number): Promise<AudienceSegment[]> {
    let segments = Array.from(this.audienceSegments.values());
    
    if (personaId) {
      segments = segments.filter(segment => segment.personaId === personaId);
    }
    
    return segments;
  }
  
  async getPersonaSegments(personaId: number): Promise<AudienceSegment[]> {
    return this.getAudienceSegments(personaId);
  }
  
  async getAudienceSegment(id: number): Promise<AudienceSegment | undefined> {
    return this.audienceSegments.get(id);
  }
  
  async createAudienceSegment(segment: InsertAudienceSegment): Promise<AudienceSegment> {
    const id = this.audienceSegmentId++;
    const now = new Date();
    const newSegment: AudienceSegment = {
      ...segment,
      id,
      createdAt: now,
      updatedAt: now,
      status: segment.status || 'active',
      metadata: segment.metadata || {}
    };
    
    this.audienceSegments.set(id, newSegment);
    return newSegment;
  }
  
  async updateAudienceSegment(id: number, segment: Partial<AudienceSegment>): Promise<AudienceSegment | undefined> {
    const existingSegment = this.audienceSegments.get(id);
    if (!existingSegment) return undefined;
    
    const updatedSegment = { 
      ...existingSegment, 
      ...segment,
      updatedAt: new Date()
    };
    
    this.audienceSegments.set(id, updatedSegment);
    return updatedSegment;
  }
  
  async deleteAudienceSegment(id: number): Promise<boolean> {
    return this.audienceSegments.delete(id);
  }
  
  // Event tracking methods for contacts
  async getContactsClickEvents(contactIds: number[]): Promise<ClickEvent[]> {
    if (!contactIds.length) return [];
    
    return Array.from(this.clickEvents.values())
      .filter(event => event.contactId !== null && contactIds.includes(event.contactId));
  }
  
  async getContactsOpenEvents(contactIds: number[]): Promise<OpenEvent[]> {
    if (!contactIds.length) return [];
    
    return Array.from(this.openEvents.values())
      .filter(event => event.contactId !== null && contactIds.includes(event.contactId));
  }
}

// Create an instance of MemStorage for in-memory storage
const memStorage = new MemStorage();

// Use dynamic storage selection based on database availability
// Initialize with memory storage, but allow dynamic switching through storageManager
// This avoids circular dependency issues
export const storage = memStorage;
