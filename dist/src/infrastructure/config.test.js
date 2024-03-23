"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
describe('Application', function () {
    it('exists', function () {
        expect(config_1.Application).toBeDefined();
    });
    const org = new config_1.Domain({
        env: 'e',
        name: 'n',
        location: 'l',
        gitRepositoryUrl: 'g',
        applications: [],
        domains: [],
        resources: {
            containerRepository: config_1.ContainerRepository,
        }
    });
    describe('validation', () => {
        it('throws exception when no containerRepository is configured', () => {
            expect(() => {
                const orgWithNoCR = new config_1.Domain({
                    env: 'e',
                    name: 'n',
                    location: 'l',
                    gitRepositoryUrl: 'g',
                    applications: [{
                            name: 'n'
                        }],
                });
            }).toThrow('Could not find a configured ContainerRepository');
        });
    });
    describe('containerAppName', () => {
        const resourceGroups = new config_1.ResourceGroups({
            env: 'e',
            name: 'n'
        });
        it('with env', () => {
            const domain = new config_1.Domain({
                env: 'e',
                name: 'n',
                location: 'l',
                gitRepositoryUrl: 'g',
                applications: [],
                domains: [],
                resources: {
                    containerRepository: new config_1.ContainerRepository({ env: 'e', name: 'n' }),
                }
            });
            const appWithEnv = new config_1.Application({
                name: 'n'
            }, domain);
            expect(appWithEnv.containerAppName).toEqual('n-e');
        });
        it('with env and instance', () => {
            const domainWithInst = new config_1.Domain({
                env: 'e',
                instance: 'i',
                name: 'n',
                location: 'l',
                gitRepositoryUrl: 'g',
                applications: [],
                domains: [],
                resources: {
                    containerRepository: new config_1.ContainerRepository({ env: 'e', name: 'n' }),
                }
            });
            const appWithEnvAndInst = new config_1.Application({
                name: 'n'
            }, domainWithInst);
            expect(appWithEnvAndInst.containerAppName).toEqual('n-e-i');
        });
        it('name cannot be greater than 32 characters', () => {
            const domainWithInst = new config_1.Domain({
                env: 'e',
                instance: 'i',
                name: 'n',
                location: 'l',
                gitRepositoryUrl: 'g',
                applications: [],
                domains: [],
                resources: {
                    containerRepository: new config_1.ContainerRepository({ env: 'e', name: 'n' }),
                }
            });
            const appWithLongName = new config_1.Application({
                name: '123456789012345678901234567890'
            }, domainWithInst);
            expect(() => appWithLongName.containerAppName).toThrow("Configuration Error - containerAppName cannot be longer than 32 characters");
        });
    });
});
describe('Domain', function () {
    it('exists', function () {
        expect(config_1.Domain).toBeDefined();
    });
    describe('validation', () => {
        const opts = {
            env: 'e',
            name: 'n'
        };
        it('valid Domain throws no exceptions', function () {
            const org = new config_1.Domain(Object.assign(Object.assign({}, opts), { location: 'l', gitRepositoryUrl: 'g', applications: [] }));
        });
        it('env length must be 4 or less', function () {
            expect(() => {
                new config_1.Domain(Object.assign(Object.assign({}, opts), { env: '12345', location: 'l', gitRepositoryUrl: 'g', applications: [] }));
            }).toThrow('Configuration Error - Env cannot be longer than 4 characters');
        });
        it('4 character env length is ok', function () {
            new config_1.Domain(Object.assign(Object.assign({}, opts), { env: '1234', location: 'l', gitRepositoryUrl: 'g', applications: [] }));
        });
        it('name length must be 19 character or less', function () {
            expect(() => {
                new config_1.Domain({
                    name: '123456789012345678901234567',
                    env: 'dev',
                    location: 'l',
                    gitRepositoryUrl: 'g',
                    applications: [],
                });
            }).toThrow("Configuration Error - Domain name cannot be longer than 19 characters");
        });
    });
    describe('valid Domain instance', () => {
        const env = 'dev';
        const instance = '';
        const orgOpts = {
            env,
            instance,
            name: 'Major-League-Miruken',
        };
        let org = new config_1.Domain(Object.assign(Object.assign({}, orgOpts), { location: 'CentralUs', gitRepositoryUrl: 'g', bootstrapUsers: [
                'foo@bar.com',
                'bizz@buzz.com',
            ], resources: {
                b2c: new config_1.B2CNames(orgOpts),
                containerRepository: new config_1.ContainerRepository(orgOpts),
                keyVault: new config_1.KeyVault(orgOpts),
            }, applications: [] }));
        let domain = new config_1.Domain({
            env,
            instance,
            name: 'billing',
            parent: org,
            location: 'CentralUs',
            gitRepositoryUrl: 'g',
            applications: [
                {
                    name: 'app1'
                }
            ]
        });
        it('domain has a name', function () {
            expect(org.name).toEqual('majorleaguemiruken');
            expect(domain.name).toEqual('billing');
        });
        it('nested domain has a reference to the parent', function () {
            expect(domain.parent).toEqual(org);
        });
        it('domain has resourceGroups', function () {
            expect(org.resourceGroups).toBeDefined();
        });
        it('globalResourceGroup', function () {
            expect(org.resourceGroups.global).toEqual('majorleaguemiruken-global');
        });
        it('domain has bootstrapUsers', function () {
            expect(org.bootstrapUsers.length).toEqual(2);
        });
        it('has array of applications', function () {
            expect(domain.applications.length).toEqual(1);
        });
        describe('resources', () => {
            it('b2c', function () {
                expect(org.resources.b2c).toBeDefined();
            });
            it('containerRepository name', function () {
                expect(org.resources.containerRepository.name).toEqual('majorleaguemirukenglobal');
            });
            it('keyVault name', function () {
                expect(org.resources.keyVault.name).toEqual('majorleaguemiruken-dev');
            });
        });
    });
    describe('child domains', () => {
        it('are created', () => {
            const org = new config_1.Domain({
                name: 'Major-League-Miruken',
                env: 'dev',
                location: 'CentralUs',
                gitRepositoryUrl: 'g',
                domains: [
                    {
                        name: 'a',
                        env: 'e',
                        location: 'l',
                        gitRepositoryUrl: 'g'
                    }
                ]
            });
            expect(org.domains.length).toEqual(1);
        });
    });
    describe('Instantiating Domain', function () {
        const envOpts = {
            env: 'dev',
            instance: 'ci',
            location: 'l'
        };
        const domainOpts = Object.assign(Object.assign({}, envOpts), { name: 'MajorLeagueMiruken' });
        const org = new config_1.Domain(Object.assign(Object.assign({}, domainOpts), { location: 'CentralUs', env: 'dev', instance: 'ci', gitRepositoryUrl: 'http://', resources: {
                b2c: new config_1.B2CNames(domainOpts),
                containerRepository: new config_1.ContainerRepository(domainOpts),
                keyVault: new config_1.KeyVault(domainOpts),
            }, applications: [
                {
                    name: 'enrich-srv',
                    enrichApi: true,
                },
            ], domains: [
                Object.assign(Object.assign({}, envOpts), { name: 'billing', gitRepositoryUrl: 'http://', applications: [
                        {
                            name: 'billingui',
                        },
                        {
                            name: 'billingsrv',
                        },
                    ] }),
                Object.assign(Object.assign({}, envOpts), { name: 'league', gitRepositoryUrl: 'g', applications: [
                        {
                            name: 'majorleaguemiruken',
                        },
                        {
                            name: 'tournaments',
                        },
                        {
                            name: 'teamsrv',
                        },
                        {
                            name: 'schedulesrv',
                        },
                    ] }),
            ] }));
        it('creates domain', function () {
            //console.log(inspect(org, { depth: null }))
            expect(org.domains.length).toEqual(2);
            expect(org.domains[0].instance).toEqual('ci');
            expect(org.domains[0].applications.length).toEqual(2);
            expect(org.domains[0].applications[0].instance).toEqual('ci');
            expect(org.domains[1].instance).toEqual('ci');
            expect(org.domains[1].applications.length).toEqual(4);
        });
        it('returns enrich applications', () => {
            expect(org.enrichApiApplication.name).toEqual('enrich-srv');
        });
        it('throw exception if there is no enrich application defined', () => {
            org.applications[0].enrichApi = false;
            expect(() => { org.enrichApiApplication; }).toThrow('No application defined in domain where enrichApi = true');
        });
        it('gets application by name from domain', () => {
            expect(org.getApplicationByName('enrich-srv').name).toEqual('enrich-srv');
        });
        it('gets application by name from child domains', () => {
            expect(org.getApplicationByName('tournaments').name).toEqual('tournaments');
        });
        it('throw exception when application is not found', () => {
            org.applications[0].enrichApi = false;
            expect(() => { org.getApplicationByName('I dont exist'); }).toThrow('Application with name I dont exist not found');
        });
        describe('application imageName', () => {
            it('domain has image name', () => {
                const app = org.applications[0];
                expect(app.imageName).toEqual('majorleaguemirukenglobal.azurecr.io/enrich-srv');
            });
        });
        describe('child domain application imageName', () => {
            it('domain has image name', () => {
                const app = org.domains[0].applications[0];
                console.log(app.name);
                expect(app.imageName).toEqual('majorleaguemirukenglobal.azurecr.io/billingui');
            });
        });
    });
});
describe('ContainerRepository', () => {
    it('exitsts', function () {
        expect(config_1.ContainerRepository).toBeDefined();
    });
    describe('validation', function () {
        it('valid ContainerRepository throws no exceptions', function () {
            new config_1.ContainerRepository({
                env: 'e',
                name: 'n',
            });
        });
        it('name cannot be more than 32 characters', function () {
            expect(() => {
                new config_1.ContainerRepository({
                    env: 'e',
                    name: '123456789012345678901234567890'
                });
            }).toThrow('Configuration Error - ContainerRepository.Name cannot be longer than 32 characters');
        });
    });
    describe('valid ContainerRepository instance', () => {
        const cr = new config_1.ContainerRepository({
            env: 'e',
            name: 'My-Name'
        });
        it('strips invalid characters', () => {
            expect(cr.name).toEqual('mynameglobal');
        });
    });
});
describe('KeyVault', () => {
    it('exists', function () {
        expect(config_1.KeyVault).toBeDefined();
    });
    describe('validation', function () {
        it('name cannot be more than 24 characters', function () {
            expect(() => {
                const keyVault = new config_1.KeyVault({
                    name: '123456789012345678901234',
                    env: 'e'
                });
                keyVault.name;
            }).toThrow('Configuration Error - keyVault name cannot be longer than 24 characters');
        });
    });
    describe('valid KeyVault instance', () => {
        it('strips characters for the name', function () {
            const keyVault = new config_1.KeyVault({
                name: 'My-Name',
                env: 'ENV'
            });
            expect(keyVault.name).toEqual('myname-env');
        });
    });
});
describe('ResourceGroups', function () {
    it('exitsts', function () {
        expect(config_1.ResourceGroups).toBeDefined();
    });
    describe('with instance', function () {
        const resourceGroups = new config_1.ResourceGroups({
            name: 'majorleaguemiruken',
            env: 'dev',
            instance: 'ci'
        });
        it('global', function () {
            expect(resourceGroups.global).toEqual('majorleaguemiruken-global');
        });
        it('common', function () {
            expect(resourceGroups.common).toEqual('majorleaguemiruken-dev-common');
        });
        it('manual', function () {
            expect(resourceGroups.manual).toEqual('majorleaguemiruken-dev-manual');
        });
        it('stable', function () {
            expect(resourceGroups.stable).toEqual('majorleaguemiruken-dev');
        });
        it('instance', function () {
            expect(resourceGroups.instance).toEqual('majorleaguemiruken-dev-ci');
        });
    });
    describe('without instance', function () {
        const resourceGroups = new config_1.ResourceGroups({
            name: 'majorleaguemiruken',
            env: 'dev'
        });
        it('global', function () {
            expect(resourceGroups.global).toEqual('majorleaguemiruken-global');
        });
        it('common', function () {
            expect(resourceGroups.common).toEqual('majorleaguemiruken-dev-common');
        });
        it('manual', function () {
            expect(resourceGroups.manual).toEqual('majorleaguemiruken-dev-manual');
        });
        it('stable', function () {
            expect(resourceGroups.stable).toEqual('majorleaguemiruken-dev');
        });
        it('instance', function () {
            expect(resourceGroups.instance).toEqual('majorleaguemiruken-dev');
        });
    });
});
describe('B2CNames', function () {
    it('exitsts', function () {
        expect(config_1.B2CNames).toBeDefined();
    });
    describe('valid b2c instance', function () {
        const b2c = new config_1.B2CNames({
            name: 'Major-League-Miruken',
            env: 'dev'
        });
        it('makes names lowercase and removes special characters', function () {
            expect(b2c.name).toEqual('majorleaguemirukenauthdev');
        });
        it('b2cDisplayName', function () {
            expect(b2c.displayName).toEqual('majorleaguemiruken auth dev');
        });
        it('b2cDomainName', function () {
            expect(b2c.domainName).toEqual('majorleaguemirukenauthdev.onmicrosoft.com');
        });
        it('openIdConfigurationUrl', function () {
            expect(b2c.openIdConfigurationUrl).toEqual('https://majorleaguemirukenauthdev.b2clogin.com/majorleaguemirukenauthdev.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_SIGNUP_SIGNIN');
        });
        it('default profile', function () {
            expect(b2c.profile).toEqual('B2C_1A_SIGNUP_SIGNIN');
        });
    });
    describe('valid b2c instance', function () {
        const b2c = new config_1.B2CNames({
            name: 'Major-League-Miruken',
            env: 'dev',
            profile: 'p'
        });
        it('accepts a configurable profile', function () {
            expect(b2c.profile).toEqual('p');
        });
    });
});
//# sourceMappingURL=config.test.js.map