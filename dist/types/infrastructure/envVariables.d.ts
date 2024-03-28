export declare class EnvVariables {
    variables: Record<string, string>;
    optional(names: string[]): EnvVariables;
    required(names: string[]): EnvVariables;
    requireFromEnvFile(directory: string, names: string[]): EnvVariables;
}
