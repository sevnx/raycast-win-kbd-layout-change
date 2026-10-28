import { join } from "node:path";
import { closeMainWindow, environment } from "@vicinae/api";
import { parseKeyboardState } from "./keyboard-state";
import { executePowerShellFile } from "./powershell";

export async function readKeyboardState() {
  return parseKeyboardState(await runWindowsScript("language.ps1", []));
}

export async function switchActiveKeyboard(inputTip: string) {
  await closeMainWindow();
  await runWindowsScript("switch-keyboard.ps1", ["-InputTip", inputTip]);
}

async function runWindowsScript(script: string, args: string[]) {
  if (process.platform !== "win32")
    throw new Error("This command requires Windows.");

  try {
    const { stdout } = await executePowerShellFile(
      join(environment.assetsPath, script),
      args,
    );
    return stdout;
  } catch (error) {
    if (
      error instanceof Error &&
      "stderr" in error &&
      typeof error.stderr === "string" &&
      error.stderr.trim()
    ) {
      throw new Error(error.stderr.trim());
    }
    throw error;
  }
}
