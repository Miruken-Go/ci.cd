export declare class Git {
    configured: Promise<void>;
    constructor(ghToken: string);
    configure(ghToken: string): Promise<void>;
    tagAndPush(tag: string): Promise<void>;
    anyChanges(): Promise<boolean>;
    commitAll(message: string): Promise<void>;
    addAndCommit(selector: string, message: string): Promise<void>;
    push(): Promise<void>;
    findGitDirectory(dir: string): string;
}
