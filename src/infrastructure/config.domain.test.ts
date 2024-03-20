import {
    Opts,
    Domain,
    Application,
    B2CNames,
    ContainerRepository,
    KeyVault,
    ResourceGroups,
} from './config'

describe('Domain', function () {

    it('exists', function () { 
        expect(Domain).toBeDefined()
    })

    describe('validation', () => {
        const opts: Opts = {
            env:      'e',
            name:     'n'
        }
        it('valid Domain throws no exceptions', function () {
            const org = new Domain({
                ...opts,
                location:         'l',
                gitRepositoryUrl: 'g',
                applications:     [],
            })
        })

        it('env length must be 4 or less', function () {
            expect(() => { new Domain({
                ...opts,
                env:              '12345',
                location:         'l',
                gitRepositoryUrl: 'g',
                applications:     [],
            })}).toThrow('Configuration Error - Env cannot be longer than 4 characters')
        })

        it('4 character env length is ok', function () {
            new Domain({
                ...opts,
                env:              '1234',
                location:         'l',
                gitRepositoryUrl: 'g',
                applications:     [],
            })
        })

        it('name length must be 19 character or less', function () {
            expect(()=>{
                new Domain({
                    name:             '123456789012345678901234567',
                    env:              'dev',
                    location:         'l',
                    gitRepositoryUrl: 'g',
                    applications:     [],
                })
            }).toThrow("Configuration Error - Domain name cannot be longer than 19 characters")
        })
    })

    describe('valid Domain instance', () => { 
        const env      = 'dev'
        const instance = ''

        const orgOpts: Opts = {
            env,
            instance,
            name: 'Major-League-Miruken',
        }

        let org = new Domain({
            ...orgOpts,
            location:         'CentralUs',
            gitRepositoryUrl: 'g',
            bootstrapUsers: [
                'foo@bar.com',
                'bizz@buzz.com',
            ],
            resources: {
                b2c:                 new B2CNames({...orgOpts, profile: 'p'}),
                containerRepository: new ContainerRepository(orgOpts),
                keyVault:            new KeyVault(orgOpts),
            },
            applications: [],
        })

        let domain = new Domain({
            env,
            instance,
            name: 'billing',
            parent:           org,
            location:         'CentralUs',
            gitRepositoryUrl: 'g',
            applications: [
                {
                    name: 'app1'
                }
            ]
        })

        it('domain has a name', function () {
            expect(org.name).toEqual('majorleaguemiruken')
            expect(domain.name).toEqual('billing')
        })

        it('nested domain has a reference to the parent', function () {
            expect(domain.parent).toEqual(org)
        })

        it('domain has resourceGroups', function () {
            expect(org.resourceGroups).toBeDefined()
        })

        it('globalResourceGroup', function () {
            expect(org.resourceGroups.global).toEqual('majorleaguemiruken-global')
        })

        it('domain has bootstrapUsers', function () {
            expect(org.bootstrapUsers.length).toEqual(2)
        })

        it('has array of applications', function () {
            expect(domain.applications.length).toEqual(1)
        })

        describe('resources', () => {
            it('b2c', function () {
                expect(org.resources.b2c).toBeDefined()
            })
            it('containerRepository name', function () {
                expect(org.resources.containerRepository.name).toEqual('majorleaguemirukenglobal')
            })
            it('keyVault name', function () {
                expect(org.resources.keyVault.name).toEqual('majorleaguemiruken-dev')
            })
        })
    })

    describe('child domains', () => {
        it('are created', () => {
            const org = new Domain({
                name:     'Major-League-Miruken',
                env:      'dev',
                location: 'CentralUs',
                gitRepositoryUrl: 'g',
                domains: [
                    {
                        name:             'a',
                        env:              'e',
                        location:         'l',
                        gitRepositoryUrl: 'g'
                    }
                ]
            })
            expect(org.domains.length).toEqual(1)
        })
    })
})

// describe('Instantiating Domain', function () {
//     const org = new Domain({
//         name:     'MajorLeagueMiruken',
//         location: 'CentralUs',
//         env:      'dev',
//         instance: 'ci',
//         resources: {
//             b2c:                 B2CNames,
//             containerRepository: ContainerRepository,
//             keyVault:            KeyVault,
//         },
//         applications: [
//             {
//                 name:      'enrich-srv', 
//                 enrichApi: true,  
//             },
//         ],
//         domains: [
//             {
//                 name: 'billing', 
//                 applications: [
//                     {
//                         name: 'billingui',  
//                         ui:   true
//                     },
//                     {
//                         name: 'billingsrv', 
//                         ui:   true, 
//                         api:  true
//                     },
//                 ]
//             },
//             {
//                 name: 'league', 
//                 applications: [
//                     {
//                         name: 'majorleaguemiruken', 
//                         ui:   true
//                     },
//                     {
//                         name: 'tournaments',
//                         ui:   true
//                     },
//                     {
//                         name: 'teamsrv',            
//                         ui:   true, 
//                         api:  true
//                     },
//                     {
//                         name: 'schedulesrv',        
//                         ui:   true, 
//                         api:  true
//                     },
//                 ]
//             },
//         ],
//     })
//     it('creates domain', function () { 
//         //console.log(inspect(org, { depth: null }))
//         expect(org.domains.length).toEqual(2)
//         expect(org.domains[0].instance).toEqual('ci')
//         expect(org.domains[0].applications.length).toEqual(2)
//         expect(org.domains[0].applications[0].instance).toEqual('ci')
//         expect(org.domains[1].instance).toEqual('ci')
//         expect(org.domains[1].applications.length).toEqual(4)
//     })
//     it('returns enrich applications', () => {
//         expect(org.enrichApiApplication.name).toEqual('enrich-srv')
//     })
//     it('throw exception if there is no enrich application defined', () => {
//         org.applications[0].enrichApi = false
//         expect(() => {org.enrichApiApplication}).toThrow('No application defined in domain where enrichApi = true')
//     })
//     it('gets application by name from domain', () => {
//         expect(org.getApplicationByName('enrich-srv').name).toEqual('enrich-srv')
//     })
//     it('gets application by name from child domains', () => {
//         expect(org.getApplicationByName('tournaments').name).toEqual('tournaments')
//     })
//     it('throw exception when application is not found', () => {
//         org.applications[0].enrichApi = false
//         expect(() => {org.getApplicationByName('I dont exist')}).toThrow('Application with name I dont exist not found')
//     })
//     describe('application imageName', () => {
//         it('domain has image name', () => {
//             const app = org.applications[0]
//             expect(app.imageName).toEqual('majorleaguemirukenglobal.azurecr.io/enrich-srv')
//         })
//     })
//     describe('child domain application imageName', () => {
//         it('domain has image name', () => {
//             const app = org.domains[0].applications[0]
//             console.log(app.name)
//             expect(app.imageName).toEqual('majorleaguemirukenglobal.azurecr.io/billingui')
//         })
//     })
// })

