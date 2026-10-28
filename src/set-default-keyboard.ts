import { LaunchProps, LaunchType, launchCommand, showHUD } from "@vicinae/api";
import {
  KeyboardShortcutTarget,
  readShortcutTarget,
} from "./lib/keyboard-shortcut";
import { switchActiveKeyboard } from "./lib/windows";

export default async function SwitchSavedKeyboardLayout({
  launchContext,
}: LaunchProps<{ launchContext: KeyboardShortcutTarget }>) {
  try {
    const target = readShortcutTarget(launchContext);
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
