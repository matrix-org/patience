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

import type { EventEmitter } from "events";

import type { IClientAdapter } from ".";
import type { IClient } from "../../types/client";
import type { IEventWindow } from "./utils/io";
import { waitForFrameDoc } from "./utils/time";

interface ISessionItemViewModel extends EventEmitter {
    delete: () => Promise<void>;
}

interface ISessionPickerViewModel extends EventEmitter {
    sessions: ISessionItemViewModel[];
    delete: (id: string) => Promise<void>;
}

interface IWaitForHandle<T> {
    promise: Promise<T>;
}

interface IObservableValue<T> {
    get: () => T;
    waitFor: (predicate: (value: T) => boolean) => IWaitForHandle<T>;
}

enum LoadStatus {
    NotLoading = "NotLoading",
    Login = "Login",
    LoginFailed = "LoginFailed",
    Loading = "Loading",
    SessionSetup = "SessionSetup",
    Migrating = "Migrating",
    FirstSync = "FirstSync",
    Error = "Error",
    Ready = "Ready",
}

interface ISession {
    rooms: Map<string, object>;
}

interface ISessionContainer {
    loadStatus: IObservableValue<LoadStatus>;
    session?: ISession;
}

interface ISessionViewModel extends EventEmitter {
    _sessionContainer: ISessionContainer;
}

interface IRootViewModel extends EventEmitter {
    sessionPickerViewModel?: ISessionPickerViewModel;
    sessionViewModel?: ISessionViewModel;
    _showPicker: () => Promise<void>;
}

interface IFrameWindow extends IEventWindow {
    __hydrogenViewModel: IRootViewModel;
}

export default class HydrogenAdapter implements IClientAdapter {
    constructor(public model: IClient) {
    }

    private get frameWindow(): IFrameWindow {
        // @ts-expect-error: Seems hard to type this
        return window[this.model.userId].contentWindow;
    }

    private get viewModel(): IRootViewModel {
        return this.frameWindow.__hydrogenViewModel;
    }

    public async start(): Promise<void> {
        this.model.act("start");

        const { userId, homeserverUrl, accessToken } = this.model;

        // Shared session array for possibly multiple Hydrogen clients
        let sessions = JSON.parse(localStorage.getItem("hydrogen_sessions_v1") || "[]");
        sessions = sessions.filter(({ id }: {id: string}) => id !== userId);
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

        // Wait for root view model
        await new Promise<void>(resolve => {
            const waitForRootViewModel = setInterval(() => {
                if (!this.viewModel) {
                    return;
                }
                clearInterval(waitForRootViewModel);
                resolve();
            }, 10);
        });
    }

    public async stop(): Promise<void> {
        this.model.act("stop");
        await this.viewModel._showPicker();
        await this.viewModel.sessionPickerViewModel?.delete(this.model.userId);
    }

    public async waitForRooms(): Promise<void> {
        this.model.act("waitForRooms");
        if (!this.viewModel.sessionViewModel) {
            await new Promise<void>(resolve => {
                const changeHandler = (changed: string) => {
                    if (changed !== "activeSection") {
                        return;
                    }
                    if (!this.viewModel.sessionViewModel) {
                        return;
                    }
                    this.viewModel.off("change", changeHandler);
                    resolve();
                };
                this.viewModel.on("change", changeHandler);
            });
        }
        if (!this.viewModel.sessionViewModel) {
            throw new Error("Session view model not ready");
        }
        const sessionContainer = this.viewModel.sessionViewModel._sessionContainer;
        const { loadStatus } = sessionContainer;
        await loadStatus.waitFor(status => status === LoadStatus.Ready).promise;
        if (!sessionContainer.session) {
            throw new Error("Session missing");
        }
        if (sessionContainer.session.rooms.size === 0) {
            throw new Error("Rooms failed to load");
        }
    }

    public async viewRoom(roomId?: string): Promise<void> {
        this.model.act("viewRoom", roomId);
        if (!roomId) {
            if (!this.viewModel.sessionViewModel) {
                throw new Error("Session view model not ready");
            }
            const sessionContainer = this.viewModel.sessionViewModel._sessionContainer;
            if (!sessionContainer.session) {
                throw new Error("Session missing");
            }
            roomId = sessionContainer.session.rooms.keys().next().value;
        }
        const { userId } = this.model;
        const { location } = this.frameWindow;
        location.hash = `#/session/${userId}/open-room/${roomId}`;
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
