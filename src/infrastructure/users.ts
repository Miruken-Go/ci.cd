import { header }           from './logging'
import { Graph }            from './graph'
import { Domain, B2CNames } from './config'

export class Users { 
    domain:   Domain
    b2cNames: B2CNames
    graph:    Graph

    constructor (domain: Domain, b2cNames: B2CNames, b2cDeploymentPipelineClientId: string, b2cDeploymentPipelineClientSecret: string) {
        if (!domain)                        throw new Error('domain is required')
        if (!b2cDeploymentPipelineClientId) throw new Error('b2cDeploymentPipelineClientId is required')
        this.domain   = domain
        this.b2cNames = b2cNames
        this.graph    = new Graph(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret)
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
                        issuer:           this.b2cNames.domainName,
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
