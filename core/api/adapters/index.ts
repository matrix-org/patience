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

import type { IClient } from "../../types/client";
import { ClientKind } from "../../types/client";
import ElementAndroidAdapter from "./element-android";
import ElementWebAdapter from "./element-web";
import HydrogenAdapter from "./hydrogen";

export interface IClientAdapter {
    model: IClient;
    start(): Promise<void>;
    stop(): Promise<void>;
    waitForRooms(): Promise<void>;
    viewRoom(roomId?: string): Promise<void>;
    sendMessage(message: string): Promise<void>;
    waitForMessage(expected?: string): Promise<string>;
}

export default function getAdapterForClient(client: IClient): IClientAdapter {
    switch (client.kind) {
        case ClientKind.ElementAndroid:
            return new ElementAndroidAdapter(client);
        case ClientKind.ElementWeb:
            return new ElementWebAdapter(client);
        case ClientKind.Hydrogen:
            return new HydrogenAdapter(client);
    }
}
