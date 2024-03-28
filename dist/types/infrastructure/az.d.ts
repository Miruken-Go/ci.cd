export declare class AZ {
    tenantId: string;
    subscriptionId: string;
    deploymentPipelineClientId: string;
    deploymentPipelineClientSecret: string;
    loggedInToAZ: boolean;
    loggedInToACR: boolean;
    constructor(tenantId: string, subscriptionId: string, deploymentPipelineClientId: string, deploymentPipelineClientSecret: string);
    login(): Promise<void>;
    loginToACR(containerRepositoryName: string): Promise<void>;
    createResourceGroup(name: string, location: string, tags: Record<string, string>): Promise<void>;
    registerAzureProvider(providerName: string): Promise<void>;
    getAzureContainerRepositoryPassword(name: string): Promise<any>;
    getKeyVaultSecret(secretName: string, keyVaultName: string): Promise<any>;
    getContainerAppUrl(name: string, resourceGroup: string): Promise<any>;
    deleteOrphanedApplicationSecurityPrincipals(name: string): Promise<void>;
}
