import { Signal } from "./qt";

declare global {
  var workspace: WorkspaceWrapper;
  var registerShortcut: (
    title: string,
    text: string,
    keySequence: string,
    callback: any
  ) => void;
  var print: (...args: any) => void;
}

export type Output = {
  readonly name: string;
};
export type Window = {
  readonly output: Output;
  readonly normalWindow: boolean;
  readonly caption: string;
  skipTaskbar: boolean;
  skipSwitcher: boolean;
  minimized: boolean;
  readonly outputChanged: Signal<() => void>;
  readonly minimizedChanged: Signal<() => void>;
};
export type WorkspaceWrapper = {
  readonly activeScreen: Output;
  readonly screens: Output[];
  readonly stackingOrder: Window[];
  readonly windowAdded: Signal<(window: Window) => void>;
  readonly windowRemoved: Signal<(window: Window) => void>;
  readonly screensChanged: Signal<() => void>;
  activeWindow: Window;
  sendClientToScreen: (client: Window, output: Output) => void;
};
