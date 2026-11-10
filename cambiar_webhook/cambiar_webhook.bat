@echo off
title Configurador de Webhook Discord - Panel Pedro
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    node cambiar_webhook.js
    if %ERRORLEVEL% equ 0 goto fin
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0cambiar_webhook.ps1"

:fin
pause

