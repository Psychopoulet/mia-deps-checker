// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // natives
    type Timeout = ReturnType<typeof setTimeout>;

    // locals
    import type { components, operations, paths } from "./Descriptor";
    export type tRepository = components["schemas"]["Repository"];

// component

export class SDK extends EventEmitter<{
    "connected": [];
    "disconnected": [ number, string ];
    "error": [ Error ];
}> {

    // protected

        protected _socket: WebSocket | null;
        protected _reconnectTimeout: Timeout | null;

    // constructor

    public constructor () {

        super();

        this._socket = null;
        this._reconnectTimeout = null;

    }

    // public methods

    public connect (): void {

        if (WebSocket.OPEN === this._socket?.readyState) {
            return;
        }

        if (this._reconnectTimeout) {
            return;
        }

        this.emit("connecting");

        this._socket = new WebSocket(
            ("https:" === window.location.protocol ? "wss:" : "ws:")
            + "//" + window.location.host
        );

        this._socket.onopen = (): void => {
            this.emit("connected");
        };

        this._socket.onclose = (event: CloseEvent): void => {

            this.emit("disconnected", event.code, event.reason);

            // normal closure
            if (1000 === event.code) {
                return;
            }

            this._reconnectTimeout = setTimeout((): void => {
                this._reconnectTimeout = null;
                return this.connect();
            }, 1000);

        };

        this._socket.onerror = (evt: Event): void => {

            // avoid catching error on reconnection
            if (evt instanceof ErrorEvent) {
                this.emit("error", new Error(evt.message));
            }

        };

    }

    public disconnect (): void {

        if (this._reconnectTimeout) {
            clearTimeout(this._reconnectTimeout);
            this._reconnectTimeout = null;
        }

        if (this._socket
            && (
                WebSocket.CONNECTING === this._socket.readyState
                || WebSocket.OPEN === this._socket.readyState
            )
        ) {
            this._socket.close(1000, "Normal closure");
        }

        this._socket = null;

    }

    // api methods

    public getUsers (): Promise<operations["getUsers"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-deps-checker/api/users";

        return fetch(url, {
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getUsers"]["responses"]["200"]["content"]["application/json"]> => {

            if (!res.ok) {

                return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                    res.json().then((content: operations["getUsers"]["responses"]["default"]["content"]["application/json"]): void => {
                        return reject(new Error(content.message));
                    }).catch((): void => {
                        return reject(new Error("Failed to fetch repositories: " + res.statusText));
                    });

                });

            }

            return res.json();

        });

    }

    public addUser (user: operations["addUser"]["requestBody"]["content"]["application/json"]): Promise<operations["addUser"]["responses"]["201"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-deps-checker/api/users";

        return fetch(url, {
            "method": "PUT",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(user)
        }).then((res: Response): Promise<operations["addUser"]["responses"]["201"]["content"]["application/json"]> => {

            if (!res.ok) {

                return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                    res.json().then((content: operations["addUser"]["responses"]["default"]["content"]["application/json"]): void => {
                        return reject(new Error(content.message));
                    }).catch((): void => {
                        return reject(new Error("Failed to add user: " + res.statusText));
                    });

                });

            }

            return Promise.resolve();

        });

    }

    public deleteUser (user: operations["deleteUser"]["requestBody"]["content"]["application/json"]): Promise<operations["deleteUser"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-deps-checker/api/users";

        return fetch(url, {
            "method": "DELETE",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(user)
        }).then((res: Response): Promise<operations["deleteUser"]["responses"]["200"]["content"]["application/json"]> => {

            if (!res.ok) {

                return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                    res.json().then((content: operations["deleteUser"]["responses"]["default"]["content"]["application/json"]): void => {
                        return reject(new Error(content.message));
                    }).catch((): void => {
                        return reject(new Error("Failed to add user: " + res.statusText));
                    });

                });

            }

            return Promise.resolve();

        });

    }

    public getRepositoriesByUser (user: operations["getRepositoriesByUser"]["parameters"]["path"]["user"]): Promise<operations["getRepositoriesByUser"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-deps-checker/api/repositories/{user}";

        return fetch(url.replace("{user}", user), {
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getRepositoriesByUser"]["responses"]["200"]["content"]["application/json"]> => {

            if (!res.ok) {

                return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                    res.json().then((content: operations["getRepositoriesByUser"]["responses"]["default"]["content"]["application/json"]): void => {
                        return reject(new Error(content.message));
                    }).catch((): void => {
                        return reject(new Error("Failed to fetch repositories: " + res.statusText));
                    });

                });

            }

            return res.json();

        });

    }

    public analyzePackage (
        packageUrl: operations["analyzePackage"]["requestBody"]["content"]["application/json"]["package_url"]
    ): Promise<operations["analyzePackage"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-deps-checker/api/analyze";

        return fetch(url, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({ "package_url": packageUrl })
        }).then((res: Response): Promise<operations["analyzePackage"]["responses"]["200"]["content"]["application/json"]> => {

            if (!res.ok) {

                return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                    res.json().then((content: operations["analyzePackage"]["responses"]["default"]["content"]["application/json"]): void => {
                        return reject(new Error(content.message));
                    }).catch((): void => {
                        return reject(new Error("Failed to fetch repositories: " + res.statusText));
                    });

                });

            }

            return res.json();

        });

    }

}

let _sdk: SDK | null = null;

export default function getSDK (): SDK {

    _sdk ??= new SDK();

    return _sdk;

}
