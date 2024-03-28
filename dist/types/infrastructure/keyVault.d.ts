import { AZ } from './az';
export declare class KeyVault {
    secrets: Record<string, string>;
    requireSecrets(az: AZ, names: string[], keyVaultName: string): Promise<KeyVault>;
}
