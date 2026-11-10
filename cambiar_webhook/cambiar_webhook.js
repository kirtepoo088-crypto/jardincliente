/**
 * ============================================================================
 * CONFIGURADOR AUTOMÁTICO DE WEBHOOK DE DISCORD - PANEL PEDRO
 * ============================================================================
 * Encripta el webhook usando XOR (Key 90) + Base64 y actualiza app.js
 * de forma segura y sin exponer la URL en texto plano.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');

// Localizar app.js en la carpeta superior o local
let APP_JS_PATH = path.join(__dirname, '..', 'app.js');
if (!fs.existsSync(APP_JS_PATH)) {
    APP_JS_PATH = path.join(__dirname, 'app.js');
}

const XOR_KEY = 90;

function clearConsole() {
    process.stdout.write('\x1Bc');
}

function printHeader() {
    console.log('\x1b[36m============================================================\x1b[0m');
    console.log('\x1b[1m\x1b[32m       CONFIGURADOR DE WEBHOOK DE DISCORD - PANEL PEDRO     \x1b[0m');
    console.log('\x1b[36m============================================================\x1b[0m');
    console.log('Este script cifra tu webhook de Discord y actualiza app.js');
    console.log('de manera segura para que el panel funcione de inmediato.\n');
}

// Cifrado simétrico XOR (Key 90) compatible con getSecEndpoint() en app.js
function encryptWebhook(url) {
    let binary = '';
    for (let i = 0; i < url.length; i++) {
        binary += String.fromCharCode(url.charCodeAt(i) ^ XOR_KEY);
    }
    return Buffer.from(binary, 'binary').toString('base64');
}

// Descifrado para verificación
function decryptWebhook(enc) {
    const raw = Buffer.from(enc, 'base64').toString('binary');
    let out = '';
    for (let i = 0; i < raw.length; i++) {
        out += String.fromCharCode(raw.charCodeAt(i) ^ XOR_KEY);
    }
    return out;
}

function sendDiscordTest(webhookUrl) {
    return new Promise((resolve) => {
        try {
            const parsed = new URL(webhookUrl);
            const payload = JSON.stringify({
                username: 'Panel Pedro - Monitor',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/9068/9068642.png',
                embeds: [{
                    title: '✅ Webhook Configurado Exitosamente',
                    description: 'Las notificaciones del **Panel Pedro** están activas y funcionando correctamente en este canal.',
                    color: 0x22c55e,
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Panel Pedro Security Framework' }
                }]
            });

            const req = https.request({
                hostname: parsed.hostname,
                path: parsed.pathname + parsed.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 300);
            });

            req.on('error', () => resolve(false));
            req.write(payload);
            req.end();
        } catch (e) {
            resolve(false);
        }
    });
}

function ask(rl, question) {
    return new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim())));
}

async function main() {
    clearConsole();
    printHeader();

    if (!fs.existsSync(APP_JS_PATH)) {
        console.error('\x1b[31m[ERROR] No se encontró el archivo app.js en:\x1b[0m', APP_JS_PATH);
        process.exit(1);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let webhookUrl = process.argv[2] ? process.argv[2].trim() : '';

    if (!webhookUrl) {
        console.log('\x1b[33mPega tu Webhook de Discord y presiona Enter:\x1b[0m');
        webhookUrl = await ask(rl, '> ');
    }

    webhookUrl = webhookUrl.replace(/^["']|["']$/g, '').trim();

    if (!webhookUrl) {
        console.log('\x1b[31m[ERROR] No ingresaste ningún webhook.\x1b[0m');
        rl.close();
        process.exit(1);
    }

    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') &&
        !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
        console.log('\x1b[33m\n[AVISO] La URL no parece un webhook estándar de Discord.');
        console.log('Formato esperado: https://discord.com/api/webhooks/ID/TOKEN\x1b[0m');
        const cont = await ask(rl, '¿Deseas continuar de todos modos? (s/n): ');
        if (cont.toLowerCase() !== 's') {
            console.log('\x1b[31mOperación cancelada.\x1b[0m');
            rl.close();
            process.exit(0);
        }
    }

    console.log('\n\x1b[34m[1/3] Cifrando webhook con algoritmo XOR seguro...\x1b[0m');
    const encrypted = encryptWebhook(webhookUrl);

    // Verificación de descifrado
    const testDecrypted = decryptWebhook(encrypted);
    if (testDecrypted !== webhookUrl) {
        console.error('\x1b[31m[ERROR] Falló la verificación del algoritmo de cifrado.\x1b[0m');
        rl.close();
        process.exit(1);
    }

    console.log('\x1b[34m[2/3] Actualizando app.js...\x1b[0m');
    let appJsContent = fs.readFileSync(APP_JS_PATH, 'utf8');

    // Buscar y reemplazar la constante enc en getSecEndpoint
    const regex = /(function\s+getSecEndpoint\s*\(\)\s*\{[\s\S]*?const\s+enc\s*=\s*")[^"]*(";)/;
    if (!regex.test(appJsContent)) {
        console.error('\x1b[31m[ERROR] No se pudo localizar la función getSecEndpoint() en app.js\x1b[0m');
        rl.close();
        process.exit(1);
    }

    appJsContent = appJsContent.replace(regex, `$1${encrypted}$2`);
    fs.writeFileSync(APP_JS_PATH, appJsContent, 'utf8');

    console.log('\x1b[32m[3/3] ¡Webhook actualizado con éxito en app.js!\x1b[0m\n');
    console.log('\x1b[36mCadena cifrada guardada:\x1b[0m', encrypted.substring(0, 35) + '...');

    const doTest = await ask(rl, '\n¿Deseas enviar un mensaje de prueba a Discord para comprobar que funciona? (s/n): ');
    if (doTest.toLowerCase() === 's') {
        process.stdout.write('Enviando mensaje de prueba a Discord... ');
        const ok = await sendDiscordTest(webhookUrl);
        if (ok) {
            console.log('\x1b[32m¡ÉXITO! Mensaje recibido en tu canal de Discord.\x1b[0m');
        } else {
            console.log('\x1b[33mNo se recibió confirmación 200 de Discord. Verifica que el canal/webhook exista y no haya sido revocado.\x1b[0m');
        }
    }

    console.log('\n\x1b[1m\x1b[32m============================================================\x1b[0m');
    console.log('\x1b[1m\x1b[32m       PROCESO COMPLETADO SATISFACTORIAMENTE               \x1b[0m');
    console.log('\x1b[1m\x1b[32m============================================================\x1b[0m\n');

    rl.close();
}

main().catch((err) => {
    console.error('\x1b[31m[ERROR]:\x1b[0m', err.message);
});

