export declare class Git {
    constructor(ghToken: string);
    tagAndPush(tag: string): Promise<void>;
    anyChanges(): Promise<boolean>;
    commitAll(message: string): Promise<void>;
    push(): Promise<void>;
}
