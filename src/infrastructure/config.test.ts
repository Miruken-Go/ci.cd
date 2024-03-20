import {
    Opts,
    Domain,
    Application,
    ResourceGroups,
    ContainerRepository,                
    KeyVault
} from './config'

describe('Application', function () {
    it('exists', function () { 
        expect(Application).toBeDefined()
    })

    const org = new Domain({
        env:              'e',
        name:             'n',
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
                    env:              'e',
                    name:             'n',
                    location:         'l',
                    gitRepositoryUrl: 'g',
                    applications: [{
                        name: 'n'
                    }],
                })
            }).toThrow('Could not find a configured ContainerRepository')
        })
    })

    describe('containerAppName', () => {
        const resourceGroups = new ResourceGroups({
            env: 'e',
            name: 'n'
        })

        it('with env', () => {
            const domain = new Domain({
                env:              'e',
                name:             'n',
                location:         'l',
                gitRepositoryUrl: 'g',
                applications:     [],
                domains:          [],
                resources: {
                    containerRepository: new ContainerRepository({env: 'e', name: 'n'}),
                }
            })
            const appWithEnv = new Application({
                name: 'n'
            }, domain)
            expect(appWithEnv.containerAppName).toEqual('n-e')
        })

        it('with env and instance', () => {
            const domainWithInst = new Domain({
                env:              'e',
                instance:         'i',
                name:             'n',
                location:         'l',
                gitRepositoryUrl: 'g',
                applications:     [],
                domains:          [],
                resources: {
                    containerRepository: new ContainerRepository({env: 'e', name: 'n'}),
                }
            })
            const appWithEnvAndInst = new Application({
                name: 'n'
            }, domainWithInst)
            expect(appWithEnvAndInst.containerAppName).toEqual('n-e-i')
        })

        it('name cannot be greater than 32 characters', () => {
            const domainWithInst = new Domain({
                env:              'e',
                instance:         'i',
                name:             'n',
                location:         'l',
                gitRepositoryUrl: 'g',
                applications:     [],
                domains:          [],
                resources: {
                    containerRepository: new ContainerRepository({env: 'e', name: 'n'}),
                }
            })
            const appWithLongName = new Application({
                name: '123456789012345678901234567890'
            }, domainWithInst)
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
            new ContainerRepository({
                env: 'e',
                name: 'n',
            })
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
            env:  'e',
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

describe('ResourceGroups', function () { 
    it('exitsts', function () { 
        expect(ResourceGroups).toBeDefined()
    })

    describe('with instance', function () {
        const resourceGroups = new ResourceGroups({
            name:     'majorleaguemiruken',
            env:      'dev',
            instance: 'ci'
        })

        it('global', function () {
            expect(resourceGroups.global).toEqual('majorleaguemiruken-global')
        })

        it('common', function () {
            expect(resourceGroups.common).toEqual('majorleaguemiruken-dev-common')
        })

        it('manual', function () {
            expect(resourceGroups.manual).toEqual('majorleaguemiruken-dev-manual')
        })

        it('stable', function () {
            expect(resourceGroups.stable).toEqual('majorleaguemiruken-dev')
        })

        it('instance', function () {
            expect(resourceGroups.instance).toEqual('majorleaguemiruken-dev-ci')
        })
    })
    describe('without instance', function () {
        const resourceGroups = new ResourceGroups({
            name:     'majorleaguemiruken',
            env:      'dev'
        })

        it('global', function () {
            expect(resourceGroups.global).toEqual('majorleaguemiruken-global')
        })

        it('common', function () {
            expect(resourceGroups.common).toEqual('majorleaguemiruken-dev-common')
        })

        it('manual', function () {
            expect(resourceGroups.manual).toEqual('majorleaguemiruken-dev-manual')
        })

        it('stable', function () {
            expect(resourceGroups.stable).toEqual('majorleaguemiruken-dev')
        })

        it('instance', function () {
            expect(resourceGroups.instance).toEqual('majorleaguemiruken-dev')
        })
    })
})
