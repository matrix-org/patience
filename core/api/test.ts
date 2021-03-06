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

// This file is imported by tests using the harness to arrange things like
// servers and clients for use in the test.

import type { IClientSnapshotIn } from "../types/client";
import getAdapterForClient from "./adapters";
import type { IHomerunnerResponse, IOrchestrationRequest, IOrchestrationResponse } from "./rpc";

export async function orchestrate(request: IOrchestrationRequest): Promise<IOrchestrationResponse> {
    // @ts-expect-error: No types available, maybe add some locally
    // TODO: Find some way to reference the Web Test Runner port here instead of
    // assuming the default value.
    const webSocketModule = await import("http://localhost:8000/__web-dev-server__web-socket.js");
    const { sendMessageWaitForResponse } = webSocketModule;

    const servers: IHomerunnerResponse = await sendMessageWaitForResponse({
        type: "deploy",
        request: request.servers,
    });

    let clientIndex = 0;
    for (const server of Object.values(servers.homeservers)) {
        const homeserverUrl = server.baseUrl;
        for (const [userId, accessToken] of Object.entries(server.accessTokens)) {
            let kind = request.clients;
            if (Array.isArray(kind)) {
                kind = kind[clientIndex++];
            }
            const client: IClientSnapshotIn = {
                userId,
                homeserverUrl,
                accessToken,
                kind,
            };
            // Add them to the harness UI
            window.clientStore.add(client);
        }
    }

    // TODO: This will return _all_ clients if this function is called more than
    // once per test.
    // We're using globals via `window` as a way of notifying the test framework
    // without importing the framework itself into the test.
    const clients = window.clientStore.clients.map(cli => getAdapterForClient(cli));
    window.clients = clients;

    return {
        servers,
        clients,
    };
}
