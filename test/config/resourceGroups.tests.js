import { expect }  from 'chai'

import {
    ResourceGroups,
} from '#infrastructure/config.js'

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
