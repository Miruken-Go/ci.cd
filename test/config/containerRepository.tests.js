import { expect }  from 'chai'

import {
    ContainerRepository
} from '#infrastructure/config.js'

describe('ContainerRepository', () => { 
    it('exitsts', function () { 
        expect(ContainerRepository).to.exist
    })
    describe('validation', function () {
        it('name is required', function () {
            expect(()=>{new ContainerRepository({})}).to.throw('name required')
        })
        it('name cannot be more than 32 characters', function () {
            expect(()=>{new ContainerRepository({
                name: '123456789012345678901234567890'
            })}).to.throw('Configuration Error - ContainerRepository.Name cannot be longer than 32 characters')
        })
        it('valid ContainerRepository throws no exceptions', function () {
            new ContainerRepository({
                name: 'n'
            })
        })
    })

    describe('valid ContainerRepository instance', () => {
        const cr = new ContainerRepository({
            name: 'My-Name'
        })
        it('strips invalid characters', () => {
            expect(cr.name).to.equal('mynameglobal')
        })
    })
})
