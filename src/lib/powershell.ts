import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { win32 } from "node:path";
import { promisify } from "node:util";

const executeFile = promisify(execFile);

function resolvePowerShellExecutable(): string {
  const getVariable = (name: string) =>
    Object.entries(process.env).find(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    )?.[1];
  const roots = [
    getVariable("SystemRoot"),
    getVariable("windir"),
    "C:\\Windows",
  ];

  for (const root of roots) {
    if (!root || !win32.isAbsolute(root)) continue;
    const executable = win32.join(
      root,
      "System32",
      "WindowsPowerShell",
      "v1.0",
      "powershell.exe",
    );
    if (existsSync(executable)) return executable;
  }

  // Nonstandard Windows installations can still expose PowerShell through PATH.
  return "powershell.exe";
}

export function executePowerShellFile(scriptPath: string, args: string[]) {
  return executeFile(
    resolvePowerShellExecutable(),
    [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      ...args,
    ],
    {
      windowsHide: true,
      timeout: 20_000,
      maxBuffer: 1024 * 1024,
      encoding: "utf8",
    },
  );
}
