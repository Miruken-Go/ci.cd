import {
    Opts,
    Domain,
    Application,
    ResourceGroups,
    ContainerRepository,                
    KeyVault
} from './config'

const opts: Opts = {
    env:      'e',
    name:     'n'
}

const resourceGroups = new ResourceGroups(opts)

describe('Application', function () {
    it('exists', function () { 
        expect(Application).toBeDefined()
    })

    const org = new Domain({
        ...opts,
        location:         'l',
        gitRepositoryUrl: 'g',
        applications:     [],
        domains:          [],
        resources: {
            containerRepository: ContainerRepository,
        }
    })

    describe('validation', () => {
        it('throws exception when no containerRepository is configured', () => {
            expect(() => {
                const orgWithNoCR = new Domain({
                    ...opts,
                    location:         'l',
                    gitRepositoryUrl: 'g',
                    applications:     [],
                    domains:          [],
                })
                new Application({
                    ...opts,
                    location: 'l',
                    parent:   orgWithNoCR,
                    resourceGroups: resourceGroups,
                })
            }).toThrow('Could not find a configured containerRepository')
        })
    })

    describe('containerAppName', () => {

        const appWithEnv = new Application({
            ...opts,
            resourceGroups,
            location: 'l',
            parent:   org, 
        })

        const appWithEnvAndInst = new Application({
            ...opts,
            resourceGroups,
            location: 'l',
            instance: 'i',
            parent:   org,
        })

        const appWithLongName = new Application({
            ...opts,
            resourceGroups,
            name:     '123456789012345678901234567890',
            instance: 'i',
            location: 'l',
            parent:   org,
        })

        it('with env', () => {
            expect(appWithEnv.containerAppName).toEqual('n-e')
        })

        it('with env and instance', () => {
            expect(appWithEnvAndInst.containerAppName).toEqual('n-e-i')
        })

        it('name cannot be greater than 32 characters', () => {
            expect(() => appWithLongName.containerAppName).toThrow("Configuration Error - containerAppName cannot be longer than 32 characters")
        })
    })
})

describe('ContainerRepository', () => { 
    it('exitsts', function () { 
        expect(ContainerRepository).toBeDefined()
    })
    describe('validation', function () {
        it('valid ContainerRepository throws no exceptions', function () {
            new ContainerRepository(opts)
        })
        it('name cannot be more than 32 characters', function () {
            expect(()=>{new ContainerRepository({
                env: 'e',
                name: '123456789012345678901234567890'
            })}).toThrow('Configuration Error - ContainerRepository.Name cannot be longer than 32 characters')
        })
    })

    describe('valid ContainerRepository instance', () => {
        const cr = new ContainerRepository({
            ...opts,
            name: 'My-Name'
        })
        it('strips invalid characters', () => {
            expect(cr.name).toEqual('mynameglobal')
        })
    })
})

describe('KeyVault', () => { 
    it('exists', function () { 
        expect(KeyVault).toBeDefined()
    })

    describe('validation', function () {
        it('name cannot be more than 24 characters', function () {
            expect(()=>{
                const keyVault = new KeyVault({
                    name: '123456789012345678901234',
                    env:  'e'
                })
                keyVault.name
            }).toThrow('Configuration Error - keyVault name cannot be longer than 24 characters')
        })
    })

    describe('valid KeyVault instance', () => {
        it('strips characters for the name', function () {
            const keyVault = new KeyVault({
                name: 'My-Name',
                env:  'ENV'
            })
            expect(keyVault.name).toEqual('myname-env')
        })
    })
})