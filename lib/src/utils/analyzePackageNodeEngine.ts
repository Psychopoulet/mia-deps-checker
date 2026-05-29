// deps

    // externals
    import checkNodeEngine from "check-node-engine";
    import getPackageByUrl from "./getPackageByUrl";

    // locals
    import isPlainObject from "./isPlainObject";

// types & interfaces

    // locals
    import type { components } from "../Descriptor";
    import type { tPackageContent } from "./getPackageByUrl";

// module

export default function analyzePackageNodeEngine (packageUrl: string): Promise<components["schemas"]["AnalyzeNodeEngineResult"]> {

    return getPackageByUrl(packageUrl).then((packageContent: tPackageContent): Promise<components["schemas"]["AnalyzeNodeEngineResult"]> => {

        if (
            !isPlainObject(packageContent.engines)
            || "undefined" === typeof packageContent.engines.node
        ) {
            throw new Error("No node engine found");
        }

        return new Promise((resolve: (result: components["schemas"]["AnalyzeNodeEngineResult"]) => void): void => {

            checkNodeEngine(packageContent).then((): void => {

                return resolve({
                    "result": true,
                    "message": "Node engine is compatible"
                });

            }).catch((error: Error): void => {

                return resolve({
                    "result": false,
                    "message": error.message
                });

            });

        });

    });
}
