export interface Opts {
    name: string;
    env: string;
    instance?: string;
}
export declare class ResourceGroups {
    name: string;
    env: string;
    envInst?: string;
    constructor(opts: Opts);
    requireEnv(): void;
    get global(): string;
    get common(): string;
    get manual(): string;
    get stable(): string;
    get instance(): string;
}
interface B2CResourceOpts extends Opts {
    profile?: string;
}
export declare class B2CResource {
    cleanedName: string;
    env: string;
    profile: string;
    constructor(opts: B2CResourceOpts);
    get name(): string;
    get displayName(): string;
    get domainName(): string;
    get openIdConfigurationUrl(): string;
}
export declare class ContainerRepositoryResource {
    name: string;
    constructor(opts: Opts);
}
export declare class StorageResource {
    name: string;
    constructor(opts: Opts);
}
export declare class KeyVaultResource {
    opts: Opts;
    constructor(opts: Opts);
    get name(): string;
}
interface ApplicationOpts {
    name: string;
    implicitFlow?: boolean;
    spa?: boolean;
    enrichApi?: boolean;
    scopes?: string[];
    secrets?: string[];
}
export declare class Application {
    name: string;
    env: string;
    instance?: string;
    parent: Domain;
    resourceGroups: ResourceGroups;
    implicitFlow: boolean;
    spa: boolean;
    enrichApi: boolean;
    scopes: string[];
    secrets: string[];
    imageName: string;
    constructor(opts: ApplicationOpts, parent: Domain);
    resourcesByType<T extends Resource>(resourceType: {
        new (opts?: any): T;
    }): T[];
    get containerAppName(): string;
}
interface Resource {
    name: string;
}
interface DomainOpts extends Opts {
    parent?: Domain;
    location: string;
    gitRepositoryUrl: string;
    bootstrapUsers?: string[];
    resources?: Record<string, Resource>;
    applications?: ApplicationOpts[];
    domains?: DomainOpts[];
}
export declare class Domain {
    name: string;
    env: string;
    instance?: string;
    location: string;
    parent?: Domain;
    gitRepositoryUrl: string;
    resourceGroups: ResourceGroups;
    containerRepository?: ContainerRepositoryResource;
    domains: Domain[];
    applications: Application[];
    bootstrapUsers: string[];
    resources: Record<string, Resource>;
    constructor(opts: DomainOpts);
    get enrichApiApplication(): Application;
    getApplicationByName(name: string): Application;
}
export {};
