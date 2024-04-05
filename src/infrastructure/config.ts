export interface Opts {
    name:      string
    env:       string
    instance?: string
}

function stripCharacters (input: string) {
    return input.replace(/[^A-Za-z0-9]/g, "").toLowerCase()
}

export class ResourceGroups {
    name:     string
    env:      string
    envInst?: string

    constructor (opts: Opts) {
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

interface B2CResourceOpts extends Opts {
    profile?: string
}

export class B2CResource {
    cleanedName: string
    env:         string
    profile:     string

    constructor (opts: B2CResourceOpts) {
        this.cleanedName = stripCharacters(opts.name)
        this.env         = opts.env
        this.profile     = opts.profile || 'B2C_1A_SIGNUP_SIGNIN'
    }

    get name () {
        return `${this.cleanedName}auth${this.env}`.toLowerCase()
    }

    get displayName () {
        return `${this.cleanedName} auth ${this.env}`.toLowerCase()
    }

    get domainName () {
        return `${this.name}.onmicrosoft.com`
    }

    get openIdConfigurationUrl () {
        return `https://${this.name}.b2clogin.com/${this.name}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${this.profile}`
    }
}

export class ContainerRepositoryResource {
    name: string

    constructor (opts: Opts) {
        if (!opts.name) throw new Error("name required")

        const name = stripCharacters(opts.name)

        this.name = `${name}global`

        if (this.name.length > 32)
             throw `Configuration Error - ContainerRepositoryResource.Name cannot be longer than 32 characters : ${this.name} [${this.name.length}]`
    }
}

export class StorageResource {
    name: string

    constructor (opts: Opts) {
        if (!opts.name) throw new Error("name required")
        if (!opts.env) throw new Error("env required")

        const name = stripCharacters(opts.name)
        this.name = `${name}${opts.env}${opts?.instance ?? ''}`

        if (this.name.length > 24)
             throw `Configuration Error - Storage.Name cannot be longer than 24 characters : ${this.name} [${this.name.length}]`
    }
}

export class KeyVaultResource {
    opts: Opts

    constructor (opts: Opts) {
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

interface ApplicationOpts {
    name:           string,
    implicitFlow?:  boolean
    spa?:           boolean
    enrichApi?:     boolean
    scopes?:        string[]
    secrets?:       string[]
}

export class Application {
    name:           string
    env:            string
    instance?:      string
    parent:         Domain
    resourceGroups: ResourceGroups
    implicitFlow:   boolean
    spa:            boolean
    enrichApi:      boolean
    scopes:         string[] = []
    secrets:        string[] = []
    imageName:      string   = ''

    constructor (opts: ApplicationOpts, parent: Domain) {
        const name          = opts.name

        this.name           = name 
        this.parent         = parent
        this.resourceGroups = parent.resourceGroups
        this.env            = parent.env
        this.instance       = parent.instance
        this.implicitFlow   = opts.implicitFlow || false
        this.spa            = opts.spa          || false
        this.enrichApi      = opts.enrichApi    || false
        this.scopes         = opts.scopes       || ['Group', 'Role', 'Entitlement']
        this.secrets        = opts.secrets      || []

        const containerRepositories = this.resourcesByType(ContainerRepositoryResource)
        if (containerRepositories.length) {
            this.imageName = `${containerRepositories[0].name}.azurecr.io/${name}`
        } else {
            throw new Error('Could not find a configured ContainerRepositoryResource')
        }
    }

    resourcesByType<T extends Resource> (resourceType: { new(opts?: any): T}): T[] {
        let domain: Domain | undefined = this.parent
        const targetResources: T[] = []
        while(domain) {
            for (const [_, resource] of Object.entries(domain.resources)) {
                if (resource instanceof resourceType ) {
                    targetResources.push(resource)
                }
            }
            domain = domain.parent
        }
        return targetResources
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

interface Resource {
    name: string
}

interface DomainOpts extends Opts {
    parent?:          Domain
    location:         string
    gitRepositoryUrl: string
    bootstrapUsers?:  string[]
    resources?:       Record<string, Resource>
    applications?:    ApplicationOpts[]
    domains?:         DomainOpts[]
}

export class Domain {
    name:                 string
    env:                  string
    instance?:            string
    location:             string
    parent?:              Domain
    gitRepositoryUrl:     string
    resourceGroups:       ResourceGroups
    containerRepository?: ContainerRepositoryResource
    domains:              Domain[]                 = []
    applications:         Application[]            = []
    bootstrapUsers:       string[]                 = []
    resources:            Record<string, Resource> = {}

    constructor (opts: DomainOpts) {
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
        if (opts.bootstrapUsers) {
            this.bootstrapUsers = opts.bootstrapUsers
        }

        this.resourceGroups = new ResourceGroups({
            name:     name, 
            env:      env,
            instance: instance,
        })

        if (opts.resources) {
            for(const [key, resource] of Object.entries(opts.resources)) {
                this.resources[key] = resource
            }
        }

        if(opts.applications) {
            for (const application of opts.applications) {
                this.applications.push(new Application(application, this))
            }
        }

        if(opts.domains) {
            for (const domain of opts.domains) {
                this.domains.push((domain instanceof Domain)
                    ? domain
                    : new Domain({
                        ...domain,
                        parent: this,
                    }))
            }
        }
    }

    get enrichApiApplication (): Application {
        let application  = this.applications.find(a => a.enrichApi)
        if (application) return application

        throw new Error(`No application defined in domain where enrichApi = true`)
    }

    getApplicationByName(name: string): Application {
        let application = this.applications.find(a => a.name === name)
        if (application) return application

        for (const domain of this.domains) {
            application = domain.applications.find(a => a.name === name)
            if (application) return application
        }

        throw new Error(`Application with name ${name} not found`)
    }

    getDomainByName(name: string): Domain {
        if (this.name === name.toLowerCase()) return this

        for (const domain of this.domains) {
            if (domain.name === name.toLowerCase()) return domain
        }

        throw new Error(`Domain with name ${name} not found`)
    }
}
