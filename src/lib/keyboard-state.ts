export type InputMethod = {
  inputTip: string;
  languageTag: string;
  languageName: string;
  keyboardName: string;
};

export type KeyboardState = {
  inputMethods: InputMethod[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseKeyboardState(output: string): KeyboardState {
  const data: unknown = JSON.parse(output.replace(/^\uFEFF/, "").trim());
  if (!isRecord(data) || !Array.isArray(data.inputMethods)) {
    throw new Error(
      "Windows returned an unexpected keyboard settings response.",
    );
  }

  const inputMethods = data.inputMethods.map((item: unknown): InputMethod => {
    if (
      !isRecord(item) ||
      typeof item.inputTip !== "string" ||
      typeof item.languageTag !== "string" ||
      typeof item.languageName !== "string" ||
      typeof item.keyboardName !== "string"
    ) {
      throw new Error("Windows returned an invalid input method.");
    }
    return {
      inputTip: item.inputTip,
      languageTag: item.languageTag,
      languageName: item.languageName,
      keyboardName: item.keyboardName,
    };
  });

  return { inputMethods };
}
