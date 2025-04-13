import { IStorage } from './storage';
import { db } from './db';
import { eq, desc, and, gt, lt, isNull, count } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { log } from './vite';

/**
 * Implementation of the storage interface using PostgreSQL database
 */
export class DbStorage implements IStorage {
  constructor() {
    log('Database storage initialized', 'db-storage');
  }

  // Client methods
  async getClient(id: number) {
    try {
      const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, id));
      return client;
    } catch (error) {
      console.error('Error getting client:', error);
      return undefined;
    }
  }

  async getClientByEmail(email: string) {
    try {
      const [client] = await db.select().from(schema.clients).where(eq(schema.clients.email, email));
      return client;
    } catch (error) {
      console.error('Error getting client by email:', error);
      return undefined;
    }
  }

  async getClients() {
    try {
      const clients = await db.select().from(schema.clients).orderBy(desc(schema.clients.createdAt));
      return clients;
    } catch (error) {
      console.error('Error getting clients:', error);
      return [];
    }
  }

  async createClient(client: Omit<schema.InsertClient, 'id'>) {
    try {
      const [newClient] = await db.insert(schema.clients).values(client).returning();
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: number, update: Partial<schema.InsertClient>) {
    try {
      const [updatedClient] = await db
        .update(schema.clients)
        .set(update)
        .where(eq(schema.clients.id, id))
        .returning();
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      return undefined;
    }
  }

  async deleteClient(id: number) {
    try {
      const [deletedClient] = await db
        .delete(schema.clients)
        .where(eq(schema.clients.id, id))
        .returning();
      return deletedClient;
    } catch (error) {
      console.error('Error deleting client:', error);
      return undefined;
    }
  }

  // Client users methods
  async getClientUser(id: number) {
    try {
      const [user] = await db.select().from(schema.clientUsers).where(eq(schema.clientUsers.id, id));
      return user;
    } catch (error) {
      console.error('Error getting client user:', error);
      return undefined;
    }
  }

  async getClientUserByUsername(username: string) {
    try {
      const [user] = await db.select().from(schema.clientUsers).where(eq(schema.clientUsers.username, username));
      return user;
    } catch (error) {
      console.error('Error getting client user by username:', error);
      return undefined;
    }
  }

  async getClientUsers() {
    try {
      const users = await db.select().from(schema.clientUsers).orderBy(desc(schema.clientUsers.createdAt));
      return users;
    } catch (error) {
      console.error('Error getting client users:', error);
      return [];
    }
  }

  async getClientUsersByClientId(clientId: number) {
    try {
      const users = await db
        .select()
        .from(schema.clientUsers)
        .where(eq(schema.clientUsers.clientId, clientId))
        .orderBy(desc(schema.clientUsers.createdAt));
      return users;
    } catch (error) {
      console.error('Error getting client users by client ID:', error);
      return [];
    }
  }

  async createClientUser(user: Omit<schema.InsertClientUser, 'id'>) {
    try {
      const [newUser] = await db.insert(schema.clientUsers).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('Error creating client user:', error);
      throw error;
    }
  }

  async updateClientUser(id: number, update: Partial<schema.InsertClientUser>) {
    try {
      const [updatedUser] = await db
        .update(schema.clientUsers)
        .set(update)
        .where(eq(schema.clientUsers.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating client user:', error);
      return undefined;
    }
  }

  async deleteClientUser(id: number) {
    try {
      const [deletedUser] = await db
        .delete(schema.clientUsers)
        .where(eq(schema.clientUsers.id, id))
        .returning();
      return deletedUser;
    } catch (error) {
      console.error('Error deleting client user:', error);
      return undefined;
    }
  }

  // Admin user methods
  async getUser(id: number) {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUsers() {
    try {
      const users = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async createUser(user: Omit<schema.InsertUser, 'id'>) {
    try {
      const [newUser] = await db.insert(schema.users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, update: Partial<schema.InsertUser>) {
    try {
      const [updatedUser] = await db
        .update(schema.users)
        .set(update)
        .where(eq(schema.users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number) {
    try {
      const [deletedUser] = await db
        .delete(schema.users)
        .where(eq(schema.users.id, id))
        .returning();
      return deletedUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      return undefined;
    }
  }

  // Campaigns methods
  async getCampaign(id: number) {
    try {
      const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.id, id));
      return campaign;
    } catch (error) {
      console.error('Error getting campaign:', error);
      return undefined;
    }
  }

  async getCampaigns() {
    try {
      const campaigns = await db.select().from(schema.campaigns).orderBy(desc(schema.campaigns.createdAt));
      return campaigns;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return [];
    }
  }

  async createCampaign(campaign: Omit<schema.InsertCampaign, 'id'>) {
    try {
      const [newCampaign] = await db.insert(schema.campaigns).values(campaign).returning();
      return newCampaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaign(id: number, update: Partial<schema.InsertCampaign>) {
    try {
      const [updatedCampaign] = await db
        .update(schema.campaigns)
        .set(update)
        .where(eq(schema.campaigns.id, id))
        .returning();
      return updatedCampaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return undefined;
    }
  }

  async deleteCampaign(id: number) {
    try {
      const [deletedCampaign] = await db
        .delete(schema.campaigns)
        .where(eq(schema.campaigns.id, id))
        .returning();
      return deletedCampaign;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return undefined;
    }
  }

  // Email credits methods
  async getClientEmailCredits(clientId: number) {
    try {
      // Get latest credit information for the client
      const result = await db.query.clients.findFirst({
        where: eq(schema.clients.id, clientId),
        columns: {
          id: true,
          emailCredits: true,
          emailCreditsPurchased: true,
          emailCreditsUsed: true,
          lastCreditUpdateAt: true
        }
      });
      
      if (!result) return null;
      
      return {
        clientId: result.id,
        available: result.emailCredits || 0,
        purchased: result.emailCreditsPurchased || 0,
        used: result.emailCreditsUsed || 0,
        lastUpdated: result.lastCreditUpdateAt
      };
    } catch (error) {
      console.error('Error getting client email credits:', error);
      return null;
    }
  }
  
  async updateClientEmailCredits(clientId: number, credits: number, action: 'add' | 'deduct' | 'set', reason: string) {
    try {
      // Get current client to verify it exists and get current credits
      const client = await this.getClient(clientId);
      if (!client) throw new Error('Client not found');
      
      const currentCredits = client.emailCredits || 0;
      let newCredits = currentCredits;
      
      // Calculate the new credit balance based on action
      if (action === 'add') {
        newCredits = currentCredits + credits;
      } else if (action === 'deduct') {
        if (currentCredits < credits) throw new Error('Insufficient credits');
        newCredits = currentCredits - credits;
      } else if (action === 'set') {
        newCredits = credits;
      }

      // Update client credits
      const [updatedClient] = await db
        .update(schema.clients)
        .set({
          emailCredits: newCredits,
          emailCreditsPurchased: action === 'add' ? (client.emailCreditsPurchased || 0) + credits : client.emailCreditsPurchased,
          emailCreditsUsed: action === 'deduct' ? (client.emailCreditsUsed || 0) + credits : client.emailCreditsUsed,
          lastCreditUpdateAt: new Date()
        })
        .where(eq(schema.clients.id, clientId))
        .returning();
      
      // Record credit history
      const history = await this.addClientEmailCreditHistory(clientId, {
        amount: credits,
        type: action,
        previousBalance: currentCredits,
        newBalance: newCredits,
        reason: reason,
        performedBy: null,
        systemCreditsDeducted: 0
      });
      
      return {
        client: updatedClient,
        history: history,
        previousCredits: currentCredits,
        newCredits: newCredits
      };
    } catch (error) {
      console.error('Error updating client email credits:', error);
      throw error;
    }
  }

  async getClientEmailCreditsHistory(clientId: number, options: { 
    start_date?: string;
    end_date?: string;
    type?: '' | 'add' | 'deduct' | 'set';
    limit?: number;
  } = {}) {
    try {
      let query = db.select().from(schema.clientEmailCreditsHistory)
        .where(eq(schema.clientEmailCreditsHistory.clientId, clientId));
      
      // Apply filters
      if (options.start_date) {
        query = query.where(gt(schema.clientEmailCreditsHistory.createdAt, new Date(options.start_date)));
      }
      
      if (options.end_date) {
        query = query.where(lt(schema.clientEmailCreditsHistory.createdAt, new Date(options.end_date)));
      }
      
      if (options.type && options.type !== '') {
        query = query.where(eq(schema.clientEmailCreditsHistory.type, options.type));
      }
      
      // Apply sorting and limit
      query = query.orderBy(desc(schema.clientEmailCreditsHistory.createdAt));
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const history = await query;
      return history;
    } catch (error) {
      console.error('Error getting client email credits history:', error);
      return [];
    }
  }
  
  async addClientEmailCreditHistory(clientId: number, data: {
    amount: number;
    type: 'add' | 'deduct' | 'set';
    previousBalance: number;
    newBalance: number;
    reason: string;
    performedBy: number | null;
    systemCreditsDeducted: number | null;
  }) {
    try {
      const [history] = await db.insert(schema.clientEmailCreditsHistory)
        .values({
          clientId,
          amount: data.amount,
          type: data.type,
          previousBalance: data.previousBalance,
          newBalance: data.newBalance,
          reason: data.reason,
          performedBy: data.performedBy,
          systemCreditsDeducted: data.systemCreditsDeducted,
          metadata: {
            action: data.type === 'add' ? 'added' : data.type === 'deduct' ? 'deducted' : 'set',
            adminAction: data.performedBy !== null,
            systemAction: data.systemCreditsDeducted !== null && data.systemCreditsDeducted > 0
          },
          createdAt: new Date()
        })
        .returning();
      
      return history;
    } catch (error) {
      console.error('Error adding client email credit history:', error);
      throw error;
    }
  }

  // System credits methods
  async getSystemCredits() {
    try {
      const [systemCredits] = await db.select().from(schema.systemCredits).limit(1);
      if (!systemCredits) {
        // Initialize system credits if they don't exist
        return this.initializeSystemCredits();
      }
      return systemCredits;
    } catch (error) {
      console.error('Error getting system credits:', error);
      return null;
    }
  }
  
  private async initializeSystemCredits() {
    try {
      const [systemCredits] = await db.insert(schema.systemCredits)
        .values({
          totalCredits: 0,
          allocatedCredits: 0,
          availableCredits: 0,
          lastUpdatedAt: new Date()
        })
        .returning();
      
      return systemCredits;
    } catch (error) {
      console.error('Error initializing system credits:', error);
      throw error;
    }
  }
  
  async updateSystemCredits(params: {
    totalCredits?: number;
    allocatedCredits?: number;
    availableCredits?: number;
  }) {
    try {
      // Get current system credits
      const currentSystemCredits = await this.getSystemCredits();
      if (!currentSystemCredits) throw new Error('System credits not found');
      
      // Update system credits
      const [updatedSystemCredits] = await db.update(schema.systemCredits)
        .set({
          ...params,
          lastUpdatedAt: new Date()
        })
        .where(eq(schema.systemCredits.id, currentSystemCredits.id))
        .returning();
      
      return updatedSystemCredits;
    } catch (error) {
      console.error('Error updating system credits:', error);
      throw error;
    }
  }
  
  async addSystemCredits(amount: number, reason: string) {
    try {
      // Get current system credits
      const currentSystemCredits = await this.getSystemCredits();
      if (!currentSystemCredits) throw new Error('System credits not found');
      
      const currentTotal = currentSystemCredits.totalCredits;
      const currentAvailable = currentSystemCredits.availableCredits;
      
      // Update system credits
      const updatedSystemCredits = await this.updateSystemCredits({
        totalCredits: currentTotal + amount,
        availableCredits: currentAvailable + amount
      });
      
      // Record system credits history
      const history = await this.addSystemCreditsHistory({
        amount,
        type: 'add',
        previousBalance: currentTotal,
        newBalance: currentTotal + amount,
        reason,
        performedBy: null,
        clientId: null
      });
      
      return {
        systemCredits: updatedSystemCredits,
        history,
        previousTotal: currentTotal,
        newTotal: currentTotal + amount
      };
    } catch (error) {
      console.error('Error adding system credits:', error);
      throw error;
    }
  }
  
  async deductSystemCredits(amount: number, reason: string) {
    try {
      // Get current system credits
      const currentSystemCredits = await this.getSystemCredits();
      if (!currentSystemCredits) throw new Error('System credits not found');
      
      const currentTotal = currentSystemCredits.totalCredits;
      const currentAvailable = currentSystemCredits.availableCredits;
      
      // Check if there are enough available credits
      if (currentAvailable < amount) {
        throw new Error('Insufficient available system credits');
      }
      
      // Update system credits
      const updatedSystemCredits = await this.updateSystemCredits({
        totalCredits: currentTotal - amount,
        availableCredits: currentAvailable - amount
      });
      
      // Record system credits history
      const history = await this.addSystemCreditsHistory({
        amount,
        type: 'deduct',
        previousBalance: currentTotal,
        newBalance: currentTotal - amount,
        reason,
        performedBy: null,
        clientId: null
      });
      
      return {
        systemCredits: updatedSystemCredits,
        history,
        previousTotal: currentTotal,
        newTotal: currentTotal - amount
      };
    } catch (error) {
      console.error('Error deducting system credits:', error);
      throw error;
    }
  }
  
  async allocateSystemCreditsToClient(clientId: number, amount: number, reason: string) {
    try {
      // Get current system credits
      const currentSystemCredits = await this.getSystemCredits();
      if (!currentSystemCredits) throw new Error('System credits not found');
      
      const currentAvailable = currentSystemCredits.availableCredits;
      const currentAllocated = currentSystemCredits.allocatedCredits;
      
      // Check if there are enough available credits
      if (currentAvailable < amount) {
        throw new Error('Insufficient available system credits');
      }
      
      // Update system credits - move from available to allocated
      const updatedSystemCredits = await this.updateSystemCredits({
        availableCredits: currentAvailable - amount,
        allocatedCredits: currentAllocated + amount
      });
      
      // Record system credits history
      const sysHistory = await this.addSystemCreditsHistory({
        amount,
        type: 'allocate',
        previousBalance: currentAvailable,
        newBalance: currentAvailable - amount,
        reason,
        performedBy: null,
        clientId
      });
      
      // Add credits to client
      const clientUpdate = await this.updateClientEmailCredits(clientId, amount, 'add', 'Allocated from system pool: ' + reason);
      
      return {
        systemCredits: updatedSystemCredits,
        systemHistory: sysHistory,
        clientUpdate,
        previousAvailable: currentAvailable,
        newAvailable: currentAvailable - amount
      };
    } catch (error) {
      console.error('Error allocating system credits to client:', error);
      throw error;
    }
  }
  
  async getSystemCreditsHistory(options: {
    start_date?: string;
    end_date?: string;
    type?: '' | 'add' | 'deduct' | 'allocate';
    limit?: number;
  } = {}) {
    try {
      let query = db.select().from(schema.systemCreditsHistory);
      
      // Apply filters
      if (options.start_date) {
        query = query.where(gt(schema.systemCreditsHistory.createdAt, new Date(options.start_date)));
      }
      
      if (options.end_date) {
        query = query.where(lt(schema.systemCreditsHistory.createdAt, new Date(options.end_date)));
      }
      
      if (options.type && options.type !== '') {
        query = query.where(eq(schema.systemCreditsHistory.type, options.type));
      }
      
      // Apply sorting and limit
      query = query.orderBy(desc(schema.systemCreditsHistory.createdAt));
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const history = await query;
      return history;
    } catch (error) {
      console.error('Error getting system credits history:', error);
      return [];
    }
  }
  
  async addSystemCreditsHistory(data: {
    amount: number;
    type: 'add' | 'deduct' | 'allocate';
    previousBalance: number;
    newBalance: number;
    reason: string;
    performedBy: number | null;
    clientId: number | null;
  }) {
    try {
      const [history] = await db.insert(schema.systemCreditsHistory)
        .values({
          amount: data.amount,
          type: data.type,
          previousBalance: data.previousBalance,
          newBalance: data.newBalance,
          reason: data.reason,
          performedBy: data.performedBy,
          clientId: data.clientId,
          metadata: {
            action: data.type === 'add' ? 'added' : data.type === 'deduct' ? 'deducted' : 'allocated',
            adminAction: data.performedBy !== null,
            systemAction: true
          },
          createdAt: new Date()
        })
        .returning();
      
      return history;
    } catch (error) {
      console.error('Error adding system credits history:', error);
      throw error;
    }
  }

  // Contacts methods
  async getContact(id: number) {
    try {
      const [contact] = await db.select().from(schema.contacts).where(eq(schema.contacts.id, id));
      return contact;
    } catch (error) {
      console.error('Error getting contact:', error);
      return undefined;
    }
  }

  async getContacts() {
    try {
      const contacts = await db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt));
      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async getContactByEmail(email: string) {
    try {
      const [contact] = await db.select().from(schema.contacts).where(eq(schema.contacts.email, email));
      return contact;
    } catch (error) {
      console.error('Error getting contact by email:', error);
      return undefined;
    }
  }

  async createContact(contact: Omit<schema.InsertContact, 'id'>) {
    try {
      const [newContact] = await db.insert(schema.contacts).values(contact).returning();
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async updateContact(id: number, update: Partial<schema.InsertContact>) {
    try {
      const [updatedContact] = await db
        .update(schema.contacts)
        .set(update)
        .where(eq(schema.contacts.id, id))
        .returning();
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      return undefined;
    }
  }

  async deleteContact(id: number) {
    try {
      const [deletedContact] = await db
        .delete(schema.contacts)
        .where(eq(schema.contacts.id, id))
        .returning();
      return deletedContact;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return undefined;
    }
  }

  // Contact lists methods
  async getList(id: number) {
    try {
      const [list] = await db.select().from(schema.contactLists).where(eq(schema.contactLists.id, id));
      return list;
    } catch (error) {
      console.error('Error getting list:', error);
      return undefined;
    }
  }

  async getLists() {
    try {
      const lists = await db.select().from(schema.contactLists).orderBy(desc(schema.contactLists.createdAt));
      return lists;
    } catch (error) {
      console.error('Error getting lists:', error);
      return [];
    }
  }

  async createList(list: Omit<schema.InsertContactList, 'id'>) {
    try {
      const [newList] = await db.insert(schema.contactLists).values(list).returning();
      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }

  async updateList(id: number, update: Partial<schema.InsertContactList>) {
    try {
      const [updatedList] = await db
        .update(schema.contactLists)
        .set(update)
        .where(eq(schema.contactLists.id, id))
        .returning();
      return updatedList;
    } catch (error) {
      console.error('Error updating list:', error);
      return undefined;
    }
  }

  async deleteList(id: number) {
    try {
      const [deletedList] = await db
        .delete(schema.contactLists)
        .where(eq(schema.contactLists.id, id))
        .returning();
      return deletedList;
    } catch (error) {
      console.error('Error deleting list:', error);
      return undefined;
    }
  }

  async getContactListRelations(contactId: number, listId?: number) {
    try {
      let query = db.select().from(schema.contactListRelations).where(eq(schema.contactListRelations.contactId, contactId));
      
      if (listId) {
        query = query.where(eq(schema.contactListRelations.listId, listId));
      }
      
      const relations = await query;
      return relations;
    } catch (error) {
      console.error('Error getting contact list relations:', error);
      return [];
    }
  }

  async addContactToList(contactId: number, listId: number) {
    try {
      // Check if the relation already exists
      const existing = await db.select()
        .from(schema.contactListRelations)
        .where(and(
          eq(schema.contactListRelations.contactId, contactId),
          eq(schema.contactListRelations.listId, listId)
        ));
      
      if (existing.length > 0) {
        return existing[0]; // Relation already exists
      }
      
      // Create a new relation
      const [relation] = await db.insert(schema.contactListRelations)
        .values({
          contactId,
          listId,
          addedAt: new Date()
        })
        .returning();
      
      return relation;
    } catch (error) {
      console.error('Error adding contact to list:', error);
      throw error;
    }
  }

  async removeContactFromList(contactId: number, listId: number) {
    try {
      const [deletedRelation] = await db.delete(schema.contactListRelations)
        .where(and(
          eq(schema.contactListRelations.contactId, contactId),
          eq(schema.contactListRelations.listId, listId)
        ))
        .returning();
      
      return deletedRelation;
    } catch (error) {
      console.error('Error removing contact from list:', error);
      return undefined;
    }
  }

  async getContactsInList(listId: number) {
    try {
      // Join contact_list_relations with contacts
      const contactsInList = await db.select({
        contact: schema.contacts
      })
      .from(schema.contactListRelations)
      .innerJoin(schema.contacts, eq(schema.contactListRelations.contactId, schema.contacts.id))
      .where(eq(schema.contactListRelations.listId, listId));
      
      return contactsInList.map(item => item.contact);
    } catch (error) {
      console.error('Error getting contacts in list:', error);
      return [];
    }
  }

  async getContactLists(contactId: number) {
    try {
      // Join contact_list_relations with contact_lists
      const lists = await db.select({
        list: schema.contactLists
      })
      .from(schema.contactListRelations)
      .innerJoin(schema.contactLists, eq(schema.contactListRelations.listId, schema.contactLists.id))
      .where(eq(schema.contactListRelations.contactId, contactId));
      
      return lists.map(item => item.list);
    } catch (error) {
      console.error('Error getting contact lists:', error);
      return [];
    }
  }

  async getListCount(listId: number) {
    try {
      const result = await db.select({
        count: count()
      })
      .from(schema.contactListRelations)
      .where(eq(schema.contactListRelations.listId, listId));
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting list count:', error);
      return 0;
    }
  }

  // Templates methods
  async getTemplate(id: number) {
    try {
      const [template] = await db.select().from(schema.templates).where(eq(schema.templates.id, id));
      return template;
    } catch (error) {
      console.error('Error getting template:', error);
      return undefined;
    }
  }

  async getTemplates() {
    try {
      const templates = await db.select().from(schema.templates).orderBy(desc(schema.templates.createdAt));
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  async createTemplate(template: Omit<schema.InsertTemplate, 'id'>) {
    try {
      const [newTemplate] = await db.insert(schema.templates).values(template).returning();
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async updateTemplate(id: number, update: Partial<schema.InsertTemplate>) {
    try {
      const [updatedTemplate] = await db
        .update(schema.templates)
        .set(update)
        .where(eq(schema.templates.id, id))
        .returning();
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      return undefined;
    }
  }

  async deleteTemplate(id: number) {
    try {
      const [deletedTemplate] = await db
        .delete(schema.templates)
        .where(eq(schema.templates.id, id))
        .returning();
      return deletedTemplate;
    } catch (error) {
      console.error('Error deleting template:', error);
      return undefined;
    }
  }

  // Domain methods
  async getDomain(id: number) {
    try {
      const [domain] = await db.select().from(schema.domains).where(eq(schema.domains.id, id));
      return domain;
    } catch (error) {
      console.error('Error getting domain:', error);
      return undefined;
    }
  }

  async getDomains() {
    try {
      const domains = await db.select().from(schema.domains).orderBy(desc(schema.domains.createdAt));
      return domains;
    } catch (error) {
      console.error('Error getting domains:', error);
      return [];
    }
  }

  async getDomainByName(name: string) {
    try {
      const [domain] = await db.select().from(schema.domains).where(eq(schema.domains.name, name));
      return domain;
    } catch (error) {
      console.error('Error getting domain by name:', error);
      return undefined;
    }
  }

  async createDomain(domain: Omit<schema.InsertDomain, 'id'>) {
    try {
      // If this is the first domain, make it the default
      let isDefault = false;
      const existingDomains = await this.getDomains();
      if (existingDomains.length === 0) {
        isDefault = true;
      }
      
      const [newDomain] = await db.insert(schema.domains)
        .values({
          ...domain,
          defaultDomain: isDefault
        })
        .returning();
      
      return newDomain;
    } catch (error) {
      console.error('Error creating domain:', error);
      throw error;
    }
  }

  async updateDomain(id: number, update: Partial<schema.InsertDomain>) {
    try {
      const [updatedDomain] = await db
        .update(schema.domains)
        .set(update)
        .where(eq(schema.domains.id, id))
        .returning();
      return updatedDomain;
    } catch (error) {
      console.error('Error updating domain:', error);
      return undefined;
    }
  }

  async deleteDomain(id: number) {
    try {
      const domain = await this.getDomain(id);
      if (!domain) return undefined;
      
      // If this is the default domain, don't allow deletion
      if (domain.defaultDomain) {
        throw new Error('Cannot delete the default domain');
      }
      
      const [deletedDomain] = await db
        .delete(schema.domains)
        .where(eq(schema.domains.id, id))
        .returning();
      
      return deletedDomain;
    } catch (error) {
      console.error('Error deleting domain:', error);
      throw error;
    }
  }

  async setDefaultDomain(id: number) {
    try {
      // Clear default from all domains
      await db.update(schema.domains)
        .set({ defaultDomain: false })
        .where(eq(schema.domains.defaultDomain, true));
      
      // Set the new default
      const [updatedDomain] = await db
        .update(schema.domains)
        .set({ defaultDomain: true })
        .where(eq(schema.domains.id, id))
        .returning();
      
      return updatedDomain;
    } catch (error) {
      console.error('Error setting default domain:', error);
      return undefined;
    }
  }

  async getDefaultDomain() {
    try {
      const [domain] = await db
        .select()
        .from(schema.domains)
        .where(eq(schema.domains.defaultDomain, true));
      
      return domain;
    } catch (error) {
      console.error('Error getting default domain:', error);
      return undefined;
    }
  }

  // Campaign domain relations methods
  async getCampaignDomains(campaignId: number) {
    try {
      // Join campaignDomainRelations with domains
      const domains = await db.select({
        domain: schema.domains
      })
      .from(schema.campaignDomainRelations)
      .innerJoin(schema.domains, eq(schema.campaignDomainRelations.domainId, schema.domains.id))
      .where(eq(schema.campaignDomainRelations.campaignId, campaignId));
      
      return domains.map(item => item.domain);
    } catch (error) {
      console.error('Error getting campaign domains:', error);
      return [];
    }
  }

  async getDomainCampaigns(domainId: number) {
    try {
      // Join campaignDomainRelations with campaigns
      const campaigns = await db.select({
        campaign: schema.campaigns
      })
      .from(schema.campaignDomainRelations)
      .innerJoin(schema.campaigns, eq(schema.campaignDomainRelations.campaignId, schema.campaigns.id))
      .where(eq(schema.campaignDomainRelations.domainId, domainId));
      
      return campaigns.map(item => item.campaign);
    } catch (error) {
      console.error('Error getting domain campaigns:', error);
      return [];
    }
  }

  async addDomainToCampaign(campaignId: number, domainId: number) {
    try {
      // Check if the relation already exists
      const existing = await db
        .select()
        .from(schema.campaignDomainRelations)
        .where(and(
          eq(schema.campaignDomainRelations.campaignId, campaignId),
          eq(schema.campaignDomainRelations.domainId, domainId)
        ));
      
      if (existing.length > 0) {
        return existing[0]; // Relation already exists
      }
      
      // Create a new relation
      const [relation] = await db
        .insert(schema.campaignDomainRelations)
        .values({
          campaignId,
          domainId,
          createdAt: new Date(),
          metadata: {}
        })
        .returning();
      
      return relation;
    } catch (error) {
      console.error('Error adding domain to campaign:', error);
      throw error;
    }
  }

  async removeDomainFromCampaign(campaignId: number, domainId: number) {
    try {
      const [deletedRelation] = await db
        .delete(schema.campaignDomainRelations)
        .where(and(
          eq(schema.campaignDomainRelations.campaignId, campaignId),
          eq(schema.campaignDomainRelations.domainId, domainId)
        ))
        .returning();
      
      return deletedRelation;
    } catch (error) {
      console.error('Error removing domain from campaign:', error);
      return undefined;
    }
  }

  // Email methods
  async getEmail(id: number) {
    try {
      const [email] = await db.select().from(schema.emails).where(eq(schema.emails.id, id));
      return email;
    } catch (error) {
      console.error('Error getting email:', error);
      return undefined;
    }
  }

  async getEmails() {
    try {
      const emails = await db.select().from(schema.emails).orderBy(desc(schema.emails.createdAt));
      return emails;
    } catch (error) {
      console.error('Error getting emails:', error);
      return [];
    }
  }

  async createEmail(email: Omit<schema.InsertEmail, 'id'>) {
    try {
      const [newEmail] = await db.insert(schema.emails).values(email).returning();
      return newEmail;
    } catch (error) {
      console.error('Error creating email:', error);
      throw error;
    }
  }

  async updateEmail(id: number, update: Partial<schema.InsertEmail>) {
    try {
      const [updatedEmail] = await db
        .update(schema.emails)
        .set(update)
        .where(eq(schema.emails.id, id))
        .returning();
      return updatedEmail;
    } catch (error) {
      console.error('Error updating email:', error);
      return undefined;
    }
  }

  async deleteEmail(id: number) {
    try {
      const [deletedEmail] = await db
        .delete(schema.emails)
        .where(eq(schema.emails.id, id))
        .returning();
      return deletedEmail;
    } catch (error) {
      console.error('Error deleting email:', error);
      return undefined;
    }
  }

  // Campaign analytics methods
  async getCampaignAnalytics(campaignId: number) {
    try {
      const analytics = await db
        .select()
        .from(schema.campaignAnalytics)
        .where(eq(schema.campaignAnalytics.campaignId, campaignId))
        .orderBy(desc(schema.campaignAnalytics.date));
      
      return analytics;
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      return [];
    }
  }

  async createCampaignAnalytics(analytics: Omit<schema.InsertCampaignAnalytics, 'id'>) {
    try {
      const [newAnalytics] = await db
        .insert(schema.campaignAnalytics)
        .values(analytics)
        .returning();
      
      return newAnalytics;
    } catch (error) {
      console.error('Error creating campaign analytics:', error);
      throw error;
    }
  }

  async updateCampaignAnalytics(id: number, update: Partial<schema.InsertCampaignAnalytics>) {
    try {
      const [updatedAnalytics] = await db
        .update(schema.campaignAnalytics)
        .set(update)
        .where(eq(schema.campaignAnalytics.id, id))
        .returning();
      
      return updatedAnalytics;
    } catch (error) {
      console.error('Error updating campaign analytics:', error);
      return undefined;
    }
  }

  // Other methods required by IStorage interface
  // These are placeholders to satisfy the interface and should be implemented as needed
  getContactsCount() { return Promise.resolve(0); }
  getListsCount() { return Promise.resolve(0); }
  getTemplatesCount() { return Promise.resolve(0); }
  getCampaignsCount() { return Promise.resolve(0); }
  getDomainVerificationStatus() { return Promise.resolve({ success: false, details: 'Not implemented' }); }
  updateDomainVerificationStatus() { return Promise.resolve(false); }
  getEmailOpen() { return Promise.resolve(undefined); }
  createEmailOpen() { return Promise.resolve(undefined); }
  getEmailClick() { return Promise.resolve(undefined); }
  createEmailClick() { return Promise.resolve(undefined); }
  getCampaignPerformance() { return Promise.resolve(undefined); }
  createCampaignPerformance() { return Promise.resolve(undefined); }
  updateCampaignPerformance() { return Promise.resolve(undefined); }
  getCampaignLink() { return Promise.resolve(undefined); }
  getCampaignLinks() { return Promise.resolve([]); }
  createCampaignLink() { return Promise.resolve(undefined); }
  updateCampaignLink() { return Promise.resolve(undefined); }
  getAudiencePersona() { return Promise.resolve(undefined); }
  getAudiencePersonas() { return Promise.resolve([]); }
  createAudiencePersona() { return Promise.resolve(undefined); }
  updateAudiencePersona() { return Promise.resolve(undefined); }
  deleteAudiencePersona() { return Promise.resolve(undefined); }
  getPersonaDemographics() { return Promise.resolve(undefined); }
  createPersonaDemographics() { return Promise.resolve(undefined); }
  updatePersonaDemographics() { return Promise.resolve(undefined); }
  getPersonaBehavior() { return Promise.resolve(undefined); }
  createPersonaBehavior() { return Promise.resolve(undefined); }
  updatePersonaBehavior() { return Promise.resolve(undefined); }
  getPersonaInsight() { return Promise.resolve(undefined); }
  getPersonaInsights() { return Promise.resolve([]); }
  createPersonaInsight() { return Promise.resolve(undefined); }
  updatePersonaInsight() { return Promise.resolve(undefined); }
  getSegment() { return Promise.resolve(undefined); }
  getSegments() { return Promise.resolve([]); }
  createSegment() { return Promise.resolve(undefined); }
  updateSegment() { return Promise.resolve(undefined); }
  deleteSegment() { return Promise.resolve(undefined); }
}

// Create a singleton instance of the database storage
export const dbStorage = new DbStorage();