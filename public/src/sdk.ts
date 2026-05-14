

// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // locals
    import type { components, operations } from "./Descriptor";

    export type tRepository = components["schemas"]["Repository"];

// component

export class SDK extends EventEmitter<{
    "connected": [];
    "disconnected": [ number, string ];
    "error": [ Error ];
}> {

    // static

        public static readonly BASE_URL: string = window.location.protocol + "//" + window.location.host;

    // constructor

    public constructor () {

        super();

        const socket = new WebSocket("ws://" + window.location.host);

        socket.addEventListener("open", (): void => {
            this.emit("connected");
        });

        socket.addEventListener("close", (data: CloseEvent): void => {
            this.emit("disconnected", data.code, data.reason);
        });

        socket.addEventListener("error", (evt: Event): void => {
            const message = evt instanceof ErrorEvent ? evt.message : "Socket error";
            this.emit("error", new Error(message));
        });

    }

    // api methods

    public getUsers (): Promise<operations["getUsers"]["responses"]["200"]["content"]["application/json"]> {

        return fetch(SDK.BASE_URL + "/mia-deps-checker/api/users", {
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

    public getRepositoriesByUser (user: operations["getRepositoriesByUser"]["parameters"]["path"]["user"]): Promise<operations["getRepositoriesByUser"]["responses"]["200"]["content"]["application/json"]> {

        return fetch(SDK.BASE_URL + "/mia-deps-checker/api/repositories/" + user, {
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

        return fetch(SDK.BASE_URL + "/mia-deps-checker/api/analyze", {
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
