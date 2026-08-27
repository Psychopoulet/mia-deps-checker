// deps

    // natives
    const { join } = require("node:path");
    const { mkdir, mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const { deepStrictEqual, rejects, strictEqual } = require("node:assert");

    // externals
    const { ConflictError, NotFoundError } = require("node-pluginsmanager-plugin");

// consts

    const DESCRIPTOR_FILE = join(__dirname, "..", "lib", "data", "Descriptor.json");
    const DIST_DIR = join(__dirname, "..", "public", "dist");
    const BUNDLE_FILE = join(DIST_DIR, "bundle.min.js");
    const MAP_FILE = join(DIST_DIR, "bundle.min.js.map");
    const MAX_TIMEOUT = 10000;

    const repositories = {
        "impl": function impl () {
            return Promise.resolve([]);
        }
    };

    const nodeEngine = {
        "impl": function impl () {
            return Promise.resolve({
                "message": "Node engine is compatible",
                "result": true
            });
        }
    };

    const dependencies = {
        "impl": function impl () {
            return Promise.resolve([]);
        }
    };

function mockDefault (relativePath, fn) {

    const absPath = require.resolve(join(__dirname, "..", "lib", "cjs", relativePath));

    require.cache[absPath] = {
        "exports": {
            "__esModule": true,
            "default": fn
        },
        "filename": absPath,
        "id": absPath,
        "loaded": true
    };

}

mockDefault("utils/getRepositoriesByUser.js", (user) => {
    return repositories.impl(user);
});

mockDefault("utils/analyzePackageNodeEngine.js", (packageUrl) => {
    return nodeEngine.impl(packageUrl);
});

mockDefault("utils/analyzePackageDependencies.js", (packageUrl) => {
    return dependencies.impl(packageUrl);
});

    // locals
    const Mediator = require("../lib/cjs/Mediator.js").default;

// tests

describe("mediator", () => {

    let descriptor = null;
    let resourcesDir = "";
    let usersFile = "";
    let mediator = null;

    before(() => {

        return readFile(DESCRIPTOR_FILE, "utf-8").then((content) => {

            descriptor = JSON.parse(content);

            return mkdtemp(join(tmpdir(), "mia-deps-checker-"));

        }).then((created) => {

            resourcesDir = created;
            usersFile = join(resourcesDir, "users.json");

            return mkdir(DIST_DIR, {
                "recursive": true
            });

        }).then(() => {

            return writeFile(BUNDLE_FILE, "{{plugin.name}}|{{plugin.version}}|{{plugin.description}}", "utf-8");

        }).then(() => {

            return writeFile(MAP_FILE, "sourcemap", "utf-8");

        });

    });

    beforeEach(() => {

        repositories.impl = function impl () {
            return Promise.resolve([]);
        };

        nodeEngine.impl = function impl () {
            return Promise.resolve({
                "message": "Node engine is compatible",
                "result": true
            });
        };

        dependencies.impl = function impl () {
            return Promise.resolve([]);
        };

        mediator = new Mediator({
            "descriptor": descriptor,
            "externalResourcesDirectory": resourcesDir
        });

        return writeFile(usersFile, "[]", "utf-8");

    });

    after(() => {

        return Promise.all([
            rm(resourcesDir, {
                "force": true,
                "recursive": true
            }),
            rm(BUNDLE_FILE, {
                "force": true
            }),
            rm(MAP_FILE, {
                "force": true
            })
        ]);

    });

    it("should init and release workspace", () => {

        return mediator._initWorkSpace().then(() => {

            return mediator._releaseWorkSpace();

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in front index", () => {

        return mediator.getFrontIndex().then((content) => {

            strictEqual(content.includes(descriptor.info.title), true);
            strictEqual(content.includes("{{plugin.name}}"), false);

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in front app", () => {

        return mediator.getFrontApp().then((content) => {

            strictEqual(content, descriptor.info.title + "|" + descriptor.info.version + "|" + descriptor.info.description);

        });

    }).timeout(MAX_TIMEOUT);

    it("should return front app sourcemap", () => {

        return mediator.getFrontAppMap().then((content) => {

            strictEqual(content, "sourcemap");

        });

    }).timeout(MAX_TIMEOUT);

    it("should return users from db file", () => {

        return writeFile(usersFile, JSON.stringify([ "octocat" ]), "utf-8").then(() => {

            return mediator.getUsers();

        }).then((users) => {

            deepStrictEqual(users, [ "octocat" ]);

        });

    }).timeout(MAX_TIMEOUT);

    it("should add a user and emit added-user", () => {

        let emitted = "";

        mediator.once("added-user", (user) => {

            emitted = user;

        });

        return mediator.addUser({}, {
            "user": "octocat"
        }).then(() => {

            strictEqual(emitted, "octocat");

            return mediator.getUsers();

        }).then((users) => {

            deepStrictEqual(users, [ "octocat" ]);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject adding an existing user", () => {

        return mediator.addUser({}, {
            "user": "octocat"
        }).then(() => {

            return rejects(() => {

                return mediator.addUser({}, {
                    "user": "octocat"
                });

            }, ConflictError);

        });

    }).timeout(MAX_TIMEOUT);

    it("should delete a user and emit deleted-user", () => {

        let emitted = "";

        return mediator.addUser({}, {
            "user": "octocat"
        }).then(() => {

            mediator.once("deleted-user", (user) => {

                emitted = user;

            });

            return mediator.deleteUser({}, {
                "user": "octocat"
            });

        }).then(() => {

            strictEqual(emitted, "octocat");

            return mediator.getUsers();

        }).then((users) => {

            deepStrictEqual(users, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject deleting an unknown user", () => {

        return rejects(() => {

            return mediator.deleteUser({}, {
                "user": "unknown"
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should map and filter repositories", () => {

        repositories.impl = function impl () {

            return Promise.resolve([
                {
                    "archived": true,
                    "default_branch": "develop",
                    "disabled": true,
                    "full_name": "octocat/old",
                    "html_url": "https://github.com/octocat/old",
                    "language": "Go",
                    "name": "old",
                    "open_issues_count": 2,
                    "watchers_count": 9
                },
                {
                    "full_name": "octocat/hello-world",
                    "html_url": "https://github.com/octocat/hello-world",
                    "name": "hello-world"
                },
                {
                    "archived": false,
                    "default_branch": "develop",
                    "disabled": true,
                    "full_name": "octocat/alive",
                    "html_url": "https://github.com/octocat/alive",
                    "language": "TypeScript",
                    "name": "alive",
                    "open_issues_count": 4,
                    "watchers_count": 12
                }
            ]);

        };

        return mediator.getRepositoriesByUser({
            "path": {
                "user": "octocat"
            }
        }).then((repos) => {

            deepStrictEqual(repos, [
                {
                    "archived": false,
                    "disabled": false,
                    "full_name": "octocat/hello-world",
                    "html_url": "https://github.com/octocat/hello-world",
                    "language": "unknown",
                    "name": "hello-world",
                    "open_issues_count": 0,
                    "package_url": "https://raw.githubusercontent.com/octocat/hello-world/refs/heads/main/package.json",
                    "watchers_count": 0
                },
                {
                    "archived": false,
                    "disabled": true,
                    "full_name": "octocat/alive",
                    "html_url": "https://github.com/octocat/alive",
                    "language": "TypeScript",
                    "name": "alive",
                    "open_issues_count": 4,
                    "package_url": "https://raw.githubusercontent.com/octocat/alive/refs/heads/develop/package.json",
                    "watchers_count": 12
                }
            ]);

        });

    }).timeout(MAX_TIMEOUT);

    it("should analyze package node engine", () => {

        let receivedUrl = "";

        nodeEngine.impl = function impl (packageUrl) {

            receivedUrl = packageUrl;

            return Promise.resolve({
                "message": "Node engine is compatible",
                "result": true
            });

        };

        return mediator.analyzePackageNodeEngine({}, {
            "package_url": "https://example.com/package.json"
        }).then((result) => {

            strictEqual(receivedUrl, "https://example.com/package.json");
            deepStrictEqual(result, {
                "message": "Node engine is compatible",
                "result": true
            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should analyze package dependencies", () => {

        let receivedUrl = "";

        dependencies.impl = function impl (packageUrl) {

            receivedUrl = packageUrl;

            return Promise.resolve([
                {
                    "failAt": "patch",
                    "name": "mocha",
                    "result": true
                }
            ]);

        };

        return mediator.analyzePackageDependencies({}, {
            "package_url": "https://example.com/package.json"
        }).then((result) => {

            strictEqual(receivedUrl, "https://example.com/package.json");
            deepStrictEqual(result, [
                {
                    "failAt": "patch",
                    "name": "mocha",
                    "result": true
                }
            ]);

        });

    }).timeout(MAX_TIMEOUT);

});
