import * as logging            from './logging'
import { AZ }                  from './az'
import { Graph }               from './graph'
import { Domain, B2CResource } from './config'
import * as fs                 from 'node:fs'
import * as path               from 'node:path'
import axios                   from 'axios'

interface OAuthPermissionScope {
    id:                      string
    adminConsentDescription: string
    adminConsentDisplayName: string
    isEnabled:               boolean
    type:                    string
    value:                   string
}

interface ResourceAccess {
    id:   string
    type: string
}                

interface RequiredResourceAccess {
    resourceAppId: string
    resourceAccess: ResourceAccess[]
}

interface B2cApplication {
    id?: string
    appId?: string
    displayName: string
    signInAudience?: string
    spa?: {
        redirectUris: string[]
    }
    identifierUris?: string[]
    api?: {
        requestedAccessTokenVersion: number,
        oauth2PermissionScopes: OAuthPermissionScope[]
    }
    requiredResourceAccess?: RequiredResourceAccess[]

    web?: {
        implicitGrantSettings: {
            enableAccessTokenIssuance: boolean,
            enableIdTokenIssuance:     boolean,
        }
    }
}

export class B2C {
    domain
    graph
    b2cResource: B2CResource
    az:       AZ

    constructor (
        domain:                            Domain, 
        b2cResource:                       B2CResource, 
        tenantId:                          string, 
        subscriptionId:                    string, 
        deploymentPipelineClientId:        string, 
        deploymentPipelineClientSecret:    string, 
        b2cDeploymentPipelineClientId:     string, 
        b2cDeploymentPipelineClientSecret: string
    ) {
        if (!domain)                        throw new Error('domain is required')
        if (!b2cDeploymentPipelineClientId) throw new Error('b2cDeploymentPipelineClientId is required')

        this.domain   = domain
        this.b2cResource = b2cResource
        this.graph    = new Graph(domain, b2cResource, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret)
        this.az       = new AZ({tenantId, subscriptionId, deploymentPipelineClientId, deploymentPipelineClientSecret})
    }

    async getWellKnownOpenIdConfiguration() {
        const uri = this.b2cResource.openIdConfigurationUrl
        console.log(`Getting: ${uri}`)
        const result = await axios.get(uri)
            .catch((error) => {
                console.log(`Failed to Get: ${uri}`)  
                this.logError(error)
                throw error
            });
    
        console.log(result.data)
        return result.data
    }

    async getApplications(): Promise<B2cApplication[]> {
        const result = await this.graph.get("/applications")
        return result.data.value
    }

    async getApplicationById(id: string): Promise<B2cApplication> {
        const result = await this.graph.get(`/applications/${id}`)
        return result.data
    }

    async getApplicationByName(displayName: string): Promise<B2cApplication | undefined> {
        const applications = await this.getApplications()
        const application  =  applications.find(a => a.displayName === displayName)
        console.log(application)
        return application
    }

    async updateApplication(id: string, manifest: object) {
        console.log(`Updating existing application appId [${id}]`)
        await this.graph.patch(`/applications/${id}`, manifest)
        return await this.getApplicationById(id)
    }

    async createOrUpdateApplication(manifest: B2cApplication) {
        const displayName = manifest.displayName
        const existing = await this.getApplicationByName(displayName)

        let application = undefined
        if (existing) {
            if (!existing.id) throw new Error('Id required to update application')
            application = await this.updateApplication(existing.id, manifest)
        } else {
            console.log(`Creating application: ${displayName}`)
            application = (await this.graph.post("/applications", manifest)).data
            console.log(`Created Application: ${displayName}`)
            console.log(application)
        }

        return application
    }

    async addRedirectUris(id: string, uris: string[]) {
        const app = await this.getApplicationById(id)
        if (!app?.spa?.redirectUris) return
        const redirectUris = [...app.spa.redirectUris]
        for (const uri of uris) {
            if (!redirectUris.includes(uri)) {
                redirectUris.push(uri)
            }
        }
        await this.updateApplication(id, {
            spa: {
                redirectUris: redirectUris
            }
        })
        return await this.getApplicationById(id)
    }

    async configureAppRegistrations() { 
        await this.configureAppRegistration(this.domain)
        for (const domain of this.domain.domains) {
            await this.configureAppRegistration(domain)
        }
    }

