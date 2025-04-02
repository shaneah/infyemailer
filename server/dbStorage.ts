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
  users, contacts, lists, contactLists, campaigns, emails, templates, analytics,
  campaignVariants, variantAnalytics, domains, campaignDomains, clients, clientUsers
} from '@shared/schema';
import { IStorage } from './storage';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { log } from './vite';

export class DbStorage implements IStorage {
  constructor() {
    log('PostgreSQL storage initialized', 'db');
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.email, email));
    return result[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values({
      ...client,
      status: client.status || 'active'
    }).returning();
    return result[0];
  }

  async updateClient(id: number, client: Partial<Client>): Promise<Client | undefined> {
    const result = await db.update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  async getClientCampaigns(clientId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.clientId, clientId));
  }

  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }

  async getContactByEmail(email: string): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.email, email));
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact | undefined> {
    const result = await db.update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return result[0];
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }

  // List methods
  async getLists(): Promise<List[]> {
    return await db.select().from(lists);
  }

  async getList(id: number): Promise<List | undefined> {
    const result = await db.select().from(lists).where(eq(lists.id, id));
    return result[0];
  }

  async createList(list: InsertList): Promise<List> {
    const result = await db.insert(lists).values(list).returning();
    return result[0];
  }

  async updateList(id: number, list: Partial<List>): Promise<List | undefined> {
    const result = await db.update(lists)
      .set({
        ...list,
        updatedAt: new Date()
      })
      .where(eq(lists.id, id))
      .returning();
    return result[0];
  }

  async deleteList(id: number): Promise<boolean> {
    const result = await db.delete(lists).where(eq(lists.id, id)).returning();
    return result.length > 0;
  }

  // Contact-List methods
  async getContactLists(): Promise<ContactList[]> {
    return await db.select().from(contactLists);
  }

  async addContactToList(contactList: InsertContactList): Promise<ContactList> {
    const result = await db.insert(contactLists).values(contactList).returning();
    return result[0];
  }

  async removeContactFromList(contactId: number, listId: number): Promise<boolean> {
    const result = await db.delete(contactLists)
      .where(
        and(
          eq(contactLists.contactId, contactId),
          eq(contactLists.listId, listId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async getContactsByList(listId: number): Promise<Contact[]> {
    const relationRows = await db.select()
      .from(contactLists)
      .where(eq(contactLists.listId, listId));
    
    if (relationRows.length === 0) {
      return [];
    }

    const contactIds = relationRows.map(row => row.contactId);
    const contactResults = [];
    
    // Fetch each contact one by one to ensure typesafety
    for (const id of contactIds) {
      const contact = await this.getContact(id);
      if (contact) {
        contactResults.push(contact);
      }
    }
    
    return contactResults;
  }

  async getListsByContact(contactId: number): Promise<List[]> {
    const relationRows = await db.select()
      .from(contactLists)
      .where(eq(contactLists.contactId, contactId));
    
    if (relationRows.length === 0) {
      return [];
    }

    const listIds = relationRows.map(row => row.listId);
    const listResults = [];
    
    // Fetch each list one by one
    for (const id of listIds) {
      const list = await this.getList(id);
      if (list) {
        listResults.push(list);
      }
    }
    
    return listResults;
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result[0];
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const result = await db.insert(campaigns).values(campaign).returning();
    return result[0];
  }

  async updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined> {
    const result = await db.update(campaigns)
      .set({
        ...campaign,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, id))
      .returning();
    return result[0];
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();
    return result.length > 0;
  }

  // Email methods
  async getEmails(): Promise<Email[]> {
    return await db.select().from(emails);
  }

  async getEmail(id: number): Promise<Email | undefined> {
    const result = await db.select().from(emails).where(eq(emails.id, id));
    return result[0];
  }

  async createEmail(email: InsertEmail): Promise<Email> {
    const result = await db.insert(emails).values(email).returning();
    return result[0];
  }

  async updateEmail(id: number, email: Partial<Email>): Promise<Email | undefined> {
    const result = await db.update(emails)
      .set(email)
      .where(eq(emails.id, id))
      .returning();
    return result[0];
  }

  async deleteEmail(id: number): Promise<boolean> {
    const result = await db.delete(emails).where(eq(emails.id, id)).returning();
    return result.length > 0;
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.category, category));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id));
    return result[0];
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const result = await db.insert(templates).values(template).returning();
    return result[0];
  }

  async updateTemplate(id: number, template: Partial<Template>): Promise<Template | undefined> {
    const result = await db.update(templates)
      .set({
        ...template,
        updatedAt: new Date()
      })
      .where(eq(templates.id, id))
      .returning();
    return result[0];
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytics[]> {
    return await db.select().from(analytics);
  }

  async getAnalyticsByCampaign(campaignId: number): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.campaignId, campaignId));
  }

  async recordAnalytic(analytic: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values(analytic).returning();
    return result[0];
  }
  
  // Campaign Variant methods for A/B Testing
  async getCampaignVariants(campaignId: number): Promise<CampaignVariant[]> {
    return await db.select().from(campaignVariants).where(eq(campaignVariants.campaignId, campaignId));
  }
  
  async getCampaignVariant(id: number): Promise<CampaignVariant | undefined> {
    const result = await db.select().from(campaignVariants).where(eq(campaignVariants.id, id));
    return result[0];
  }
  
  async createCampaignVariant(variant: InsertCampaignVariant): Promise<CampaignVariant> {
    const result = await db.insert(campaignVariants).values(variant).returning();
    return result[0];
  }
  
  async updateCampaignVariant(id: number, variant: Partial<CampaignVariant>): Promise<CampaignVariant | undefined> {
    const result = await db.update(campaignVariants)
      .set({
        ...variant,
        updatedAt: new Date()
      })
      .where(eq(campaignVariants.id, id))
      .returning();
    return result[0];
  }
  
  async deleteCampaignVariant(id: number): Promise<boolean> {
    const result = await db.delete(campaignVariants).where(eq(campaignVariants.id, id)).returning();
    return result.length > 0;
  }
  
  // Variant Analytics methods for A/B Testing
  async getVariantAnalytics(variantId: number): Promise<VariantAnalytics[]> {
    return await db.select().from(variantAnalytics).where(eq(variantAnalytics.variantId, variantId));
  }
  
  async getVariantAnalyticsByCampaign(campaignId: number): Promise<VariantAnalytics[]> {
    return await db.select().from(variantAnalytics).where(eq(variantAnalytics.campaignId, campaignId));
  }
  
  async recordVariantAnalytic(analytic: InsertVariantAnalytics): Promise<VariantAnalytics> {
    const result = await db.insert(variantAnalytics).values(analytic).returning();
    return result[0];
  }
  
  // A/B Test specific methods
  async setWinningVariant(campaignId: number, variantId: number): Promise<Campaign | undefined> {
    return await this.updateCampaign(campaignId, { winningVariantId: variantId });
  }
  
  async getAbTestCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.isAbTest, true));
  }
  
  // Domain methods
  async getDomains(): Promise<Domain[]> {
    return await db.select().from(domains);
  }
  
  async getDomain(id: number): Promise<Domain | undefined> {
    const result = await db.select().from(domains).where(eq(domains.id, id));
    return result[0];
  }
  
  async getDomainByName(name: string): Promise<Domain | undefined> {
    const result = await db.select().from(domains).where(eq(domains.name, name));
    return result[0];
  }
  
  async createDomain(domain: InsertDomain): Promise<Domain> {
    const result = await db.insert(domains).values(domain).returning();
    return result[0];
  }
  
  async updateDomain(id: number, domain: Partial<Domain>): Promise<Domain | undefined> {
    // If this domain is set as default, unset default for all other domains
    if (domain.defaultDomain === true) {
      await db.update(domains)
        .set({ defaultDomain: false })
        .where(db.sql`${domains.id} != ${id}`);
    }
    
    const result = await db.update(domains)
      .set(domain)
      .where(eq(domains.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteDomain(id: number): Promise<boolean> {
    const result = await db.delete(domains).where(eq(domains.id, id)).returning();
    return result.length > 0;
  }
  
  async setDefaultDomain(id: number): Promise<Domain | undefined> {
    // Unset default for all domains
    await db.update(domains).set({ defaultDomain: false });
    
    // Set this domain as default
    const result = await db.update(domains)
      .set({ defaultDomain: true })
      .where(eq(domains.id, id))
      .returning();
    
    return result[0];
  }
  
  // Campaign-Domain methods
  async assignDomainToCampaign(campaignDomain: InsertCampaignDomain): Promise<CampaignDomain> {
    // Update the lastUsedAt field of the domain
    await db.update(domains)
      .set({ lastUsedAt: new Date() })
      .where(eq(domains.id, campaignDomain.domainId));
    
    const result = await db.insert(campaignDomains).values(campaignDomain).returning();
    return result[0];
  }
  
  async removeDomainFromCampaign(campaignId: number, domainId: number): Promise<boolean> {
    const result = await db.delete(campaignDomains)
      .where(
        and(
          eq(campaignDomains.campaignId, campaignId),
          eq(campaignDomains.domainId, domainId)
        )
      )
      .returning();
    
    return result.length > 0;
  }
  
  async getCampaignDomains(campaignId: number): Promise<Domain[]> {
    const relations = await db.select()
      .from(campaignDomains)
      .where(eq(campaignDomains.campaignId, campaignId));
    
    if (relations.length === 0) {
      return [];
    }
    
    const domainIds = relations.map(relation => relation.domainId);
    const domainResults = [];
    
    // Fetch each domain one by one
    for (const id of domainIds) {
      const domain = await this.getDomain(id);
      if (domain) {
        domainResults.push(domain);
      }
    }
    
    return domainResults;
  }
  
  async getDomainCampaigns(domainId: number): Promise<Campaign[]> {
    const relations = await db.select()
      .from(campaignDomains)
      .where(eq(campaignDomains.domainId, domainId));
    
    if (relations.length === 0) {
      return [];
    }
    
    const campaignIds = relations.map(relation => relation.campaignId);
    const campaignResults = [];
    
    // Fetch each campaign one by one
    for (const id of campaignIds) {
      const campaign = await this.getCampaign(id);
      if (campaign) {
        campaignResults.push(campaign);
      }
    }
    
    return campaignResults;
  }
  
  // Client User methods
  async getClientUsers(): Promise<ClientUser[]> {
    return await db.select().from(clientUsers);
  }
  
  async getClientUser(id: number): Promise<ClientUser | undefined> {
    const result = await db.select().from(clientUsers).where(eq(clientUsers.id, id));
    return result[0];
  }
  
  async getClientUserByUsername(username: string): Promise<ClientUser | undefined> {
    const result = await db.select().from(clientUsers).where(eq(clientUsers.username, username));
    return result[0];
  }
  
  async getClientUsersByClientId(clientId: number): Promise<ClientUser[]> {
    return await db.select().from(clientUsers).where(eq(clientUsers.clientId, clientId));
  }
  
  async createClientUser(clientUser: InsertClientUser): Promise<ClientUser> {
    const result = await db.insert(clientUsers).values(clientUser).returning();
    return result[0];
  }
  
  async updateClientUser(id: number, clientUser: Partial<ClientUser>): Promise<ClientUser | undefined> {
    const result = await db.update(clientUsers)
      .set(clientUser)
      .where(eq(clientUsers.id, id))
      .returning();
    return result[0];
  }
  
  async deleteClientUser(id: number): Promise<boolean> {
    const result = await db.delete(clientUsers).where(eq(clientUsers.id, id)).returning();
    return result.length > 0;
  }
  
  async verifyClientLogin(username: string, password: string): Promise<ClientUser | undefined> {
    const user = await this.getClientUserByUsername(username);
    if (!user) return undefined;
    
    // In a real implementation, we would use bcrypt to compare hashed passwords
    if (user.password === password) {
      // Update last login timestamp
      await this.updateClientUser(user.id, { lastLoginAt: new Date() });
      return user;
    }
    
    return undefined;
  }

  // Initialize the database with sample data
  async initializeWithSampleData() {
    try {
      log('Initializing database with sample data', 'db');
      
      // Check if we already have data
      const existingTemplates = await this.getTemplates();
      if (existingTemplates.length > 0) {
        log('Database already has data, skipping initialization', 'db');
        return;
      }

      // Add default templates
      await this.createTemplate({
        name: "Newsletter",
        description: "Standard newsletter layout",
        content: "<h1>Newsletter Template</h1><p>This is a sample newsletter template.</p>",
        category: "newsletter",
        metadata: { icon: "file-earmark-text", iconColor: "primary" }
      });

      await this.createTemplate({
        name: "Promotional",
        description: "For sales and offers",
        content: "<h1>Promotional Template</h1><p>This is a sample promotional template.</p>",
        category: "promotional",
        metadata: { icon: "megaphone", iconColor: "danger", selected: true }
      });

      await this.createTemplate({
        name: "Welcome",
        description: "For new subscribers",
        content: "<h1>Welcome Template</h1><p>This is a sample welcome template.</p>",
        category: "transactional",
        metadata: { icon: "envelope-check", iconColor: "success" }
      });

      // Add default lists
      await this.createList({
        name: "Newsletter Subscribers",
        description: "People who subscribed to the newsletter"
      });

      await this.createList({
        name: "Product Updates",
        description: "People interested in product updates"
      });

      await this.createList({
        name: "New Customers",
        description: "Recently acquired customers"
      });

      await this.createList({
        name: "VIP Members",
        description: "Premium customers"
      });

      // Add default campaigns
      await this.createCampaign({
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

      await this.createCampaign({
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

      await this.createCampaign({
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

      await this.createCampaign({
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
      
      // Create a sample A/B test campaign
      const abTestCampaign = await this.createCampaign({
        name: "Summer Sale A/B Test",
        subject: "Summer Specials Inside",
        previewText: "Check out our best summer deals",
        senderName: "Your Company",
        replyToEmail: "info@example.com",
        content: "<h1>Summer Sale</h1><p>Our main summer deals content...</p>",
        status: "draft",
        isAbTest: true,
        scheduledAt: new Date("2023-06-15T09:00:00"),
        metadata: {
          icon: { name: "sun-fill", color: "warning" },
          subtitle: "A/B Test",
          recipients: 0,
          openRate: 0,
          clickRate: 0,
          date: "June 15, 2023"
        }
      });
      
      // Create two variants for the A/B test
      await this.createCampaignVariant({
        campaignId: abTestCampaign.id,
        name: "Variant A - Discount Focus",
        subject: "Summer Sale: 30% OFF Everything",
        previewText: "Limited time summer discounts inside",
        content: "<h1>SUMMER SALE - 30% OFF</h1><p>Get huge discounts on all our summer products...</p>",
        weight: 50,
        metadata: { variantType: "discount" }
      });
      
      await this.createCampaignVariant({
        campaignId: abTestCampaign.id,
        name: "Variant B - Scarcity Focus",
        subject: "Summer Collection: Limited Stock",
        previewText: "Exclusive summer items before they're gone",
        content: "<h1>SUMMER COLLECTION - LIMITED STOCK</h1><p>Get our exclusive summer items before they sell out...</p>",
        weight: 50,
        metadata: { variantType: "scarcity" }
      });

      // Add default domains
      await this.createDomain({
        name: "marketing.example.com",
        status: "active",
        verified: true,
        defaultDomain: true,
        metadata: { 
          type: "primary",
          dkimVerified: true,
          spfVerified: true
        }
      });
      
      await this.createDomain({
        name: "newsletters.example.com",
        status: "active",
        verified: true,
        defaultDomain: false,
        metadata: { 
          type: "newsletters",
          dkimVerified: true,
          spfVerified: true
        }
      });
      
      await this.createDomain({
        name: "promos.example.com",
        status: "active",
        verified: true,
        defaultDomain: false,
        metadata: { 
          type: "promotions",
          dkimVerified: true,
          spfVerified: true
        }
      });
      
      // Add domains to campaigns
      await this.assignDomainToCampaign({
        campaignId: 1, // Monthly Newsletter
        domainId: 2,   // newsletters.example.com
        metadata: { primary: true }
      });
      
      await this.assignDomainToCampaign({
        campaignId: 2, // Product Launch
        domainId: 1,   // marketing.example.com
        metadata: { primary: true }
      });
      
      await this.assignDomainToCampaign({
        campaignId: 3, // Spring Sale
        domainId: 3,   // promos.example.com
        metadata: { primary: true }
      });
      
      log('Sample data initialization completed', 'db');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
}

// Create a singleton instance
export const dbStorage = new DbStorage();