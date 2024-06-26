import { Domain, B2CResource } from './config';
export interface GraphOptions {
    domain: Domain;
    b2cResource: B2CResource;
    b2cDeploymentPipelineClientId: string;
    b2cDeploymentPipelineClientSecret: string;
}
export declare class Graph {
    domain: Domain;
    b2cResource: B2CResource;
    b2cDeploymentPipelineClientId: string;
    b2cDeploymentPipelineClientSecret: string;
    _token: string | undefined;
    static APP_ID: string;
    constructor(options: GraphOptions);
    getToken(): Promise<string>;
    get(endpoint: string, version?: string): Promise<import("axios").AxiosResponse<any, any>>;
    post(endpoint: string, json: any, version?: string): Promise<import("axios").AxiosResponse<any, any>>;
    patch(endpoint: string, json: object, version?: string): Promise<import("axios").AxiosResponse<any, any>>;
    updateTrustFrameworkPolicy(policyId: string, xml: string): Promise<import("axios").AxiosResponse<any, any>>;
    logError(error: any): void;
}
