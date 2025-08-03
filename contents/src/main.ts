import { SharedWorkspaceManager } from "./workspace/manager/SharedWorkspaceManager";
import { Window } from "./types/kwin";
import { ref } from "./WindowRef";

const workspaceCount = 10;
const workspaceManager = new SharedWorkspaceManager(workspaceCount);

let managingWorkspaces = false;

function activateWorkspace(ws: number) {
  managingWorkspaces = true;
  workspaceManager.activateWorkspace(ws);
  managingWorkspaces = false;
}

function moveActiveToWorkspace(ws: number, silent: boolean) {
  workspaceManager.moveToWorkspace(workspace.activeWindow, ws);
  if (!silent) activateWorkspace(ws);
}

function setupKeybinds() {
  for (let i = 0; i < workspaceCount; i++) {
    registerShortcut(`PMW - Activate workspace ${i + 1}`, "", "", () =>
      activateWorkspace(i)
    );
    registerShortcut(`PMW - Move to workspace ${i + 1}`, "", "", () =>
      moveActiveToWorkspace(i, false)
    );
    registerShortcut(`PMW - Move to workspace ${i + 1} silently`, "", "", () =>
      moveActiveToWorkspace(i, true)
    );
  }
}

function onWindowMoved(window: Window) {
  if (managingWorkspaces) return;

  const targetWorkspace = workspaceManager.getActiveWorkspace(window.output);
  if (targetWorkspace == ref(window).workspace) return;

  // TODO by-ref instead of by-id
  workspaceManager.moveToWorkspace(window, targetWorkspace.ordinal);
}

function onWindowMinimizedChanged(window: Window) {
  if (!window.minimized) return;

  const activeWorkspace = workspaceManager.getActiveWorkspace(window.output);
  const windowWorkspace = ref(window).workspace;
  if (activeWorkspace != windowWorkspace)
    activateWorkspace(windowWorkspace.ordinal);
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
