interface ghConfig {
    ghToken: string;
    repository: string;
    repositoryOwner: string;
    ref: string;
    skipRepositoryDispatches?: boolean;
}
export declare class GH {
    config: ghConfig;
    constructor(config: ghConfig);
    sendRepositoryDispatch(eventType: string, payload: object, repository: string): Promise<void>;
    sendRepositoryDispatches(eventType: string, payload: object): Promise<void>;
}
export {};
