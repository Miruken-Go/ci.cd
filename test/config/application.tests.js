import { expect }  from 'chai'

import {
    Domain,
    Application,
    ResourceGroups,
    ContainerRepository,                
} from '#infrastructure/config.js'

describe('Application', function () {
    it('exitsts', function () { 
        expect(Application).to.exist
    })

    const org = new Domain({
        name:     'n',
        location: 'l',
        resources: {
            containerRepository: ContainerRepository,
        }
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
        it('requires resourceGroups', () => {
            expect(() => {new Application({
                name:         'n',
                location:     'l',
            })}).to.throw('resourceGroups required')
        })
        it('requires parent', () => {
            expect(() => {new Application({
                name:           'n',
                location:       'l',
                resourceGroups: {},
            })}).to.throw('parent required')
        })
        it('valid object throws no exceptions', () => {
            new Application({
                name:           'n',
                location:       'l',
                parent:         org,
                resourceGroups: []
            })
        })
        it('throws exception when no containerRepository is configured', () => {
            expect(() => {
                const orgWithNoCR = new Domain({
                    name:     'n',
                    location: 'l',
                })
                new Application({
                    name:           'n',
                    location:       'l',
                    parent:         orgWithNoCR,
                    resourceGroups: []
                })
            }).to.throw('Could not find a configured containerRepository')
        })
    })

    describe('containerAppName', () => {

        const appWithoutEnv = new Application({
            name:         'n',
            location:     'l',
            parent:       org,
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        const appWithEnv = new Application({
            name:         'n',
            location:     'l',
            env:          'e',
            parent:       org, 
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        const appWithEnvAndInst = new Application({
            name:         'n',
            location:     'l',
            env:          'e',
            instance:     'i',
            parent:       org,
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        const appWithLongName = new Application({
            name:         '123456789012345678901234567890',
            location:     'l',
            env:          'e',
            instance:     'i',
            parent:       org,
            resourceGroups: new ResourceGroups({
                name: 'n'
            })
        })

        it('requires env', () => {
            expect(() => {appWithoutEnv.containerAppName}).to.throw("env required")
        })

        it('with env', () => {
            expect(appWithEnv.containerAppName).to.equal('n-e')
        })

        it('with env and instance', () => {
            expect(appWithEnvAndInst.containerAppName).to.equal('n-e-i')
        })

        it('name cannot be greater than 32 characters', () => {
            expect(() => appWithLongName.containerAppName).to.throw("Configuration Error - containerAppName cannot be longer than 32 characters")
        })
    })
})