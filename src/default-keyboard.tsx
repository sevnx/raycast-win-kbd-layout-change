import {
  Action,
  ActionPanel,
  Icon,
  Keyboard,
  List,
  environment,
  showHUD,
} from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardState } from "./lib/keyboard-state";
import { createKeyboardShortcutLink } from "./lib/keyboard-shortcut";
import { readKeyboardState, switchActiveKeyboard } from "./lib/windows";

export default function SwitchKeyboardLayout() {
  const [state, setState] = useState<KeyboardState>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const running = useRef(false);

  const refresh = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setLoading(true);
    setError(undefined);
    try {
      setState(await readKeyboardState());
    } catch (error) {
      setState(undefined);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      running.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function switchKeyboard(inputTip: string) {
    if (running.current) return;
    running.current = true;
    setLoading(true);
    try {
      await switchActiveKeyboard(inputTip);
    } catch (error) {
      await showHUD(
        `Couldn't switch keyboard: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      running.current = false;
      setLoading(false);
    }
  }

  function actions(inputTip?: string) {
    const input = state?.inputMethods.find(
      (method) => method.inputTip === inputTip,
    );
    return (
      <ActionPanel>
        {inputTip !== undefined && (
          <Action
            title="Switch Keyboard"
            icon={Icon.Checkmark}
            onAction={() => switchKeyboard(inputTip)}
          />
        )}
        {inputTip !== undefined && (
          <Action.CreateQuicklink
            title="Create Keyboard Shortcut"
            quicklink={{
              name: `Switch to ${input?.keyboardName} / ${input?.languageName}`,
              link: createKeyboardShortcutLink(
                environment.ownerOrAuthorName,
                environment.extensionName,
                inputTip,
              ),
            }}
          />
        )}
        <Action
          title="Refresh"
          icon={Icon.ArrowClockwise}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={refresh}
        />
        <Action.OpenInBrowser
          title="Open Advanced Keyboard Settings"
          url="ms-settings:keyboard-advanced"
          icon={Icon.Gear}
        />
        <Action.OpenInBrowser
          title="Open Language Settings"
          url="ms-settings:regionlanguage"
          icon={Icon.Globe}
        />
      </ActionPanel>
    );
  }

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder="Search configured keyboards or languages…"
    >
      {!state ? (
        <List.EmptyView
          title={
            error
              ? "Couldn't read Windows keyboard settings"
              : "Loading keyboards"
          }
          description={error}
          icon={error ? Icon.ExclamationMark : Icon.Keyboard}
          actions={actions()}
        />
      ) : (
        <>
          <List.Section
            title="Switch active keyboard"
            subtitle={
              state.inputMethods.length === 0
                ? "Add a keyboard in Windows Language Settings"
                : "Select a keyboard, then return to your app"
            }
          >
            {state.inputMethods.map((method) => (
              <List.Item
                key={`${method.languageTag}:${method.inputTip}`}
                id={`${method.languageTag}:${method.inputTip}`}
                title={method.languageName || method.languageTag}
                subtitle={method.keyboardName}
                keywords={[
                  method.languageTag,
                  method.inputTip,
                  method.keyboardName,
                ]}
                icon={Icon.Keyboard}
                actions={actions(method.inputTip)}
              />
            ))}
          </List.Section>
        </>
      )}
    </List>
  );
}
