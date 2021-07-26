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

// Integrate both client and server config, like an extended form of Complement
// Would be nice if clients could use snapshotted sessions, rather than needing
// to login for each test.

it("displays 2 client frames", async function() {
    this.timeout(10000);

    const response = await orchestrate({
        servers: {
            baseImageUri: "complement-synapse",
            blueprintName: "oneToOneRoom",
        },
        clients: ClientKind.ElementWeb,
    });
    console.log(response);
    expect(Object.keys(response.homeservers.hs1.AccessTokens).length).to.equal(2);
    expect(window.frames.length).to.equal(2);
});
