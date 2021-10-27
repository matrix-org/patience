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

import type { IClientAdapter } from ".";
import type { IClient } from "../../types/client";

export default class ElementAndroidAdapter implements IClientAdapter {
    constructor(public model: IClient) {
    }

    public async start(): Promise<void> {
        this.model.act("start");
        this.model.start();
    }

    public async stop(): Promise<void> {
        this.model.act("stop");
    }

    public async waitForRooms(): Promise<void> {
        this.model.act("waitForRooms");
    }

    public async viewRoom(roomId?: string): Promise<void> {
        this.model.act("viewRoom", roomId);
    }

    public async sendMessage(message: string): Promise<void> {
        this.model.act("sendMessage", message);
    }

    public async waitForMessage(expected?: string): Promise<string> {
        // TODO: Maybe we should have generic tracing spans...?
        this.model.act("waitForMessage");
    }
}
