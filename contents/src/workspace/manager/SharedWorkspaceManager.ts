import { Output, Window } from "../../types/kwin";
import { ref } from "../../WindowRef";
import { WorkspaceManager } from "./WorkspaceManager";

export class SharedWorkspaceManager extends WorkspaceManager {
  private workspaces = this.createWorkspaces();

  activateWorkspace(ws: number): void {
    if (ws < 0 || ws >= this.workspaces.length) return;

    const output = workspace.activeScreen;
    const currentWorkspace = this.getActiveWorkspace(output);
    const newWorkspace = this.workspaces[ws];
    if (currentWorkspace == newWorkspace) return;
    if (newWorkspace.active) return; // TODO swap workspaces

    currentWorkspace.deactivate();
    newWorkspace.activate(output);
    this.activeWorkspace.set(output, newWorkspace);
    print(`[PMW] Activate workspace ${ws + 1}, output ${output.name}`);
  }

  moveToWorkspace(window: Window, ws: number): void {
    if (ws < 0 || ws >= this.workspaces.length) return;
    ref(window).workspace = this.workspaces[ws];
    print(`[PMW] Move to workspace ${ws + 1}, window [${window.caption}]`);
  }

  protected addOutput(output: Output): void {
    const freeWorkspaces = this.workspaces.filter((it) => !it.active);
    freeWorkspaces[0].activate(output);
    this.activeWorkspace.set(output, freeWorkspaces[0]); // TODO not enough workspaces
    const ws = freeWorkspaces[0].ordinal;
    print(`[PMW] Add output ${output.name} workspace ${ws + 1}`);
  }

  protected removeOutput(output: Output): void {
    this.activeWorkspace.delete(output);
    print(`[PMW] Remove output ${output.name}`);
  }
}
