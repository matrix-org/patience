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

// TODO: When using Snowpack without a production bundler, this is still
// included in the build output, but it will not actually run. The built-in
// version of `esbuild` could optimise this away, but it needs an upgrade to
// esbuild 0.10.0 to support top-level await.
// https://github.com/snowpackjs/snowpack/issues/3402
if (import.meta.env.MODE === "development") {
    await import("preact/debug");
}

// TODO: Ideally we could include CSS only via HTML (so that it loads before JS)
// and still have HMR, but that seems to confuse Snowpack at the moment. By
// including it here instead, we get working HMR, which is more important that
// CSS load time during development.
import "./index.css";

import type { FunctionComponent } from "preact";
import { h, Fragment, render } from "preact";
import { observer } from "mobx-react";

import ClientFrames from "./components/client-frames";
import type { IClientStore } from "./stores/client";
import clientStore from "./stores/client";
import type { ITimeline } from "./stores/timeline";
import timeline from "./stores/timeline";
import Timeline from "./components/timeline";

const App: FunctionComponent<{
    clientStore: IClientStore;
    timeline: ITimeline;
}> = observer(({ clientStore, timeline }) => {
    return <>
        <ClientFrames clientStore={clientStore} />
        <Timeline timeline={timeline} />
    </>;
});

render(<App
    clientStore={clientStore}
    timeline={timeline}
/>, document.body);

// The test API uses this as a way of notifying the test framework without
// importing the framework itself into the test.
window.clientStore = clientStore;
window.timeline = timeline;
