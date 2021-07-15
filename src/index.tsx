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

import { h, render, FunctionComponent } from "preact";
import { observable } from "mobx";
import { observer } from "mobx-react";

const state = observable({
    value: "MobX",
});

setInterval(() => {
    const titles = [
        "world",
        "Preact",
        "MobX",
    ];
    state.value = titles[Math.floor(Math.random() * 3)];
}, 500);

interface AppProps {
    title: {
        value: string;
    };
}

const App: FunctionComponent<AppProps> = observer(({ title }) => <div>
    Hello {title.value}!
</div>);

render(<App title={state} />, document.body);
