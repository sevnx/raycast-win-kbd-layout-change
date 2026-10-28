# Keyboard Switcher

Switch the active Windows input language and keyboard layout from Vicinae, including the layout shown by the ENG / US indicator.

## Use

Open Vicinae and search for **Switch Keyboard**. Select a language/layout pair and press **Enter**. Vicinae closes and switches the active keyboard in the application you return to. A failure HUD appears if Windows blocks the request or the target app does not accept it.

Requires Vicinae for Windows 0.29.2 or later and Windows PowerShell 5.1 with the International module. Building requires Node.js 22 or later and npm.

Switch requests target the focused app; the extension does not request desktop-wide IME activation. Languages with multiple IME profiles must be switched through Windows' keyboard switcher. Windows' own input-language settings can still carry the selected layout between apps.

## Save a shortcut

1. Select a keyboard in **Switch Keyboard**.
2. Press **Ctrl+K** and choose **Create Keyboard Shortcut**.
3. Save the prefilled shortcut in Vicinae.
4. Assign a hotkey to the saved shortcut in Vicinae.

Create a separate Quicklink for each layout you want, each with its own hotkey. The Quicklink runs **Switch Keyboard from Quicklink** with your selection.

## Build and install

Clone the repository and enter its directory:

```powershell
git clone https://github.com/sevnx/raycast-win-kbd-layout-change.git
cd raycast-win-kbd-layout-change
```

```powershell
npm ci
npm run install:extension
```

`npm run install:extension` performs a one-time production build into Vicinae's local extension directory and exits. On Windows this is `%LOCALAPPDATA%\vicinae\data\extensions\windows-default-keyboard`. Open Vicinae and search for **Switch Keyboard**.

If the commands do not appear after the first installation, quit and reopen Vicinae once.

`npm run build` also builds and installs the extension. For development, `npm run dev` watches for changes. The repository and command identifiers keep their original names so this migration does not require renaming the checkout.

## License

[MIT](LICENSE).
