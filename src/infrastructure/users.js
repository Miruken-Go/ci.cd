import { header }    from './logging.js'
import { Graph }     from './graph.js'

export class Users { 

    constructor(domain, b2cDeploymentPipelineClientId ) {
        if (!domain)                        throw new Error('domain is required')
        if (!b2cDeploymentPipelineClientId) throw new Error('b2cDeploymentPipelineClientId is required')
        this.domain = domain
        this.graph  = new Graph(domain, b2cDeploymentPipelineClientId)
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
                        issuer:           this.domain.b2c.domainName,
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
