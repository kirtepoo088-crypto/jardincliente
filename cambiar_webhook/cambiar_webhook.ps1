<#
============================================================================
 CONFIGURADOR AUTOMÁTICO DE WEBHOOK DE DISCORD - PANEL PEDRO (POWERSHELL)
============================================================================
 Permite cambiar el webhook de Discord en app.js en cualquier PC con Windows
 sin instalar dependencias externas.
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       CONFIGURADOR DE WEBHOOK DE DISCORD - PANEL PEDRO     " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Este script cifra tu webhook de Discord y actualiza app.js"
Write-Host "de manera segura para que el panel funcione de inmediato.`n"

# Localizar app.js en carpeta padre o local
$appJsPath = Join-Path $PSScriptRoot "..\app.js"
if (-not (Test-Path $appJsPath)) {
    $appJsPath = Join-Path $PSScriptRoot "app.js"
}

if (-not (Test-Path $appJsPath)) {
    Write-Host "[ERROR] No se encontro el archivo app.js en: $appJsPath" -ForegroundColor Red
    pause
    exit 1
}

$webhook = Read-Host "Pega tu Webhook de Discord y presiona Enter"
$webhook = $webhook.Trim().Trim('"').Trim("'")

if ([string]::IsNullOrWhiteSpace($webhook)) {
    Write-Host "`n[ERROR] No ingresaste ningun webhook." -ForegroundColor Red
    pause
    exit 1
}

if (-not $webhook.StartsWith("https://discord.com/api/webhooks/") -and -not $webhook.StartsWith("https://discordapp.com/api/webhooks/")) {
    Write-Host "`n[AVISO] La URL no parece un webhook estandar de Discord." -ForegroundColor Yellow
    Write-Host "Formato esperado: https://discord.com/api/webhooks/ID/TOKEN"
    $cont = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($cont.ToLower() -ne "s") {
        Write-Host "Operacion cancelada." -ForegroundColor Red
        pause
        exit 0
    }
}

Write-Host "`n[1/3] Cifrando webhook con algoritmo XOR seguro..." -ForegroundColor Blue

# Cifrado simétrico XOR (Key 90) compatible con getSecEndpoint() en app.js
$bytes = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($webhook)
for ($i = 0; $i -lt $bytes.Length; $i++) {
    $bytes[$i] = $bytes[$i] -bxor 90
}
$encrypted = [Convert]::ToBase64String($bytes)

# Verificación de descifrado
$testBytes = [Convert]::FromBase64String($encrypted)
for ($i = 0; $i -lt $testBytes.Length; $i++) {
    $testBytes[$i] = $testBytes[$i] -bxor 90
}
$decrypted = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($testBytes)

if ($decrypted -ne $webhook) {
    Write-Host "[ERROR] Fallo la verificacion del algoritmo de cifrado." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[2/3] Actualizando app.js..." -ForegroundColor Blue
$content = [System.IO.File]::ReadAllText($appJsPath, [System.Text.Encoding]::UTF8)

$pattern = '(function\s+getSecEndpoint\s*\(\)\s*\{[\s\S]*?const\s+enc\s*=\s*")[^"]*(";)'
if ($content -notmatch $pattern) {
    Write-Host "[ERROR] No se pudo localizar la funcion getSecEndpoint() en app.js" -ForegroundColor Red
    pause
    exit 1
}

$newContent = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, "${1}$encrypted`${2}")
[System.IO.File]::WriteAllText($appJsPath, $newContent, [System.Text.Encoding]::UTF8)

Write-Host "[3/3] ¡Webhook actualizado con exito en app.js!" -ForegroundColor Green
Write-Host "`nCadena cifrada guardada: " -NoNewline -ForegroundColor Cyan
Write-Host "$($encrypted.Substring(0, [Math]::Min(35, $encrypted.Length)))..."

$test = Read-Host "`n¿Deseas enviar un mensaje de prueba a Discord para comprobar que funciona? (s/n)"
if ($test.ToLower() -eq "s") {
    Write-Host "Enviando mensaje de prueba a Discord... " -NoNewline
    try {
        $body = @{
            username   = "Panel Pedro - Monitor"
            avatar_url = "https://cdn-icons-png.flaticon.com/512/9068/9068642.png"
            embeds     = @(@{
                title       = "✅ Webhook Configurado Exitosamente"
                description = "Las notificaciones del **Panel Pedro** están activas y funcionando correctamente en este canal."
                color       = 2278750
                timestamp   = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                footer      = @{ text = "Panel Pedro Security Framework" }
            })
        } | ConvertTo-Json -Depth 5

        $response = Invoke-RestMethod -Uri $webhook -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "¡EXITO! Mensaje recibido en tu canal de Discord." -ForegroundColor Green
    } catch {
        Write-Host "No se recibio confirmacion 200 de Discord: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "       PROCESO COMPLETADO SATISFACTORIAMENTE               " -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green
pause