    async configureAppRegistration(domain: Domain) {
        const GROUP_ID: string       = 'db580dbb-797c-4334-bf09-db802106accd'
        const ROLE_ID: string        = '0ba8756b-c67c-4fd3-9d70-488fc8da3b55'
        const ENTITLEMENT_ID: string = 'd748b2c9-a76b-47b2-8c7b-fa348fbb474d'
        
        const appRegistration = await this.createOrUpdateApplication({
            displayName:    domain.name,
            signInAudience: 'AzureADandPersonalMicrosoftAccount',
            identifierUris: [ `https://${this.b2cResource.name}.onmicrosoft.com/${domain.name}` ],
            api: {
                requestedAccessTokenVersion: 2,
                oauth2PermissionScopes: [
                    {
                        id:                      GROUP_ID, 
                        adminConsentDescription: 'Groups to which the user belongs.',
                        adminConsentDisplayName: 'Group',
                        isEnabled:               true,
                        type:                    'Admin',
                        value:                   'Group',
                    },
                    {
                        id:                      ROLE_ID, 
                        adminConsentDescription: 'Roles to which a user belongs',
                        adminConsentDisplayName: 'Role',
                        isEnabled:               true,
                        type:                    'Admin',
                        value:                   'Role',
                    },
                    {
                        id:                      ENTITLEMENT_ID, 
                        adminConsentDescription: 'Entitlements which belong to the user',
                        adminConsentDisplayName: 'Entitlement',
                        isEnabled:               true,
                        type:                    'Admin',
                        value:                   'Entitlement',
                    },
                ],
            },
        })
        console.log(appRegistration)

        const requiredResourceAccess = await this.createOrUpdateApplication({
            displayName: domain.name,
            requiredResourceAccess: [
                {
                    resourceAppId: '00000003-0000-0000-c000-000000000000',
                    resourceAccess: [
                        {
                            'id':   '37f7f235-527c-4136-accd-4a02d197296e',
                            'type': 'Scope'
                        },
                        {
                            'id':   '7427e0e9-2fba-42fe-b0c0-848c9e6a8182',
                            'type': 'Scope'
                        }
                    ]
                },
                {
                    resourceAppId: appRegistration.appId, 
                    resourceAccess: [
                        {
                            id:   GROUP_ID,
                            type: 'Scope',
                        },
                        {
                            id:   ROLE_ID,
                            type: 'Scope',
                        },
                        {
                            id:   ENTITLEMENT_ID,
                            type: 'Scope',
                        },
                    ],
                },
            ],
        })
        console.log(requiredResourceAccess)

        if (domain.applications.some(a => a.implicitFlow)) {
            console.log('Configure implicit flow')
            const implicitGrant = await this.createOrUpdateApplication({
                displayName: domain.name,
                web: {
                    implicitGrantSettings: {
                        enableAccessTokenIssuance: true,
                        enableIdTokenIssuance:     true,
                    }
                }
            })
            console.log(implicitGrant)
        }

        if (domain.applications.some(a => a.spa)) {
            console.log('Configure spa')
            const redirectUris = (['dev', 'qa'].includes(this.domain.env))
                ? [
                    'https://jwt.ms/',
                    'http://localhost:8080/oauth2-redirect.html',
                ] 
                : []
            const spa = await this.createOrUpdateApplication({
                displayName: domain.name,
                spa: {
                    redirectUris: redirectUris
                },
            })
            console.log(spa)
        }
    }

    async configureCustomPolicies (customPoliciesDirectory: string) {
        if (!customPoliciesDirectory) throw new Error('customPoliciesDirectory is required')
        
        logging.header("Deploying B2C Configuration")

        const identityExperienceFrameworkClient = await this.getApplicationByName('IdentityExperienceFramework')
        if(!identityExperienceFrameworkClient || !identityExperienceFrameworkClient.appId) throw new Error("IdentityExperienceFramework application not found. Check that the App Registration was created in B2C and check the name spelling and casing.")

        const proxyIdentityExperienceFrameworkClient = await this.getApplicationByName('ProxyIdentityExperienceFramework')
        if(!proxyIdentityExperienceFrameworkClient || !proxyIdentityExperienceFrameworkClient.appId) throw new Error("ProxyIdentityExperienceFramework application not found. Check that the App Registration was created in B2C and check the name spelling and casing.")

        const containerAppName = this.domain.enrichApiApplication.containerAppName
        const appUrl = await this.az.getContainerAppUrl(containerAppName, this.domain.resourceGroups.instance)
        if(!appUrl) throw new Error(`authorizationServiceUrl could not be calculated. The AppUrl for ${containerAppName} container app was not found. The default application environment instance needs to be deployed before common configuration can run.`)

        const authorizationServiceUrl = `https://${appUrl}/enrich`

        //https://learn.microsoft.com/en-us/azure/active-directory-b2c/deploy-custom-policies-devops
        const customPoliciesFileOrder = [
            'TrustFrameworkBase.xml',
            'TrustFrameworkLocalization.xml',
            'TrustFrameworkExtensions.xml',
            'SignUp_SignIn.xml',
            'ProfileEdit.xml',
            'PasswordReset.xml',
        ]
        for (const file of customPoliciesFileOrder) {
                const policyId = `B2C_1A_${path.basename(file, '.xml')}`
                const filePath = path.join(customPoliciesDirectory, file)
                let xml        = fs.readFileSync(filePath,{encoding: 'utf-8'}) 

                xml = xml.replace(/{B2C_DOMAIN_NAME}/g,                              this.b2cResource.domainName)
                xml = xml.replace(/{IDENTITY_EXPERIENCE_FRAMEWORK_CLIENTID}/g,       identityExperienceFrameworkClient.appId)
                xml = xml.replace(/{PROXY_IDENTITY_EXPERIENCE_FRAMEWORK_CLIENTID}/g, proxyIdentityExperienceFrameworkClient.appId)
                xml = xml.replace(/{AUTHORIZATION_SERVICE_URL}/g,                    authorizationServiceUrl)

                await this.graph.updateTrustFrameworkPolicy(policyId, xml)
        };
    }

    logError(error: any){
        if(error.response){
            console.log(`status: ${error.response.status}`)
            console.log(`error.response.data: ${JSON.stringify(error.response.data)}`)
        }
    }
}
