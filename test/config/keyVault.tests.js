import { expect }  from 'chai'

import {
    KeyVault
} from '#infrastructure/config.js'

describe('KeyVault', () => { 
    it('exitsts', function () { 
        expect(KeyVault).to.exist
    })
    describe('validation', function () {
        it('name is required', function () {
            expect(()=>{new KeyVault({})}).to.throw('name required')
        })
        it('env is required', function () {
            expect(()=>{
                const keyVault = new KeyVault({
                    name: 'n'
                })
                keyVault.name
            }).to.throw('env required')
        })
        it('name cannot be more than 24 characters', function () {
            expect(()=>{
                const keyVault = new KeyVault({
                    name: '123456789012345678901234',
                    env:  'e'
                })
                keyVault.name
            }).to.throw('Configuration Error - keyVault name cannot be longer than 24 characters')
        })
    })

    describe('valid KeyVault instance', () => {
        it('strips characters for the name', function () {
            const keyVault = new KeyVault({
                name: 'My-Name',
                env:  'ENV'
            })
            expect(keyVault.name).to.equal('myname-env')
        })
    })
})
