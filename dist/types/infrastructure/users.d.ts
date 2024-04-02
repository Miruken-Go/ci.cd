import { Graph } from './graph';
import { Domain, B2CResource } from './config';
export declare class Users {
    domain: Domain;
    b2cResource: B2CResource;
    graph: Graph;
    constructor(domain: Domain, b2cResource: B2CResource, b2cDeploymentPipelineClientId: string, b2cDeploymentPipelineClientSecret: string);
    configureBootstrapUsers(): Promise<void>;
}
