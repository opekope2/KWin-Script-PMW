import { Workspace } from "./workspace/Workspace";
import { Window } from "./types/kwin";

const windows = new Map<Window, WindowRef>();

export class WindowRef {
  private _workspace!: Workspace;

  get workspace(): Workspace {
    return this._workspace;
  }

  set workspace(value: Workspace) {
    if (this._workspace == value) return;

    this._workspace?.removeWindow(this._window);
    this._workspace = value;
    this._workspace.addWindow(this._window);
  }

  constructor(private readonly _window: Window) {}

  show(show: boolean) {
    // TODO store state
    this._window.skipTaskbar = !show;
    this._window.skipSwitcher = !show;
    this._window.minimized = !show;
  }

  unref() {
    this._workspace?.removeWindow(this._window);
    windows.delete(this._window);
    print(`[PMW] Untrack window ${this._window} [${this._window.caption}]`);
  }
}

export function ref(window: Window): WindowRef {
  if (windows.has(window)) return windows.get(window)!;

  const ref = new WindowRef(window);
  windows.set(window, ref);
  print(`[PMW] Track window ${window} [${window.caption}]`);
  return ref;
}
