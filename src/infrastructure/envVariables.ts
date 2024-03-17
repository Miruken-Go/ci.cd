import fs   from 'node:fs'
import path from 'node:path'

export class EnvVariables {
    variables: Record<string, string> = {}

    optional (names: string[]): EnvVariables {
        for ( const name of names) {
            if(this.variables[name]) return this

            const variable = process.env[name]
            if (variable){
                this.variables[name] = variable.trim()
            }
        }
        return this
    }

    required (names: string[]): EnvVariables {
        for ( const name of names) {
            if(this.variables[name]) return this

            const variable = process.env[name]
            if (!variable){
                throw `Environment variable required: ${name}`
            }
            this.variables[name] = variable.trim()
        }
        return  this
    }

    requireFromEnvFile (directory: string, names: string[]): EnvVariables {
        const env = process.env['env'] 
        if (!env) {
            throw 'Environment variable required: env'
        }

        const filePath = path.join(directory, `${env}on`)
        if (!fs.existsSync(filePath)) {
            throw new Error(`Config file does not exist: ${filePath}`)
        }

        const envSpecific = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf8'}))

        for ( const name of names) {
            const variable =  envSpecific[name]
            if (!variable){
                throw `Variable required from ${filePath}: ${name}`
            }
            this.variables[name] = variable.trim()
        }

        return this
    }
}
