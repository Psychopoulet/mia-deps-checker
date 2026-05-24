// deps

    // externals
    import { Server } from "node-pluginsmanager-plugin";

// types & interfaces

    // locals
    import type MediatorMiaDepsChecker from "./Mediator";
    import type { components } from "./Descriptor";

// module

export default class ServerMiaDepsChecker extends Server {

    public _initWorkSpace (): Promise<void> {

        (this._Mediator as MediatorMiaDepsChecker)

            .on("initialized", this._onPluginInitialized)
            .on("released", this._onPluginReleased)
            .on("error", this._onPluginError)

            .on("add-user", this._onAddUser)
            .on("delete-user", this._onDeleteUser);

        return Promise.resolve();

    }

    public _releaseWorkSpace (): Promise<void> {

        (this._Mediator as MediatorMiaDepsChecker)

            .off("initialized", this._onPluginInitialized)
            .off("released", this._onPluginReleased)
            .off("error", this._onPluginError)

            .off("add-user", this._onAddUser)
            .off("delete-user", this._onDeleteUser);

        return Promise.resolve();

    }

    // events

    private readonly _onPluginInitialized = (): void => {

        this.push("initialized");

    };

    private readonly _onPluginReleased = (): void => {

        this.push("released");

    };

    private readonly _onPluginError = (data: components["schemas"]["PushEventPluginError"]["data"]): void => {

        this.push("error", data);

    };

    private readonly _onAddUser = (data: components["schemas"]["EventUserAdded"]["data"]): void => {

        this.push("add-user", data);

    };

    private readonly _onDeleteUser = (data: components["schemas"]["EventUserAdded"]["data"]): void => {

        this.push("delete-user", data);

    };

}
