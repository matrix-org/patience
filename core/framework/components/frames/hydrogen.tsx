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

import { h } from "preact";
import type { FunctionComponent } from "preact";
import { observer } from "mobx-react";

import type { IClient } from "../../stores/client";
import { ClientFrame } from "./frame";

const HydrogenFrame: FunctionComponent<{ client: IClient }> = observer(({ client }) => {
    return <ClientFrame client={client}
        url={`/client/hydrogen/#/session/${client.userId}`}
    />;
});

export default HydrogenFrame;