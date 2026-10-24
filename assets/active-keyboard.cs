using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Threading;

public static class ActiveKeyboard
{
    [StructLayout(LayoutKind.Sequential)]
    private struct GuiThreadInfo
    {
        public int cbSize;
        public int flags;
        public IntPtr hwndActive, hwndFocus, hwndCapture, hwndMenuOwner, hwndMoveSize, hwndCaret;
        public int left, top, right, bottom;
    }

    [DllImport("user32.dll")] private static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
    [DllImport("user32.dll")] private static extern IntPtr GetKeyboardLayout(uint threadId);
    [DllImport("user32.dll")] private static extern int GetKeyboardLayoutList(int count, [Out] IntPtr[] layouts);
    [DllImport("user32.dll")] private static extern bool GetGUIThreadInfo(uint threadId, ref GuiThreadInfo info);
    [DllImport("user32.dll")] private static extern bool IsWindow(IntPtr window);
    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool PostMessage(IntPtr window, uint message, IntPtr wParam, IntPtr lParam);

    private sealed class State
    {
        public long windowHandle { get; set; }
        public uint threadId { get; set; }
        public string processName { get; set; }
    }

    private static uint Bits(IntPtr value) { return (uint)(value.ToInt64() & 0xffffffffL); }

    private static State Read()
    {
        IntPtr window = GetForegroundWindow();
        if (window == IntPtr.Zero || !IsWindow(window)) throw new InvalidOperationException("No application window is available.");
        uint processId;
        uint threadId = GetWindowThreadProcessId(window, out processId);
        GuiThreadInfo gui = new GuiThreadInfo();
        gui.cbSize = Marshal.SizeOf(typeof(GuiThreadInfo));
        if (GetGUIThreadInfo(threadId, ref gui) && gui.hwndFocus != IntPtr.Zero)
        {
            window = gui.hwndFocus;
            threadId = GetWindowThreadProcessId(window, out processId);
        }
        return new State {
            windowHandle = window.ToInt64(), threadId = threadId,
            processName = Process.GetProcessById((int)processId).ProcessName
        };
    }

    private static IntPtr ResolveLayout(string inputTip)
    {
        ushort language = ushort.Parse(inputTip.Substring(0, 4), NumberStyles.HexNumber);
        bool ime = inputTip[5] == '{';
        uint layout = ime ? 0 : uint.Parse(inputTip.Substring(5), NumberStyles.HexNumber);
        uint layoutWord = layout;
        if (!ime && layout > 0xffff)
        {
            using (var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(
                @"SYSTEM\CurrentControlSet\Control\Keyboard Layouts\" + layout.ToString("X8")))
            {
                string id = key == null ? null : key.GetValue("Layout Id") as string;
                if (id == null) throw new InvalidOperationException("Cannot identify this custom keyboard layout.");
                layoutWord = 0xf000 | uint.Parse(id, NumberStyles.HexNumber);
            }
        }
        int count = GetKeyboardLayoutList(0, null);
        IntPtr[] layouts = new IntPtr[count];
        count = GetKeyboardLayoutList(count, layouts);
        IntPtr match = IntPtr.Zero;
        for (int index = 0; index < count; index++)
        {
            uint bits = Bits(layouts[index]);
            if ((bits & 0xffff) != language || (!ime && (bits >> 16) != layoutWord)) continue;
            if (!ime) return layouts[index];
            if (match != IntPtr.Zero && Bits(match) != bits)
                throw new InvalidOperationException("This IME cannot be uniquely selected for one app. Use the Windows keyboard switcher.");
            match = layouts[index];
        }
        if (match != IntPtr.Zero) return match;
        throw new InvalidOperationException("This keyboard is not loaded in the Windows session. Refresh the picker.");
    }

    public static void Switch(string inputTip)
    {
        IntPtr layout = ResolveLayout(inputTip);
        State before = null;
        for (int attempt = 0; attempt < 40; attempt++)
        {
            before = Read();
            if (!before.processName.StartsWith("Raycast", StringComparison.OrdinalIgnoreCase)) break;
            Thread.Sleep(50);
        }
        if (before.processName.StartsWith("Raycast", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Raycast has not returned focus to your application. Close it and try again.");

        if (!PostMessage(new IntPtr(before.windowHandle), 0x0050, IntPtr.Zero, layout))
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Windows blocked the application's keyboard switch request.");

        for (int attempt = 0; attempt < 40; attempt++)
        {
            if (Bits(GetKeyboardLayout(before.threadId)) == Bits(layout))
            {
                return;
            }
            Thread.Sleep(50);
        }
        throw new InvalidOperationException("The application did not accept the keyboard switch. Its active layout did not change.");
    }
}
