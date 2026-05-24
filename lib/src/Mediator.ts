// deps

    // natives
    import { readFile, writeFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

    // locals
    import getRepositoriesByUser from "./utils/getRepositoriesByUser";
    import analyzePackage from "./utils/analyzePackage";

// types & interfaces

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type { iEventsMinimal, iDescriptorUserOptions } from "node-pluginsmanager-plugin";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorMiaDepsChecker extends Mediator<iEventsMinimal & {
    "initialized": [ ContainerPattern ];
    "released": [ ContainerPattern ];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
    "add-user": [ components["schemas"]["User"] ];
    "delete-user": [ components["schemas"]["User"] ];
}> {

    // attributes

        // private

        private readonly _dbFile: string;

    // constructor

    public constructor (data: iDescriptorUserOptions) {

        super(data);

        this._dbFile = join(data.externalResourcesDirectory, "users.json");

    }

    // constructor

    protected _initWorkSpace (): Promise<void> {
        return Promise.resolve();
    }

    protected _releaseWorkSpace (): Promise<void> {
        return Promise.resolve();
    }

    // front files

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<string> { // tricks return to avoid costful parsing
        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js.map"), "utf-8");
    }

    // api

    public getUsers (): Promise<operations["getUsers"]["responses"]["200"]["content"]["application/json"]> {

        return readFile(this._dbFile, "utf-8").then((content: string): string[] => {
            return JSON.parse(content) as string[];
        });

    }

    public addUser (urlParams: operations["addUser"]["parameters"], bodyParams: operations["addUser"]["requestBody"]["content"]["application/json"]): Promise<operations["addUser"]["responses"]["201"]["content"]["application/json"]> {

        return readFile(this._dbFile, "utf-8").then((content: string): string[] => {
            return JSON.parse(content) as string[];
        }).then((users: string[]): Promise<operations["addUser"]["responses"]["201"]["content"]["application/json"]> => {

            if (users.includes(bodyParams)) {
                return Promise.resolve();
            }

            users.push(bodyParams);
            return writeFile(this._dbFile, JSON.stringify(users), "utf-8");

        }).then((): void => {

            this.emit("add-user", bodyParams);

        });

    }

    public deleteUser (urlParams: operations["deleteUser"]["parameters"], bodyParams: operations["deleteUser"]["requestBody"]["content"]["application/json"]): Promise<operations["deleteUser"]["responses"]["200"]["content"]["application/json"]> {

        return readFile(this._dbFile, "utf-8").then((content: string): string[] => {
            return JSON.parse(content) as string[];
        }).then((users: string[]): Promise<operations["deleteUser"]["responses"]["200"]["content"]["application/json"]> => {

            return writeFile(this._dbFile, JSON.stringify(users.filter((user: string): boolean => {
                return user !== bodyParams;
            })), "utf-8");

        }).then((): void => {

            this.emit("delete-user", bodyParams);

        });

    }

    public getRepositoriesByUser (urlParams: operations["getRepositoriesByUser"]["parameters"]): Promise<operations["getRepositoriesByUser"]["responses"]["200"]["content"]["application/json"]> {

        return getRepositoriesByUser(urlParams.path.user).then((content): Array<components["schemas"]["Repository"]> => {

            return content.filter((rep): boolean => {
                return !(rep.archived ?? false);
            }).map((rep): components["schemas"]["Repository"] => {

                return {
                    "name": rep.name,
                    "full_name": rep.full_name,
                    "html_url": rep.html_url,
                    "package_url":
                        "https://raw.githubusercontent.com/" + urlParams.path.user + "/"
                        + rep.name
                        + "/refs/heads/"
                        + (rep.default_branch ?? "main")
                        + "/package.json",
                    "archived": rep.archived ?? false,
                    "disabled": rep.disabled ?? false,
                    "language": rep.language ?? "unknown",
                    "watchers_count": rep.watchers_count ?? 0,
                    "open_issues_count": rep.open_issues_count ?? 0
                };

            });

        });

    }

    public analyzePackage (
        urlParams: operations["analyzePackage"]["parameters"],
        bodyParams: operations["analyzePackage"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["analyzePackage"]["responses"]["200"]["content"]["application/json"]> {

        return analyzePackage(bodyParams.package_url);

    }

}
