import { expect }  from 'chai'
import { inspect } from 'node:util'

import {
    Domain,
    Application,
    B2C,
    ContainerRepository,
    KeyVault,
} from '#infrastructure/config.js'

describe('Domain', function () {

    it('exitsts', function () { 
        expect(Domain).to.exist
    })

    describe('validation', () => {
        it('name is required', function () {
            expect(() => { new Domain({})}).to.throw('name required')
        })

        it('location is required', function () {
            expect(() => { new Domain({
                name: 'n'
            })}).to.throw('location required')
        })

        it('valid Domain throws no exceptions', function () {
            new Domain({
                name:     'n',
                location: 'l',
            })
        })

        it('env length must be 4 or less', function () {
            expect(() => { new Domain({
                name:     'n',
                location: 'l',
                env:      '12345'
            })}).to.throw('Configuration Error - Env cannot be longer than 4 characters')
        })
        it('4 character env length is ok', function () {
            new Domain({
                name:     'n',
                location: 'l',
                env:      '1234'
            })
        })
        it('name length must be 19 character or less', function () {
            expect(()=>{
                new Domain({
                    name:     '123456789012345678901234567',
                    env:      'dev',
                    location: 'CentralUs',
                })
            }).to.throw("Configuration Error - Domain name cannot be longer than 19 characters")
        })
        it('valid Domain throws no exceptions', function () {
            const org = new Domain({
                name:     'n',
                location: 'l',
            })
        })
    })

    describe('valid Domain instance', () => { 
        const env = 'dev'

        let org = new Domain({
            name:       'Major-League-Miruken',
            env:        env,
            location:   'CentralUs',
            bootstrapUsers: [
                'foo@bar.com',
                'bizz@buzz.com',
            ],
            resources: {
                b2c:                 B2C,
                containerRepository: ContainerRepository,
                keyVault:            KeyVault,
            }
        })

        let domain = new Domain({
            name:         'billing',
            parent:       org,
            location:     'CentralUs',
            env:          env,
            applications: [
                {name: 'app1'}
            ]
        })

        it('domain has a name', function () {
            expect(org.name).to.equal('majorleaguemiruken')
            expect(domain.name).to.equal('billing')
        })

        it('nested domain has a reference to the parent', function () {
            expect(domain.parent).to.equal(org)
        })

        it('domain has resourceGroups', function () {
            expect(org.resourceGroups).to.exist
        })

        it('globalResourceGroup', function () {
            expect(org.resourceGroups.global).to.equal('majorleaguemiruken-global')
        })

        it('domain has bootstrapUsers', function () {
            expect(org.bootstrapUsers.length).to.equal(2)
        })

        it('has array of applications', function () {
            expect(domain.applications.length).to.equal(1)
        })

        it('application instance can be  passed in ', function () {
            const app = new Application({
                name:           'a',
                location:       'l',
                parent:         new Domain({
                    name:     'n',
                    location: 'l',
                    resources: {
                        containerRepository: ContainerRepository,
                    }
                }),
                resourceGroups: []
            })
            const domain = new Domain({
                name:         'n',
                location:     'l',
                applications: [
                    app
                ]
            })
            expect(domain.applications[0]).to.be.equal(app)
        })

        describe('resources', () => {
            it('b2c', function () {
                expect(org.b2c).to.exist
            })
            it('containerRepository name', function () {
                expect(org.containerRepository.name).to.equal('majorleaguemirukenglobal')
            })
            it('keyVault name', function () {
                expect(org.keyVault.name).to.be.equal('majorleaguemiruken-dev')
            })
        })
    })

    describe('child domains', () => {
        it('can take existing domain', () => {
            const domain = new Domain({
                name:           'a',
                location:       'l',
                parent:         {},
            })
            const org = new Domain({
                name:     'Major-League-Miruken',
                env:      'dev',
                location: 'CentralUs',
                domains: [
                    domain
                ]
            })
            expect(org.domains[0]).to.be.equal(domain)
        })
        it('can take domain object literal', () => {
            const org = new Domain({
                name:     'Major-League-Miruken',
                env:      'dev',
                location: 'CentralUs',
                domains: [
                    {
                        name:           'a',
                        location:       'l',
                        parent:         {},
                    }
                ]
            })
            expect(org.domains.length).to.equal(1)
        })
    })
})

describe('Instantiating Domain', function () {
    const org = new Domain({
        name:     'MajorLeagueMiruken',
        location: 'CentralUs',
        env:      'dev',
        instance: 'ci',
        resources: {
            b2c:                 B2C,
            containerRepository: ContainerRepository,
            keyVault:            KeyVault,
        },
        applications: [
            {
                name:      'enrich-srv', 
                enrichApi: true,  
            },
        ],
        domains: [
            {
                name: 'billing', 
                applications: [
                    {
                        name: 'billingui',  
                        ui:   true
                    },
                    {
                        name: 'billingsrv', 
                        ui:   true, 
                        api:  true
                    },
                ]
            },
            {
                name: 'league', 
                applications: [
                    {
                        name: 'majorleaguemiruken', 
                        ui:   true
                    },
                    {
                        name: 'tournaments',
                        ui:   true
                    },
                    {
                        name: 'teamsrv',            
                        ui:   true, 
                        api:  true
                    },
                    {
                        name: 'schedulesrv',        
                        ui:   true, 
                        api:  true
                    },
                ]
            },
        ],
    })
    it('creates domain', function () { 
        //console.log(inspect(org, { depth: null }))
        expect(org.domains.length).to.be.equal(2)
        expect(org.domains[0].instance).to.be.equal('ci')
        expect(org.domains[0].applications.length).to.be.equal(2)
        expect(org.domains[0].applications[0].instance).to.be.equal('ci')
        expect(org.domains[1].instance).to.be.equal('ci')
        expect(org.domains[1].applications.length).to.be.equal(4)
    })
    it('returns enrich applications', () => {
        expect(org.enrichApiApplication.name).to.be.equal('enrich-srv')
    })
    it('throw exception if there is no enrich application defined', () => {
        org.applications[0].enrichApi = false
        expect(() => {org.enrichApiApplication}).to.throw('No application defined in domain where enrichApi = true')
    })
    it('gets application by name from domain', () => {
        expect(org.getApplicationByName('enrich-srv').name).to.be.equal('enrich-srv')
    })
    it('gets application by name from child domains', () => {
        expect(org.getApplicationByName('tournaments').name).to.be.equal('tournaments')
    })
    it('throw exception when application is not found', () => {
        org.applications[0].enrichApi = false
        expect(() => {org.getApplicationByName('I dont exist')}).to.throw('Application with name I dont exist not found')
    })
    describe('application imageName', () => {
        it('domain has image name', () => {
            const app = org.applications[0]
            expect(app.imageName).to.equal('majorleaguemirukenglobal.azurecr.io/enrich-srv')
        })
    })
    describe('child domain application imageName', () => {
        it('domain has image name', () => {
            const app = org.domains[0].applications[0]
            console.log(app.name)
            expect(app.imageName).to.equal('majorleaguemirukenglobal.azurecr.io/billingui')
        })
    })
})

