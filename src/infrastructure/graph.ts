import * as querystring        from 'node:querystring'
import axios                   from 'axios'
import { Domain, B2CResource } from './config'

export class Graph {
    domain:                            Domain
    b2cResource:                       B2CResource
    b2cDeploymentPipelineClientId:     string
    b2cDeploymentPipelineClientSecret: string
    _token:                            string | undefined  = undefined

    static APP_ID = "00000003-0000-0000-c000-000000000000"

    constructor (domain: Domain, b2cResource: B2CResource, b2cDeploymentPipelineClientId: string, b2cDeploymentPipelineClientSecret: string) {
        if (!domain)                            throw new Error('domain is required')
        if (!b2cDeploymentPipelineClientId)     throw new Error('b2cDeploymentPipelineClientId is required')
        if (!b2cDeploymentPipelineClientSecret) throw new Error('b2cDeploymentPipelineClientSecret is required')

        this.domain                            = domain
        this.b2cResource                          = b2cResource
        this.b2cDeploymentPipelineClientId     = b2cDeploymentPipelineClientId
        this.b2cDeploymentPipelineClientSecret = b2cDeploymentPipelineClientSecret
    }

    async getToken() {
        if (this._token) return this._token;

        const uri=`https://login.microsoftonline.com/${this.b2cResource.domainName}/oauth2/v2.0/token`
        const result = await axios.post(uri, querystring.stringify({
            client_id:     this.b2cDeploymentPipelineClientId,
            scope:         'https://graph.microsoft.com/.default',
            client_secret: this.b2cDeploymentPipelineClientSecret,
            grant_type:    'client_credentials'
        }));
        console.log('Retrieved token')
        this._token = result.data.access_token;
        return this._token;
    }

    async get(endpoint: string, version: string = 'v1.0') {
        const uri = `https://graph.microsoft.com/${version}${endpoint}`
        console.log(`Getting: ${uri}`)

        const options = {
            headers: {
                Authorization: `Bearer ${await this.getToken()}`
            }
        };

        try {
            return await axios.get(uri, options)
        } catch (error) {
            console.log(`Failed to Get: ${uri}`)  
            this.logError(error)
            throw error
        }
    }

    async post(endpoint: string, json: any, version: string = 'v1.0') {
        const uri = `https://graph.microsoft.com/${version}${endpoint}`
        console.log(`Posting: ${uri}`)

        const options = {
            headers: {
                Authorization: `Bearer ${await this.getToken()}`,
                "Content-Type": "application/json"
            }
        };

        try {
            return await axios.post(uri, json, options)
        } catch (error) {
            console.log(`Failed to Post: ${uri}`)  
            this.logError(error)
            throw error
        }
    }

    async patch(endpoint: string, json: object, version: string = 'v1.0') {
        const uri = `https://graph.microsoft.com/${version}${endpoint}`
        console.log(`Patching: ${uri}`)

        const options = {
            headers: {
                Authorization: `Bearer ${await this.getToken()}`,
                "Content-Type": "application/json"
            }
        };

        try {
            return await axios.patch(uri, json, options)
        } catch (error) {
            console.log(`Failed to Patch: ${uri}`)  
            this.logError(error)
            throw error
        }
    }

    // https://learn.microsoft.com/en-us/graph/api/trustframework-put-trustframeworkpolicy?view=graph-rest-beta
    async updateTrustFrameworkPolicy(policyId: string, xml: string) {
        const uri = `https://graph.microsoft.com/beta/trustFramework/policies/${policyId}/$value`
        console.log(`Putting: ${uri}`)

        const options = {
            headers: {
                Authorization: `Bearer ${await this.getToken()}`,
                "Content-Type": "application/xml"
            }
        };

        try {
            var result = await axios.put(uri, xml, options)
            console.log(result.status)
            return result;
        } catch (error) {
            console.log(`Failed to Update: ${uri}`)  
            this.logError(error)
            throw error
        }
    }
    
    logError(error: any){
        if(error.response){
            console.log(`status: ${error.response.status}`)
            console.log(`error.response.data: ${JSON.stringify(error.response.data)}`)
        }
    }

}
