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

import type { IOrchestrationRequest, IOrchestrationResponse } from "./rpc";

export async function orchestrate(request: IOrchestrationRequest): Promise<IOrchestrationResponse> {
    // @ts-expect-error: No types available, maybe add some locally
    const webSocketModule = await import("/__web-dev-server__web-socket.js");
    const { sendMessageWaitForResponse } = webSocketModule;
    return await sendMessageWaitForResponse({ type: "orchestrate", request });
}
