Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;

    public class Win32 {
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern bool SetConsoleTitle(string lpConsoleTitle);
    }
"@

function Set-ConsoleTitle ($title) {
    [Win32]::SetConsoleTitle($title)
}

Start-Process npm -ArgumentList 'run electron:serve' -NoNewWindow
$dirName = Split-Path -Path $PSScriptRoot -Leaf
Start-Sleep -Seconds 5
Set-ConsoleTitle "Dev: $dirName" 