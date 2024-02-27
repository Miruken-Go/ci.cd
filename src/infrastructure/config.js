function stripCharacters (string) {
    return string.replace(/[^A-Za-z0-9]/g, "").toLowerCase()
}

export class ResourceGroups {

    constructor (opts) {
        if (!opts.name) throw new Error("name required")

        this.name    = opts.name.toLowerCase()
        this.env     = opts.env
        this.envInst = opts.instance
    }

    requireEnv () {
        if (!this.env) throw new Error("env required")
    }

    get global () {
        return `${this.name}-global`
    }

    get common () {
        this.requireEnv()
        return `${this.name}-${this.env}-common`
    }

    get manual () {
        this.requireEnv()
        return `${this.name}-${this.env}-manual`
    }

    get stable () {
        this.requireEnv()
        return `${this.name}-${this.env}`
    }

    get instance () {
        this.requireEnv()
        return (this.envInst) 
            ? `${this.name}-${this.env}-${this.envInst}`
            : `${this.name}-${this.env}`
    }
}

export class B2C {

    constructor (opts) {
        if (!opts.name) throw new Error("name required")

        this.cleanedName = stripCharacters(opts.name)
        this.env         = opts.env
        this.profile     = opts.profile || 'B2C_1A_SIGNUP_SIGNIN'
    }

    requireEnv () {
        if (!this.env) throw new Error("env required")
    }

    get name () {
        this.requireEnv()
        return `${this.cleanedName}auth${this.env}`.toLowerCase()
    }

    get displayName () {
        this.requireEnv()
        return `${this.cleanedName} auth ${this.env}`.toLowerCase()
    }

    get domainName () {
        return `${this.name}.onmicrosoft.com`
    }

    get openIdConfigurationUrl () {
        return `https://${this.name}.b2clogin.com/${this.name}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${this.profile}`
    }
}

export class ContainerRepository {
    name

    constructor (opts) {
        if (!opts.name) throw new Error("name required")

        const name = stripCharacters(opts.name)

        this.name = `${name}global`

        if (this.name.length > 32)
             throw `Configuration Error - ContainerRepository.Name cannot be longer than 32 characters : ${this.name} [${this.name.length}]`
    }
}

export class Storage {
    name

    constructor (opts) {
        if (!opts.name) throw new Error("name required")
        if (!opts.env) throw new Error("env required")

        const name = stripCharacters(opts.name)
        this.name = `${name}${opts.env}${opts?.instance ?? ''}`

        if (this.name.length > 24)
             throw `Configuration Error - Storage.Name cannot be longer than 24 characters : ${this.name} [${this.name.length}]`
    }
}

export class KeyVault {
    constructor (opts) {
        if (!opts.name) throw new Error("name required")
        this.opts = opts
    }

    get name () {
        if (!this.opts.env) throw new Error("env required")

        const name = stripCharacters(this.opts.name)
        const env  = stripCharacters(this.opts.env)


        const keyVaultName = `${name}-${env}` 
        if (keyVaultName.length > 24)
            throw new Error(`Configuration Error - keyVault name cannot be longer than 24 characters : ${keyVaultName} [${keyVaultName.length}]`)

        return keyVaultName
    }
}

export class Application {
    name
    env
    instance
    location
    parent
    resourceGroups
    implicitFlow
    spa
    enrichApi
    scopes  = []
    secrets = []
    imageName

    constructor (opts) {
        if (!opts.name)           throw new Error("name required")
        if (!opts.location)       throw new Error("location required")
        if (!opts.resourceGroups) throw new Error("resourceGroups required")
        if (!opts.parent)         throw new Error("parent required")

        const name         = opts.name
        const parent       = opts.parent

        this.name           = name 
        this.parent         = parent
        this.location       = opts.location
        this.parent         = opts.parent
        this.env            = opts.env
        this.instance       = opts.instance
        this.resourceGroups = opts.resourceGroups
        this.implicitFlow   = opts.implicitFlow || false
        this.spa            = opts.spa          || false
        this.enrichApi      = opts.enrichApi    || false
        this.scopes         = opts.scopes       || ['Group', 'Role', 'Entitlement']
        this.secrets        = opts.secrets      || []

        let domain = parent
        while(domain) {
            if (domain.containerRepository) {
                this.imageName = `${domain.containerRepository.name}.azurecr.io/${name}` 
                break
            } else {
                domain = domain.parent
            }
        }
        if (!this.imageName) throw new Error('Could not find a configured containerRepository')
    }

    get containerAppName () {
        if (!this.env) throw new Error("env required")

        const containerAppName =  (this.instance)
            ? `${this.name}-${this.env}-${this.instance}`
            : `${this.name}-${this.env}`

        if (containerAppName.length > 32)
            throw `Configuration Error - containerAppName cannot be longer than 32 characters : ${containerAppName} [${containerAppName.length}]`

        return containerAppName
    }
}

export class Domain {
    name
    env
    instance
    location
    parent
    gitRepositoryUrl
    resourceGroups
    b2c
    domains        = []
    applications   = []
    bootstrapUsers = []

    constructor (opts) {
        if (!opts.name)     throw new Error("name required")
        if (!opts.location) throw new Error("location required")

        const name = stripCharacters(opts.name)
        if (name.length > 19)
            throw `Configuration Error - Domain name cannot be longer than 19 characters : ${name} [${name.length}]`

        const env = opts.env
        if (env && env.length > 4)
            throw `Configuration Error - Env cannot be longer than 4 characters : ${env} [${env.length}]`

        const instance = opts.instance
        const location = opts.location
        const parent   = opts.parent

        this.name             = name
        this.env              = env 
        this.instance         = instance
        this.location         = location
        this.parent           = parent
        this.gitRepositoryUrl = opts.gitRepositoryUrl
        this.bootstrapUsers   = opts.bootstrapUsers

        this.resourceGroups = new ResourceGroups({
            name:     name, 
            env:      env,
            instance: instance,
        })

        if (opts.resources) {
            for(const [key, resource] of Object.entries(opts.resources)) {
                this[key] = new resource(opts)
            }
        }

        if(opts.applications) {
            for (const application of opts.applications) {
                this.applications.push((application instanceof Application)
                    ? application
                    : new Application({
                        env:            env, 
                        instance:       instance,
                        location:       location,
                        resourceGroups: this.resourceGroups,
                        ...application,
                        parent:         this,
                    }))
            }
        }

        if(opts.domains) {
            for (const domain of opts.domains) {
                this.domains.push((domain instanceof Domain)
                    ? domain
                    : new Domain({
                        env:          env,
                        instance:     instance,
                        location:     location, 
                        ...domain,
                        parent:       this,
                    }))
            }
        }
    }

    get enrichApiApplication () {
        let application  = this.applications.find(a => a.enrichApi)
        if (application) return application

        throw new Error(`No application defined in domain where enrichApi = true`)
    }

    getApplicationByName(name) {
        let application = this.applications.find(a => a.name === name)
        if (application) return application

        for (const domain of this.domains) {
            application = domain.applications.find(a => a.name === name)
            if (application) return application
        }

        throw new Error(`Application with name ${name} not found`)
    }
}
