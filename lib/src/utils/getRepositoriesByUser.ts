// deps

    // natives
    import { get } from "node:https";

// types & interfaces

    // natives
    import type { IncomingMessage } from "node:http";

// module

export default function getRepositoriesByUser (user: string): Promise<Array<Record<string, unknown>>> {

    return new Promise((resolve: (result: string) => void, reject: (error: Error) => void): void => {

        get(
            "https://api.github.com/users/" + user + "/repos?per_page=100",
            {
                "headers": {
                    "user-agent": user
                }
            },
            (res: IncomingMessage): void => {

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

            }

        );

    }).then((content: string): Array<Record<string, unknown>> => {
        return JSON.parse(content) as Array<Record<string, unknown>>;
    });

}
