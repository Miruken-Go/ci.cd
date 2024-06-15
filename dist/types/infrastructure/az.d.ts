export interface AZOptions {
    tenantId: string;
    subscriptionId: string;
    deploymentPipelineClientId: string;
    deploymentPipelineClientSecret: string;
}
export declare class AZ {
    options: AZOptions;
    loggedInToAZ: boolean;
    loggedInToACR: boolean;
    constructor(options: AZOptions);
    login(): Promise<void>;
    loginToACR(containerRepositoryName: string): Promise<void>;
    createResourceGroup(name: string, location: string, tags: Record<string, string>): Promise<void>;
    registerAzureProvider(providerName: string): Promise<void>;
    getAzureContainerRepositoryPassword(name: string): Promise<any>;
    getKeyVaultSecret(secretName: string, keyVaultName: string): Promise<any>;
    getContainerAppUrl(name: string, resourceGroup: string): Promise<any>;
    deleteOrphanedApplicationSecurityPrincipals(): Promise<void>;
}
