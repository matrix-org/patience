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

import { Instance, types } from "mobx-state-tree";

export enum ClientKind {
    ElementWeb = "Element Web",
}

const Client = types
    .model("Client", {
        id: types.identifier,
        name: types.string,
        kind: types.enumeration<ClientKind>(Object.values(ClientKind)),
        active: false,
    })
    .actions(self => ({
        start() {
            self.active = true;
        },
    }));

export interface IClient extends Instance<typeof Client> { }

const ClientStore = types
    .model("ClientStore", {
        clients: types.array(Client),
    });

export interface IClientStore extends Instance<typeof ClientStore> { }

export default ClientStore.create({
    clients: [
        {
            id: "@alice:local",
            name: "Alice (local)",
            kind: ClientKind.ElementWeb,
        },
        {
            id: "@bob:local",
            name: "Bob (local)",
            kind: ClientKind.ElementWeb,
        },
    ],
});
