// deps

    // natives
    import { get } from "node:https";

    // externals
    import checkVersionModules from "check-version-modules";

    // locals
    import isPlainObject from "./isPlainObject";

// types & interfaces

    // natives
    import type { IncomingMessage } from "node:http";

    // locals
    import type { components } from "../Descriptor";

// module

export default function analyzePackage (packageUrl: string): Promise<components["schemas"]["Analyze"]> {

    return new Promise((resolve: (result: string) => void, reject: (error: Error) => void): void => {

        get(packageUrl, (res: IncomingMessage): void => {

            if (200 !== res.statusCode) {
                reject(new Error(res.statusMessage ?? "Unknown error"));
            }
            else {

                let data: string = "";

                res.on("data", (chunk: string): void => {
                    data += chunk;
                }).on("end", (): void => {
                    return resolve(data);
                }).on("error", (err: Error): void => {
                    return reject(err);
                });

            }

        });

    }).then((content: string): Record<string, object | string | number | boolean> => {
        return JSON.parse(content) as Record<string, object | string | number | boolean>;
    }).then((packageContent: Record<string, object | string | number | boolean>): Promise<components["schemas"]["Analyze"]> => {

        if (
            !isPlainObject(packageContent.dependencies)
            && !isPlainObject(packageContent.devDependencies)
            && !isPlainObject(packageContent.optionalDependencies)
        ) {
            throw new Error("No dependency found");
        }

        return checkVersionModules(packageContent, {
            "dev": true,
            "optional": true
        });

    });

}
