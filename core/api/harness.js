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

const childProcess = require("child_process");
const http = require("http");
const process = require("process");

const { camelToSnake } = require("./utils");

const HOMERUNNER_URL = "http://localhost:54321";

let instance;

class Orchestrator {
    constructor() {
        this.homerunnerProcess = null;
    }

    static getInstance() {
        if (!instance) {
            instance = new Orchestrator();
        }
        return instance;
    }

    async orchestrate({ servers }) {
        console.log(servers);
        await this.startHomerunner();

        const deployment = await new Promise((resolve, reject) => {
            const request = http.request(`${HOMERUNNER_URL}/create`, {
                method: "POST",
            }, response => {
                response.setEncoding("utf8");
                response.on("data", data => {
                    if (response.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(JSON.parse(data).message));
                    }
                });
            });
            request.write(JSON.stringify({
                base_image_uri: servers.baseImageUri,
                blueprint_name: camelToSnake(servers.blueprintName),
            }));
            request.end();
        });

        return deployment;
    }

    async startHomerunner() {
        if (this.homerunnerProcess) {
            return;
        }
        this.homerunnerProcess = await childProcess.spawn("homerunner");
        process.on("exit", () => {
            this.homerunnerProcess.kill();
        });

        await new Promise(resolve => {
            this.homerunnerProcess.stderr.setEncoding("utf8");
            this.homerunnerProcess.stderr.on("data", data => {
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
        webSockets.on("message", async ({ webSocket, data }) => {
            try {
                const { type, request } = data;
                if (type === "orchestrate") {
                    const response = await Orchestrator.getInstance().orchestrate(request);
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
};
