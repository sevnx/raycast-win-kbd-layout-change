$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

. (Join-Path $PSScriptRoot 'session-layouts.ps1')

function Get-KeyboardState {
    $methods = @(
        foreach ($language in (Get-WinUserLanguageList)) {
            foreach ($tip in $language.InputMethodTips) {
                $keyboardName = $tip
                # Classic layouts have a registry name. Keep IME profile identifiers intact.
                if ($tip -match '^[0-9a-fA-F]{4}:([0-9a-fA-F]{8})$') {
                    $layoutPath = 'Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layouts\' + $Matches[1]
                    if (Test-Path -LiteralPath $layoutPath) {
                        $layout = Get-ItemProperty -LiteralPath $layoutPath
                        if ($layout.'Layout Text') { $keyboardName = $layout.'Layout Text' }
                    }
                }
                [pscustomobject]@{
                    inputTip = [string]$tip
                    languageTag = [string]$language.LanguageTag
                    languageName = [string]$language.LocalizedName
                    keyboardName = [string]$keyboardName
                }
            }
        }
    )
    foreach ($method in (Get-SessionInputMethods | Sort-Object inputTip)) {
        if ($method.inputTip -in $methods.inputTip) { continue }
        $languageId, $layoutId = $method.inputTip -split ':'
        # A language's base HKL may represent its configured IME, not a separate keyboard.
        if ($layoutId -eq ('0000' + $languageId) -and @($methods | Where-Object { $_.inputTip -like ($languageId + ':{*') }).Count -gt 0) { continue }
        $methods += $method
    }
    [pscustomobject]@{ inputMethods = @($methods) }
}

Get-KeyboardState | ConvertTo-Json -Depth 5 -Compress
