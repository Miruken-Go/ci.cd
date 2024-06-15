import { Graph } from './graph';
import { Domain, B2CResource } from './config';
export interface UsersOptions {
    domain: Domain;
    b2cResource: B2CResource;
    graph: Graph;
}
export declare class Users {
    options: UsersOptions;
    domain: Domain;
    b2cResource: B2CResource;
    graph: Graph;
    constructor(options: UsersOptions);
    configureBootstrapUsers(): Promise<void>;
}
