/*
Copyright 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import childProcess from "child_process";
import http from "http";
import process from "process";

import type { Plugin } from "@web/dev-server-core";
import debug from "debug";

import type { IHomerunnerRequest, IHomerunnerResponse } from "./rpc";
import type { Data } from "./utils";
import { camelToSnake, fromHomerunner } from "./utils";

const log = debug("harness");

let instance: Homerunner;

class Homerunner {
    private homerunnerProcess?: childProcess.ChildProcess;

    // Needs `homerunner` from Complement, try running `go install ./cmd/homerunner`
    // in a Complement checkout.
    private static homerunnerUrl = "http://localhost:54321";

    static getInstance(): Homerunner {
        if (!instance) {
            instance = new Homerunner();
        }
        return instance;
    }

    async deploy(request: IHomerunnerRequest): Promise<IHomerunnerResponse> {
        log(request);
        await this.start();

        const deployment = await new Promise<IHomerunnerResponse>((resolve, reject) => {
            const httpReq = http.request(`${Homerunner.homerunnerUrl}/create`, {
                method: "POST",
            }, httpRes => {
                httpRes.setEncoding("utf8");
                httpRes.on("data", data => {
                    if (httpRes.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(JSON.parse(data).message));
                    }
                });
            });
            httpReq.write(JSON.stringify({
                base_image_uri: request.baseImageUri || "complement-dendrite",
                blueprint_name: camelToSnake(request.blueprintName),
            }));
            httpReq.end();
        });

        // Surely there's a more natural way to do this...
        return fromHomerunner(deployment as unknown as Data) as unknown as IHomerunnerResponse;
    }

    async start() {
        if (this.homerunnerProcess) {
            return;
        }

        try {
            this.homerunnerProcess = await childProcess.spawn("homerunner", {
                env: Object.assign({
                    HOMERUNNER_LIFETIME_MINS: "120",
                }, process.env),
            });
            process.on("exit", () => {
                this.homerunnerProcess?.kill();
            });
        } catch (e) {
            console.error("Failed to start Homerunner", e);
            throw e;
        }

        log("Waiting for Homerunner to listen...");
        await new Promise<void>(resolve => {
            this.homerunnerProcess?.stderr?.setEncoding("utf8");
            this.homerunnerProcess?.stderr?.on("data", data => {
                log(data);
                if (data.includes("Homerunner listening")) {
                    log("Homerunner listening");
                    resolve();
                }
            });
        });
    }
}

module.exports = {
    name: "patience",
    injectWebSocket: true,
    serverStart({ webSockets }) {
        webSockets?.on("message", async ({ webSocket, data }) => {
            try {
                const { type, request } = data;
                if (type === "deploy") {
                    const response = await Homerunner.getInstance().deploy(
                        request as IHomerunnerRequest,
                    );
                    webSocket.send(JSON.stringify({
                        type: "message-response",
                        id: data.id,
                        response,
                    }));
                }
            } catch (e) {
                console.error(e);
                let error;
                if (e instanceof Error) {
                    error = e.toString();
                }
                webSocket.send(JSON.stringify({
                    type: "message-response",
                    id: data.id,
                    error,
                }));
            }
        });
    },
} as Plugin;
