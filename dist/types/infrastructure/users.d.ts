import { Graph } from './graph';
import { Domain, B2CNames } from './config';
export declare class Users {
    domain: Domain;
    b2cNames: B2CNames;
    graph: Graph;
    constructor(domain: Domain, b2cNames: B2CNames, b2cDeploymentPipelineClientId: string, b2cDeploymentPipelineClientSecret: string);
    configureBootstrapUsers(): Promise<void>;
}
