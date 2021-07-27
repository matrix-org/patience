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

import type { ClientKind } from "../types/client";

// See https://github.com/matrix-org/complement/tree/master/internal/b
type PredefinedBlueprint =
    "alice" |
    "cleanHs" |
    "federationOneToOneRoom" |
    "federationTwoLocalOneRemote" |
    "hsWithApplicationService" |
    "oneToOneRoom" |
    "perfE2eeRoom" |
    "perfManyMessages" |
    "perfManyRooms";

export interface IComplementRequest {
    baseImageUri: string;
    blueprintName: PredefinedBlueprint;
}

interface IComplementHomeserverInfo {
    baseUrl: string;
    fedBaseUrl: string;
    containerId: string;
    accessTokens: {
        [userId: string]: string;
    };
}

export interface IComplementResponse {
    homeservers: {
        [homeserverId: string]: IComplementHomeserverInfo;
    };
    expires: string;
}

export interface IOrchestrationRequest {
    servers: IComplementRequest;
    clients: ClientKind | ClientKind[];
}

export interface IOrchestrationResponse {
    servers: IComplementResponse;
}
