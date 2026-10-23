// deps

    // natives
    const { deepStrictEqual, rejects, strictEqual } = require("node:assert");
    const { EventEmitter } = require("node:events");
    const https = require("node:https");
    const { join } = require("node:path");

// private

    const responses = [];
    const checkers = {
        "engine": () => {
            return Promise.resolve();
        },
        "versions": () => {
            return Promise.resolve([]);
        }
    };

    const originalGet = https.get;

    function installFake (name, fn) {

        const filename = require.resolve(name);

        delete require.cache[filename];

        require.cache[filename] = {
            "exports": fn,
            "filename": filename,
            "id": filename,
            "loaded": true
        };

    }

    function queue (response) {

        responses.push(response);

    }

    https.get = (url, options, callback) => {

        const done = "function" === typeof options ? options : callback;
        const pending = responses.shift();
        const res = new EventEmitter();

        process.nextTick(() => {

            res.statusCode = pending.statusCode;
            res.statusMessage = pending.statusMessage;
            done(res);

            if (200 !== pending.statusCode) {
                return;
            }

            if (pending.error) {
                res.emit("error", pending.error);
                return;
            }

            res.emit("data", pending.body);
            res.emit("end");

        });

        return res;

    };

    installFake("check-node-engine", (packageContent) => {
        return checkers.engine(packageContent);
    });

    installFake("check-version-modules", (packageContent, options) => {
        return checkers.versions(packageContent, options);
    });

    const packageByUrlFile = require.resolve(join(__dirname, "..", "lib", "src", "utils", "getPackageByUrl.ts"));
    const repositoriesFile = require.resolve(join(__dirname, "..", "lib", "src", "utils", "getRepositoriesByUser.ts"));
    const dependenciesFile = require.resolve(join(__dirname, "..", "lib", "src", "utils", "analyzePackageDependencies.ts"));
    const nodeEngineFile = require.resolve(join(__dirname, "..", "lib", "src", "utils", "analyzePackageNodeEngine.ts"));

    delete require.cache[packageByUrlFile];
    delete require.cache[repositoriesFile];
    delete require.cache[dependenciesFile];
    delete require.cache[nodeEngineFile];

    const getPackageByUrl = require(packageByUrlFile).default;
    const getRepositoriesByUser = require(repositoriesFile).default;
    const analyzePackageDependencies = require(dependenciesFile).default;
    const analyzePackageNodeEngine = require(nodeEngineFile).default;

// tests

describe("package url", () => {
    it("should read a package document", () => {

        queue({
            "body": "{\"name\":\"plugin\"}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        return getPackageByUrl("https://example.com/package.json").then((content) => {
            deepStrictEqual(content, {
                "name": "plugin"
            }, "package is not as expected");
        });

    });

    it("should reject a failed package request", () => {

        queue({
            "statusCode": 404,
            "statusMessage": "Not Found"
        });

        return rejects(getPackageByUrl("https://example.com/missing.json"), {
            "message": "Not Found"
        });

    });

    it("should reject a package request without a status message", () => {

        queue({
            "statusCode": 500
        });

        return rejects(getPackageByUrl("https://example.com/broken.json"), {
            "message": "Unknown error"
        });

    });

    it("should reject a package response error", () => {

        queue({
            "error": new Error("socket"),
            "statusCode": 200,
            "statusMessage": "OK"
        });

        return rejects(getPackageByUrl("https://example.com/package.json"), {
            "message": "socket"
        });

    });

});

