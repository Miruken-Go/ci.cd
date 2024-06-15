import { AZ } from './az';
import { Graph } from './graph';
import { Domain, B2CResource } from './config';
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
export interface B2COptions {
    domain: Domain;
    b2cResource: B2CResource;
    graph: Graph;
    az: AZ;
}
export declare class B2C {
    domain: Domain;
    b2cResource: B2CResource;
    graph: Graph;
    az: AZ;
    options: B2COptions;
    constructor(b2cOptions: B2COptions);
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
