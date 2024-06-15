interface ghOptions {
    ghToken: string;
    repository: string;
    repositoryOwner: string;
    ref: string;
    skipRepositoryDispatches?: boolean;
}
export declare class GH {
    options: ghOptions;
    constructor(options: ghOptions);
    sendRepositoryDispatch(eventType: string, payload: object, repository: string): Promise<void>;
    sendRepositoryDispatches(eventType: string, payload: object): Promise<void>;
}
export {};
