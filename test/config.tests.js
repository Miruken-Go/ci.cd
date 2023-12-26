import { expect }  from 'chai'
import { inspect } from 'node:util'

import {
    Organization,
    Domain,
    Application,
    ResourceGroups,
    B2C
} from '../src/infrastructure/config.js'

describe('ResourceGroups', function () { 
    it('exitsts', function () { 
        expect(ResourceGroups).to.exist
    })
    describe('validation', function () {
        it('name is required', function () {
            expect(()=>{new ResourceGroups({})}).to.throw('name required')
        })

        describe('requireEnv', () => {
            it('thows exception when env is not given', () => {
                const resourceGroups = new ResourceGroups({
                    name: 'n',
                })
                expect(() => resourceGroups.requireEnv()).to.throw('env required')
            })
            it('does not thow exception when env is given', () => {
                const resourceGroups = new ResourceGroups({
                    name: 'n',
                    env:  'e',
                })
                resourceGroups.requireEnv()
            })
        })
    })

    describe('with instance', function () {
        const resourceGroups = new ResourceGroups({
            name:     'majorleaguemiruken',
            env:      'dev',
            instance: 'ci'
        })

        it('global', function () {
            expect(resourceGroups.global).to.equal('majorleaguemiruken-global')
        })

        it('common', function () {
            expect(resourceGroups.common).to.equal('majorleaguemiruken-dev-common')
        })

        it('manual', function () {
            expect(resourceGroups.manual).to.equal('majorleaguemiruken-dev-manual')
        })

        it('stable', function () {
            expect(resourceGroups.stable).to.equal('majorleaguemiruken-dev')
        })

        it('instance', function () {
            expect(resourceGroups.instance).to.equal('majorleaguemiruken-dev-ci')
        })
    })
    describe('without instance', function () {
        const resourceGroups = new ResourceGroups({
            name:     'majorleaguemiruken',
            env:      'dev'
        })

        it('global', function () {
            expect(resourceGroups.global).to.equal('majorleaguemiruken-global')
        })

        it('common', function () {
            expect(resourceGroups.common).to.equal('majorleaguemiruken-dev-common')
        })

        it('manual', function () {
            expect(resourceGroups.manual).to.equal('majorleaguemiruken-dev-manual')
        })

        it('stable', function () {
            expect(resourceGroups.stable).to.equal('majorleaguemiruken-dev')
        })

        it('instance', function () {
            expect(resourceGroups.instance).to.equal('majorleaguemiruken-dev')
        })
    })
})

describe('B2C', function () { 
    it('exitsts', function () { 
        expect(B2C).to.exist
    })
    describe('validation', function () {
        it('name is required', function () {
            expect(()=>{new B2C({})}).to.throw('name required')
        })
        describe('requireEnv', () => {
            it('thows exception when env is not given', () => {
                const b2c = new B2C({
                    name: 'n',
                })
                expect(() => b2c.requireEnv()).to.throw('env required')
            })
            it('does not thow exception when env is given', () => {
                const b2c = new B2C({
                    name: 'n',
                    env:  'e',
                })
                b2c.requireEnv()
            })
        })
    })

    describe('valid b2c instance', function(){

        let b2c = new B2C({
            name: 'Major-League-Miruken',
            env:  'dev'
        })

        it('makes names lowercase and removes special characters', function () {
            expect(b2c.name).to.equal('majorleaguemirukenauthdev')
        })
        it('b2cDisplayName', function () {
            expect(b2c.displayName).to.equal('majorleaguemiruken auth dev')
        })
        it('b2cDomainName', function () {
            expect(b2c.domainName).to.equal('majorleaguemirukenauthdev.onmicrosoft.com')
        })
        it('openIdConfigurationUrl', function () {
            expect(b2c.openIdConfigurationUrl).to.equal('https://majorleaguemirukenauthdev.b2clogin.com/majorleaguemirukenauthdev.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_SIGNUP_SIGNIN')
        })
    })
})

