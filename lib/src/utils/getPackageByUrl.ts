// deps

    // natives
    import { get } from "node:https";

// types & interfaces

    // natives
    import type { IncomingMessage } from "node:http";

    // locals
    export type tPackageContent = {
        "engines": {
            "node": string;
        };
        "dependencies": Record<string, string>;
        "devDependencies": Record<string, string>;
        "optionalDependencies": Record<string, string>;
    };

// module

export default function getPackageByUrl (packageUrl: string): Promise<tPackageContent> {

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

    }).then((content: string): tPackageContent => {
        return JSON.parse(content) as tPackageContent;
    });

}
