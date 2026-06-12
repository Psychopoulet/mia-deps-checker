// deps

    // externals
    import checkVersionModules from "check-version-modules";
    import { isPlainObject } from "node-pluginsmanager-plugin";

    // locals
    import getPackageByUrl from "./getPackageByUrl";

// types & interfaces

    // locals
    import type { components } from "../Descriptor";
    import type { tPackageContent } from "./getPackageByUrl";

// module

export default function analyzePackageDependencies (packageUrl: string): Promise<components["schemas"]["AnalyzeDependenciesResult"]> {

    return getPackageByUrl(packageUrl).then((packageContent: tPackageContent): Promise<components["schemas"]["AnalyzeDependenciesResult"]> => {

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
