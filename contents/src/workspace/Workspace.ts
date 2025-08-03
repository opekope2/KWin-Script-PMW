import { Output, Window } from "../types/kwin";
import { ref } from "../WindowRef";

export class Workspace {
  private readonly _windows = new Set<Window>();
  private _output?: Output;

  constructor(public readonly ordinal: number) {}

  get active(): boolean {
    return this._output != undefined;
  }

  get output(): Output | undefined {
    return this._output;
  }

  private updateWindow(window: Window) {
    ref(window).show(this.active);
  }

  addWindow(window: Window) {
    this._windows.add(window);
    this.updateWindow(window);
  }

  removeWindow(window: Window) {
    this._windows.delete(window);
  }

  activate(output: Output) {
    this._output = output;
    for (const window of this._windows) {
      ref(window).show(this.active);
      if (window.output != output) workspace.sendClientToScreen(window, output);
    }
  }

  deactivate() {
    this._output = undefined;
    for (const window of this._windows) ref(window).show(this.active);
  }
}
