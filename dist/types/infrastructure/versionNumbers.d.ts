export declare function epochVerion(): string;
export declare function repoVersion(repositoryPath: string, ref: string): Promise<string>;
export declare function tagVersion(repositoryPath: string, ref: string, tagPrefix: string): Promise<string>;
