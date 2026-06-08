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

            .on("added-user", this._onAddedUser)
            .on("deleted-user", this._onDeletedUser);

        return Promise.resolve();

    }

    public _releaseWorkSpace (): Promise<void> {

        (this._Mediator as MediatorMiaDepsChecker)

            .off("initialized", this._onPluginInitialized)
            .off("released", this._onPluginReleased)
            .off("error", this._onPluginError)

            .off("added-user", this._onAddedUser)
            .off("deleted-user", this._onDeletedUser);

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

    private readonly _onAddedUser = (data: components["schemas"]["PushEventUserAdded"]["data"]): void => {

        this.push("added-user", data);

    };

    private readonly _onDeletedUser = (data: components["schemas"]["PushEventUserDeleted"]["data"]): void => {

        this.push("deleted-user", data);

    };

}
