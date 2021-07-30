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
import { sleep } from "./utils";

interface IMatrixClientCreds {
    userId: string;
    homeserverUrl: string;
    identityServerUrl?: string;
    deviceId?: string;
    accessToken: string;
    guest?: boolean;
    pickleKey?: string;
    freshLogin?: boolean;
}

interface IMatrixChat {
    onUserCompletedLoginFlow(creds: IMatrixClientCreds): Promise<void>;
}

interface IActionPayload {
    action: string;
    [key: string]: string;
}

interface IDispatcher {
    register(callback: (action: IActionPayload) => void): string;
    unregister(id: string): void;
    dispatch(action: IActionPayload, sync?: boolean): void;
}

interface IMatrixRoom {
    roomId: string;
}

interface IMatrixClient {
    getRooms(): IMatrixRoom[];
}

interface IAppWindow extends Window {
    matrixChat: IMatrixChat;
    mxDispatcher: IDispatcher;
    mxMatrixClientPeg: {
        get(): IMatrixClient;
    };
}

let idb: IDBDatabase;

async function idbInit(): Promise<void> {
    if (!indexedDB) {
        throw new Error("IndexedDB not available");
    }
    idb = await new Promise((resolve, reject) => {
        const request = indexedDB.open("matrix-react-sdk", 1);
        request.onerror = reject;
        request.onsuccess = (event) => { resolve(request.result); };
        request.onupgradeneeded = (event) => {
            const db = request.result;
            db.createObjectStore("pickleKey");
            db.createObjectStore("account");
        };
    });
}

export async function idbDelete(
    table: string,
    key: string | string[],
): Promise<void> {
    if (!idb) {
        await idbInit();
    }
    return new Promise((resolve, reject) => {
        const txn = idb.transaction([table], "readwrite");
        txn.onerror = reject;

        const objectStore = txn.objectStore(table);
        const request = objectStore.delete(key);
        request.onerror = reject;
        request.onsuccess = (event) => { resolve(); };
    });
}

export default class ElementWebAdapter implements IClientAdapter {
    constructor(public model: IClient) {
    }

    private get appWindow(): IAppWindow {
        // @ts-expect-error: Seems hard to type this
        return window[this.model.userId].contentWindow;
    }

    private get dispatcher(): IDispatcher {
        return this.appWindow.mxDispatcher;
    }

    private get matrixClient(): IMatrixClient {
        return this.appWindow.mxMatrixClientPeg.get();
    }

    public async start(): Promise<void> {
        const { userId, homeserverUrl, accessToken } = this.model;

        // Inject login details via local storage
        await this.clearStorage();
        localStorage.setItem("mx_user_id", userId);
        localStorage.setItem("mx_hs_url", homeserverUrl);
        localStorage.setItem("mx_access_token", accessToken);

        await new Promise<void>(resolve => {
            let dispatcherRef: string;
            const startupWaitLoop = setInterval(() => {
                // Wait until the dispatcher appears
                if (!this.dispatcher) {
                    return;
                }
                clearInterval(startupWaitLoop);
                dispatcherRef = this.dispatcher.register(onAction);
            }, 50);
            const onAction = ({ action }: IActionPayload) => {
                // Wait until the app has processed the stored login
                if (action !== "on_logged_in") {
                    return;
                }
                this.dispatcher.unregister(dispatcherRef);
                resolve();
            };
            // Load the client
            this.model.start();
        });

        // Clear local storage for future use by other sessions
        await this.clearStorage();

        // TODO: For some reason, without this sleep between clients, both clients
        // get very strange responses from the homeserver, such as user is not in
        // the room, etc.
        await sleep(1000);
    }

    public async stop(): Promise<void> {
        this.dispatcher.dispatch({ action: "logout" }, true);
    }

    public async waitForRoom(): Promise<void> {
        await new Promise<void>(resolve => {
            const waitLoop = setInterval(() => {
                if (!this.matrixClient.getRooms().length) {
                    return;
                }
                clearInterval(waitLoop);
                resolve();
            }, 50);
        });
    }

    public async viewRoom(roomId?: string): Promise<void> {
        if (!roomId) {
            roomId = this.matrixClient.getRooms()[0].roomId;
        }
        this.dispatcher.dispatch({
            action: "view_room",
            room_id: roomId,
        }, true);
    }

    private async clearStorage(): Promise<void> {
        localStorage.clear();
        await idbDelete("account", "mx_access_token");
    }
}
