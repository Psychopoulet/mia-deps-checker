// deps

    // natives
    import { get } from "node:https";
    import { writeFile, unlink } from "node:fs/promises";

    // externals
    import checkVersionModules from "check-version-modules";

// types & interfaces

    // natives
    import type { IncomingMessage } from "node:http";

    // locals
    interface iAnalyzePackage {
        "result": boolean;
    }

// module

export default function analyzePackage (packageUrl: string, packageFile: string): Promise<iAnalyzePackage> {

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

    }).then((packageContent: string): Promise<iAnalyzePackage> => {

        return writeFile(packageFile, packageContent, "utf-8").then((): Promise<iAnalyzePackage> => {

            return checkVersionModules(packageFile, {
                "dev": true,
                "optional": true
            });

        });

    }).then((result) => {

        return unlink(packageFile).then(() => {
            return result;
        });

    });

}
