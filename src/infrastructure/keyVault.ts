import { AZ } from './az'

export class KeyVault {
    secrets: Record<string, string> = {}

    async requireSecrets (az: AZ, names: string[], keyVaultName: string): Promise<KeyVault> {
        for(const name of names) {
            if (this.secrets[name]) return this

            const secret = await az.getKeyVaultSecret(name, keyVaultName)
            if (!secret){
                throw `KeyVault secret required: ${name}`
            }
            this.secrets[name] = secret.trim()
        }
        return this
    }
}
