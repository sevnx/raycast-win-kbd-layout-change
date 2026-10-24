export type KeyboardShortcutTarget = { inputTip: string };

export function readShortcutTarget(
  context: unknown,
): KeyboardShortcutTarget | undefined {
  if (context === undefined || context === null) return undefined;
  if (
    typeof context !== "object" ||
    !("inputTip" in context) ||
    typeof context.inputTip !== "string" ||
    context.inputTip.trim().length === 0
  ) {
    throw new Error(
      "This keyboard shortcut is invalid. Create it again from Switch Keyboard.",
    );
  }
  return { inputTip: context.inputTip };
}

export function createKeyboardShortcutLink(
  author: string,
  extension: string,
  inputTip: string,
): string {
  const context = encodeURIComponent(JSON.stringify({ inputTip }));
  return `raycast://extensions/${encodeURIComponent(author)}/${encodeURIComponent(extension)}/set-default-keyboard?launchType=background&context=${context}`;
}
