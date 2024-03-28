import { AZ } from './az';
import { Graph } from './graph';
import { Domain, B2CNames } from './config';
interface OAuthPermissionScope {
    id: string;
    adminConsentDescription: string;
    adminConsentDisplayName: string;
    isEnabled: boolean;
    type: string;
    value: string;
}
interface ResourceAccess {
    id: string;
    type: string;
}
interface RequiredResourceAccess {
    resourceAppId: string;
    resourceAccess: ResourceAccess[];
}
interface B2cApplication {
    id?: string;
    appId?: string;
    displayName: string;
    signInAudience?: string;
    spa?: {
        redirectUris: string[];
    };
    identifierUris?: string[];
    api?: {
        requestedAccessTokenVersion: number;
        oauth2PermissionScopes: OAuthPermissionScope[];
    };
    requiredResourceAccess?: RequiredResourceAccess[];
    web?: {
        implicitGrantSettings: {
            enableAccessTokenIssuance: boolean;
            enableIdTokenIssuance: boolean;
        };
    };
}
export declare class B2C {
    domain: Domain;
    graph: Graph;
    b2cNames: B2CNames;
    az: AZ;
    constructor(domain: Domain, b2cNames: B2CNames, tenantId: string, subscriptionId: string, deploymentPipelineClientId: string, deploymentPipelineClientSecret: string, b2cDeploymentPipelineClientId: string, b2cDeploymentPipelineClientSecret: string);
    getWellKnownOpenIdConfiguration(): Promise<any>;
    getApplications(): Promise<B2cApplication[]>;
    getApplicationById(id: string): Promise<B2cApplication>;
    getApplicationByName(displayName: string): Promise<B2cApplication | undefined>;
    updateApplication(id: string, manifest: object): Promise<B2cApplication>;
    createOrUpdateApplication(manifest: B2cApplication): Promise<any>;
    addRedirectUris(id: string, uris: string[]): Promise<B2cApplication>;
    configureAppRegistrations(): Promise<void>;
    configureAppRegistration(domain: Domain): Promise<void>;
    configureCustomPolicies(customPoliciesDirectory: string): Promise<void>;
    logError(error: any): void;
}
export {};
