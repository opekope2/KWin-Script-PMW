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
    if (newWorkspace.active) {
      currentWorkspace.activate(newWorkspace.output!);
      newWorkspace.activate(output);

      this.activeWorkspace.set(currentWorkspace.output!, currentWorkspace);
      this.activeWorkspace.set(newWorkspace.output!, newWorkspace);

      const currentOrdinal = currentWorkspace.ordinal;
      const newOrdinal = newWorkspace.ordinal;
      print(`[PMW] Swap workspaces ${currentOrdinal + 1}, ${newOrdinal + 1}`);
    } else {
      currentWorkspace.deactivate();
      newWorkspace.activate(output);
      this.activeWorkspace.set(output, newWorkspace);
      print(`[PMW] Activate workspace ${ws + 1}, output ${output.name}`);
    }
  }

  moveToWorkspace(window: Window, ws: number): void {
    if (ws < 0 || ws >= this.workspaces.length) return;

    const targetWorkspace = this.workspaces[ws];
    ref(window).workspace = targetWorkspace;
    if (targetWorkspace.active)
      workspace.sendClientToScreen(window, targetWorkspace.output!);
    print(`[PMW] Move to workspace ${ws + 1}, window [${window.caption}]`);
  }

  protected addOutput(output: Output): void {
    const freeWorkspaces = this.workspaces.filter((it) => !it.active);
    freeWorkspaces[0].activate(output);
    this.activeWorkspace.set(output, freeWorkspaces[0]); // TODO not enough workspaces
    const ws = freeWorkspaces[0].ordinal;

    // KWin automatically moves windows between monitors and back, if the user didn't touch them. It also undoes WindowRef.show(false) effects.
    // Window.outputChanged gets called before WorkspaceWrapper.screensChanged, so the output has no workspace assigned when the windows get moved.
    for (const window of workspace.stackingOrder) {
      if (window.normalWindow && window.output == output)
        this.moveToWorkspace(window, ws);
    }

    print(`[PMW] Add output ${output.name} workspace ${ws + 1}`);
  }

  protected removeOutput(output: Output): void {
    this.activeWorkspace.get(output)!.deactivate();
    this.activeWorkspace.delete(output);
    print(`[PMW] Remove output ${output.name}`);
  }
}
