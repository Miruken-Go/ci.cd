import { header }              from './logging'
import { Graph }               from './graph'
import { Domain, B2CResource } from './config'

export interface UsersOptions {
    domain:      Domain
    b2cResource: B2CResource
    graph:       Graph 
}

export class Users { 
    options:     UsersOptions
    domain:      Domain
    b2cResource: B2CResource
    graph:       Graph

    constructor (options: UsersOptions) {
        this.options     = options
        this.domain      = options.domain
        this.b2cResource = options.b2cResource
        this.graph       = options.graph 
    }

    async configureBootstrapUsers() {
        if (!this.domain.bootstrapUsers || !this.domain.bootstrapUsers.length) return
        
        header("Configuring Bootstrap Users")

        for(const email of this.domain.bootstrapUsers) {

            var userData = undefined

            const userresp = await this.graph.get(`/users?$filter=(mail eq '${email}')`)
            if(userresp.data.value.length) {
                userData = userresp.data.value[0]
                console.log('Existing user')
            }

            if(!userData) {
                console.log(`Creating bootstrap user: ${email}`)
                const createdUser = await this.graph.post('/users', {
                    identities: [{
                        signInType:       "emailAddress",
                        issuer:           this.b2cResource.domainName,
                        issuerAssignedId: email
                    }],
                    userType:          "Member",
                    mail:              email,
                    displayName:       'bootstrap user',
                    accountEnabled:    true,
                    passwordProfile: {
                        forceChangePasswordNextSignIn: true,
                        password: "xWwvJ]6NMw+bWH-d"
                    }
                })
                userData = createdUser.data
            }
            console.log('Created boostrap user', userData)
        }
    }
}
