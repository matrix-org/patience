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

/* eslint-disable @typescript-eslint/no-invalid-this */

import { expect } from "chai";

import { orchestrate } from "@matrix-org/patience";
import { ClientKind } from "@matrix-org/patience/types/client";

const { clients } = await orchestrate({
    servers: {
        blueprintName: "federationOneToOneRoom",
    },
    clients: ClientKind.Hydrogen,
});
const alice = window.alice = clients[0];
const bob = window.bob = clients[1];

after(async () => {
    await alice.stop();
    await bob.stop();
});

it("logs into both clients", async function() {
    await alice.start();
    await bob.start();
});

it("has a conversation", async function() {
    await alice.waitForRooms();
    await bob.waitForRooms();
    await alice.viewRoom();
    await bob.viewRoom();

    const bobWaitsForMessage = bob.waitForMessage("Hi Bob!");
    await alice.sendMessage("Hi Bob!");
    expect(await bobWaitsForMessage).to.equal("Hi Bob!");
    await bob.sendMessage("Hello Alice!");
});
