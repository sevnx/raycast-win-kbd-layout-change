import { LaunchProps, LaunchType, launchCommand, showHUD } from "@vicinae/api";
import {
  KeyboardShortcutTarget,
  readShortcutTarget,
} from "./lib/keyboard-shortcut";
import { switchActiveKeyboard } from "./lib/windows";

export default async function SwitchSavedKeyboardLayout({
  arguments: args,
  launchContext,
}: LaunchProps<{
  arguments: { inputTip?: string };
  launchContext: KeyboardShortcutTarget;
}>) {
  try {
    const target = readShortcutTarget(args?.inputTip !== undefined ? args : launchContext);
    if (!target) {
      await launchCommand({
        name: "default-keyboard",
        type: LaunchType.UserInitiated,
      });
      return;
    }
    await switchActiveKeyboard(target.inputTip);
  } catch (error) {
    await showHUD(
      `Couldn't switch keyboard: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
