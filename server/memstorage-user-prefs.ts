// User preferences methods for MemStorage
async getUserPreferences(userId: number): Promise<any> {
  const user = await this.getUser(userId);
  if (!user) return null;
  
  // Get preferences from metadata or return default empty object
  const metadata = user.metadata as any || {};
  return metadata.preferences || { dashboardLayout: null };
}

async updateUserPreferences(userId: number, preferences: any): Promise<boolean> {
  const user = await this.getUser(userId);
  if (!user) return false;
  
  // Get current metadata or initialize as empty object
  const metadata = (user.metadata as any) || {};
  
  // Update preferences in metadata
  metadata.preferences = {
    ...(metadata.preferences || {}),
    ...preferences
  };
  
  // Update user with new metadata
  await this.updateUser(userId, { metadata });
  return true;
}

async getClientUserPreferences(clientUserId: number): Promise<any> {
  const clientUser = await this.getClientUser(clientUserId);
  if (!clientUser) return null;
  
  // Get preferences from metadata or return default empty object
  const metadata = clientUser.metadata as any || {};
  return metadata.preferences || { dashboardLayout: null };
}

async updateClientUserPreferences(clientUserId: number, preferences: any): Promise<boolean> {
  const clientUser = await this.getClientUser(clientUserId);
  if (!clientUser) return false;
  
  // Get current metadata or initialize as empty object
  const metadata = (clientUser.metadata as any) || {};
  
  // Update preferences in metadata
  metadata.preferences = {
    ...(metadata.preferences || {}),
    ...preferences
  };
  
  // Update client user with new metadata
  await this.updateClientUser(clientUserId, { metadata });
  return true;
}