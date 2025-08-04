import { Workspace } from "../Workspace";
import { Output, Window } from "../../types/kwin";

export abstract class WorkspaceManager {
  protected readonly activeWorkspace = new Map<Output, Workspace>();

  constructor(protected readonly workspaceCount: number) {}

  protected createWorkspaces(): Workspace[] {
    const workspaces: Workspace[] = [];
    for (let i = 0; i < this.workspaceCount; i++)
      workspaces.push(new Workspace(i));
    return workspaces;
  }

  getActiveWorkspace(output: Output): Workspace {
    return this.activeWorkspace.get(output)!;
  }

  abstract activateWorkspace(ws: number, bringToActiveOutput: boolean): void;

  abstract moveToWorkspace(window: Window, ws: number): void;

  protected abstract addOutput(output: Output): void;

  protected abstract removeOutput(output: Output): void;

  updateOutputs(outputs: Output[]) {
    const outputSet = new Set(outputs);
    for (const output of outputSet) {
      if (!this.activeWorkspace.has(output)) this.addOutput(output);
    }
    for (const [output] of this.activeWorkspace) {
      if (!outputSet.has(output)) this.removeOutput(output);
    }
  }
}
