// deps

    // natives
    const { strictEqual } = require("node:assert");
    const { mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const { join } = require("node:path");

    // locals
    const main = require(join(__dirname, "..", "lib", "src", "main.cts"));
    const Orchestrator = require(join(__dirname, "..", "lib", "src", "Orchestrator.ts")).default;
    const descriptor = require(join(__dirname, "..", "lib", "src", "Descriptor.ts"));
    const github = require(join(__dirname, "..", "lib", "src", "types", "github.ts"));

// tests

describe("orchestrator", () => {

    it("should export the orchestrator", () => {

        strictEqual(main, Orchestrator, "main export is not the orchestrator");
        strictEqual(typeof descriptor, "object", "descriptor types must load");
        strictEqual(typeof github, "object", "github types must load");

    });

    it("should install and uninstall tracked users", () => {

        let root = "";

        return mkdtemp(join(tmpdir(), "mia-deps-checker-")).then((created) => {

            root = created;

            const resources = join(created, "resources");
            const usersFile = join(resources, "users.json");
            const orchestrator = new Orchestrator({
                "externalResourcesDirectory": resources
            });

            return orchestrator._initWorkSpace().then(() => {

                return readFile(usersFile, "utf-8");

            }).then((content) => {

                strictEqual(content, "[]", "tracked users must start empty");

                return writeFile(usersFile, "[{\"user\":\"kept\"}]", "utf-8");

            }).then(() => {

                return orchestrator.install();

            }).then(() => {

                return readFile(usersFile, "utf-8");

            }).then((content) => {

                strictEqual(content, "[{\"user\":\"kept\"}]", "existing users must be kept");

                return orchestrator.uninstall();

            }).then(() => {

                return orchestrator.uninstall();

            });

        }).finally(() => {

            return root ? rm(root, {
                "recursive": true,
                "force": true
            }) : Promise.resolve();

        });

    });

});
