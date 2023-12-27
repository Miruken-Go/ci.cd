import { expect }  from 'chai'

import {
    B2C
} from '#infrastructure/config.js'

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