describe('Organization', function () {
    let org = new Organization({
        name:     'majorLeagueMiruken',
        env:      'dev',
        location: 'CentralUs',
    })
    it('exitsts', function () { 
        expect(Organization).to.exist
    })

    it('has a name', function () {
        expect(org.name).to.equal('majorleaguemiruken')
    })

    it('name is required', function () {
        expect(() => { new Organization({})}).to.throw('name required')
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
        let org = new Organization({
            name:     'Major-League-Miruken',
            env:      'dev',
            location: 'CentralUs',
        })

        it('containerRepositoryName', function () {
            expect(org.containerRepositoryName).to.equal('majorleaguemirukenglobal')
        })
        it('containerRepositoryName validates the max length', function () {
            expect(()=>{
                new Organization({
                    name:     '123456789012345678901234567',
                    env:      'dev',
                    location: 'CentralUs',
                })
            }).to.throw("Configuration Error - Organization name cannot be longer than 19 characters")
        })
    })
})

describe('Domain', function () {

    const env = 'dev'

    let org = new Organization({
        name:     'Major-League-Miruken',
        env:      env,
        location: 'CentralUs',
    })

    let domain = new Domain({
        name:         'billing',
        organization: org,
        location:     'CentralUs',
        env:          env,
        applications: [
            {name: 'app1'}
        ]
    })

    it('exitsts', function () { 
        expect(Domain).to.exist
    })

    it('has a name', function () {
        expect(domain.name).to.equal('billing')
    })

    it('name is required', function () {
        expect(() => { new Domain({})}).to.throw('name required')
    })

    it('has a reference to the organization', function () {
        expect(domain.organization).to.equal(org)
    })

    it('has array of applications', function () {
        expect(domain.applications.length).to.equal(1)
    })
})

describe('Application', function () {
    it('exitsts', function () { 
        expect(Application).to.exist
    })

    describe('validation', () => {
        it('requires name', () => {
            expect(() => {new Application({})}).to.throw('name required')
        })
        it('requires location', () => {
            expect(() => {new Application({
                name: 'n'
            })}).to.throw('location required')
        })
        it('requires organization', () => {
            expect(() => {new Application({
                name:     'n',
                location: 'l'
            })}).to.throw('organization required')
        })
        it('requires resourceGroups', () => {
            expect(() => {new Application({
                name:         'n',
                location:     'l',
                organization: 'o',
            })}).to.throw('resourceGroups required')
        })
    })

    describe('containerAppName', () => {
        const appWithoutEnv = new Application({
            name:         'n',
            location:     'l',
            organization: 'o', 
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        const appWithEnv = new Application({
            name:         'n',
            location:     'l',
            organization: 'o', 
            env:          'e',
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        const appWithEnvAndInst = new Application({
            name:         'n',
            location:     'l',
            organization: 'o', 
            env:          'e',
            instance:     'i',
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        const appWithLongName = new Application({
            name:         '123456789012345678901234567890',
            location:     'l',
            organization: 'o', 
            env:          'e',
            instance:     'i',
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        it('requires env', () => {
            expect(() => {appWithoutEnv.containerAppName}).to.throw("env required")
        })

        it('with env', () => {
            expect(appWithEnv.containerAppName).to.be.equal('n-e')
        })

        it('with env and instance', () => {
            expect(appWithEnvAndInst.containerAppName).to.be.equal('n-e-i')
        })

        it('name cannot be greater than 32 characters', () => {
            expect(() => appWithLongName.containerAppName).to.throw("Configuration Error - containerAppName cannot be longer than 32 characters")
        })
    })
})

describe('Instantiating Organization', function () {
    const org = new Organization({
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
        expect(() => {org.enrichApiApplication}).to.throw('No application defined in organization where enrichApi = true')
    })
    it('gets applications by name from organization', () => {
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

