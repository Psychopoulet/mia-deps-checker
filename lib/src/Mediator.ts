// deps

    // natives
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

    // locals
    import getRepositoriesByUser from "./utils/getRepositoriesByUser";

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

    public getRepositoriesByUser (user: string): Promise<Array<components["schemas"]["Repository"]>> {

        return getRepositoriesByUser(user).then((content: Array<Record<string, unknown>>): Array<components["schemas"]["Repository"]> => {

            return content.filter((rep: Record<string, unknown>): boolean => {

                return !(rep.archived as boolean)
                    && (
                        0 < (rep.open_issues_count as number)
                        || 0 < (rep.open_issues as number)
                        || 0 < (rep.watchers_count as number)
                    );

            }).map((rep) => {

                return {
                    "name": rep.name as string,
                    "full_name": rep.full_name as string,
                    "html_url": rep.html_url as string,
                    "raw_package":
                        "https://raw.githubusercontent.com/Psychopoulet/"
                        + (rep.name as string)
                        + "/refs/heads/"
                        + (rep.default_branch as string)
                        + "/package.json",
                    "archived": rep.archived as boolean,
                    "disabled": rep.disabled as boolean,
                    "language": rep.language as string,
                    "watchers_count": rep.watchers_count as number,
                    "open_issues": rep.open_issues as number,
                    "open_issues_count": rep.open_issues_count as number,
                    "watchers": rep.watchers as number
                };

            });

        });

    }

}
