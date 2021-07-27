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

import type { IComplementResponse, IOrchestrationRequest, IOrchestrationResponse } from "./rpc";
import { camelToSnake, Data, fromHomerunner } from "./utils";

// Needs `homerunner` from Complement, try running `go install ./cmd/homerunner`
// in a Complement checkout.
const HOMERUNNER_URL = "http://localhost:54321";

let instance: Orchestrator;

class Orchestrator {
    private homerunnerProcess?: childProcess.ChildProcess;

    static getInstance(): Orchestrator {
        if (!instance) {
            instance = new Orchestrator();
        }
        return instance;
    }

    async orchestrate(orReq: IOrchestrationRequest): Promise<IOrchestrationResponse> {
        console.log(orReq.servers);
        await this.startHomerunner();

        const deployment = await new Promise<IComplementResponse>((resolve, reject) => {
            const hrReq = http.request(`${HOMERUNNER_URL}/create`, {
                method: "POST",
            }, hrRes => {
                hrRes.setEncoding("utf8");
                hrRes.on("data", data => {
                    if (hrRes.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(JSON.parse(data).message));
                    }
                });
            });
            hrReq.write(JSON.stringify({
                base_image_uri: orReq.servers.baseImageUri,
                blueprint_name: camelToSnake(orReq.servers.blueprintName),
            }));
            hrReq.end();
        });

        return {
            // Surely there's a more natural way to do this...
            servers: fromHomerunner(deployment as unknown as Data) as unknown as IComplementResponse,
        };
    }

    async startHomerunner() {
        if (this.homerunnerProcess) {
            return;
        }

        this.homerunnerProcess = await childProcess.spawn("homerunner");
        process.on("exit", () => {
            this.homerunnerProcess?.kill();
        });

        await new Promise<void>(resolve => {
            this.homerunnerProcess?.stderr?.setEncoding("utf8");
            this.homerunnerProcess?.stderr?.on("data", data => {
                console.log(data);
                if (data.includes("Homerunner listening")) {
                    console.log("Homerunner started");
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
                if (type === "orchestrate") {
                    const response = await Orchestrator.getInstance().orchestrate(
                        request as IOrchestrationRequest,
                    );
                    webSocket.send(JSON.stringify({
                        type: "message-response",
                        id: data.id,
                        response,
                    }));
                }
            } catch (e) {
                console.error(e);
                webSocket.send(JSON.stringify({
                    type: "message-response",
                    id: data.id,
                    error: e.toString(),
                }));
            }
        });
    },
} as Plugin;
