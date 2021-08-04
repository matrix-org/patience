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

import { cast, Instance, SnapshotIn, SnapshotOrInstance, types } from "mobx-state-tree";

import { ClientKind } from "../../types/client";
import timeline from "./timeline";

export const Client = types
    .model("Client", {
        userId: types.identifier,
        homeserverUrl: types.string,
        accessToken: types.string,
        kind: types.enumeration<ClientKind>(Object.values(ClientKind)),
        active: false,
        zoom: 100,
    })
    .views(self => ({
        get name(): string {
            return self.userId.split("@")[1].split(":")[0]
                .replace(/^[a-z]/, value => value.toUpperCase());
        },
    }))
    .actions(self => ({
        start() {
            self.active = true;
        },
        setZoom(value: number) {
            self.zoom = value;
        },
        act(type: string, value?: string) {
            const index = window.clientStore.clients.indexOf(cast(self));
            timeline.add(self.name, index, type, value);
        },
    }));

export interface IClient extends Instance<typeof Client> { }
export interface IClientSnapshotIn extends SnapshotIn<typeof Client> { }

const ClientStore = types
    .model("ClientStore", {
        clients: types.array(Client),
    })
    .actions(self => ({
        add(client: SnapshotOrInstance<typeof Client>) {
            self.clients.push(client);
        },
    }));

export interface IClientStore extends Instance<typeof ClientStore> { }

export default ClientStore.create();
