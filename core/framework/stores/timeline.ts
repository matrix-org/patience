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

import { Instance, SnapshotIn, types } from "mobx-state-tree";

const Action = types
    .model("Action", {
        // TODO: Figure out references...
        // client: types.reference(types.late(() => Client)),
        clientName: types.string,
        clientIndex: types.number,
        type: types.string,
        value: types.maybe(types.string),
    })
    .actions(self => ({
    }));

export interface IAction extends Instance<typeof Action> { }
export interface IActionSnapshotIn extends SnapshotIn<typeof Action> { }

const Timeline = types
    .model("Timeline", {
        actions: types.array(Action),
    })
    .actions(self => ({
        add(clientName: string, clientIndex: number, type: string, value?: string) {
            self.actions.push({
                clientName,
                clientIndex,
                type,
                value,
            });
        },
    }));

export interface ITimeline extends Instance<typeof Timeline> { }

export default Timeline.create();
