# Keyboard Switcher

Switch the active Windows input language and keyboard layout from Raycast, including the layout shown by the ENG / US indicator.

## Use

Open Raycast and search for **Switch Keyboard**. Select a language/layout pair and press **Enter**. Raycast closes and switches the active keyboard in the application you return to. A failure HUD appears if Windows blocks the request or the target app does not accept it.

Requires Raycast for Windows and Windows PowerShell 5.1 with the International module. Development requires Node.js 22.22.2 or later and npm.

Switch requests target the focused app; the extension does not request desktop-wide IME activation. Languages with multiple IME profiles must be switched through Windows' keyboard switcher. Windows' own input-language settings can still carry the selected layout between apps.

## Save a shortcut

1. Select a keyboard in **Switch Keyboard**.
2. Press **Ctrl+K** and choose **Create Keyboard Shortcut**.
3. Save the prefilled Quicklink with **Ctrl+Enter**.
4. In Raycast Settings > Quicklinks, assign a hotkey to that Quicklink.

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

Keep Raycast running during installation. `npm run install:extension` performs a one-time production build into Raycast's local extension directory and exits. Open Raycast and search for **Switch Keyboard**.

If this is the first installation and the commands do not appear, run **Import Extension** in Raycast, select the cloned project folder, then rerun `npm run install:extension`.

For development, `npm run dev` watches for changes. `npm run build` only writes to the local `dist` directory.

## License

[MIT](LICENSE).
