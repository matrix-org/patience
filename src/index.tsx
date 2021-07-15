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

import { h, Fragment, render, FunctionComponent } from "preact";
import { observer } from "mobx-react";
import { types } from "mobx-state-tree";

const Store = types
    .model("Store", {
        list: types.array(types.string),
    })
    .actions(self => ({
        add() {
            const titles = [
                "world",
                "Preact",
                "MobX",
                "MST",
            ];
            self.list.push(titles[Math.floor(Math.random() * titles.length)]);
        },
    }));

const store = Store.create({
    list: ["MobX"],
});

interface AppProps {
    store: typeof store;
}

const App: FunctionComponent<AppProps> = observer(({ store }) => {
    const list = store.list.map(title => <li>
        Hello {title}!
    </li>);

    return <>
        <button onClick={store.add}>Add</button>
        {list}
    </>;
});

render(<App store={store} />, document.body);
