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

interface IMatrixChat {
    onUserCompletedLoginFlow(creds: IMatrixClientCreds): Promise<void>;
}

export default class ElementWebAdapter implements IClientAdapter {
    constructor(public model: IClient) {
    }

    private get appWindow(): Window & { matrixChat: IMatrixChat } {
        // @ts-expect-error: Seems hard to type this
        return window[this.model.userId].contentWindow;
    }

    async start(): Promise<void> {
        const { userId, homeserverUrl, accessToken } = this.model;

        localStorage.setItem("mx_user_id", userId);
        localStorage.setItem("mx_hs_url", homeserverUrl);
        localStorage.setItem("mx_access_token", accessToken);

        await new Promise<void>(resolve => {
            this.appWindow.addEventListener("load", () => {
                resolve();
            }, { once: true });
            this.model.start();
        });
        await new Promise<void>(resolve => {
            const startupWaitLoop = setInterval(() => {
                if (this.appWindow.matrixChat) {
                    clearInterval(startupWaitLoop);
                    resolve();
                }
            }, 50);
        });
    }

    async login(): Promise<void> {
    }
}
