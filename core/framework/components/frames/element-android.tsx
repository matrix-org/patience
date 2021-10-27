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
import Web2Driver from "web2driver";

import type { IClient } from "../../stores/client";
import { ClientFrame } from "./frame";

window.Web2Driver = Web2Driver;

const server = {
    hostname: "localhost",
    port: 4723,
    connectionRetryCount: 0,
};
const capabilities = {
    platformName: "Android",
    avd: "Pixel_4_API_30",
    automationName: "UiAutomator2",
    app: "/Users/jryans/Downloads/gplay/debug/vector-gplay-universal-debug.apk", 
    appActivity: "im.vector.app.features.login.LoginActivity",
};

const ElementAndroidFrame: FunctionComponent<{ client: IClient }> = observer(({ client }) => {
    return <ClientFrame client={client} url="https://example.com" />;
});

export default ElementAndroidFrame;
