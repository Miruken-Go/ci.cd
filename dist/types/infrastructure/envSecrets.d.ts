export declare class EnvSecrets {
    secrets: Record<string, string>;
    require(names: string[]): EnvSecrets;
}