describe("github repositories", () => {

    it("should read a user repository list", () => {

        queue({
            "body": "[{\"name\":\"repo\"}]",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        return getRepositoriesByUser("octocat").then((content) => {
            deepStrictEqual(content, [
                {
                    "name": "repo"
                }
            ], "repositories are not as expected");
        });

    });

    it("should reject a failed repository request", () => {

        queue({
            "statusCode": 404,
            "statusMessage": "Not Found"
        });

        return rejects(getRepositoriesByUser("missing"), {
            "message": "Not Found"
        });

    });

    it("should reject a repository request without a status message", () => {

        queue({
            "statusCode": 500
        });

        return rejects(getRepositoriesByUser("broken"), {
            "message": "Unknown error"
        });

    });

    it("should reject a repository response error", () => {

        queue({
            "error": new Error("socket"),
            "statusCode": 200,
            "statusMessage": "OK"
        });

        return rejects(getRepositoriesByUser("octocat"), {
            "message": "socket"
        });

    });

});

describe("dependency analysis", () => {

    it("should reject a package without dependencies", () => {

        queue({
            "body": "{}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        return rejects(analyzePackageDependencies("https://example.com/package.json"), {
            "message": "No dependency found"
        });

    });

    it("should analyze dependencies", () => {

        queue({
            "body": "{\"dependencies\":{\"left-pad\":\"1.0.0\"}}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        checkers.versions = (packageContent, options) => {

            strictEqual(packageContent.dependencies["left-pad"], "1.0.0", "dependency is not as expected");
            deepStrictEqual(options, {
                "dev": true,
                "optional": true
            }, "options are not as expected");

            return Promise.resolve([
                {
                    "name": "left-pad"
                }
            ]);

        };

        return analyzePackageDependencies("https://example.com/package.json").then((result) => {
            deepStrictEqual(result, [
                {
                    "name": "left-pad"
                }
            ], "analysis is not as expected");
        });

    });

    it("should analyze dev dependencies", () => {

        queue({
            "body": "{\"devDependencies\":{\"left-pad\":\"1.0.0\"}}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        checkers.versions = () => {
            return Promise.resolve([
                {
                    "name": "left-pad"
                }
            ]);
        };

        return analyzePackageDependencies("https://example.com/package.json").then((result) => {
            deepStrictEqual(result, [
                {
                    "name": "left-pad"
                }
            ], "analysis is not as expected");
        });

    });

    it("should analyze optional dependencies", () => {

        queue({
            "body": "{\"optionalDependencies\":{\"left-pad\":\"1.0.0\"}}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        checkers.versions = () => {
            return Promise.resolve([
                {
                    "name": "left-pad"
                }
            ]);
        };

        return analyzePackageDependencies("https://example.com/package.json").then((result) => {
            deepStrictEqual(result, [
                {
                    "name": "left-pad"
                }
            ], "analysis is not as expected");
        });

    });

});

describe("node engine analysis", () => {

    after(() => {
        https.get = originalGet;
    });


    it("should reject a package without an engines object", () => {

        queue({
            "body": "{}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        return rejects(analyzePackageNodeEngine("https://example.com/package.json"), {
            "message": "No node engine found"
        });

    });

    it("should reject a package without a node engine", () => {

        queue({
            "body": "{\"engines\":{}}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        return rejects(analyzePackageNodeEngine("https://example.com/package.json"), {
            "message": "No node engine found"
        });

    });

    it("should accept a compatible node engine", () => {

        queue({
            "body": "{\"engines\":{\"node\":\">=22.23.4\"}}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        checkers.engine = () => {
            return Promise.resolve();
        };

        return analyzePackageNodeEngine("https://example.com/package.json").then((result) => {
            deepStrictEqual(result, {
                "message": "Node engine is compatible",
                "result": true
            }, "analysis is not as expected");
        });

    });

    it("should report an incompatible node engine", () => {

        queue({
            "body": "{\"engines\":{\"node\":\">=99.0.0\"}}",
            "statusCode": 200,
            "statusMessage": "OK"
        });

        checkers.engine = () => {
            return Promise.reject(new Error("too old"));
        };

        return analyzePackageNodeEngine("https://example.com/package.json").then((result) => {
            deepStrictEqual(result, {
                "message": "too old",
                "result": false
            }, "analysis is not as expected");
        });

    });

});
