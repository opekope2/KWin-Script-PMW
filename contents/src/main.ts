import { SharedWorkspaceManager } from "./workspace/manager/SharedWorkspaceManager";
import { Window } from "./types/kwin";
import { ref } from "./WindowRef";

const workspaceCount = 10;
const workspaceManager = new SharedWorkspaceManager(workspaceCount);

function moveToWorkspace(ws: number, silent: boolean) {
  workspaceManager.moveToWorkspace(workspace.activeWindow, ws);
  if (!silent) workspaceManager.activateWorkspace(ws);
  print(`[PMW] Move to workspace ${ws + 1} ${silent ? "(silent)" : ""}`);
}

function setupKeybinds() {
  for (let i = 0; i < workspaceCount; i++) {
    registerShortcut(`PMW - Activate workspace ${i + 1}`, "", "", () =>
      workspaceManager.activateWorkspace(i)
    );
    registerShortcut(`PMW - Move to workspace ${i + 1}`, "", "", () =>
      moveToWorkspace(i, false)
    );
    registerShortcut(`PMW - Move to workspace ${i + 1} silently`, "", "", () =>
      moveToWorkspace(i, true)
    );
  }
}

function onWindowMoved(window: Window) {
  // TODO
  const targetWorkspace = workspaceManager.getActiveWorkspace(window.output);
  workspaceManager.moveToWorkspace(window, targetWorkspace.ordinal);
  print(`[PMW] Move to workspace ${targetWorkspace.ordinal + 1}`);
}

function onWindowMinimizedChanged(window: Window) {
  if (!window.minimized) return;

  const activeWorkspace = workspaceManager.getActiveWorkspace(window.output);
  const windowWorkspace = ref(window).workspace;
  if (activeWorkspace != windowWorkspace)
    workspaceManager.activateWorkspace(windowWorkspace.ordinal);
}

function onWindowAdded(window: Window) {
  if (!window.normalWindow) return;
  ref(window).workspace = workspaceManager.getActiveWorkspace(window.output);
  window.outputChanged.connect(() => onWindowMoved(window));
  window.minimizedChanged.connect(() => onWindowMinimizedChanged(window));
}

function onWindowRemoved(window: Window) {
  ref(window).unref();
}

function addWindowsToWorkspace() {
  for (const window of workspace.stackingOrder) {
    onWindowAdded(window);

    if (!window.normalWindow) continue;
    // Unhide previously hidden windows
    window.skipTaskbar = false;
    window.skipSwitcher = false;
    window.minimized = false;
  }
}

function init() {
  setupKeybinds();
  workspace.windowAdded.connect(onWindowAdded);
  workspace.windowRemoved.connect(onWindowRemoved);
  workspace.screensChanged.connect(() =>
    workspaceManager.updateOutputs(workspace.screens)
  );
  workspaceManager.updateOutputs(workspace.screens);
  addWindowsToWorkspace();
}

init();
