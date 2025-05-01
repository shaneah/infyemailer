import { Express } from "express";
import aiAssistantRoutes from "./aiAssistantRoutes";
import { log } from "../helpers/logger";

export function registerAIAssistantRoutes(app: Express): void {
  // Register AI Assistant routes under the /api/ai-assistant path
  app.use('/api/ai-assistant', aiAssistantRoutes);
  
  log('Registering AI Assistant routes', 'server');
}