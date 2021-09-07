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

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export async function pollFor(predicate: () => boolean | null): Promise<void> {
    if (predicate()) {
        return;
    }
    return new Promise(resolve => {
        const pollLoop = setInterval(() => {
            if (!predicate()) {
                return;
            }
            clearInterval(pollLoop);
            resolve();
        }, 10);
    });
}

/**
 * Wait just long enough for the frame's document to be parsed. At this step,
 * it's possible to override platform functions before the frame's own scripts
 * run.
 */
export async function waitForFrameDoc(
    frame: HTMLIFrameElement,
    load: () => void,
): Promise<Document> {
    const pollForNavigation = pollFor(() => {
        return frame.contentWindow && frame.contentWindow.location.href !== "about:blank";
    });
    load();
    await pollForNavigation;

    await new Promise<void>(resolve => {
        const waitForInteractive = () => {
            if (frame.contentDocument?.readyState === "loading") {
                return;
            }
            frame.contentDocument?.removeEventListener(
                "readystatechange",
                waitForInteractive,
            );
            resolve();
        };
        frame.contentDocument?.addEventListener(
            "readystatechange",
            waitForInteractive,
        );
        waitForInteractive();
    });

    const frameDoc = frame.contentDocument;
    if (!frameDoc) {
        throw new Error("Frame document missing");
    }

    return frameDoc;
}
