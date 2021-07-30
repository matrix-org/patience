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

export interface IActionPayload {
    action: string;
}

interface IAppWindow extends Window {
    matrixChat: IMatrixChat;
    mxDispatcher: {
        register(callback: (action: IActionPayload) => void): string;
        unregister(id: string): void;
    };
}

interface IMatrixChat {
    onUserCompletedLoginFlow(creds: IMatrixClientCreds): Promise<void>;
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

    async start(): Promise<void> {
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
                if (!this.appWindow.mxDispatcher) {
                    return;
                }
                clearInterval(startupWaitLoop);
                dispatcherRef = this.appWindow.mxDispatcher.register(onAction);
            }, 50);
            const onAction = ({ action }: IActionPayload) => {
                // Wait until the app has processed the stored login
                if (action !== "on_logged_in") {
                    return;
                }
                this.appWindow.mxDispatcher.unregister(dispatcherRef);
                resolve();
            };
            this.model.start();
        });

        // Clear local storage for future use by other sessions
        await this.clearStorage();
    }

    private async clearStorage(): Promise<void> {
        localStorage.clear();
        await idbDelete("account", "mx_access_token");
    }
}
