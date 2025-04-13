import { 
  IEmailProvider, 
  SendEmailParams, 
  VerifyDomainParams, 
  DomainVerificationResult,
  EmailProviderFactory,
  EmailProviderType
} from './emailProviders';

/**
 * Service for handling email operations using different providers
 */
export class EmailService {
  private providers: Map<string, IEmailProvider> = new Map();
  private defaultProvider: IEmailProvider | null = null;
  
  /**
   * Register an email provider with the service
   */
  registerProvider(name: string, provider: IEmailProvider): void {
    this.providers.set(name, provider);
    
    // Set as default if it's the first provider
    if (!this.defaultProvider) {
      this.defaultProvider = provider;
    }
  }
  
  /**
   * Register a provider using the factory
   */
  registerProviderWithFactory(
    name: string, 
    providerType: EmailProviderType, 
    config: Record<string, any>
  ): IEmailProvider {
    const provider = EmailProviderFactory.createProvider(providerType, config);
    this.registerProvider(name, provider);
    return provider;
  }
  
  /**
   * Set the default provider
   */
  setDefaultProvider(name: string): void {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.defaultProvider = provider;
  }
  
  /**
   * Send an email using a specific provider or the default
   */
  async sendEmail(
    params: SendEmailParams, 
    providerName?: string
  ): Promise<boolean> {
    const provider = providerName 
      ? this.getProvider(providerName) 
      : this.getDefaultProvider();
    
    return provider.sendEmail(params);
  }
  
  /**
   * Verify domain authentication using a specific provider
   */
  async verifyDomainAuthentication(
    params: VerifyDomainParams, 
    providerName: string
  ): Promise<DomainVerificationResult> {
    const provider = this.getProvider(providerName);
    return provider.verifyDomainAuthentication(params);
  }
  
  /**
   * Get a provider by name
   */
  getProvider(name: string): IEmailProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not registered`);
    }
    return provider;
  }
  
  /**
   * Get the default provider
   */
  getDefaultProvider(): IEmailProvider {
    if (!this.defaultProvider) {
      throw new Error('No default provider set');
    }
    return this.defaultProvider;
  }
  
  /**
   * Get all registered providers
   */
  getAllProviders(): { name: string, provider: IEmailProvider }[] {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      provider
    }));
  }
  
  /**
   * Check if a provider is registered
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }
  
  /**
   * Check if a provider is the default provider
   */
  isDefaultProvider(name: string): boolean {
    if (!this.defaultProvider) return false;
    
    const provider = this.providers.get(name);
    if (!provider) return false;
    
    return provider === this.defaultProvider;
  }
  
  /**
   * Get the name of the default provider
   */
  getDefaultProviderName(): string | undefined {
    if (!this.defaultProvider) return undefined;
    
    // Convert entries to array first to avoid iterator issues
    const providersArray = Array.from(this.providers.entries());
    
    for (const [name, provider] of providersArray) {
      if (provider === this.defaultProvider) {
        return name;
      }
    }
    
    return undefined;
  }
}

// Create a singleton instance
export const emailService = new EmailService();