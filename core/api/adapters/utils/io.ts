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

export interface IEventWindow extends Window {
    MouseEvent: {
        prototype: MouseEvent;
        new(type: string, eventInitDict?: MouseEventInit): MouseEvent;
    };
    KeyboardEvent: {
        prototype: KeyboardEvent;
        new(type: string, eventInitDict?: KeyboardEventInit): KeyboardEvent;
    };
}

export async function query(win: IEventWindow, selector: string): Promise<HTMLElement> {
    return new Promise<HTMLElement>(resolve => {
        const waitLoop = setInterval(() => {
            const element = win.document.querySelector<HTMLElement>(selector);
            if (!element) {
                return;
            }
            clearInterval(waitLoop);
            resolve(element);
        }, 50);
    });
}

export function click(win: IEventWindow, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const MouseEvent = win.MouseEvent;
    const event = new MouseEvent("click", {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(event);
}

export function fill(win: IEventWindow, element: HTMLElement, message: string) {
    element.ownerDocument.execCommand("insertText", false, message);
}

export function press(win: IEventWindow, element: HTMLElement, key: string) {
    const KeyboardEvent = win.KeyboardEvent;
    const down = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(down);
    const up = new KeyboardEvent("keyup", {
        key,
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(up);
}
