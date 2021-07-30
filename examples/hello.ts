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

import { sleep } from "./utils";

// Integrate both client and server config, like an extended form of Complement
// Would be nice if clients could use snapshotted sessions, rather than needing
// to login for each test.

const { servers, clients } = await orchestrate({
    servers: {
        // TODO: Maybe default to this and avoid embedding in tests
        baseImageUri: "complement-dendrite",
        blueprintName: "oneToOneRoom",
    },
    clients: ClientKind.ElementWeb,
});
const alice = window.alice = clients[0];
const bob = window.bob = clients[1];

it("displays 2 client frames", async function() {
    expect(Object.keys(servers.homeservers.hs1.accessTokens).length).to.equal(2);
    expect(clients.length).to.equal(2);
    expect(window.frames.length).to.equal(2);
});

it("logs into both clients", async function() {
    await alice.start();
    await bob.start();
});

it("has a conversation", async function() {
    await alice.waitForRoom();
    await bob.waitForRoom();
    await alice.viewRoom();
    await bob.viewRoom();

    await alice.sendMessage("Hi Bob!");
    // TODO: Perhaps even this should be recorded as an action...?
    await sleep(500);
    await bob.sendMessage("Hello Alice!");
});
