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
import { waitForFrameDoc } from "./utils/time";

export default class HydrogenAdapter implements IClientAdapter {
    constructor(public model: IClient) {
    }

    public async start(): Promise<void> {
        this.model.act("start");

        const { userId, homeserverUrl, accessToken } = this.model;

        // Shared session array for possibly multiple Hydrogen clients
        const sessions = JSON.parse(localStorage.getItem("hydrogen_sessions_v1") || "[]");
        sessions.push({
            id: userId,
            deviceId: null,
            userId,
            homeServer: homeserverUrl,
            homeserver: homeserverUrl,
            accessToken,
            lastUsed: Date.now(),
        });
        localStorage.setItem("hydrogen_sessions_v1", JSON.stringify(sessions));

        const { frame } = this.model;
        if (!frame) {
            throw new Error("Client frame has not mounted");
        }

        // Wait for the frame document to be parsed
        const frameDoc = await waitForFrameDoc(frame, () => {
            this.model.start();
        });

        // Inject a helper script to disable service workers, as the multiple
        // frames on same domain otherwise affect each other via the service
        // worker.
        const helperScript = frameDoc.createElement("script");
        helperScript.textContent = "(" + function() {
            // We can't delete navigator.serviceWorker, so instead we hide it
            // with a proxy.
            const navigatorProxy = new Proxy({}, {
                has: (target, key) => key !== "serviceWorker" && key in target,
            });
            Object.defineProperty(window, "navigator", {
                value: navigatorProxy,
            });
            console.log("Service worker support disabled");
        } + ")()";
        frameDoc.head.prepend(helperScript);
    }

    public async stop(): Promise<void> {
        this.model.act("stop");
    }

    public async waitForRoom(): Promise<void> {
        this.model.act("waitForRoom");
    }

    public async viewRoom(roomId?: string): Promise<void> {
        this.model.act("viewRoom", roomId);
    }

    public async sendMessage(message: string): Promise<void> {
        this.model.act("sendMessage", message);
    }

    public async waitForMessage(): Promise<string> {
        // TODO: Maybe we should have generic tracing spans...?
        this.model.act("waitForMessage");
        return "";
    }
}
