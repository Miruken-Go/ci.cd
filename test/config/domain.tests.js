import { expect }  from 'chai'
import { inspect } from 'node:util'

import {
    Domain,
    Application,
    B2C
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

        it('valid Domain is valid', function () {
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
        it('valid Domain is valid', function () {
            const org = new Domain({
                name:     'n',
                location: 'l',
            })

            expect(()=>{org.requireEnv()}).to.throw('env required')
        })
        it('keyVaultName must be less than 24', function () {
            org.name = '123456789012345678901234'
            expect(() => {org.keyVaultName}).to.throw('Configuration Error - keyVaultName cannot be longer than 24 characters')
        })
    })

    const env = 'dev'

    let org = new Domain({
        name:       'Major-League-Miruken',
        env:        env,
        location:   'CentralUs',
        resources: {
            b2c: B2C
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

    it('org has a name', function () {
        expect(org.name).to.equal('majorleaguemiruken')
    })

    it('domain has a name', function () {
        expect(domain.name).to.equal('billing')
    })

    it('nested domain has a reference to the parent', function () {
        expect(domain.parent).to.equal(org)
    })

    it('resourceGroups', function () {
        expect(org.resourceGroups).to.exist
    })

    it('globalResourceGroup', function () {
        expect(org.resourceGroups.global).to.equal('majorleaguemiruken-global')
    })

    it('b2c', function () {
        expect(org.b2c).to.exist
    })

    it('keyVaultName', function () {
        expect(org.keyVaultName).to.be.equal('majorleaguemiruken-dev')
    })

    describe('containerRepository', function(){
        let org = new Domain({
            name:     'Major-League-Miruken',
            env:      'dev',
            location: 'CentralUs',
        })

        it('containerRepositoryName', function () {
            expect(org.containerRepositoryName).to.equal('majorleaguemirukenglobal')
        })
        it('containerRepositoryName validates the max length', function () {
            expect(()=>{
                new Domain({
                    name:     '123456789012345678901234567',
                    env:      'dev',
                    location: 'CentralUs',
                })
            }).to.throw("Configuration Error - Domain name cannot be longer than 19 characters")
        })
    })

    it('has array of applications', function () {
        expect(domain.applications.length).to.equal(1)
    })

    it('application instance can be  passed in ', function () {
        const app = new Application({
            name:           'a',
            location:       'l',
            parent:         {},
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
    it('gets applications by name from domain', () => {
        expect(org.getApplicationByName('enrich-srv').name).to.be.equal('enrich-srv')
    })
    it('gets applications by name from domains', () => {
        expect(org.getApplicationByName('tournaments').name).to.be.equal('tournaments')
    })
    it('throw exception when application is not found', () => {
        org.applications[0].enrichApi = false
        expect(() => {org.getApplicationByName('I dont exist')}).to.throw('Application with name I dont exist not found')
    })
})

