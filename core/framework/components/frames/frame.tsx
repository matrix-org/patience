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
import { useCallback } from "preact/hooks";
import type { FunctionComponent } from "preact";
import { observer } from "mobx-react";

import type { IClient } from "../../stores/client";
import ZoomToolbar from "../zoom-toolbar";

export const ClientFrame: FunctionComponent<{
    client: IClient;
    url: string;
}> = observer(({ client, url }) => {
    const frameRef = useCallback((frame: HTMLIFrameElement | null) => {
        if (frame) {
            client.setFrame(frame);
        }
    }, []);

    const location = client.active ? url : "about:blank";

    const frameStyles = {
        height: `${(100 / client.zoom) * 100}%`,
        width: `${(100 / client.zoom) * 100}%`,
        transform: `scale(${client.zoom / 100})`,
        transformOrigin: "top left",
    };

    return <div className="client-frame">
        <div className="client-frame-header">
            <span className="client-frame-name">{client.name} ({client.userId})</span>
            <ZoomToolbar client={client} />
        </div>
        <div className="client-frame-frame">
            <iframe id={client.userId}
                ref={frameRef}
                src={location}
                style={frameStyles}
            ></iframe>
        </div>
    </div>;
});
