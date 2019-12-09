#!/usr/bin/env bash

# Install Chocolatey
cmd.exe /C @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

ansible-playbook ansible-playbook-*.yml

# Print a message on completion
echo -e "windows/bootstrap.sh finished"
