// deps

    // natives
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

    // locals
    import getRepositoriesByUser from "./utils/getRepositoriesByUser";
    import analyzePackage from "./utils/analyzePackage";

// types & interfaces

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type { iEventsMinimal } from "node-pluginsmanager-plugin";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorTemplate extends Mediator<iEventsMinimal & {
        "initialized": [ ContainerPattern ];
        "released": [ ContainerPattern ];
    }> {

    // constructor

    protected _initWorkSpace (): Promise<void> {

        // <init work space>

        return Promise.resolve();

    }

    protected _releaseWorkSpace (): Promise<void> {

        // <release work space>

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

    public getFrontAppMap (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {
        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js.map"), "utf-8");
    }

    // api

    public getUsers (): Promise<operations["getUsers"]["responses"]["200"]["content"]["application/json"]> {
        return Promise.resolve([ "Psychopoulet", "Malky-dev" ]);
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
