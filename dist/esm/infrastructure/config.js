var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function stripCharacters(input) {
    return input.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
}
var ResourceGroups = (function () {
    function ResourceGroups(opts) {
        this.name = opts.name.toLowerCase();
        this.env = opts.env;
        this.envInst = opts.instance;
    }
    ResourceGroups.prototype.requireEnv = function () {
        if (!this.env)
            throw new Error("env required");
    };
    Object.defineProperty(ResourceGroups.prototype, "global", {
        get: function () {
            return "".concat(this.name, "-global");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceGroups.prototype, "common", {
        get: function () {
            this.requireEnv();
            return "".concat(this.name, "-").concat(this.env, "-common");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceGroups.prototype, "manual", {
        get: function () {
            this.requireEnv();
            return "".concat(this.name, "-").concat(this.env, "-manual");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceGroups.prototype, "stable", {
        get: function () {
            this.requireEnv();
            return "".concat(this.name, "-").concat(this.env);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ResourceGroups.prototype, "instance", {
        get: function () {
            this.requireEnv();
            return (this.envInst)
                ? "".concat(this.name, "-").concat(this.env, "-").concat(this.envInst)
                : "".concat(this.name, "-").concat(this.env);
        },
        enumerable: false,
        configurable: true
    });
    return ResourceGroups;
}());
export { ResourceGroups };
var B2CNames = (function () {
    function B2CNames(opts) {
        this.cleanedName = stripCharacters(opts.name);
        this.env = opts.env;
        this.profile = opts.profile || 'B2C_1A_SIGNUP_SIGNIN';
    }
    Object.defineProperty(B2CNames.prototype, "name", {
        get: function () {
            return "".concat(this.cleanedName, "auth").concat(this.env).toLowerCase();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(B2CNames.prototype, "displayName", {
        get: function () {
            return "".concat(this.cleanedName, " auth ").concat(this.env).toLowerCase();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(B2CNames.prototype, "domainName", {
        get: function () {
            return "".concat(this.name, ".onmicrosoft.com");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(B2CNames.prototype, "openIdConfigurationUrl", {
        get: function () {
            return "https://".concat(this.name, ".b2clogin.com/").concat(this.name, ".onmicrosoft.com/v2.0/.well-known/openid-configuration?p=").concat(this.profile);
        },
        enumerable: false,
        configurable: true
    });
    return B2CNames;
}());
export { B2CNames };
var ContainerRepository = (function () {
    function ContainerRepository(opts) {
        if (!opts.name)
            throw new Error("name required");
        var name = stripCharacters(opts.name);
        this.name = "".concat(name, "global");
        if (this.name.length > 32)
            throw "Configuration Error - ContainerRepository.Name cannot be longer than 32 characters : ".concat(this.name, " [").concat(this.name.length, "]");
    }
    return ContainerRepository;
}());
export { ContainerRepository };
var Storage = (function () {
    function Storage(opts) {
        var _a;
        if (!opts.name)
            throw new Error("name required");
        if (!opts.env)
            throw new Error("env required");
        var name = stripCharacters(opts.name);
        this.name = "".concat(name).concat(opts.env).concat((_a = opts === null || opts === void 0 ? void 0 : opts.instance) !== null && _a !== void 0 ? _a : '');
        if (this.name.length > 24)
            throw "Configuration Error - Storage.Name cannot be longer than 24 characters : ".concat(this.name, " [").concat(this.name.length, "]");
    }
    return Storage;
}());
export { Storage };
var KeyVault = (function () {
    function KeyVault(opts) {
        if (!opts.name)
            throw new Error("name required");
        this.opts = opts;
    }
    Object.defineProperty(KeyVault.prototype, "name", {
        get: function () {
            if (!this.opts.env)
                throw new Error("env required");
            var name = stripCharacters(this.opts.name);
            var env = stripCharacters(this.opts.env);
            var keyVaultName = "".concat(name, "-").concat(env);
            if (keyVaultName.length > 24)
                throw new Error("Configuration Error - keyVault name cannot be longer than 24 characters : ".concat(keyVaultName, " [").concat(keyVaultName.length, "]"));
            return keyVaultName;
        },
        enumerable: false,
        configurable: true
    });
    return KeyVault;
}());
export { KeyVault };
var Application = (function () {
    function Application(opts, parent) {
        this.scopes = [];
        this.secrets = [];
        this.imageName = '';
        var name = opts.name;
        this.name = name;
        this.parent = parent;
        this.resourceGroups = parent.resourceGroups;
        this.env = parent.env;
        this.instance = parent.instance;
        this.implicitFlow = opts.implicitFlow || false;
        this.spa = opts.spa || false;
        this.enrichApi = opts.enrichApi || false;
        this.scopes = opts.scopes || ['Group', 'Role', 'Entitlement'];
        this.secrets = opts.secrets || [];
        var containerRepositories = this.resourcesByType(ContainerRepository);
        if (containerRepositories.length) {
            this.imageName = "".concat(containerRepositories[0].name, ".azurecr.io/").concat(name);
        }
        else {
            throw new Error('Could not find a configured ContainerRepository');
        }
    }
    Application.prototype.resourcesByType = function (resourceType) {
        var domain = this.parent;
        var targetResources = [];
        while (domain) {
            for (var _i = 0, _a = Object.entries(domain.resources); _i < _a.length; _i++) {
                var _b = _a[_i], _ = _b[0], resource = _b[1];
                if (resource instanceof resourceType) {
                    targetResources.push(resource);
                }
            }
            domain = domain.parent;
        }
        return targetResources;
    };
    Object.defineProperty(Application.prototype, "containerAppName", {
        get: function () {
            if (!this.env)
                throw new Error("env required");
            var containerAppName = (this.instance)
                ? "".concat(this.name, "-").concat(this.env, "-").concat(this.instance)
                : "".concat(this.name, "-").concat(this.env);
            if (containerAppName.length > 32)
                throw "Configuration Error - containerAppName cannot be longer than 32 characters : ".concat(containerAppName, " [").concat(containerAppName.length, "]");
            return containerAppName;
        },
        enumerable: false,
        configurable: true
    });
    return Application;
}());
export { Application };
var Domain = (function () {
    function Domain(opts) {
        this.domains = [];
        this.applications = [];
        this.bootstrapUsers = [];
        this.resources = {};
        if (!opts.name)
            throw new Error("name required");
        if (!opts.location)
            throw new Error("location required");
        var name = stripCharacters(opts.name);
        if (name.length > 19)
            throw "Configuration Error - Domain name cannot be longer than 19 characters : ".concat(name, " [").concat(name.length, "]");
        var env = opts.env;
        if (env && env.length > 4)
            throw "Configuration Error - Env cannot be longer than 4 characters : ".concat(env, " [").concat(env.length, "]");
        var instance = opts.instance;
        var location = opts.location;
        var parent = opts.parent;
        this.name = name;
        this.env = env;
        this.instance = instance;
        this.location = location;
        this.parent = parent;
        this.gitRepositoryUrl = opts.gitRepositoryUrl;
        if (opts.bootstrapUsers) {
            this.bootstrapUsers = opts.bootstrapUsers;
        }
        this.resourceGroups = new ResourceGroups({
            name: name,
            env: env,
            instance: instance,
        });
        if (opts.resources) {
            for (var _i = 0, _a = Object.entries(opts.resources); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], resource = _b[1];
                this.resources[key] = resource;
            }
        }
        if (opts.applications) {
            for (var _c = 0, _d = opts.applications; _c < _d.length; _c++) {
                var application = _d[_c];
                this.applications.push(new Application(application, this));
            }
        }
        if (opts.domains) {
            for (var _e = 0, _f = opts.domains; _e < _f.length; _e++) {
                var domain = _f[_e];
                this.domains.push((domain instanceof Domain)
                    ? domain
                    : new Domain(__assign(__assign({}, domain), { parent: this })));
            }
        }
    }
    Object.defineProperty(Domain.prototype, "enrichApiApplication", {
        get: function () {
            var application = this.applications.find(function (a) { return a.enrichApi; });
            if (application)
                return application;
            throw new Error("No application defined in domain where enrichApi = true");
        },
        enumerable: false,
        configurable: true
    });
    Domain.prototype.getApplicationByName = function (name) {
        var application = this.applications.find(function (a) { return a.name === name; });
        if (application)
            return application;
        for (var _i = 0, _a = this.domains; _i < _a.length; _i++) {
            var domain = _a[_i];
            application = domain.applications.find(function (a) { return a.name === name; });
            if (application)
                return application;
        }
        throw new Error("Application with name ".concat(name, " not found"));
    };
    return Domain;
}());
export { Domain };
//# sourceMappingURL=config.js.map