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
}

// Create a singleton instance
export const emailService = new EmailService();