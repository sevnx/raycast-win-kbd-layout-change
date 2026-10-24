function Get-SessionInputMethods {
    if (-not ('RaycastKeyboardLayouts' -as [type])) {
        Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class RaycastKeyboardLayouts {
    [DllImport("user32.dll")]
    public static extern int GetKeyboardLayoutList(int count, [Out] IntPtr[] layouts);
}
'@
    }
    $count = [RaycastKeyboardLayouts]::GetKeyboardLayoutList(0, $null)
    if ($count -eq 0) { return }
    $layouts = New-Object IntPtr[] $count
    $count = [RaycastKeyboardLayouts]::GetKeyboardLayoutList($count, $layouts)
    for ($index = 0; $index -lt $count; $index++) {
        $value = $layouts[$index].ToInt64() -band 0xffffffffL
        $languageId = [int]($value -band 0xffff)
        $layoutId = [int](($value -shr 16) -band 0xffff)
        # Dynamic handles and legacy IMEs do not encode a classic KLID in their high word.
        # Their configured input profiles are already supplied by Get-WinUserLanguageList.
        if ($layoutId -eq 0 -or $layoutId -ge 0xD000) { continue }
        $klid = '{0:X8}' -f $layoutId
        $layoutPath = 'Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layouts\' + $klid
        if (!(Test-Path -LiteralPath $layoutPath)) { continue }
        try { $culture = [System.Globalization.CultureInfo]::GetCultureInfo($languageId) }
        catch { continue }
        $layout = Get-ItemProperty -LiteralPath $layoutPath
        [pscustomobject]@{
            inputTip = ('{0:X4}:{1}' -f $languageId, $klid)
            languageTag = $culture.Name
            languageName = $culture.DisplayName
            keyboardName = [string]$layout.'Layout Text'
        }
    }
}
