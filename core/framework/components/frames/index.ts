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

import type { ComponentType } from "preact";

import type { IClient } from "../../stores/client";
import { ClientKind } from "../../../types/client";
import ElementWebFrame from "./element-web";
import HydrogenFrame from "./hydrogen";
import ElementAndroidFrame from "./element-android";

export default function getFrameForClient(client: IClient): ComponentType<{ client: IClient }> {
    switch (client.kind) {
        case ClientKind.ElementAndroid:
            return ElementAndroidFrame;
        case ClientKind.ElementWeb:
            return ElementWebFrame;
        case ClientKind.Hydrogen:
            return HydrogenFrame;
    }
}
