param(
    [Parameter(Mandatory = $true)]
    [string]$InputTip
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

$state = & (Join-Path $PSScriptRoot 'language.ps1') | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($InputTip) -or $InputTip -notin $state.inputMethods.inputTip) {
    throw 'This input method is no longer available. Refresh the keyboard picker.'
}
if ($InputTip[5] -eq '{') {
    $profiles = @($state.inputMethods | Where-Object { $_.inputTip -like ($InputTip.Substring(0, 5) + '{*') })
    if ($profiles.Count -gt 1) {
        throw 'Multiple IMEs are configured for this language. Use the Windows keyboard switcher to select a specific profile.'
    }
}
if (-not ('ActiveKeyboard' -as [type])) {
    Add-Type -Path (Join-Path $PSScriptRoot 'active-keyboard.cs')
}
[ActiveKeyboard]::Switch($InputTip)
