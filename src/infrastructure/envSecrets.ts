export class EnvSecrets {
    secrets: Record<string, string> = {}

    require (names: string[]): EnvSecrets {
        for ( const name of names) {
            if(this.secrets[name]) return this

            const secret = process.env[name]
            if (!secret){
                throw `Environment secret required: ${name}`
            }
            this.secrets[name] = secret.trim()
        }
        return this
    }
}
