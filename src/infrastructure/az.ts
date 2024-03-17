import * as bash  from './bash'
import { header } from './logging'

export class AZ {
    tenantId:                       string
    subscriptionId:                 string
    deploymentPipelineClientId:     string
    deploymentPipelineClientSecret: string
    loggedInToAZ:                   boolean = false 
    loggedInToACR:                  boolean = false 
    
    constructor (
        tenantId:                       string,
        subscriptionId:                 string,
        deploymentPipelineClientId:     string,
        deploymentPipelineClientSecret: string,
    ) {
        this.tenantId                       = tenantId
        this.subscriptionId                 = subscriptionId
        this.deploymentPipelineClientId     = deploymentPipelineClientId
        this.deploymentPipelineClientSecret = deploymentPipelineClientSecret
    }

    async login() {
        if (this.loggedInToAZ) return 

        header('Logging into az')
        await bash.execute(`az login --service-principal --username ${this.deploymentPipelineClientId} --password ${this.deploymentPipelineClientSecret} --tenant ${this.tenantId}`);
        this.loggedInToAZ = true 
    }

    async loginToACR(containerRepositoryName: string) {
        if (this.loggedInToACR) return 

        header('Logging into ACR')
        await this.login()
        await bash.execute(`
            az acr login -n ${containerRepositoryName}
        `)
        this.loggedInToACR = true
    }

    async createResourceGroup(name: string, location: string, tags: Record<string, string>) {
        await this.login()
        await bash.execute(`az group create --location ${location} --name ${name} --subscription ${this.subscriptionId} --tags ${tags}`)
    }

    // https://learn.microsoft.com/en-us/azure/azure-resource-manager/troubleshooting/error-register-resource-provider?tabs=azure-cli
    async registerAzureProvider(providerName: string) { 
        await this.login()
        header(`Checking ${providerName} Provider Registration`)
        const providers = await bash.json(`az provider list --query "[?namespace=='${providerName}']" --output json`)
        if (providers.length) {
            const provider =  providers[0];
            if (provider.registrationState === "NotRegistered") {
                header(`Registering ${providerName} Provider`)
                await bash.execute(`az provider register --namespace ${providerName} --wait`);
            }
        }
    }

    async getAzureContainerRepositoryPassword(name: string) {
        await this.login()
        const result = await bash.json(`az acr credential show --name ${name} --subscription ${this.subscriptionId}`, true)
        if (!result.passwords.length)
            throw new Error(`Expected passwords from the Azure Container Registry: ${name}`)

        return result.passwords[0].value
    }

    async getKeyVaultSecret(secretName: string, keyVaultName: string) {
        await this.login()
        try {
            const result = await bash.json(`az keyvault secret show --name ${secretName} --vault-name ${keyVaultName}`, true)
            console.log(`Secret [${secretName}] found in [${keyVaultName}] keyvault`)
            return result.value
        } catch (error) {
            console.log(`Secret [${secretName}] not found in [${keyVaultName}] keyvault`)
            return null
        }
    }

    async getContainerAppUrl(name: string, resourceGroup: string) {
        await this.login()
        const result = await bash.json(`
            az containerapp show -n ${name} --resource-group ${resourceGroup}
        `)

        if (!result) throw new Error(`ContainerApp ${name} not found in ${resourceGroup}`)
        
        return result.properties.configuration.ingress.fqdn
    }

    async deleteOrphanedApplicationSecurityPrincipals(name: string) {
        await this.login()
        const ids = await bash.json(`
            az role assignment list --all --query "[?principalName==''].id"    
        `)

        if (ids.length) {
            await bash.json(`
                az role assignment delete --ids ${ids.join(' ')}
            `)

            console.log(`Deleted ${ids.length} orphaned application security principals`)
        }
    }
}








